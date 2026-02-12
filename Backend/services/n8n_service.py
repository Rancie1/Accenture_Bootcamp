"""
n8n integration service for external workflow automation.

Handles HTTP webhook calls to n8n service with error handling and logging.
"""

import httpx
import logging
from typing import Any, Dict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ServiceUnavailableError(Exception):
    """Raised when an external service is unavailable or fails."""
    pass


async def call_n8n_webhook(
    webhook_url: str,
    payload: Dict[str, Any],
    timeout: int = 120
) -> Dict[str, Any]:
    """
    Generic n8n webhook caller with error handling.

    Args:
        webhook_url: Full n8n webhook URL
        payload: JSON payload to send
        timeout: Request timeout in seconds (default 30)

    Returns:
        JSON response from n8n

    Raises:
        ServiceUnavailableError: n8n unreachable or returned non-200
        TimeoutError: Request exceeded timeout

    Implementation:
    - Uses httpx.AsyncClient
    - Sets timeout
    - Logs request/response
    - Handles connection errors
    - Validates response status
    """
    # Log the outgoing request
    logger.info(f"Calling n8n webhook: {webhook_url}")
    logger.debug(f"Request payload: {payload}")
    
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                webhook_url,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            # Log the response
            logger.info(f"n8n webhook response status: {response.status_code}")
            logger.info(f"Response body: {response.text[:500]}")
            
            # Handle non-200 responses
            if response.status_code != 200:
                error_msg = f"n8n webhook returned status {response.status_code}: {response.text}"
                logger.error(error_msg)
                raise ServiceUnavailableError(error_msg)
            
            # Parse response — n8n agents may return JSON or plain text
            content_type = response.headers.get("content-type", "")
            try:
                response_data = response.json()
                # If it's a JSON string (not dict/list), wrap it
                if isinstance(response_data, str):
                    return {"output": response_data}
                return response_data
            except Exception:
                # n8n returned plain text — wrap it in a dict so tools can use it
                logger.info("n8n returned non-JSON response, wrapping as text")
                return {"output": response.text}
    
    except httpx.TimeoutException as e:
        error_msg = f"n8n webhook request timed out after {timeout} seconds: {str(e)}"
        logger.error(error_msg)
        raise TimeoutError(error_msg)
    
    except httpx.ConnectError as e:
        error_msg = f"Failed to connect to n8n webhook: {str(e)}"
        logger.error(error_msg)
        raise ServiceUnavailableError(error_msg)
    
    except httpx.RequestError as e:
        error_msg = f"n8n webhook request failed: {str(e)}"
        logger.error(error_msg)
        raise ServiceUnavailableError(error_msg)
    
    except ServiceUnavailableError:
        # Re-raise ServiceUnavailableError as-is
        raise
    
    except Exception as e:
        error_msg = f"Unexpected error calling n8n webhook: {str(e)}"
        logger.error(error_msg)
        raise ServiceUnavailableError(error_msg)
