"""
Grocery router for grocery optimization endpoints.

Handles HTTP request/response for grocery optimization with price predictions.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from database import get_db
from models.schemas import (
    GroceryOptimizationRequest,
    GroceryOptimizationResponse,
    GroceryItem
)
from services.grocery_service import optimize_groceries

router = APIRouter(prefix="/optimise", tags=["grocery"])


@router.post(
    "/groceries",
    status_code=status.HTTP_200_OK,
    response_model=GroceryOptimizationResponse,
    responses={
        200: {
            "description": "Grocery optimization successful",
            "content": {
                "application/json": {
                    "example": {
                        "optimal_cost": 12.50,
                        "store_recommendations": ["Woolworths", "Coles"],
                        "item_breakdown": [
                            {
                                "item_name": "Milk (1L)",
                                "current_price": 3.50,
                                "store_name": "Woolworths",
                                "price_prediction": "likely to drop next week"
                            },
                            {
                                "item_name": "Bread (Loaf)",
                                "current_price": 4.00,
                                "store_name": "Coles",
                                "price_prediction": "historically rising"
                            }
                        ]
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
                        "message": "grocery_list cannot be empty"
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
                        "message": "User with id 'usr_invalid' not found"
                    }
                }
            }
        },
        503: {
            "description": "External service unavailable",
            "content": {
                "application/json": {
                    "example": {
                        "error_code": "SERVICE_UNAVAILABLE",
                        "message": "n8n optimization service is currently unavailable"
                    }
                }
            }
        }
    }
)
async def optimize_groceries_endpoint(
    request: GroceryOptimizationRequest,
    db: Session = Depends(get_db)
) -> GroceryOptimizationResponse:
    """
    Optimize grocery shopping with AI-powered price predictions.

    This endpoint analyzes your grocery list and provides:
    - Optimal cost calculation
    - Store recommendations for best prices
    - Price predictions based on 4-week historical data
    - Item-by-item breakdown with current prices

    ## Request Body

    - **user_id** (string, required): User identifier from onboarding
    - **grocery_list** (array, required): List of grocery item names (non-empty)

    ## Response

    Returns optimization results with:
    - **optimal_cost**: Total cost for optimal shopping strategy
    - **store_recommendations**: List of recommended stores
    - **item_breakdown**: Detailed breakdown for each item including:
        - item_name: Name of the grocery item
        - current_price: Current price at recommended store
        - store_name: Store with best price
        - price_prediction: "likely to drop next week" or "historically rising" (based on 4-week average)

    ## Price Prediction Logic

    - **"likely to drop next week"**: Current price is below 4-week average
    - **"historically rising"**: Current price is at or above 4-week average
    - **null**: No historical data available for this item

    ## Error Responses

    - **400 Bad Request**: Invalid input data
        - `VALIDATION_ERROR`: grocery_list is empty or invalid
    - **404 Not Found**: User not found
        - `NOT_FOUND`: user_id does not exist
    - **503 Service Unavailable**: External service error
        - `SERVICE_UNAVAILABLE`: n8n optimization service is unavailable

    ## Example Request

    ```json
    {
        "user_id": "usr_abc123def456",
        "grocery_list": ["Milk (1L)", "Bread (Loaf)", "Eggs (Dozen)"]
    }
    ```

    ## Example Response

    ```json
    {
        "optimal_cost": 12.50,
        "store_recommendations": ["Woolworths", "Coles"],
        "item_breakdown": [
            {
                "item_name": "Milk (1L)",
                "current_price": 3.50,
                "store_name": "Woolworths",
                "price_prediction": "likely to drop next week"
            },
            {
                "item_name": "Bread (Loaf)",
                "current_price": 4.00,
                "store_name": "Coles",
                "price_prediction": "historically rising"
            },
            {
                "item_name": "Eggs (Dozen)",
                "current_price": 5.00,
                "store_name": "Woolworths",
                "price_prediction": null
            }
        ]
    }
    ```
    """
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
