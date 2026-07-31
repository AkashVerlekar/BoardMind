import logging
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict
from fastapi.middleware.cors import CORSMiddleware

from .database import get_db, engine_sim, engine_real
from .config import settings
from . import models
from .api.v1.api import router as api_v1_router

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="BoardMind API",
    description="Backend API for the BoardMind Executive Decision Intelligence Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows localhost connections from Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up BoardMind API...")
    # Create tables in both databases
    models.Base.metadata.create_all(bind=engine_sim)
    models.Base.metadata.create_all(bind=engine_real)
    logger.info("Database schemas ensured for Simulator and Real Data providers.")

app.include_router(api_v1_router, prefix="/api/v1")

@app.get("/health")
def health_check(db: Session = Depends(get_db)) -> Dict[str, str]:
    """Health check endpoint that verifies DB connectivity."""
    db_status = "unhealthy"
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        
    return {
        "status": "ok",
        "database": db_status,
        "environment": "production"
    }
