"""
Test environment constants.
This file serves as a single source of truth for test values across all tests.
"""

TEST_ENV = {
    # Base Settings
    "APP_NAME": "Empathy App Test",
    "DEBUG": "True",
    "ENVIRONMENT": "test",
    
    # API Keys
    "OPENAI_API_KEY": "test_openai_api_key_for_testing_only",
    "SECRET_KEY": "test_secret_key_for_testing_only",
    
    # Database
    "DATABASE_URL": "sqlite:///./backend/test.db",
    
    # Vector DB (Weaviate)
    "VECTOR_DB_URL": "http://localhost:8080",
    "VECTOR_DB_CONFIDENCE_THRESHOLD": "0.85",
    
    # AB Testing
    "AB_TEST_OPENAI_WEIGHT": "70",
    "AB_TEST_VECTOR_DB_WEIGHT": "30",
    "AB_TEST_LOCAL_LLM_WEIGHT": "0",
    
    # Frontend
    "NODE_ENV": "test",
    "FRONTEND_PORT": "3000",
    
    # Additional Services
    "WHISPER_HOST": "http://localhost:5005"
} 