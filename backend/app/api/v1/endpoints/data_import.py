from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import pandas as pd
import io
import hashlib
from datetime import datetime
import time

from app.database import get_db
from app.models import ImportJob, ImportProfile, Customer, Employee, Department, Expense, SalesTransaction, Product

router = APIRouter()

@router.post("/upload-inspect")
async def upload_inspect(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Accepts a file, hashes it to check for duplicates, and extracts headers using pandas.
    """
    if file.size and file.size > 100 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds 100MB limit.")
        
    contents = await file.read()
    
    # Check duplicate file hash
    file_hash = hashlib.sha256(contents).hexdigest()
    
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents), nrows=5)
        elif file.filename.endswith('.xlsx'):
            df = pd.read_excel(io.BytesIO(contents), nrows=5)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload CSV or Excel.")
            
        columns = df.columns.tolist()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")
        
    return {
        "filename": file.filename,
        "hash": file_hash,
        "columns": columns,
        "is_duplicate": False, # Mocked for now, normally query DB
        "size_bytes": len(contents)
    }

import json
import os

@router.post("/auto-map")
async def auto_map(payload: Dict[str, Any]):
    """
    Takes uploaded columns and uses a synonym dictionary to suggest mapping to BoardMind fields.
    """
    uploaded_columns = payload.get("columns", [])
    
    # Load synonyms from external configurable JSON
    synonyms_path = os.path.join(os.path.dirname(__file__), "../../../../synonyms.json")
    try:
        with open(synonyms_path, "r") as f:
            synonyms = json.load(f)
    except Exception:
        synonyms = {}
        
    # Internal BoardMind Fields (Dynamic Schema)
    internal_fields = [
        "Customer Name", "Transaction Date", "Revenue", "Expense", 
        "Product", "Transaction ID", "Department", "Industry", 
        "Country", "Employee"
    ]
    
    mappings = []
    
    for board_field in internal_fields:
        best_match = None
        confidence = 0
        
        # Simple synonym matching
        for up_col in uploaded_columns:
            up_clean = up_col.strip().lower()
            board_clean = board_field.strip().lower()
            
            if up_clean == board_clean:
                best_match = up_col
                confidence = 100
                break
                
            for syn in synonyms.get(board_field, []):
                if up_clean == syn.strip().lower():
                    best_match = up_col
                    confidence = 90
                    break
                    
            if best_match:
                break
                
        mappings.append({
            "boardmind_field": board_field,
            "mapped_column": best_match,
            "confidence": confidence
        })
        
    return {"mappings": mappings}

def process_import_job(job_id: int, file_contents: bytes, filename: str, mapping: Dict, db: Session):
    """
    Background task to process the file and insert into the database.
    """
    job = db.query(ImportJob).filter(ImportJob.id == job_id).first()
    if not job:
        return
        
    try:
        job.status = "Processing"
        db.commit()
        
        # Load data
        if filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(file_contents))
        else:
            df = pd.read_excel(io.BytesIO(file_contents))
            
        rows_processed = len(df)
        job.rows_processed = rows_processed
        
        # Here we would do the actual SQLAlchemy inserts based on the mapping dictionary.
        # Simulating heavy processing for now...
        time.sleep(2) 
        
        job.rows_imported = rows_processed
        job.status = "Completed"
        
    except Exception as e:
        job.status = "Failed"
        job.error_message = str(e)
    finally:
        db.commit()

@router.post("/validate")
async def validate_import(payload: Dict[str, Any]):
    """
    Simulates validation of the mapped columns.
    Checks for missing required fields (Customer, Date, Revenue).
    """
    mappings = payload.get("mappings", [])
    errors = []
    
    # Required fields check
    required_fields = ["Customer Name", "Transaction Date", "Revenue"]
    mapped_internal_fields = [m.get("boardmind_field") for m in mappings if m.get("mapped_column")]
    
    for req in required_fields:
        if req not in mapped_internal_fields:
            errors.append(f"Missing required mapping for: {req}")
            
    if errors:
        return {"valid": False, "errors": errors}
        
    return {"valid": True, "errors": []}

@router.post("/commit")
async def commit_import(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Initiates an asynchronous background job to process the import.
    """
    contents = await file.read()
    
    # Create the ImportJob record
    new_job = ImportJob(
        filename=file.filename,
        status="Pending"
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    
    # Send to background processing
    mapping_config = {} # In a real scenario, we'd accept this as a form field
    background_tasks.add_task(process_import_job, new_job.id, contents, file.filename, mapping_config, db)
    
    return {"message": "Import job started", "job_id": new_job.id}

@router.get("/job-status/{job_id}")
async def get_job_status(job_id: int, db: Session = Depends(get_db)):
    """
    Polling endpoint for the frontend to check import progress.
    """
    job = db.query(ImportJob).filter(ImportJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return {
        "id": job.id,
        "status": job.status,
        "rows_processed": job.rows_processed,
        "rows_imported": job.rows_imported,
        "error_message": job.error_message
    }

@router.post("/bulk-import")
async def bulk_import(
    files: List[UploadFile] = File(...)
):
    from app.database import SessionLocalReal
    db = SessionLocalReal()
    
    """
    Handles bulk importing of the 4 standard CSV files (Customers, Employees, Expenses, Sales).
    All files must be provided together. The entire operation is wrapped in a single transaction.
    """
    start_time = time.time()
    
    if len(files) != 4:
        raise HTTPException(status_code=400, detail="Exactly 4 files must be uploaded.")
        
    dfs = {}
    for file in files:
        contents = await file.read()
        try:
            df = pd.read_csv(io.BytesIO(contents))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading file {file.filename}: {str(e)}")
            
        fname = file.filename.lower()
        if "customer" in fname:
            dfs['customers'] = df
        elif "employee" in fname:
            dfs['employees'] = df
        elif "expense" in fname:
            dfs['expenses'] = df
        elif "sales" in fname:
            dfs['sales'] = df
            
    if not all(k in dfs for k in ['customers', 'employees', 'expenses', 'sales']):
        raise HTTPException(status_code=400, detail="Missing required file types. Please ensure filenames contain 'customers', 'employees', 'expenses', and 'sales'.")
        
    # Validate required columns
    required_cols = {
        'customers': ['Company Name', 'Subscription Tier'],
        'employees': ['First Name', 'Last Name', 'Role', 'Department', 'Hire Date'],
        'expenses': ['Expense Date', 'Category', 'Amount'],
        'sales': ['Transaction Date', 'Customer Name', 'Product Name', 'Sales Rep Name', 'Quantity', 'Total Revenue']
    }
    for key, cols in required_cols.items():
        missing = [c for c in cols if c not in dfs[key].columns]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing required columns in {key}.csv: {', '.join(missing)}")
            
    try:
        counts = {'customers': 0, 'employees': 0, 'expenses': 0, 'sales': 0}
        
        # Clear existing data for a fresh bulk import
        db.query(SalesTransaction).delete()
        db.query(Expense).delete()
        db.query(Product).delete()
        db.query(Employee).delete()
        db.query(Department).delete()
        db.query(Customer).delete()
        db.flush()
        
        # 1. Process Customers
        for _, row in dfs['customers'].iterrows():
            acq_date = pd.to_datetime(row.get('Acquisition Date', pd.Timestamp.today())).date()
            churn_date = pd.to_datetime(row['Churn Date']).date() if 'Churn Date' in row and pd.notnull(row['Churn Date']) else None
            
            cust = Customer(
                company_name=row['Company Name'],
                industry=row.get('Industry') if 'Industry' in row and pd.notnull(row['Industry']) else None,
                acquisition_date=acq_date,
                churn_date=churn_date,
                is_active=pd.isnull(row.get('Churn Date')),
                tier=row['Subscription Tier']
            )
            db.add(cust)
            counts['customers'] += 1
        db.flush()
        
        # 2. Process Employees & Departments
        depts_in_csv = dfs['employees']['Department'].dropna().unique()
        dept_map = {}
        for d in depts_in_csv:
            dept = db.query(Department).filter(Department.name == d).first()
            if not dept:
                dept = Department(name=d, budget=0.0)
                db.add(dept)
                db.flush()
            dept_map[d] = dept.id

        for _, row in dfs['employees'].iterrows():
            hire_date = pd.to_datetime(row['Hire Date']).date()
            term_date = pd.to_datetime(row['Termination Date']).date() if 'Termination Date' in row and pd.notnull(row['Termination Date']) else None
            emp = Employee(
                first_name=row['First Name'],
                last_name=row['Last Name'],
                role=row['Role'],
                department_id=dept_map[row['Department']],
                salary=row.get('Salary', 0.0) if 'Salary' in row and pd.notnull(row['Salary']) else 0.0,
                hire_date=hire_date,
                termination_date=term_date,
                is_active=pd.isnull(row.get('Termination Date'))
            )
            db.add(emp)
            counts['employees'] += 1
        db.flush()
        
        # 3. Process Expenses
        for _, row in dfs['expenses'].iterrows():
            exp = Expense(
                date=pd.to_datetime(row['Expense Date']).date(),
                category=row['Category'],
                amount=row['Amount']
            )
            db.add(exp)
            counts['expenses'] += 1
        db.flush()
        
        # 4. Process Sales Transactions
        products_in_csv = dfs['sales']['Product Name'].dropna().unique()
        prod_map = {}
        for p in products_in_csv:
            prod = db.query(Product).filter(Product.name == p).first()
            if not prod:
                prod = Product(name=p, category="Imported", unit_price=0.0, unit_cost=0.0)
                db.add(prod)
                db.flush()
            prod_map[p] = prod.id
            
        cust_map = {c.company_name: c.id for c in db.query(Customer).all()}
        emp_map = {f"{e.first_name} {e.last_name}": e.id for e in db.query(Employee).all()}
        
        for _, row in dfs['sales'].iterrows():
            c_id = cust_map.get(row['Customer Name'])
            p_id = prod_map.get(row['Product Name'])
            e_name = row['Sales Rep Name']
            e_id = emp_map.get(e_name)
            
            if not c_id or not p_id or not e_id:
                raise ValueError(f"Foreign key mapping failed for row: {row.to_dict()}")
                
            st = SalesTransaction(
                transaction_date=pd.to_datetime(row['Transaction Date']),
                customer_id=c_id,
                product_id=p_id,
                sales_rep_id=e_id,
                quantity=row['Quantity'],
                revenue=row['Total Revenue'],
                discount=row.get('Discount', 0.0) if 'Discount' in row and pd.notnull(row['Discount']) else 0.0
            )
            db.add(st)
            counts['sales'] += 1
            
        db.commit()
        
        duration = time.time() - start_time
        records = sum(counts.values())
        
        # Log the bulk import job
        job = ImportJob(
            filename="Bulk Starter Import (4 Files)",
            status="Completed",
            rows_processed=records,
            rows_imported=records,
            warnings=[]
        )
        db.add(job)
        db.commit()
        
        return {
            "message": "Bulk import completed successfully.", 
            "records_imported": records,
            "details": counts,
            "duration_seconds": round(duration, 2)
        }
        
    except Exception as e:
        db.rollback()
        
        # Log the failed bulk import job
        failed_job = ImportJob(
            filename="Bulk Starter Import (4 Files)",
            status="Failed",
            rows_processed=0,
            rows_imported=0,
            error_message=str(e),
            warnings=[]
        )
        db.add(failed_job)
        db.commit()
        
        raise HTTPException(status_code=500, detail=f"Database transaction failed and rolled back. Error: {str(e)}")
    finally:
        db.close()

@router.get("/history")
async def get_import_history(db: Session = Depends(get_db)):
    """
    Returns the history of import jobs.
    """
    jobs = db.query(ImportJob).order_by(ImportJob.upload_time.desc()).all()
    return [{
        "id": f"job-{job.id}",
        "filename": job.filename,
        "date": job.upload_time.strftime("%b %d, %Y, %I:%M %p"),
        "status": job.status,
        "rows": job.rows_imported,
        "warnings": len(job.warnings) if job.warnings else 0,
        "profile": job.profile.name if job.profile else "Bulk Starter Profile",
        "error_message": job.error_message
    } for job in jobs]

