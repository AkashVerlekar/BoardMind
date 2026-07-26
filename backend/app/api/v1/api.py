from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime
import os

from app import schemas
from app.models import Recommendation, Employee
from app.database import get_db
from app.engine.analytics import AnalyticsEngine
from app.engine.decision import DecisionEngine
from app.ai.executive_ai import ExecutiveAILayer
from app.api.v1.endpoints.data_import import router as data_import_router

router = APIRouter()
router.include_router(data_import_router, prefix="/data-import", tags=["Data Import"])

@router.get("/dashboard/brief", response_model=schemas.MorningBriefResponse)
def get_morning_brief(
    db: Session = Depends(get_db),
    period: str = Query("30d", description="Reporting period (today, 7d, 30d, quarter, year)")
):
    """
    Returns the comprehensive Morning Brief for the executive dashboard.
    Uses deterministically calculated analytics for the specified period.
    """
    try:
        analytics = AnalyticsEngine(db)
        decision = DecisionEngine(db)
        ai_layer = ExecutiveAILayer()

        # Gather data for the specified period
        analytics_data = schemas.AnalyticsResponse(
            strategic=analytics.get_strategic_analytics(period),
            operational=analytics.get_operational_analytics()
        )
        
        health_data = analytics.calculate_business_health(period)
        decision_result = decision.execute(analytics_data)

        # Generate Executive Summary (AI or Rule-based Fallback)
        exec_summary, is_ai, conf_score = ai_layer.generate_morning_brief(analytics_data, health_data, decision_result, period)

        # Simulator metadata
        sim_mode = os.getenv("SIMULATOR_MODE", "deterministic")
        sim_scenario = os.getenv("SIMULATOR_SCENARIO", "growth")

        return schemas.MorningBriefResponse(
            executive_summary=exec_summary,
            is_ai_generated=is_ai,
            generation_timestamp=datetime.now().isoformat(),
            confidence_score=conf_score,
            last_refreshed=datetime.now().isoformat(),
            simulator_mode=sim_mode.capitalize(),
            simulator_scenario=sim_scenario.capitalize(),
            health_score=health_data.overall,
            health_audit=health_data.audit,
            top_risks=decision_result["anomalies"][:3],
            top_opportunities=decision_result["anomalies"][-3:],
            recommended_actions=decision_result["recommendations"][:5],
            strategic_highlights=analytics_data.strategic,
            operational_highlights=analytics_data.operational
        )
    except Exception as e:
        from fastapi import HTTPException
        import logging
        logging.error(f"Failed to generate morning brief: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard/health", response_model=schemas.BusinessHealthResponse)
def get_business_health(
    db: Session = Depends(get_db),
    period: str = Query("30d", description="Reporting period")
):
    analytics = AnalyticsEngine(db)
    return analytics.calculate_business_health(period)

@router.get("/dashboard/historical", response_model=schemas.HistoricalAnalyticsResponse)
def get_historical_data(db: Session = Depends(get_db)):
    analytics = AnalyticsEngine(db)
    return analytics.get_historical_data()

@router.get("/system/status", response_model=schemas.SystemStatusResponse)
def get_system_status(db: Session = Depends(get_db)):
    # Check DB
    try:
        analytics = AnalyticsEngine(db)
        db_status = "Online"
        analytics_status = "Operational"
    except Exception:
        db_status = "Offline"
        analytics_status = "Degraded"
        
    sim_mode = os.getenv("SIMULATOR_MODE", "deterministic").capitalize()
    sim_scenario = os.getenv("SIMULATOR_SCENARIO", "growth").capitalize()
    
    # Check Gemini API Key presence (simulate health)
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    if not gemini_key:
        ai_status = "Fallback (Rule-Based)"
    else:
        ai_status = "Online (Gemini Active)"

    return schemas.SystemStatusResponse(
        analytics_engine=analytics_status,
        database=db_status,
        api="Online",
        simulator=f"{sim_mode} ({sim_scenario})",
        ai_service=ai_status
    )

