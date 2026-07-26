import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    app_name: str = "BoardMind Executive AI"
    api_v1_str: str = "/api/v1"
    
    # Use SQLite for execution in sandbox environment
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./boardmind.db")
    database_url_real: str = os.getenv("DATABASE_URL_REAL", "sqlite:///./boardmind_real.db")
    
    gemini_api_key: Optional[str] = os.getenv("GEMINI_API_KEY", None)

    class Config:
        env_file = ".env"

settings = Settings()
