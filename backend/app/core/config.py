from typing import Optional
from pydantic import ConfigDict, field_validator
from pydantic_settings import BaseSettings
import os
from pathlib import Path

# Get the project root directory path
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent

class Settings(BaseSettings):
    # Base
    APP_NAME: str = "Empathy App"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    NODE_ENV: Optional[str] = None
    FRONTEND_PORT: Optional[str] = None
    
    # API Keys
    OPENAI_API_KEY: str
    
    # Database
    DATABASE_URL: str = "sqlite:///./backend/empathy.db"
    
    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Vector Store
    VECTOR_STORE_PATH: str = "./backend/vector_store"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    VECTOR_DB_URL: Optional[str] = None
    
    # Additional Services
    MCP_ENABLED: Optional[bool] = None
    WHISPER_HOST: Optional[str] = None

    @field_validator("VECTOR_STORE_PATH")
    @classmethod
    def validate_vector_store_path(cls, v: str) -> str:
        # Convert relative path to absolute path relative to project root
        path = PROJECT_ROOT / v
        path.mkdir(parents=True, exist_ok=True)
        return str(path.absolute())

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if v.startswith("sqlite:///./"):
            # Convert relative SQLite path to absolute path
            db_path = v.replace("sqlite:///./", "")
            absolute_path = PROJECT_ROOT / db_path
            absolute_path.parent.mkdir(parents=True, exist_ok=True)
            return f"sqlite:///{absolute_path.absolute()}"
        return v

    model_config = ConfigDict(
        env_file="../.env",
        case_sensitive=True,
        extra="allow"  # Allow additional environment variables
    )

settings = Settings() 