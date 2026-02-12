"""
Custom exception classes for the Budget Optimization Backend.

Provides a centralized location for all custom exceptions used throughout
the application, ensuring consistent error handling across all services.
"""


class ValidationError(Exception):
    """
    Raised when input validation fails.
    
    Used for invalid user input, malformed requests, or data that doesn't
    meet business rules. Should result in 400 Bad Request responses.
    """
    pass


class NotFoundError(Exception):
    """
    Raised when a requested resource is not found.
    
    Used when querying for users, plans, or other entities that don't exist
    in the database. Should result in 404 Not Found responses.
    """
    pass


class ServiceUnavailableError(Exception):
    """
    Raised when an external service is unavailable or fails.
    
    Used for n8n webhook failures, timeouts, or other external service
    integration issues. Should result in 503 Service Unavailable responses.
    """
    pass


class DatabaseError(Exception):
    """
    Raised when a database operation fails.
    
    Used for database connection failures, query errors, constraint violations,
    or other database-related issues. Should result in 500 Internal Server Error
    responses.
    """
    pass
