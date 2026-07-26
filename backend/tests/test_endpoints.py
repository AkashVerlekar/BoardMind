from fastapi.testclient import TestClient
from app.main import app

def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_pagination_recommendations(client):
    # Since we don't have a populated test DB here, we just test the endpoint accepts skip/limit
    response = client.get("/api/v1/recommendations?skip=0&limit=5")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_historical_analytics_endpoint(client):
    response = client.get("/api/v1/analytics/history")
    assert response.status_code == 200
    data = response.json()
    assert "revenue" in data
    assert "profit" in data
    assert isinstance(data["revenue"], list)
