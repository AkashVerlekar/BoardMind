import pytest
from unittest.mock import MagicMock, patch
from app.ai.gemini_client import GeminiClient

def test_gemini_client_retry_logic():
    client = GeminiClient()
    client.model = MagicMock()
    
    # Mock the generate_content to fail twice, then succeed
    mock_response = MagicMock()
    mock_response.text = '{"summary": "success", "confidence": 0.9}'
    
    client.model.generate_content.side_effect = [
        Exception("Network Error 1"),
        Exception("Network Error 2"),
        mock_response
    ]
    
    # We patch time.sleep to avoid actually waiting during tests
    with patch("time.sleep", return_value=None):
        result = client.generate_json("Test prompt", max_retries=3)
        
    assert result["summary"] == "success"
    assert client.model.generate_content.call_count == 3
