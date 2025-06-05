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

def test_vector_db_settings():
    """Test that vector DB settings are loaded correctly"""
    assert settings.VECTOR_DB_URL == TEST_ENV["VECTOR_DB_URL"]
    assert settings.VECTOR_DB_CONFIDENCE_THRESHOLD == float(TEST_ENV["VECTOR_DB_CONFIDENCE_THRESHOLD"])

def test_ab_testing_settings():
    """Test that AB testing weights are loaded correctly"""
    assert settings.AB_TEST_OPENAI_WEIGHT == float(TEST_ENV["AB_TEST_OPENAI_WEIGHT"])
    assert settings.AB_TEST_VECTOR_DB_WEIGHT == float(TEST_ENV["AB_TEST_VECTOR_DB_WEIGHT"])
    assert settings.AB_TEST_LOCAL_LLM_WEIGHT == float(TEST_ENV["AB_TEST_LOCAL_LLM_WEIGHT"])
    
    # Test that weights sum up to 100
    total_weight = (
        settings.AB_TEST_OPENAI_WEIGHT +
        settings.AB_TEST_VECTOR_DB_WEIGHT +
        settings.AB_TEST_LOCAL_LLM_WEIGHT
    )
    assert total_weight == 100.0

def test_optional_variables():
    """Test that optional variables are loaded correctly"""
    assert settings.NODE_ENV == TEST_ENV["NODE_ENV"]
    assert settings.FRONTEND_PORT == TEST_ENV["FRONTEND_PORT"]
    assert settings.WHISPER_HOST == TEST_ENV["WHISPER_HOST"] 