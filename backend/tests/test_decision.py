import pytest
from unittest.mock import MagicMock
from app.engine.decision import DecisionEngine, ProfitDropRule
from app.schemas import Anomaly, RecommendationCreate

def test_profit_drop_rule():
    rule = ProfitDropRule()
    
    # Test match
    anomaly = Anomaly(id="1", metric_name="Profit", anomaly_type="DROP", current_value=1000, percentage_change=-15.0, severity="High", description="Test")
    result = rule.evaluate(anomaly)
    assert result is not None
    assert result.priority == "High"
    assert result.department_name == "Finance"
    
    # Test no match
    anomaly_no_match = Anomaly(id="2", metric_name="Revenue", anomaly_type="DROP", current_value=1000, percentage_change=-15.0, severity="Medium", description="Test")
    result_no_match = rule.evaluate(anomaly_no_match)
    assert result_no_match is None

def test_decision_engine_registry():
    db_mock = MagicMock()
    engine = DecisionEngine(db=db_mock)
    
    # Ensure rules are registered
    assert len(engine.rules) >= 3
    
    # Test recommendation generation logic
    anomaly = Anomaly(id="1", metric_name="Profit", anomaly_type="DROP", current_value=1000, percentage_change=-15.0, severity="High", description="Test")
    
    # Prevent DB hit in mock
    db_mock.query().filter().all.return_value = []
    
    engine._generate_recommendation(anomaly)
    
    # Check if db.add was called
    db_mock.add.assert_called_once()
    db_mock.commit.assert_called_once()
