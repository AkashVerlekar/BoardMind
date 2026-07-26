# Developer Guide

Welcome to the BoardMind development team. This guide outlines how to extend the platform.

## Project Structure

BoardMind is a monorepo containing:
- `/backend`: Python FastAPI application.
- `/frontend`: Next.js React application.

Ensure you are working in the correct virtual environment for the backend, and using `npm` or `yarn` for the frontend.

## Coding Standards
- **Backend:** Strictly adhere to PEP-8. Utilize Python type hints (`-> dict`, `: str`) universally. Use Pydantic schemas for all API I/O validation.
- **Frontend:** Strict TypeScript. Use Tailwind utility classes for styling. Favor functional components and Zustand for global state.

## Running Tests

The backend includes a Pytest suite that isolates the database.
```bash
cd backend
python -m pytest tests/ -v
```
*Note: The test suite patches Gemini API calls to prevent external network dependencies during CI pipelines.*

## Adding New Modules

1. **Database Model:** Define the SQLAlchemy model in `backend/app/models.py`.
2. **Schema Validation:** Define the Pydantic schema in `backend/app/schemas.py`.
3. **Endpoint:** Expose the route in `backend/app/api/v1/endpoints.py`.
4. **Frontend Integration:** Add the fetch logic to `frontend/src/lib/api.ts`.
5. **UI Rendering:** Build a React component utilizing Tailwind and the new API data.

## Extending the Analytics Engine

To track a new KPI:
1. Ensure the underlying metric exists in `models.py` (e.g., `FinancialMetric.marketing_spend`).
2. Add a calculation to `AnalyticsEngine` in `backend/app/engine/analytics.py`.
3. Expose it via `get_strategic_analytics()` or `get_operational_analytics()`.

## Extending the Decision Engine

The Decision Engine (`backend/app/engine/decision.py`) uses a Rule Registry pattern. 
To add a new business rule:
1. Subclass `BusinessRule`.
2. Implement the `evaluate()` method to inspect an `Anomaly`.
3. If the criteria match, return a `RuleMatch` object with contextual advice.
4. Register the rule instance in `DecisionEngine.__init__()`.
