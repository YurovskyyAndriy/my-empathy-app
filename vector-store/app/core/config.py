from pydantic_settings import BaseSettings
from pydantic import ConfigDict, Field

class Settings(BaseSettings):
    # Service settings
    APP_NAME: str = "Vector Store Service"
    DEBUG: bool = True
    
    # Weaviate settings
    WEAVIATE_HOST: str = "weaviate-db"
    WEAVIATE_PORT: int = 8080
    QUERY_DEFAULTS_LIMIT: int = 25
    VECTOR_DB_CONFIDENCE_THRESHOLD: float = Field(
        default=0.95,
        description="Confidence threshold for vector database matches"
    )
    
    # Schema settings
    WEAVIATE_CLASS_NAME: str = "ChatMessage"
    
    model_config = ConfigDict(
        env_file="../../.env",
        case_sensitive=True,
        extra="allow"
    )

settings = Settings() 