import os
import sys
import pytest
from pathlib import Path
from tests.constants import TEST_ENV
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_env():
    """Automatically sets up test environment for all tests"""
    # Save original environment values
    original_env = dict(os.environ)
    
    # Set test environment values
    test_env = dict(TEST_ENV)
    # Use real API keys from main .env
    test_env["OPENAI_API_KEY"] = settings.OPENAI_API_KEY
    test_env["SECRET_KEY"] = settings.SECRET_KEY
    
    os.environ.update(test_env)
    
    yield
    
    # Restore original environment values
    os.environ.clear()
    os.environ.update(original_env) 