@router.get("/recommendations")
def get_recommendations():
    return [
        {
            "id": 1,
            "recommendation_id": "REC-001",
            "department_name": "Sales",
            "title": "Optimize Pricing Strategy",
            "description": "Increase pricing by 5% on enterprise tier.",
            "priority": "High",
            "status": "Pending",
            "confidence_level": "High",
            "confidence_score": 0.95,
            "recommendation_reason": "Historical data suggests price inelasticity."
        }
    ]

@router.post("/recommendations/{rec_id}/action", response_model=schemas.RecommendationResponse)
def update_recommendation(
    rec_id: int, 
    status: str, 
    assigned_to_id: int = None,
    db: Session = Depends(get_db)
):
    from fastapi import HTTPException
    rec = db.query(Recommendation).filter(Recommendation.id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
        
    rec.status = status
    if assigned_to_id:
        rec.assigned_to_id = assigned_to_id
        
    db.commit()
    db.refresh(rec)
    return rec

@router.post("/recommendations/{rec_id}/action-plan", response_model=schemas.RecommendationResponse)
def generate_action_plan(
    rec_id: int,
    db: Session = Depends(get_db)
):
    from fastapi import HTTPException
    rec = db.query(Recommendation).filter(Recommendation.id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
        
    ai_layer = ExecutiveAILayer()
    
    # We should gather some metrics context to enrich the plan.
    analytics = AnalyticsEngine(db)
    analytics_data = analytics.get_strategic_analytics("30d")
    metrics_context = "\n".join([f"- {k}: {v.current_value} ({v.percentage_change}%)" for k, v in analytics_data.items()])
    
    action_plan_md, is_ai = ai_layer.generate_action_plan(rec, metrics_context)
    
    rec.action_plan = action_plan_md
    rec.action_plan_is_ai = is_ai
    rec.action_plan_generated_at = datetime.now()
    
    db.commit()
    db.refresh(rec)
    return rec

@router.get("/analytics/history")
def get_analytics_history(
    db: Session = Depends(get_db),
    period: str = Query("30d", description="Reporting period")
):
    analytics = AnalyticsEngine(db)
    return analytics.get_historical_data(period)

@router.get("/anomalies")
def get_anomalies():
    return []

@router.get("/employees")
def get_employees(db: Session = Depends(get_db)):
    employees = db.query(Employee).all()
    if not employees:
        return [{"id": 1, "first_name": "John", "last_name": "Doe", "role": "Manager"}]
    return employees

@router.get("/reports/{report_type}")
def get_dynamic_report(report_type: str, db: Session = Depends(get_db)):
    from app.ai.market_researcher import MarketResearcher
    
    analytics = AnalyticsEngine(db)
    analytics_data = analytics.get_strategic_analytics("30d")
    internal_metrics = "\n".join([f"- {k}: {v.current_value} (Change: {v.percentage_change:.1f}%)" for k, v in analytics_data.items()])
    
    researcher = MarketResearcher()
    market_intel = researcher.get_market_intelligence()
    market_data_str = market_intel.get("data", "")
    
    ai_layer = ExecutiveAILayer()
    
    try:
        report_json = ai_layer.generate_dynamic_report(report_type, internal_metrics, market_data_str)
        
        # Append Evidence & Traceability Appendix
        report_json["appendix"] = {
            "internal_snapshot_time": datetime.now().isoformat(),
            "market_cache_time": market_intel.get("timestamp"),
            "industry_used": market_intel.get("industry"),
            "external_sources": "DuckDuckGo Web Search API",
            "ai_generation_time": datetime.now().isoformat(),
            "note": market_intel.get("note", None)
        }
        
        return report_json
    except Exception as e:
        import logging
        logging.error(f"Error generating report: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Failed to generate report")
