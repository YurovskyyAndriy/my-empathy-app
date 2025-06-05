from typing import Optional, List, Dict
from pydantic import ConfigDict, field_validator, Field
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
    
    # Vector DB settings (Weaviate)
    VECTOR_DB_URL: str = Field(validation_alias='VECTOR_DB_URL')
    VECTOR_DB_CONFIDENCE_THRESHOLD: float = Field(default=0.85, validation_alias='VECTOR_DB_CONFIDENCE_THRESHOLD')
    
    # AB Testing configuration
    AB_TEST_OPENAI_WEIGHT: float = Field(default=100.0, validation_alias='AB_TEST_OPENAI_WEIGHT')
    AB_TEST_VECTOR_DB_WEIGHT: float = Field(default=0.0, validation_alias='AB_TEST_VECTOR_DB_WEIGHT')
    AB_TEST_LOCAL_LLM_WEIGHT: float = Field(default=0.0, validation_alias='AB_TEST_LOCAL_LLM_WEIGHT')
    
    @property
    def ab_test_config(self) -> Dict[str, float]:
        return {
            "openai": self.AB_TEST_OPENAI_WEIGHT,
            "vector_db": self.AB_TEST_VECTOR_DB_WEIGHT,
            "local_llm": self.AB_TEST_LOCAL_LLM_WEIGHT
        }
    
    # Service configuration
    BACKEND_PORT: int = Field(default=4000, validation_alias='BACKEND_PORT')
    
    @property
    def cors_origins(self) -> List[str]:
        return [
            f"http://localhost:{self.FRONTEND_PORT}",
            f"http://frontend:{self.FRONTEND_PORT}",
            "http://localhost:5173",  # Vite dev server
            "http://frontend:5173"    # Vite in Docker
        ]
    
    model_config = ConfigDict(
        env_file="../.env",
        case_sensitive=True,
        extra="allow"  # Allow additional environment variables
    ) 