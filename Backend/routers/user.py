"""
User router for user onboarding endpoints.

Handles HTTP request/response for user management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.schemas import UserOnboardRequest, UserResponse
from services.user_service import (
    create_user,
    ValidationError,
    NotFoundError,
    DatabaseError
)

router = APIRouter(prefix="/onboard", tags=["users"])


@router.post("", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
async def onboard_user(
    user_data: UserOnboardRequest,
    db: Session = Depends(get_db)
) -> UserResponse:
    """
    Create a new user account.

    Args:
        user_data: Contains name, weekly_budget, home_address

    Returns:
        UserResponse with user_id and created user details

    Raises:
        HTTPException 400: Invalid input data
        HTTPException 500: Database error
    """
    try:
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
    
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error_code": "VALIDATION_ERROR",
                "message": str(e)
            }
        )
    
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error_code": "DATABASE_ERROR",
                "message": "Failed to create user"
            }
        )
