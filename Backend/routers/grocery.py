"""
Grocery router for grocery optimization endpoints.

Handles HTTP request/response for grocery optimization with price predictions.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.schemas import (
    GroceryOptimizationRequest,
    GroceryOptimizationResponse,
    GroceryItem
)
from services.grocery_service import optimize_groceries
from services.user_service import NotFoundError
from services.n8n_service import ServiceUnavailableError

router = APIRouter(prefix="/optimise", tags=["grocery"])


@router.post("/groceries", status_code=status.HTTP_200_OK, response_model=GroceryOptimizationResponse)
async def optimize_groceries_endpoint(
    request: GroceryOptimizationRequest,
    db: Session = Depends(get_db)
) -> GroceryOptimizationResponse:
    """
    Optimize grocery shopping with price predictions.

    Args:
        request: Contains user_id and grocery_list (array of item names)

    Returns:
        GroceryOptimizationResponse with optimal_cost, store_recommendations,
        and item_breakdown with price predictions

    Raises:
        HTTPException 400: Invalid input
        HTTPException 503: n8n service unavailable
    """
    try:
        # Call grocery service
        result = await optimize_groceries(
            db=db,
            user_id=request.user_id,
            grocery_list=request.grocery_list
        )
        
        # Convert item dictionaries to GroceryItem objects
        items = [GroceryItem(**item) for item in result["item_breakdown"]]
        
        return GroceryOptimizationResponse(
            optimal_cost=result["optimal_cost"],
            store_recommendations=result["store_recommendations"],
            item_breakdown=items
        )
    
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error_code": "NOT_FOUND",
                "message": str(e)
            }
        )
    
    except ServiceUnavailableError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error_code": "SERVICE_UNAVAILABLE",
                "message": f"n8n service unavailable: {str(e)}"
            }
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error_code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred"
            }
        )
