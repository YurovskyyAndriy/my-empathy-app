from fastapi.testclient import TestClient
import pytest
from unittest.mock import patch, MagicMock
from app.main import app
from app.services.empathy_service import EmpathyService

client = TestClient(app)

def test_analyze_empty_message():
    """Test that empty messages are rejected"""
    response = client.post("/api/empathy/analyze", json={"text": ""})
    assert response.status_code == 400
    assert response.json()["detail"] == "Message text cannot be empty"

    response = client.post("/api/empathy/analyze", json={"text": "   "})
    assert response.status_code == 400
    assert response.json()["detail"] == "Message text cannot be empty"

def test_analyze_message_success():
    """Test successful message analysis"""
    # Create test message
    test_message = "Привет! Как дела? Давно не виделись."
    
    # Create service response
    service_response = {
        "status": "success",
        "analysis": "Test analysis content",
        "metadata": {
            "token_usage": {
                "prompt_tokens": 10,
                "completion_tokens": 20,
                "total_tokens": 30
            }
        }
    }
    
    # Expected API response
    expected_response = {
        "status": "success",
        "analysis": "Test analysis content",
        "error": None,
        "metadata": {
            "token_usage": {
                "prompt_tokens": 10,
                "completion_tokens": 20,
                "total_tokens": 30
            }
        }
    }
    
    # Mock the service method
    with patch.object(EmpathyService, 'analyze_message', return_value=service_response) as mock_analyze:
        # Make the request
        response = client.post("/api/empathy/analyze", json={"text": test_message})
        
        # Verify the response
        assert response.status_code == 200
        assert response.json() == expected_response
        
        # Verify the mock was called
        mock_analyze.assert_called_once_with(test_message)

def test_analyze_message_api_error():
    """Test handling of API errors"""
    test_message = "Test message"
    
    # Service response
    service_response = {
        "status": "error",
        "error": "API Error"
    }
    
    # Expected API response
    expected_response = {
        "status": "error",
        "analysis": None,
        "error": "API Error",
        "metadata": None
    }
    
    # Mock the service method to raise an exception
    with patch.object(EmpathyService, 'analyze_message', return_value=service_response) as mock_analyze:
        response = client.post("/api/empathy/analyze", json={"text": test_message})
        
        assert response.status_code == 200  # We return 200 even for API errors
        assert response.json() == expected_response
        
        # Verify the mock was called
        mock_analyze.assert_called_once_with(test_message)

def test_analyze_invalid_request():
    """Test invalid request handling"""
    # Missing required field
    response = client.post("/api/empathy/analyze", json={})
    assert response.status_code == 422

    # Invalid type for text field
    response = client.post("/api/empathy/analyze", json={"text": 123})
    assert response.status_code == 422 