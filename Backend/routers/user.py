"""
User router for user onboarding endpoints.

Handles HTTP request/response for user management.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from database import get_db
from models.schemas import UserOnboardRequest, UserResponse
from services.user_service import create_user

router = APIRouter(prefix="/onboard", tags=["users"])


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=UserResponse,
    responses={
        201: {
            "description": "User successfully created",
            "content": {
                "application/json": {
                    "example": {
                        "user_id": "usr_abc123def456",
                        "name": "John Smith",
                        "weekly_budget": 150.00,
                        "home_address": "123 University Ave, Sydney NSW 2000",
                        "created_at": "2024-01-15T10:30:00Z"
                    }
                }
            }
        },
        400: {
            "description": "Validation error - Invalid input data",
            "content": {
                "application/json": {
                    "example": {
                        "error_code": "VALIDATION_ERROR",
                        "message": "Validation failed",
                        "details": {
                            "weekly_budget": "must be positive"
                        }
                    }
                }
            }
        },
        500: {
            "description": "Database error",
            "content": {
                "application/json": {
                    "example": {
                        "error_code": "DATABASE_ERROR",
                        "message": "Failed to create user in database"
                    }
                }
            }
        }
    }
)
async def onboard_user(
    user_data: UserOnboardRequest,
    db: Session = Depends(get_db)
) -> UserResponse:
    """
    Create a new user account for budget optimization.

    This endpoint registers a new user in the system with their personal details
    and weekly budget. The user_id is automatically generated and returned.

    ## Request Body

    - **name** (string, required): User's full name (non-empty)
    - **weekly_budget** (number, required): Weekly budget in dollars (must be positive)
    - **home_address** (string, required): User's home address for location-based optimization

    ## Response

    Returns the created user object with:
    - **user_id**: Unique identifier for the user
    - **name**: User's name
    - **weekly_budget**: Weekly budget amount
    - **home_address**: User's home address
    - **created_at**: Timestamp of account creation

    ## Error Responses

    - **400 Bad Request**: Invalid input data
        - `VALIDATION_ERROR`: One or more fields failed validation
            - weekly_budget must be positive
            - name must be non-empty
            - home_address must be non-empty
    - **500 Internal Server Error**: Database error
        - `DATABASE_ERROR`: Failed to create user in database

    ## Example Request

    ```json
    {
        "name": "John Smith",
        "weekly_budget": 150.00,
        "home_address": "123 University Ave, Sydney NSW 2000"
    }
    ```

    ## Example Response

    ```json
    {
        "user_id": "usr_abc123def456",
        "name": "John Smith",
        "weekly_budget": 150.00,
        "home_address": "123 University Ave, Sydney NSW 2000",
        "created_at": "2024-01-15T10:30:00Z"
    }
    ```
    """
    user = await create_user(
        db=db,
        name=user_data.name,
        weekly_budget=user_data.weekly_budget,
        home_address=user_data.home_address
    )
    
    return UserResponse(
        user_id=user.user_id,
        name=user.name,
        weekly_budget=user.weekly_budget,
        home_address=user.home_address,
        created_at=user.created_at
    )
