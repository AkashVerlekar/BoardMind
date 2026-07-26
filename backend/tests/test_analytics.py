import pytest
from app.engine.analytics import AnalyticsEngine
from unittest.mock import MagicMock
from datetime import datetime, timedelta

def test_analytics_calculations():
    db_mock = MagicMock()
    engine = AnalyticsEngine(db_mock)
    
    # We can mock the _get_metric_sum to test logic
    engine._get_metric_sum = MagicMock(side_effect=[110, 100, 110, 100, 110, 100, 110, 100])
    
    res = engine.get_strategic_analytics()
    
    assert "revenue" in res
    revenue_kpi = res["revenue"]
    assert revenue_kpi.current_value == 110
    assert revenue_kpi.percentage_change == 10.0
    assert revenue_kpi.trend == "increasing"
    assert revenue_kpi.status == "good"

def test_business_health_score():
    db_mock = MagicMock()
    engine = AnalyticsEngine(db_mock)
    
    engine.get_strategic_analytics = MagicMock(return_value={
        "customer_growth": MagicMock(percentage_change=5.0),
        "revenue": MagicMock(percentage_change=5.0),
        "profit": MagicMock(percentage_change=2.0)
    })
    
    engine.get_operational_analytics = MagicMock(return_value={
        "burnout_risk": MagicMock(current_value=0.5)
    })
    
    health = engine.calculate_business_health()
    assert health.overall > 0
    assert health.overall > 0
    assert health.financial > 0
    assert health.customers > 0
    assert health.employees > 0
