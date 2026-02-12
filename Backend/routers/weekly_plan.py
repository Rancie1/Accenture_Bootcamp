"""
Weekly plan router for recording weekly spending.

Handles HTTP request/response for weekly plan management.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from database import get_db
from models.schemas import WeeklyPlanRequest, WeeklyPlanResponse
from services.weekly_plan_service import record_weekly_plan

router = APIRouter(prefix="/weekly-plan", tags=["weekly-plan"])


@router.post(
    "/record",
    status_code=status.HTTP_201_CREATED,
    response_model=WeeklyPlanResponse,
    responses={
        201: {
            "description": "Weekly plan successfully recorded",
            "content": {
                "application/json": {
                    "example": {
                        "id": 42,
                        "user_id": "usr_abc123def456",
                        "optimal_cost": 85.50,
                        "actual_cost": 92.30,
                        "optimization_score": 0.385,
                        "created_at": "2024-01-22T18:45:00Z"
                    }
                }
            }
        },
        400: {
            "description": "Validation error - Invalid input",
            "content": {
                "application/json": {
                    "example": {
                        "error_code": "VALIDATION_ERROR",
                        "message": "actual_cost must be positive"
                    }
                }
            }
        },
        404: {
            "description": "User not found",
            "content": {
                "application/json": {
                    "example": {
                        "error_code": "NOT_FOUND",
                        "message": "User not found"
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
                        "message": "Failed to create weekly plan record"
                    }
                }
            }
        }
    }
)
async def record_weekly_plan_endpoint(
    request: WeeklyPlanRequest,
    db: Session = Depends(get_db)
) -> WeeklyPlanResponse:
    """
    Record actual spending for the week and calculate optimization score.

    This endpoint tracks how much you actually spent compared to the optimal cost,
    and calculates an optimization score to measure your budget performance.

    ## Request Body

    - **user_id** (string, required): User identifier from onboarding
    - **optimal_cost** (number, required): Optimal cost from grocery optimization (≥ 0)
    - **actual_cost** (number, required): Amount actually spent (must be positive)

    ## Response

    Returns the created weekly plan with:
    - **id**: Unique identifier for this weekly plan
    - **user_id**: User identifier
    - **optimal_cost**: Optimal cost that was calculated
    - **actual_cost**: Amount actually spent
    - **optimization_score**: Performance score (see calculation below)
    - **created_at**: Timestamp of record creation

    ## Optimization Score Calculation

    ```
    optimization_score = (weekly_budget - actual_cost) / weekly_budget
    ```

    ### Score Interpretation

    - **Positive score**: Spent less than budget (good!)
        - Example: Budget $150, spent $120 → score = 0.20 (20% under budget)
    - **Zero score**: Spent exactly the budget
    - **Negative score**: Spent more than budget (overspent)
        - Example: Budget $150, spent $180 → score = -0.20 (20% over budget)

    ## Error Responses

    - **400 Bad Request**: Invalid input data
        - `VALIDATION_ERROR`: actual_cost must be positive, optimal_cost must be non-negative
    - **404 Not Found**: User not found
        - `NOT_FOUND`: user_id does not exist
    - **500 Internal Server Error**: Database error
        - `DATABASE_ERROR`: Failed to create weekly plan record

    ## Example Request

    ```json
    {
        "user_id": "usr_abc123def456",
        "optimal_cost": 85.50,
        "actual_cost": 92.30
    }
    ```

    ## Example Response

    ```json
    {
        "id": 42,
        "user_id": "usr_abc123def456",
        "optimal_cost": 85.50,
        "actual_cost": 92.30,
        "optimization_score": 0.385,
        "created_at": "2024-01-22T18:45:00Z"
    }
    ```

    ## Notes

    - Weekly plans are used to calculate leaderboard rankings
    - Multiple weekly plans can be recorded for the same user
    - Negative scores are allowed (when spending exceeds budget)
    """
    weekly_plan = await record_weekly_plan(
        db=db,
        user_id=request.user_id,
        optimal_cost=request.optimal_cost,
        actual_cost=request.actual_cost
    )
    
    return WeeklyPlanResponse(
        id=weekly_plan.id,
        user_id=weekly_plan.user_id,
        optimal_cost=weekly_plan.optimal_cost,
        actual_cost=weekly_plan.actual_cost,
        optimization_score=weekly_plan.optimization_score,
        created_at=weekly_plan.created_at
    )
