from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from fastapi import Request
from .config import settings

# Engine for Simulator Data
if settings.database_url.startswith("sqlite"):
    engine_sim = create_engine(
        settings.database_url, connect_args={"check_same_thread": False}
    )
else:
    engine_sim = create_engine(settings.database_url, echo=False)

# Engine for Real Business Data
if settings.database_url_real.startswith("sqlite"):
    engine_real = create_engine(
        settings.database_url_real, connect_args={"check_same_thread": False}
    )
else:
    engine_real = create_engine(settings.database_url_real, echo=False)

SessionLocalSim = sessionmaker(autocommit=False, autoflush=False, bind=engine_sim)
SessionLocalReal = sessionmaker(autocommit=False, autoflush=False, bind=engine_real)

Base = declarative_base()

def get_db(request: Request = None):
    """
    Data Provider Abstraction:
    Dynamically routes to either the Simulator or Real database depending on the X-Data-Mode header.
    Defaults to 'simulator'.
    """
    mode = "simulator"
    if request and "x-data-mode" in request.headers:
        mode = request.headers["x-data-mode"].lower()
        
    db = SessionLocalReal() if mode == "real" else SessionLocalSim()
    
    try:
        yield db
    finally:
        db.close()

