"""
Grocery service for grocery optimization operations.

Handles grocery optimization with n8n integration and price prediction enrichment.
"""

import os
import logging
from sqlalchemy.orm import Session
from models.schemas import GroceryItem
from services.user_service import get_user_by_id, NotFoundError
from services.n8n_service import call_n8n_webhook, ServiceUnavailableError
from services.historical_price_service import get_historical_average
from services.n8n_response_parser import parse_n8n_response, format_for_grocery_api

logger = logging.getLogger(__name__)


async def optimize_groceries(
    db: Session,
    user_id: str,
    grocery_list: list[str]
) -> dict:
    """
    Optimize grocery shopping with price predictions.

    Process:
    1. Fetch user's home_address
    2. Call n8n webhook with grocery_list and home_address
    3. Receive optimization results from n8n
    4. Enrich each item with price prediction
    5. Return enriched results

    Args:
        db: Database session
        user_id: User identifier
        grocery_list: List of item names

    Returns:
        Dictionary with optimal_cost, store_recommendations, and item_breakdown

    Raises:
        NotFoundError: User not found
        ServiceUnavailableError: n8n service failed
    """
    # 1. Fetch user's home_address
    user = await get_user_by_id(db, user_id)
    home_address = user.home_address
    
    # 2. Call n8n main webhook with correct payload format
    n8n_webhook_url = os.getenv(
        "N8N_MAIN_WEBHOOK_URL",
        "https://louisjean.app.n8n.cloud/webhook-test/26b8906b-6df5-4228-9d8b-859118b52338"
    )
    
    # Use user_id as sessionId for conversation continuity
    session_id = user_id
    
    # Format message for n8n to understand the grocery optimization request
    user_message = f"I need to buy {', '.join(grocery_list)}. My address is {home_address}. Please find the best prices and stores for these items."
    
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
    formatted_data = format_for_grocery_api(parsed_response)
    
    # Check if n8n needs clarification
    if formatted_data.get("needs_clarification"):
        logger.info("n8n needs clarification from user")
        # Return the conversational response for the user to provide more details
        return {
            "optimal_cost": 0.0,
            "store_recommendations": formatted_data["store_recommendations"],
            "item_breakdown": [],
            "message": formatted_data["conversational_response"],
            "needs_clarification": True
        }
    
    # 4. Build item breakdown from grocery list
    # Since n8n returns conversational responses, we create items from the original list
    items = []
    for item_name in grocery_list:
        # Use placeholder prices - in production, parse from n8n response
        grocery_item = GroceryItem(
            item_name=item_name,
            current_price=0.0,  # Will be enriched with historical data
            store_name=formatted_data["store_recommendations"][0] if formatted_data["store_recommendations"] else "Coles",
            price_prediction=None
        )
        items.append(grocery_item)
    
    # 5. Enrich with price predictions from historical data
    enriched_items = await enrich_with_price_predictions(db, items)
    
    # 6. Return enriched results with conversational context
    return {
        "optimal_cost": formatted_data["optimal_cost"],
        "store_recommendations": formatted_data["store_recommendations"],
        "item_breakdown": [item.model_dump() for item in enriched_items],
        "conversational_response": formatted_data.get("conversational_response", ""),
        "needs_clarification": False
    }


async def enrich_with_price_predictions(
    db: Session,
    items: list[GroceryItem]
) -> list[GroceryItem]:
    """
    Add price prediction tags to grocery items.

    For each item:
    1. Query historical prices (past 4 weeks)
    2. Calculate 4-week average
    3. Compare current price to average
    4. Tag: "likely to drop next week" if below average
    5. Tag: "historically rising" if at/above average

    Args:
        db: Database session
        items: List of grocery items with current prices

    Returns:
        Items enriched with price_prediction field
    """
    enriched_items = []
    
    for item in items:
        # Query historical average for this item
        historical_avg = await get_historical_average(db, item.item_name)
        
        # Determine price prediction based on comparison
        if historical_avg is not None:
            if item.current_price < historical_avg:
                item.price_prediction = "likely to drop next week"
            else:
                item.price_prediction = "historically rising"
        # If no historical data, leave price_prediction as None
        
        enriched_items.append(item)
    
    return enriched_items
