import os
import pytest
from pathlib import Path
from tests.constants import TEST_ENV

# Set environment variables before importing settings
os.environ.update(TEST_ENV)

# Import settings after environment setup
from app.core.config import settings, PROJECT_ROOT

def test_project_root():
    """Test that PROJECT_ROOT points to the correct directory"""
    assert PROJECT_ROOT.exists()
    assert (PROJECT_ROOT / "backend").exists()

def test_vector_store_path():
    """Test that vector store path is correctly configured"""
    vector_store_path = Path(settings.VECTOR_STORE_PATH)
    assert vector_store_path.exists()
    assert vector_store_path.is_absolute()
    assert str(vector_store_path).endswith("backend/test_vector_store")

def test_database_url():
    """Test that database URL is correctly configured"""
    if settings.DATABASE_URL.startswith("sqlite:///"):
        db_path = settings.DATABASE_URL.replace("sqlite:///", "")
        db_path = Path(db_path)
        assert db_path.is_absolute()
        assert str(db_path).endswith("backend/test.db")
        # Check that database directory exists
        assert db_path.parent.exists()

def test_required_env_variables():
    """Test that required environment variables are loaded correctly"""
    assert settings.APP_NAME == TEST_ENV["APP_NAME"]
    assert settings.DEBUG is True
    assert settings.ENVIRONMENT == TEST_ENV["ENVIRONMENT"]
    assert settings.OPENAI_API_KEY == TEST_ENV["OPENAI_API_KEY"]
    assert settings.SECRET_KEY == TEST_ENV["SECRET_KEY"]
    assert settings.EMBEDDING_MODEL == TEST_ENV["EMBEDDING_MODEL"]

def test_optional_variables():
    """Test that optional variables are loaded correctly"""
    assert settings.NODE_ENV == TEST_ENV["NODE_ENV"]
    assert settings.FRONTEND_PORT == TEST_ENV["FRONTEND_PORT"]
    assert settings.VECTOR_DB_URL == TEST_ENV["VECTOR_DB_URL"]
    assert settings.MCP_ENABLED is True  # Converted from string 'true' to boolean True
    assert settings.WHISPER_HOST == TEST_ENV["WHISPER_HOST"] 