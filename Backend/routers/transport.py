"""
Transport router for transport cost comparison endpoints.

Handles HTTP request/response for transport cost comparison with petrol stations.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from database import get_db
from models.schemas import (
    TransportComparisonRequest,
    TransportComparisonResponse,
    PetrolStation
)
from services.transport_service import compare_transport_costs

router = APIRouter(prefix="/transport", tags=["transport"])


@router.post(
    "/compare",
    status_code=status.HTTP_200_OK,
    response_model=TransportComparisonResponse,
    responses={
        200: {
            "description": "Transport comparison successful",
            "content": {
                "application/json": {
                    "example": {
                        "stations": [
                            {
                                "station_name": "7-Eleven Kensington",
                                "address": "456 Anzac Parade, Kensington NSW 2033",
                                "distance_from_home": 2.5,
                                "price_per_liter": 1.85,
                                "cost_to_reach_station": 0.50,
                                "fuel_cost_at_station": 74.00,
                                "total_cost": 74.50
                            },
                            {
                                "station_name": "Caltex Randwick",
                                "address": "789 Alison Rd, Randwick NSW 2031",
                                "distance_from_home": 3.8,
                                "price_per_liter": 1.82,
                                "cost_to_reach_station": 0.76,
                                "fuel_cost_at_station": 72.80,
                                "total_cost": 73.56
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
                        "message": "fuel_amount_needed must be positive"
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
        503: {
            "description": "External service unavailable",
            "content": {
                "application/json": {
                    "example": {
                        "error_code": "SERVICE_UNAVAILABLE",
                        "message": "n8n service or NSW Fuel API is unavailable"
                    }
                }
            }
        }
    }
)
async def compare_transport_endpoint(
    request: TransportComparisonRequest,
    db: Session = Depends(get_db)
) -> TransportComparisonResponse:
    """
    Compare fuel costs at nearby petrol stations for optimal refueling.

    This endpoint calculates the total cost of refueling at different petrol stations,
    considering both the fuel cost to reach each station and the fuel price at that station.
    Results are sorted by total cost (cheapest first).

    ## Request Body

    - **user_id** (string, required): User identifier from onboarding
    - **destination** (string, required): Destination address for context
    - **fuel_amount_needed** (number, required): Liters of fuel needed (must be positive)

    ## Response

    Returns a list of petrol stations sorted by total cost, each containing:
    - **station_name**: Name of the petrol station
    - **address**: Station address
    - **distance_from_home**: Distance from user's home in kilometers
    - **price_per_liter**: Fuel price per liter at this station
    - **cost_to_reach_station**: Fuel cost to drive to this station
    - **fuel_cost_at_station**: Cost of fuel purchase at this station
    - **total_cost**: Total cost (cost_to_reach + fuel_cost_at_station)

    ## Calculation Logic

    For each station:
    ```
    total_cost = cost_to_reach_station + (fuel_amount_needed × price_per_liter)
    ```

    Stations are sorted by `total_cost` in ascending order.

    ## Error Responses

    - **400 Bad Request**: Invalid input data
        - `VALIDATION_ERROR`: fuel_amount_needed must be positive
    - **404 Not Found**: User not found
        - `NOT_FOUND`: user_id does not exist
    - **503 Service Unavailable**: External service error
        - `SERVICE_UNAVAILABLE`: n8n service or NSW Fuel API is unavailable

    ## Example Request

    ```json
    {
        "user_id": "usr_abc123def456",
        "destination": "UNSW Sydney, Kensington NSW 2052",
        "fuel_amount_needed": 40.0
    }
    ```

    ## Example Response

    ```json
    {
        "stations": [
            {
                "station_name": "7-Eleven Kensington",
                "address": "456 Anzac Parade, Kensington NSW 2033",
                "distance_from_home": 2.5,
                "price_per_liter": 1.85,
                "cost_to_reach_station": 0.50,
                "fuel_cost_at_station": 74.00,
                "total_cost": 74.50
            },
            {
                "station_name": "Caltex Randwick",
                "address": "789 Alison Rd, Randwick NSW 2031",
                "distance_from_home": 3.8,
                "price_per_liter": 1.82,
                "cost_to_reach_station": 0.76,
                "fuel_cost_at_station": 72.80,
                "total_cost": 73.56
            }
        ]
    }
    ```

    ## Notes

    - Stations are sorted by total_cost (cheapest first)
    - Sometimes a slightly more expensive station closer to home is cheaper overall
    - Fuel prices are sourced from NSW Fuel API via n8n integration
    """
    # Call transport service
    result = await compare_transport_costs(
        db=db,
        user_id=request.user_id,
        destination=request.destination,
        fuel_amount_needed=request.fuel_amount_needed
    )
    
    # Convert station dictionaries to PetrolStation objects
    stations = [PetrolStation(**station) for station in result["stations"]]
    
    return TransportComparisonResponse(stations=stations)
