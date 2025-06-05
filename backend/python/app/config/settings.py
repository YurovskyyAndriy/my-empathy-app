from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Dict, Optional, List
from os import getenv
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

DEFAULT_EI_PROMPT = """You are a helpful assistant that rewrites messages to be more empathetic.

First, analyze the message and put your analysis in the "analysis" section of the JSON response.

Then, imagine you are directly talking to me and I ask you:
"Could you please rewrite this message to be more empathetic and constructive?"

Your task is to:
1. Put your analysis in the "analysis" section
2. Put your rewritten message in "long_version"
3. Put a shorter version in "short_version"

IMPORTANT: In long_version and short_version, write ONLY the rewritten message, as if you were responding in chat. Do not explain or analyze - just rewrite it!

Example:
Me: "This code is terrible!"
You (long_version): "I've been reviewing the code and noticed some areas that could be improved. Would you be open to discussing potential refactoring approaches?"
You (short_version): "Let's discuss how we can improve the code."

Required JSON structure:
{
    "analysis": {
        "self_awareness": {
            "emotional_background": string,
            "present_elements": string,
            "missing_elements": string
        },
        "self_regulation": {
            "current_phrasing": string,
            "improvement_examples": string,
            "alternative_phrases": string
        },
        "empathy": {
            "missing_elements": string,
            "potential_additions": string,
            "understanding_examples": string
        },
        "social_skills": {
            "current_impact": string,
            "improvements": string,
            "examples": string
        }
    },
    "long_version": string,  // ONLY the rewritten message, as if in chat
    "short_version": string  // ONLY the shorter version, as if in chat
}"""

class Settings(BaseSettings):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        logger.debug(f"VECTOR_DB_CONFIDENCE_THRESHOLD from env: {getenv('VECTOR_DB_CONFIDENCE_THRESHOLD')}")
        logger.debug(f"VECTOR_DB_CONFIDENCE_THRESHOLD in settings: {self.vector_db_confidence_threshold}")

    # OpenAI settings
    openai_api_key: str = Field(default=..., validation_alias='OPENAI_API_KEY')
    openai_model: str = Field(default='gpt-3.5-turbo', validation_alias='OPENAI_MODEL')
    
    # Vector DB settings
    vector_db_url: str = Field(default='http://weaviate-db:8080', validation_alias='VECTOR_DB_URL')
    vector_db_confidence_threshold: float = Field(
        default=0.95,  # Increased from 0.3 to require much higher similarity
        description="Confidence threshold for vector database matches"
    )
    
    # AB Testing configuration
    ab_test_openai_weight: float = Field(default=100.0, validation_alias='AB_TEST_OPENAI_WEIGHT')
    ab_test_vector_db_weight: float = Field(default=0.0, validation_alias='AB_TEST_VECTOR_DB_WEIGHT')
    ab_test_local_llm_weight: float = Field(default=0.0, validation_alias='AB_TEST_LOCAL_LLM_WEIGHT')
    
    @property
    def ab_test_config(self) -> Dict[str, float]:
        return {
            "openai": self.ab_test_openai_weight,
            "vector_db": self.ab_test_vector_db_weight,
            "local_llm": self.ab_test_local_llm_weight
        }
    
    # Template configurations
    default_template_id: str = Field(default='ei-analysis', validation_alias='DEFAULT_TEMPLATE_ID')
    ei_system_prompt: str = Field(default=DEFAULT_EI_PROMPT)
    
    # Service configuration
    backend_port: int = Field(default=4000, validation_alias='BACKEND_PORT')
    environment: str = Field(default='development', validation_alias='ENVIRONMENT')
    frontend_port: int = Field(default=3000, validation_alias='FRONTEND_PORT')
    
    @property
    def cors_origins(self) -> List[str]:
        return [
            f"http://localhost:{self.frontend_port}",
            f"http://frontend:{self.frontend_port}",
            "http://localhost:5173",  # Vite dev server
            "http://frontend:5173"    # Vite in Docker
        ]
    
    model_config = SettingsConfigDict(
        env_file="../../../../.env",
        env_file_encoding='utf-8',
        case_sensitive=False
    ) 