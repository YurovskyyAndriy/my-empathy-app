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
    
    # Vector Store
    "VECTOR_STORE_PATH": "./backend/test_vector_store",
    "EMBEDDING_MODEL": "all-MiniLM-L6-v2",
    "VECTOR_DB_URL": "http://localhost:8080",
    
    # Frontend
    "NODE_ENV": "test",
    "FRONTEND_PORT": "3000",
    
    # Additional Services
    "MCP_ENABLED": "true",
    "WHISPER_HOST": "http://localhost:5005"
} 