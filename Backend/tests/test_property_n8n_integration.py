"""
Property-based tests for n8n integration service.

Tests Properties 12, 20, and 21 from the design document.
"""

import pytest
import httpx
from hypothesis import given, strategies as st, settings
from unittest.mock import AsyncMock, patch
from services.n8n_service import call_n8n_webhook, ServiceUnavailableError


# Strategy for generating valid webhook URLs
webhook_urls = st.from_regex(r"https?://[a-zA-Z0-9.-]+\.[a-z]{2,}/webhook/[a-zA-Z0-9_-]+", fullmatch=True)

# Strategy for generating JSON-serializable payloads
json_values = st.recursive(
    st.none() | st.booleans() | st.floats(allow_nan=False, allow_infinity=False) | st.text(),
    lambda children: st.lists(children, max_size=3) | st.dictionaries(st.text(min_size=1, max_size=10), children, max_size=3),
    max_leaves=5
)

# Strategy for generating HTTP status codes
non_200_status_codes = st.integers(min_value=201, max_value=599).filter(lambda x: x != 200)


@pytest.mark.asyncio
@given(
    webhook_url=webhook_urls,
    payload=st.dictionaries(st.text(min_size=1, max_size=20), json_values, min_size=1, max_size=5)
)
@settings(max_examples=100, deadline=None)
async def test_property_20_n8n_request_format(webhook_url, payload):
    """
    Feature: budget-optimization-backend, Property 20: n8n Request Format
    
    For any call to n8n, the request should use HTTP POST method with JSON-formatted body.
    
    Validates: Requirements 6.1, 6.5
    """
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.json = lambda: {"result": "success"}
    mock_response.text = '{"result": "success"}'
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_instance = AsyncMock()
        mock_post = AsyncMock(return_value=mock_response)
        mock_instance.post = mock_post
        mock_client.return_value.__aenter__.return_value = mock_instance
        
        await call_n8n_webhook(webhook_url=webhook_url, payload=payload)
        
        # Verify POST method was used
        mock_post.assert_called_once()
        
        # Verify the call was made with correct parameters
        call_args = mock_post.call_args
        assert call_args[0][0] == webhook_url or call_args.kwargs.get('url') == webhook_url
        
        # Verify JSON payload was sent
        assert 'json' in call_args.kwargs
        assert call_args.kwargs['json'] == payload
        
        # Verify Content-Type header is set to application/json
        assert 'headers' in call_args.kwargs
        assert call_args.kwargs['headers']['Content-Type'] == 'application/json'


@pytest.mark.asyncio
@given(
    webhook_url=webhook_urls,
    payload=st.dictionaries(st.text(min_size=1, max_size=20), json_values, min_size=1, max_size=5),
    error_type=st.sampled_from(['timeout', 'connect_error', 'non_200_status'])
)
@settings(max_examples=100, deadline=None)
async def test_property_12_external_service_error_handling(webhook_url, payload, error_type):
    """
    Feature: budget-optimization-backend, Property 12: External Service Error Handling
    
    For any endpoint that calls n8n, when n8n fails (timeout, unreachable, non-200 status),
    the API should return a 503 status code with a descriptive error message.
    
    Validates: Requirements 2.9, 3.7, 6.3, 6.4, 11.4
    """
    with patch('httpx.AsyncClient') as mock_client:
        mock_instance = AsyncMock()
        
        if error_type == 'timeout':
            # Simulate timeout
            mock_instance.post = AsyncMock(side_effect=httpx.TimeoutException("Request timed out"))
            mock_client.return_value.__aenter__.return_value = mock_instance
            
            with pytest.raises(TimeoutError) as exc_info:
                await call_n8n_webhook(webhook_url=webhook_url, payload=payload, timeout=30)
            
            # Verify descriptive error message
            assert "timed out" in str(exc_info.value).lower()
            assert "30" in str(exc_info.value)
        
        elif error_type == 'connect_error':
            # Simulate connection error
            mock_instance.post = AsyncMock(side_effect=httpx.ConnectError("Connection refused"))
            mock_client.return_value.__aenter__.return_value = mock_instance
            
            with pytest.raises(ServiceUnavailableError) as exc_info:
                await call_n8n_webhook(webhook_url=webhook_url, payload=payload)
            
            # Verify descriptive error message
            assert "connect" in str(exc_info.value).lower() or "connection" in str(exc_info.value).lower()
        
        elif error_type == 'non_200_status':
            # Simulate non-200 status code
            mock_response = AsyncMock()
            mock_response.status_code = 500
            mock_response.text = "Internal Server Error"
            mock_instance.post = AsyncMock(return_value=mock_response)
            mock_client.return_value.__aenter__.return_value = mock_instance
            
            with pytest.raises(ServiceUnavailableError) as exc_info:
                await call_n8n_webhook(webhook_url=webhook_url, payload=payload)
            
            # Verify descriptive error message includes status code
            assert "500" in str(exc_info.value)


@pytest.mark.asyncio
@given(
    webhook_url=webhook_urls,
    payload=st.dictionaries(st.text(min_size=1, max_size=20), json_values, min_size=1, max_size=5),
    response_data=st.dictionaries(
        st.text(min_size=1, max_size=20),
        json_values,
        min_size=1,
        max_size=5
    )
)
@settings(max_examples=100, deadline=None)
async def test_property_21_n8n_response_validation_valid(webhook_url, payload, response_data):
    """
    Feature: budget-optimization-backend, Property 21: n8n Response Validation (Valid Case)
    
    For any response from n8n, the API should validate the response structure before processing,
    and successfully process valid JSON responses.
    
    Validates: Requirements 6.6
    """
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.json = lambda: response_data
    mock_response.text = str(response_data)
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_instance = AsyncMock()
        mock_instance.post = AsyncMock(return_value=mock_response)
        mock_client.return_value.__aenter__.return_value = mock_instance
        
        result = await call_n8n_webhook(webhook_url=webhook_url, payload=payload)
        
        # Verify the response was validated and returned correctly
        assert result == response_data
        assert isinstance(result, dict)


@pytest.mark.asyncio
@given(
    webhook_url=webhook_urls,
    payload=st.dictionaries(st.text(min_size=1, max_size=20), json_values, min_size=1, max_size=5),
    invalid_response=st.sampled_from(['not json', 'null', '[]', '123', 'true'])
)
@settings(max_examples=100, deadline=None)
async def test_property_21_n8n_response_validation_invalid(webhook_url, payload, invalid_response):
    """
    Feature: budget-optimization-backend, Property 21: n8n Response Validation (Invalid Case)
    
    For any response from n8n, the API should validate the response structure before processing,
    and reject invalid responses with appropriate error handling.
    
    Validates: Requirements 6.6
    """
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.text = invalid_response
    
    # Simulate JSON parsing failure
    def raise_json_error():
        raise ValueError("Invalid JSON")
    
    mock_response.json = raise_json_error
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_instance = AsyncMock()
        mock_instance.post = AsyncMock(return_value=mock_response)
        mock_client.return_value.__aenter__.return_value = mock_instance
        
        with pytest.raises(ServiceUnavailableError) as exc_info:
            await call_n8n_webhook(webhook_url=webhook_url, payload=payload)
        
        # Verify error message indicates JSON parsing failure
        assert "parse" in str(exc_info.value).lower() or "json" in str(exc_info.value).lower()
