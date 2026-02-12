"""
Parser for n8n multi-agent response format.

Converts n8n's conversational agent responses into structured data
that the Backend API expects.
"""

import re
import logging
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)


def parse_n8n_response(n8n_response: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Parse n8n multi-agent response format.
    
    Expected n8n format:
    [{
      "user_message": "...",
      "agent_answers": [
        {"route": "groceries", "answer": "..."},
        {"route": "fuel", "answer": "..."},
        {"route": "location", "answer": "..."}
      ]
    }]
    
    Args:
        n8n_response: List containing response object from n8n
        
    Returns:
        Dictionary with parsed data for each route
    """
    if not n8n_response or not isinstance(n8n_response, list):
        logger.warning("Invalid n8n response format: expected list")
        return {"agent_answers": {}}
    
    response_obj = n8n_response[0] if len(n8n_response) > 0 else {}
    agent_answers = response_obj.get("agent_answers", [])
    
    # Parse each agent's answer
    parsed = {
        "user_message": response_obj.get("user_message", ""),
        "agent_answers": {}
    }
    
    for agent in agent_answers:
        route = agent.get("route", "")
        answer = agent.get("answer", "")
        parsed["agent_answers"][route] = answer
    
    return parsed


def extract_grocery_data(parsed_response: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract grocery optimization data from parsed n8n response.
    
    Returns:
        {
          "optimal_cost": float,
          "store_recommendations": [str],
          "item_breakdown": [
            {"item_name": str, "current_price": float, "store_name": str}
          ],
          "raw_answer": str  # Original conversational response
        }
    """
    groceries_answer = parsed_response.get("agent_answers", {}).get("groceries", "")
    location_answer = parsed_response.get("agent_answers", {}).get("location", "")
    
    # Extract store name from location answer
    store_name = extract_store_name(location_answer)
    
    # Try to extract prices from groceries answer
    # Pattern: looking for price mentions like "$3.50", "3.50", etc.
    prices = re.findall(r'\$?(\d+\.?\d*)', groceries_answer)
    
    # For now, return a structured response with the conversational answer
    # In production, you might want more sophisticated parsing
    result = {
        "optimal_cost": 0.0,  # Will be calculated if prices found
        "store_recommendations": [store_name] if store_name else ["Coles"],
        "item_breakdown": [],
        "raw_answer": groceries_answer,
        "needs_clarification": "preferred sizes/brands" in groceries_answer.lower()
    }
    
    # If we found prices, try to structure them
    if prices and not result["needs_clarification"]:
        # This is a simplified parser - enhance based on actual response patterns
        result["optimal_cost"] = sum(float(p) for p in prices[:3])  # Sum first 3 prices found
    
    return result


def extract_fuel_data(parsed_response: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract fuel/transport data from parsed n8n response.
    
    Returns:
        {
          "stations": [
            {
              "station_name": str,
              "address": str,
              "distance_from_home": float,
              "price_per_liter": float,
              "coordinates": {"lat": float, "lng": float}
            }
          ],
          "raw_answer": str,
          "has_error": bool
        }
    """
    fuel_answer = parsed_response.get("agent_answers", {}).get("fuel", "")
    location_answer = parsed_response.get("agent_answers", {}).get("location", "")
    
    # Check if fuel service had an error
    has_error = "couldn't fetch" in fuel_answer.lower() or "error" in fuel_answer.lower()
    
    # Extract fuel stations from location answer
    stations = extract_fuel_stations(location_answer)
    
    return {
        "stations": stations,
        "raw_answer": fuel_answer,
        "location_details": location_answer,
        "has_error": has_error
    }


def extract_store_name(location_answer: str) -> Optional[str]:
    """Extract store name from location answer."""
    # Look for "- Coles [Location]" pattern (more specific)
    match = re.search(r'-\s+(Coles|Woolworths|Aldi|IGA)\s+(\w+)', location_answer)
    if match:
        return f"{match.group(1)} {match.group(2)}"
    
    # Look for "Coles [Location]" pattern
    match = re.search(r'(Coles|Woolworths|Aldi|IGA)\s+(\w+)', location_answer)
    if match:
        return f"{match.group(1)} {match.group(2)}"
    
    # Fallback: just look for store name
    for store in ["Coles", "Woolworths", "Aldi", "IGA"]:
        if store in location_answer:
            return store
    
    return None


def extract_fuel_stations(location_answer: str) -> List[Dict[str, Any]]:
    """
    Extract fuel station data from location answer.
    
    Looks for patterns like:
    1) bp Truckstop
      - Address: 107 Erskine St, Dubbo NSW 2830
      - Coordinates: -32.2443213, 148.6112578
    """
    stations = []
    
    # Split by numbered list items
    station_blocks = re.split(r'\n\d+\)\s+', location_answer)
    
    for block in station_blocks[1:]:  # Skip first split (before first station)
        station = {}
        
        # Extract station name (first line)
        lines = block.strip().split('\n')
        if lines:
            station["station_name"] = lines[0].strip()
        
        # Extract address
        address_match = re.search(r'Address:\s*(.+?)(?:\n|$)', block)
        if address_match:
            station["address"] = address_match.group(1).strip()
        
        # Extract coordinates
        coord_match = re.search(r'Coordinates:\s*([-\d.]+),\s*([-\d.]+)', block)
        if coord_match:
            station["coordinates"] = {
                "lat": float(coord_match.group(1)),
                "lng": float(coord_match.group(2))
            }
            station["distance_from_home"] = 0.0  # Will be calculated if needed
        
        # Add placeholder price data (since fuel API had error in example)
        station["price_per_liter"] = 0.0
        station["cost_to_reach_station"] = 0.0
        station["fuel_cost_at_station"] = 0.0
        station["total_cost"] = 0.0
        
        if station.get("station_name"):
            stations.append(station)
    
    return stations


def format_for_grocery_api(parsed_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format parsed n8n data for Backend grocery API response.
    
    Returns format expected by /optimise/groceries endpoint.
    """
    grocery_data = extract_grocery_data(parsed_data)
    
    return {
        "optimal_cost": grocery_data["optimal_cost"],
        "store_recommendations": grocery_data["store_recommendations"],
        "item_breakdown": grocery_data["item_breakdown"],
        "conversational_response": grocery_data["raw_answer"],
        "needs_clarification": grocery_data.get("needs_clarification", False)
    }


def format_for_transport_api(parsed_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format parsed n8n data for Backend transport API response.
    
    Returns format expected by /transport/compare endpoint.
    """
    fuel_data = extract_fuel_data(parsed_data)
    
    return {
        "stations": fuel_data["stations"],
        "conversational_response": fuel_data["raw_answer"],
        "location_details": fuel_data.get("location_details", ""),
        "has_error": fuel_data.get("has_error", False)
    }
