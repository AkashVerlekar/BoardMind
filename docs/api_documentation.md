# API Documentation

The BoardMind REST API is hosted by FastAPI. By default, it runs on `http://localhost:8000`.

*Note: All endpoints are prefixed with `/api/v1`.*

---

## 1. Health Check
`GET /health`
Returns the status of the backend API.
**Response:**
```json
{
  "status": "ok"
}
```

---

## 2. Morning Brief
`GET /dashboard/brief`
Generates the comprehensive morning brief, triggering the analytics, decision, and AI engines.
**Response:**
```json
{
  "date": "2023-10-25",
  "health_score": { "overall": 85.5, ... },
  "key_metrics": [ { "metric": "Revenue", "value": 11000.0, ... } ],
  "recommendations": [ { "id": "1", "title": "Increase Marketing", ... } ]
}
```

---

## 3. Analytics Endpoints

`GET /analytics/strategic`
Returns KPI analysis with a 30-day lookback for revenue, profit, cash flow, and customer growth.

`GET /analytics/operational`
Returns KPI analysis with a 7-day lookback for churn, burnout, and sales activity.

`GET /analytics/historical`
Returns a trailing 30-day chronological dataset for frontend chart rendering.
**Response:**
```json
{
  "revenue": [ {"date": "2023-10-01", "value": 10500}, ... ],
  "profit": [ {"date": "2023-10-01", "value": 3100}, ... ]
}
```

---

## 4. Recommendations Workflow

`GET /recommendations`
Retrieves the list of generated recommendations.

`POST /recommendations/{id}/action`
Updates the state or assignment of a recommendation.
**Request Body:**
```json
{
  "action": "approve" // Options: approve, reject, assign, complete
}
```
**Response:**
```json
{
  "id": "1",
  "title": "Launch Campaign",
  "status": "Approved",
  "assignee_id": null
}
```

---

## 5. Employee Directory

`GET /employees`
Retrieves a list of active employees from the database, primarily used for assigning recommendations.
**Response:**
```json
[
  {
    "id": 1,
    "name": "Jane Doe",
    "role": "Marketing Director",
    "department_id": 2
  }
]
```
