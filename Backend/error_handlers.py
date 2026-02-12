"""
Exception handlers for the Budget Optimization Backend.

Provides centralized exception handling to ensure consistent error responses
across all endpoints. Handlers catch custom exceptions and convert them to
appropriate HTTP responses with standardized error formats.
"""

import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError as PydanticValidationError

from exceptions import (
    ValidationError,
    NotFoundError,
    ServiceUnavailableError,
    DatabaseError
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def validation_error_handler(request: Request, exc: ValidationError) -> JSONResponse:
    """
    Handle ValidationError exceptions.
    
    Returns 400 Bad Request with field-specific error messages.
    
    Args:
        request: The incoming request
        exc: The ValidationError exception
        
    Returns:
        JSONResponse with 400 status code and error details
    """
    logger.warning(f"Validation error on {request.url.path}: {str(exc)}")
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error_code": "VALIDATION_ERROR",
            "message": str(exc),
            "details": None
        }
    )


async def not_found_error_handler(request: Request, exc: NotFoundError) -> JSONResponse:
    """
    Handle NotFoundError exceptions.
    
    Returns 404 Not Found with descriptive message.
    
    Args:
        request: The incoming request
        exc: The NotFoundError exception
        
    Returns:
        JSONResponse with 404 status code and error details
    """
    logger.info(f"Resource not found on {request.url.path}: {str(exc)}")
    
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "error_code": "NOT_FOUND",
            "message": str(exc),
            "details": None
        }
    )


async def service_unavailable_error_handler(
    request: Request,
    exc: ServiceUnavailableError
) -> JSONResponse:
    """
    Handle ServiceUnavailableError exceptions.
    
    Returns 503 Service Unavailable with service-specific error information.
    
    Args:
        request: The incoming request
        exc: The ServiceUnavailableError exception
        
    Returns:
        JSONResponse with 503 status code and error details
    """
    logger.error(f"External service unavailable on {request.url.path}: {str(exc)}")
    
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "error_code": "SERVICE_UNAVAILABLE",
            "message": str(exc),
            "details": None
        }
    )


async def database_error_handler(request: Request, exc: DatabaseError) -> JSONResponse:
    """
    Handle DatabaseError exceptions.
    
    Returns 500 Internal Server Error. Logs full error details server-side
    but returns generic message to client to avoid exposing internal details.
    
    Args:
        request: The incoming request
        exc: The DatabaseError exception
        
    Returns:
        JSONResponse with 500 status code and error details
    """
    # Log full error details server-side
    logger.error(f"Database error on {request.url.path}: {str(exc)}", exc_info=True)
    
    # Return generic message to client (don't expose internal details)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error_code": "DATABASE_ERROR",
            "message": "A database error occurred. Please try again later.",
            "details": None
        }
    )


async def request_validation_error_handler(
    request: Request,
    exc: RequestValidationError
) -> JSONResponse:
    """
    Handle FastAPI/Pydantic request validation errors.
    
    Returns 400 Bad Request with field-specific validation errors.
    
    Args:
        request: The incoming request
        exc: The RequestValidationError exception
        
    Returns:
        JSONResponse with 400 status code and field-specific error details
    """
    logger.warning(f"Request validation error on {request.url.path}: {exc.errors()}")
    
    # Extract field-specific errors
    errors = {}
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"][1:])  # Skip 'body'
        errors[field] = error["msg"]
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error_code": "VALIDATION_ERROR",
            "message": "Request validation failed",
            "details": errors
        }
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle all unhandled exceptions.
    
    Returns 500 Internal Server Error. Logs full error details and stack trace
    server-side but returns generic message to client to avoid exposing
    internal implementation details or stack traces.
    
    Args:
        request: The incoming request
        exc: The unhandled exception
        
    Returns:
        JSONResponse with 500 status code and generic error message
    """
    # Log full error details and stack trace server-side
    logger.error(
        f"Unhandled exception on {request.url.path}: {str(exc)}",
        exc_info=True
    )
    
    # Return generic message to client (security: don't expose stack traces)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error_code": "INTERNAL_ERROR",
            "message": "An internal error occurred. Please try again later.",
            "details": None
        }
    )


def register_exception_handlers(app):
    """
    Register all exception handlers with the FastAPI application.
    
    This function should be called during application initialization to
    ensure all custom exceptions are properly handled.
    
    Args:
        app: The FastAPI application instance
    """
    app.add_exception_handler(ValidationError, validation_error_handler)
    app.add_exception_handler(NotFoundError, not_found_error_handler)
    app.add_exception_handler(ServiceUnavailableError, service_unavailable_error_handler)
    app.add_exception_handler(DatabaseError, database_error_handler)
    app.add_exception_handler(RequestValidationError, request_validation_error_handler)
    app.add_exception_handler(Exception, generic_exception_handler)
    
    logger.info("Exception handlers registered successfully")
