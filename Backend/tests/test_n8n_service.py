"""
Basic tests for n8n service integration.
"""

import pytest
import httpx
from unittest.mock import AsyncMock, patch
from services.n8n_service import call_n8n_webhook, ServiceUnavailableError


@pytest.mark.asyncio
async def test_call_n8n_webhook_success():
    """Test successful n8n webhook call."""
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.json = lambda: {"result": "success", "data": {"optimal_cost": 50.0}}
    mock_response.text = '{"result": "success"}'
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_instance = AsyncMock()
        mock_instance.post = AsyncMock(return_value=mock_response)
        mock_client.return_value.__aenter__.return_value = mock_instance
        
        result = await call_n8n_webhook(
            webhook_url="https://test.n8n.app/webhook/test",
            payload={"test": "data"}
        )
        
        assert result == {"result": "success", "data": {"optimal_cost": 50.0}}


@pytest.mark.asyncio
async def test_call_n8n_webhook_non_200_status():
    """Test n8n webhook call with non-200 status code."""
    mock_response = AsyncMock()
    mock_response.status_code = 500
    mock_response.text = "Internal Server Error"
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_response)
        
        with pytest.raises(ServiceUnavailableError) as exc_info:
            await call_n8n_webhook(
                webhook_url="https://test.n8n.app/webhook/test",
                payload={"test": "data"}
            )
        
        assert "status 500" in str(exc_info.value)


@pytest.mark.asyncio
async def test_call_n8n_webhook_timeout():
    """Test n8n webhook call timeout."""
    with patch('httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(
            side_effect=httpx.TimeoutException("Request timed out")
        )
        
        with pytest.raises(TimeoutError) as exc_info:
            await call_n8n_webhook(
                webhook_url="https://test.n8n.app/webhook/test",
                payload={"test": "data"},
                timeout=30
            )
        
        assert "timed out after 30 seconds" in str(exc_info.value)


@pytest.mark.asyncio
async def test_call_n8n_webhook_connection_error():
    """Test n8n webhook call with connection error."""
    with patch('httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(
            side_effect=httpx.ConnectError("Connection refused")
        )
        
        with pytest.raises(ServiceUnavailableError) as exc_info:
            await call_n8n_webhook(
                webhook_url="https://test.n8n.app/webhook/test",
                payload={"test": "data"}
            )
        
        assert "Failed to connect" in str(exc_info.value)


@pytest.mark.asyncio
async def test_call_n8n_webhook_invalid_json_response():
    """Test n8n webhook call with invalid JSON response."""
    mock_response = AsyncMock()
    mock_response.status_code = 200
    
    def raise_error():
        raise ValueError("Invalid JSON")
    
    mock_response.json = raise_error
    mock_response.text = "Not valid JSON"
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_instance = AsyncMock()
        mock_instance.post = AsyncMock(return_value=mock_response)
        mock_client.return_value.__aenter__.return_value = mock_instance
        
        with pytest.raises(ServiceUnavailableError) as exc_info:
            await call_n8n_webhook(
                webhook_url="https://test.n8n.app/webhook/test",
                payload={"test": "data"}
            )
        
        assert "Failed to parse n8n response as JSON" in str(exc_info.value)


@pytest.mark.asyncio
async def test_call_n8n_webhook_custom_timeout():
    """Test n8n webhook call with custom timeout."""
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.json = lambda: {"result": "success"}
    mock_response.text = '{"result": "success"}'
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_instance = AsyncMock()
        mock_instance.post = AsyncMock(return_value=mock_response)
        mock_client.return_value.__aenter__.return_value = mock_instance
        
        result = await call_n8n_webhook(
            webhook_url="https://test.n8n.app/webhook/test",
            payload={"test": "data"},
            timeout=60
        )
        
        assert result == {"result": "success"}
        # Verify AsyncClient was created with correct timeout
        mock_client.assert_called_once_with(timeout=60)
