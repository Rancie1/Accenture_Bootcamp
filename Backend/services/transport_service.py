"""
Transport service for transport cost comparison operations.

Handles transport cost comparison with n8n integration for petrol station data.
"""

import os
import logging
from sqlalchemy.orm import Session
from models.schemas import PetrolStation
from services.user_service import get_user_by_id, NotFoundError
from services.n8n_service import call_n8n_webhook, ServiceUnavailableError
from services.n8n_response_parser import parse_n8n_response, format_for_transport_api

logger = logging.getLogger(__name__)


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
    
    # 2. Call n8n main webhook with correct payload format
    n8n_webhook_url = os.getenv(
        "N8N_MAIN_WEBHOOK_URL",
        "https://louisjean.app.n8n.cloud/webhook-test/26b8906b-6df5-4228-9d8b-859118b52338"
    )
    
    # Use user_id as sessionId for conversation continuity
    session_id = user_id
    
    # Format message for n8n to understand the transport comparison request
    user_message = f"I need {fuel_amount_needed} liters of fuel. I'm traveling from {home_address} to {destination}. Please compare fuel costs at nearby petrol stations and show me the cheapest options."
    
    # n8n expects: {"sessionId": "...", "userMessage": "..."}
    payload = {
        "sessionId": session_id,
        "userMessage": user_message
    }
    
    # Get response from n8n
    n8n_response = await call_n8n_webhook(n8n_webhook_url, payload)
    
    logger.info(f"Received n8n response: {n8n_response}")
    
    # 3. Parse n8n multi-agent response format
    parsed_response = parse_n8n_response(n8n_response)
    formatted_data = format_for_transport_api(parsed_response)
    
    # 4. Process station data
    stations = []
    for station_data in formatted_data["stations"]:
        # Calculate costs if not already calculated
        if "fuel_cost_at_station" not in station_data or station_data["fuel_cost_at_station"] == 0.0:
            # Use placeholder or estimate if price_per_liter is available
            if station_data.get("price_per_liter", 0.0) > 0:
                station_data["fuel_cost_at_station"] = (
                    fuel_amount_needed * station_data["price_per_liter"]
                )
        
        if "total_cost" not in station_data or station_data["total_cost"] == 0.0:
            station_data["total_cost"] = (
                station_data.get("cost_to_reach_station", 0.0) + 
                station_data.get("fuel_cost_at_station", 0.0)
            )
        
        # Create PetrolStation object
        try:
            station = PetrolStation(**station_data)
            stations.append(station)
        except Exception as e:
            logger.warning(f"Failed to create PetrolStation from data: {station_data}, error: {e}")
            continue
    
    # 5. Sort by total_cost ascending (cheapest first)
    stations.sort(key=lambda s: s.total_cost)
    
    # 6. Return sorted results with conversational context
    return {
        "stations": [station.model_dump() for station in stations],
        "conversational_response": formatted_data.get("conversational_response", ""),
        "location_details": formatted_data.get("location_details", ""),
        "has_error": formatted_data.get("has_error", False)
    }
