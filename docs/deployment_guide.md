# Deployment Guide

BoardMind is architected to run in containerized environments.

## Docker & PostgreSQL
In a production setting, BoardMind requires a dedicated PostgreSQL instance.

1. Ensure the PostgreSQL container is running and exposes port 5432.
2. Initialize the schema using Alembic migrations (if implemented) or allow SQLAlchemy's `Base.metadata.create_all(bind=engine)` to run on startup.

## Environment Variables
Create a production `.env` file containing:
```env
DATABASE_URL=postgresql://production_user:super_secret_password@db_host:5432/boardmind_prod
GEMINI_API_KEY=your_production_google_gemini_api_key
```

## Gemini Configuration
Ensure that the `GEMINI_API_KEY` is properly provisioned with sufficient rate limits through Google Cloud. If the key is invalid or rate-limited, the application gracefully degrades to returning fallback mock AI data, but true AI insights require a valid quota.

## Production Checklist
- [ ] Database credentials rotated and secured.
- [ ] `GEMINI_API_KEY` validated.
- [ ] Next.js Frontend compiled using `npm run build` and hosted statically or via a Node server.
- [ ] FastAPI Backend deployed behind a production ASGI server like Gunicorn (`gunicorn app.main:app -k uvicorn.workers.UvicornWorker`).
- [ ] Proper TLS/SSL termination configured at the reverse proxy (e.g., Nginx).
