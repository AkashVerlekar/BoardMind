from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from .models import RecommendationState

class AuditInfo(BaseModel):
    metric_name: str
    source: str
    business_calculation: str
    records_processed: int
    reporting_period: str
    last_updated: str
    why_it_changed: str
    top_contributors: List[str]
    input_values: Dict[str, Any]
    intermediate_calculations: Dict[str, Any]
    final_calculated_value: float

class KPIResult(BaseModel):
    current_value: float
    previous_value: float
    percentage_change: float
    trend: str
    status: str
    summary: str
    audit: AuditInfo

class BusinessHealthResponse(BaseModel):
    overall: float
    financial: float
    customers: float
    employees: float
    summary: str
    audit: AuditInfo

class AnalyticsResponse(BaseModel):
    strategic: Dict[str, KPIResult]
    operational: Dict[str, KPIResult]

class TimeSeriesDataPoint(BaseModel):
    date: str
    value: float

class HistoricalAnalyticsResponse(BaseModel):
    revenue: List[TimeSeriesDataPoint]
    profit: List[TimeSeriesDataPoint]

class Anomaly(BaseModel):
    id: str
    metric_name: str
    anomaly_type: str
    current_value: float
    percentage_change: float
    severity: str
    description: str

class RecommendationBase(BaseModel):
    recommendation_id: str
    title: str
    description: str
    severity: Optional[str] = None
    priority: str
    estimated_financial_impact: Optional[float] = None
    confidence_score: Optional[float] = None
    confidence_level: Optional[str] = None
    business_category: Optional[str] = None
    department_name: Optional[str] = None
    due_date: Optional[date] = None
    recommendation_reason: Optional[str] = None
    source_metric: Optional[str] = None
    action_plan: Optional[str] = None
    action_plan_generated_at: Optional[datetime] = None
    action_plan_is_ai: Optional[bool] = None

class RecommendationCreate(BaseModel):
    department_name: str
    title: str
    description: str
    priority: str

class EmployeeResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    role: str
    department_id: Optional[int] = None
    
    class Config:
        from_attributes = True

class RecommendationResponse(RecommendationBase):
    id: int
    created_date: datetime
    status: RecommendationState
    assigned_to_id: Optional[int] = None
    
    class Config:
        from_attributes = True

class MorningBriefResponse(BaseModel):
    executive_summary: str
    is_ai_generated: bool
    generation_timestamp: str
    confidence_score: float
    last_refreshed: str
    simulator_mode: str
    simulator_scenario: str
    health_score: float
    health_audit: AuditInfo
    top_risks: List[Anomaly]
    top_opportunities: List[Anomaly]
    recommended_actions: List[RecommendationResponse]
    strategic_highlights: Dict[str, KPIResult]
    operational_highlights: Dict[str, KPIResult]

class SystemStatusResponse(BaseModel):
    analytics_engine: str
    database: str
    api: str
    simulator: str
    ai_service: str
