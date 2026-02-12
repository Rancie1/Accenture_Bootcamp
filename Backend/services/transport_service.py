"""
Transport service for transport cost comparison operations.

Handles transport cost comparison with n8n integration for petrol station data.
"""

import os
from sqlalchemy.orm import Session
from models.schemas import PetrolStation
from services.user_service import get_user_by_id, NotFoundError
from services.n8n_service import call_n8n_webhook, ServiceUnavailableError


async def compare_transport_costs(
    db: Session,
    user_id: str,
    destination: str,
    fuel_amount_needed: float
) -> dict:
    """
    Compare fuel costs at nearby petrol stations.

    Process:
    1. Fetch user's home_address (origin)
    2. Call n8n webhook to get nearby stations with NSW Fuel API data
    3. For each station, calculate:
       - Distance from home
       - Fuel cost to reach station
       - Fuel cost at station (fuel_amount_needed * price_per_liter)
       - Total cost = cost_to_reach + fuel_cost_at_station
    4. Sort by total_cost ascending

    Args:
        db: Database session
        user_id: User identifier
        destination: Destination address (for context)
        fuel_amount_needed: Liters of fuel needed

    Returns:
        Dictionary with stations list sorted by total_cost

    Raises:
        NotFoundError: User not found
        ServiceUnavailableError: n8n service failed
    """
    # 1. Fetch user's home_address as origin
    user = await get_user_by_id(db, user_id)
    home_address = user.home_address
    
    # 2. Call n8n main webhook (handles routing to Fuel + Maps agents)
    n8n_webhook_url = os.getenv(
        "N8N_MAIN_WEBHOOK_URL",  # Your one webhook that handles everything
        "http://localhost:5678/webhook/chat"  # Or whatever your webhook path is
    )
    
    # Format as a message for your n8n webhook
    message = f"Compare fuel costs for {fuel_amount_needed}L from {home_address} to {destination}"
    
    payload = {
        "message": message,
        "home_address": home_address,
        "destination": destination,
        "fuel_amount_needed": fuel_amount_needed,
        "type": "transport_comparison"  # Help n8n identify the request type
    }
    
    # Get response from n8n
    n8n_response = await call_n8n_webhook(n8n_webhook_url, payload)
    
    # 3. Parse petrol station data from n8n
    # Expected n8n response format:
    # {
    #   "stations": [
    #     {
    #       "station_name": str,
    #       "address": str,
    #       "distance_from_home": float (km),
    #       "price_per_liter": float,
    #       "cost_to_reach_station": float,
    #       "fuel_cost_at_station": float,
    #       "total_cost": float
    #     }
    #   ]
    # }
    
    stations_data = n8n_response.get("stations", [])
    
    # 4. Calculate total costs and sort (if n8n didn't already do this)
    stations = []
    for station_data in stations_data:
        # If n8n didn't calculate these, calculate them here
        if "fuel_cost_at_station" not in station_data:
            station_data["fuel_cost_at_station"] = (
                fuel_amount_needed * station_data["price_per_liter"]
            )
        
        if "total_cost" not in station_data:
            station_data["total_cost"] = (
                station_data["cost_to_reach_station"] + 
                station_data["fuel_cost_at_station"]
            )
        
        station = PetrolStation(**station_data)
        stations.append(station)
    
    # Sort by total_cost ascending (cheapest first)
    stations.sort(key=lambda s: s.total_cost)
    
    # 5. Return sorted results
    return {
        "stations": [station.model_dump() for station in stations]
    }
