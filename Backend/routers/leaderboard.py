"""
Leaderboard router for leaderboard endpoints.

Handles HTTP request/response for leaderboard functionality.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from database import get_db
from models.schemas import LeaderboardResponse
from services.leaderboard_service import calculate_leaderboard

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    response_model=LeaderboardResponse,
    responses={
        200: {
            "description": "Leaderboard successfully retrieved",
            "content": {
                "application/json": {
                    "example": {
                        "leaderboard": [
                            {
                                "user_id": "usr_abc123",
                                "username": "Alice Johnson",
                                "average_score": 0.25,
                                "rank": 1
                            },
                            {
                                "user_id": "usr_def456",
                                "username": "Bob Smith",
                                "average_score": 0.18,
                                "rank": 2
                            },
                            {
                                "user_id": "usr_ghi789",
                                "username": "Charlie Brown",
                                "average_score": 0.12,
                                "rank": 3
                            }
                        ]
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
                        "message": "Failed to calculate leaderboard"
                    }
                }
            }
        }
    }
)
async def get_leaderboard(
    db: Session = Depends(get_db)
) -> LeaderboardResponse:
    """
    Get the ranked leaderboard of users by average optimization score.

    This endpoint calculates and returns a leaderboard showing how users rank
    based on their average optimization performance across all recorded weekly plans.

    ## Response

    Returns a leaderboard with entries containing:
    - **user_id**: User identifier
    - **username**: User's display name
    - **average_score**: Average optimization score across all weekly plans
    - **rank**: Position in the leaderboard (1 = best performer)

    ## Ranking Logic

    1. Calculate average optimization_score for each user across all their weekly plans
    2. Exclude users who have never recorded a weekly plan
    3. Sort by average_score in descending order (highest score = rank 1)
    4. Assign ranks sequentially (1, 2, 3, ...)

    ## Score Interpretation

    - **Higher scores are better** (more money saved)
    - Positive scores indicate spending under budget
    - Negative scores indicate overspending

    ## Error Responses

    - **500 Internal Server Error**: Database error
        - `DATABASE_ERROR`: Failed to calculate leaderboard

    ## Example Response

    ```json
    {
        "leaderboard": [
            {
                "user_id": "usr_abc123",
                "username": "Alice Johnson",
                "average_score": 0.25,
                "rank": 1
            },
            {
                "user_id": "usr_def456",
                "username": "Bob Smith",
                "average_score": 0.18,
                "rank": 2
            },
            {
                "user_id": "usr_ghi789",
                "username": "Charlie Brown",
                "average_score": 0.12,
                "rank": 3
            },
            {
                "user_id": "usr_jkl012",
                "username": "Diana Prince",
                "average_score": -0.05,
                "rank": 4
            }
        ]
    }
    ```

    ## Notes

    - Only users with at least one recorded weekly plan appear on the leaderboard
    - The leaderboard updates in real-time as users record new weekly plans
    - Users with negative average scores still appear (they're just ranked lower)
    - Ties in average_score are handled by database ordering
    """
    leaderboard = await calculate_leaderboard(db=db)
    
    return LeaderboardResponse(leaderboard=leaderboard)
