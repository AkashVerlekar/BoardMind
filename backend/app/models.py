from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Text, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base

class RecommendationState(str, enum.Enum):
    NEW = "New"
    UNDER_REVIEW = "Under Review"
    APPROVED = "Approved"
    ASSIGNED = "Assigned"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    REJECTED = "Rejected"

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    budget = Column(Float, default=0.0)
    
    employees = relationship("Employee", back_populates="department")

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    salary = Column(Float, nullable=False)
    hire_date = Column(Date, nullable=False)
    termination_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    department_id = Column(Integer, ForeignKey("departments.id"))
    
    department = relationship("Department", back_populates="employees")
    transactions = relationship("SalesTransaction", back_populates="sales_rep")

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False, index=True)
    industry = Column(String)
    acquisition_date = Column(Date, nullable=False)
    churn_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    tier = Column(String, default="Standard") # Standard, Premium, Enterprise
    
    transactions = relationship("SalesTransaction", back_populates="customer")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String)
    unit_price = Column(Float, nullable=False)
    unit_cost = Column(Float, nullable=False)
    
    transactions = relationship("SalesTransaction", back_populates="product")

class SalesTransaction(Base):
    __tablename__ = "sales_transactions"
    id = Column(Integer, primary_key=True, index=True)
    transaction_date = Column(DateTime(timezone=True), default=func.now(), index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    sales_rep_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    revenue = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    
    customer = relationship("Customer", back_populates="transactions")
    product = relationship("Product", back_populates="transactions")
    sales_rep = relationship("Employee", back_populates="transactions")

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    category = Column(String, nullable=False) # e.g. "Cloud Infrastructure", "Marketing", "Payroll"
    amount = Column(Float, nullable=False)

class Event(Base):
    """External or internal events affecting the simulation (e.g. Campaign, Supply Chain Delay)"""
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    event_type = Column(String, nullable=False) # e.g. "Marketing", "Macroeconomic", "Operations"
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    impact_multiplier = Column(Float, default=1.0) # e.g., 1.2x sales boost
    description = Column(Text)

class RecommendationState(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    ASSIGNED = "Assigned"
    COMPLETED = "Completed"
    DEFERRED = "Deferred"
    ARCHIVED = "Archived"

class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(String, unique=True, index=True, nullable=False)
    created_date = Column(DateTime(timezone=True), default=func.now())
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String) # e.g., Critical, High, Medium, Low
    priority = Column(String, index=True) # e.g., P1, P2, P3
    estimated_financial_impact = Column(Float, nullable=True) # e.g. 50000.0
    confidence_score = Column(Float) # 0.0 to 1.0
    business_category = Column(String) # e.g., Financial, Operational
    department_name = Column(String)
    status = Column(Enum(RecommendationState), default=RecommendationState.PENDING, index=True)
    assigned_to_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    due_date = Column(Date, nullable=True)
    recommendation_reason = Column(Text)
    source_metric = Column(String)
    action_plan = Column(Text, nullable=True)
    action_plan_generated_at = Column(DateTime(timezone=True), nullable=True)
    action_plan_is_ai = Column(Boolean, nullable=True)
    
    assigned_to = relationship("Employee")

class ImportProfile(Base):
    __tablename__ = "import_profiles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    version = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime(timezone=True), default=func.now())
    mapping_config = Column(JSON, nullable=False) # Stores the dict of {BoardMindField: UploadedColumn}

class ImportJob(Base):
    __tablename__ = "import_jobs"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    upload_time = Column(DateTime(timezone=True), default=func.now())
    profile_id = Column(Integer, ForeignKey("import_profiles.id"), nullable=True)
    status = Column(String, default="Pending") # Pending, Processing, Completed, Failed
    rows_processed = Column(Integer, default=0)
    rows_imported = Column(Integer, default=0)
    warnings = Column(JSON, nullable=True) # Array of warning strings
    error_message = Column(Text, nullable=True)
    
    profile = relationship("ImportProfile")
