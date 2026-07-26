import sys
import os
import random
from datetime import date, timedelta
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import text
from dotenv import load_dotenv

# Add backend directory to path to import models
backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend')
sys.path.insert(0, backend_dir)
load_dotenv(os.path.join(os.path.dirname(backend_dir), '.env'))

from app.database import engine_sim as engine
from app.models import (
    Base, Department, Employee, Customer, Product, SalesTransaction,
    Expense, Event
)

def clear_data(db: Session):
    print("Clearing existing data...")
    if engine.url.drivername == "sqlite":
        for table in ["recommendations", "events", "sales_transactions", "expenses", "products", "customers", "employees", "departments"]:
            db.execute(text(f"DELETE FROM {table};"))
    else:
        db.execute(text("TRUNCATE TABLE recommendations, events, sales_transactions, expenses, products, customers, employees, departments RESTART IDENTITY CASCADE;"))
    db.commit()

def generate_departments(db: Session):
    print("Generating Departments...")
    depts = [
        Department(name="Sales", budget=500000),
        Department(name="Engineering", budget=1500000),
        Department(name="Marketing", budget=400000),
        Department(name="Customer Success", budget=250000),
    ]
    db.add_all(depts)
    db.commit()
    return depts

def generate_employees(db: Session, depts):
    print("Generating Employees...")
    employees = []
    base_date = date(2023, 1, 1)
    for i in range(40):
        dept = random.choice(depts)
        emp = Employee(
            first_name=f"Emp_{i}",
            last_name=f"SaaS_{i}",
            role="Engineer" if dept.name == "Engineering" else "Specialist",
            salary=random.randint(70000, 180000),
            hire_date=base_date + timedelta(days=random.randint(0, 300)),
            is_active=True,
            department_id=dept.id
        )
        employees.append(emp)
    db.add_all(employees)
    db.commit()
    return employees

def generate_products(db: Session):
    print("Generating SaaS Tiers...")
    products = [
        Product(name="Starter Subscription", category="SaaS", unit_price=50.0, unit_cost=5.0),
        Product(name="Pro Subscription", category="SaaS", unit_price=200.0, unit_cost=20.0),
        Product(name="Enterprise License", category="SaaS", unit_price=2000.0, unit_cost=150.0),
    ]
    db.add_all(products)
    db.commit()
    return products

def generate_customers(db: Session, scenario: str):
    print(f"Generating Customers for scenario: {scenario}...")
    customers = []
    base_date = date(2023, 1, 1)
    
    # Configure distributions based on scenario
    if scenario == "startup":
        count = 50
        churn_rate = 0.25
        tier_weights = [0.8, 0.15, 0.05]
    elif scenario == "growth":
        count = 300
        churn_rate = 0.10
        tier_weights = [0.5, 0.4, 0.1]
    elif scenario == "enterprise":
        count = 100
        churn_rate = 0.05
        tier_weights = [0.1, 0.3, 0.6]
    elif scenario == "declining":
        count = 150
        churn_rate = 0.40
        tier_weights = [0.7, 0.2, 0.1]
    else:
        # Default fallback
        count = 150
        churn_rate = 0.15
        tier_weights = [0.6, 0.3, 0.1]
        
    for i in range(count):
        acq_date = base_date + timedelta(days=random.randint(0, 500))
        is_churned = random.random() < churn_rate
        churn_date = acq_date + timedelta(days=random.randint(30, 200)) if is_churned else None
        
        tier = random.choices(["Starter", "Pro", "Enterprise"], weights=tier_weights, k=1)[0]
        cust = Customer(
            company_name=f"TechCorp_{i}",
            industry=random.choice(["Tech", "Fintech", "Healthcare", "E-commerce"]),
            acquisition_date=acq_date,
            churn_date=churn_date,
            is_active=not is_churned,
            tier=tier
        )
        customers.append(cust)
    db.add_all(customers)
    db.commit()
    return customers

def generate_events(db: Session, customers, products, employees, scenario: str):
    print("Generating Transactions and Expenses...")
    sales_reps = [e for e in employees if e.department.name == "Sales"]
    if not sales_reps:
        sales_reps = employees
        
    transactions = []
    expenses = []
    start_date = date(2023, 1, 1)
    end_date = date(2024, 12, 31)
    current_date = start_date
    
    # Cost baselines depending on scenario
    if scenario == "enterprise":
        base_infra = 3000
        base_mkt = 2000
    elif scenario == "startup":
        base_infra = 200
        base_mkt = 500
    else:
        base_infra = 1000
        base_mkt = 1000
    
    while current_date <= end_date:
        infra_cost = random.uniform(base_infra * 0.8, base_infra * 1.2)
        marketing_cost = random.uniform(base_mkt * 0.5, base_mkt * 1.5)
        
        expenses.append(Expense(date=current_date, category="Cloud Infrastructure", amount=infra_cost))
        expenses.append(Expense(date=current_date, category="Marketing", amount=marketing_cost))
        
        active_today = [c for c in customers if c.acquisition_date <= current_date and (c.churn_date is None or c.churn_date > current_date)]
        
        for cust in active_today:
            if random.random() < 0.05:
                if cust.tier == "Enterprise":
                    prod = next(p for p in products if p.name == "Enterprise License")
                elif cust.tier == "Pro":
                    prod = next(p for p in products if p.name == "Pro Subscription")
                else:
                    prod = next(p for p in products if p.name == "Starter Subscription")
                    
                qty = 1 if cust.tier != "Enterprise" else random.randint(1, 10)
                tx = SalesTransaction(
                    transaction_date=pd.to_datetime(current_date) + pd.Timedelta(hours=random.randint(8, 18)),
                    customer_id=cust.id,
                    product_id=prod.id,
                    sales_rep_id=random.choice(sales_reps).id,
                    quantity=qty,
                    revenue=qty * prod.unit_price,
                    discount=0.0
                )
                transactions.append(tx)
        
        current_date += timedelta(days=1)
        
    db.add_all(transactions)
    db.add_all(expenses)
    db.commit()

def main():
    mode = os.getenv("SIMULATOR_MODE", "deterministic").lower()
    scenario = os.getenv("SIMULATOR_SCENARIO", "growth").lower()
    seed_value = int(os.getenv("SIMULATOR_SEED", "42"))
    
    print(f"Initializing Simulator: Mode={mode}, Scenario={scenario}")
    
    if mode == "deterministic":
        print(f"Applying fixed seed: {seed_value}")
        random.seed(seed_value)
    else:
        print("Using random seed for dynamic simulation.")
        # Do not seed, leave truly random
    
    Base.metadata.create_all(bind=engine)
    with Session(engine) as db:
        clear_data(db)
        depts = generate_departments(db)
        emps = generate_employees(db, depts)
        prods = generate_products(db)
        custs = generate_customers(db, scenario)
        generate_events(db, custs, prods, emps, scenario)
        print("SaaS World Generation Complete! No KPIs calculated (deferred to Analytics Engine).")

if __name__ == "__main__":
    main()
