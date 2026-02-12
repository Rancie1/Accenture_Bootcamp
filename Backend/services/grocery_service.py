"""
Grocery service for grocery optimization operations.

Handles grocery optimization by calling individual n8n agent tools
(Coles + Maps) directly and enriching results with price predictions.
"""

from sqlalchemy.orm import Session
from models.schemas import GroceryItem
from services.user_service import get_user_by_id, NotFoundError
from services.n8n_service import ServiceUnavailableError
from services.historical_price_service import get_historical_average
from services.strands_tools.coles_lookup import lookup_coles_prices
from services.strands_tools.maps_search import get_directions


async def optimize_groceries(
    db: Session,
    user_id: str,
    grocery_list: list[str]
) -> dict:
    """
    Optimize grocery shopping with price predictions.

    Process:
    1. Fetch user's home_address
    2. Resolve location via Maps agent
    3. Get Coles prices via Coles agent
    4. Enrich each item with price prediction from historical data
    5. Return enriched results

    Args:
        db: Database session
        user_id: User identifier
        grocery_list: List of item names

    Returns:
        Dictionary with optimal_cost, store_recommendations, and item_breakdown

    Raises:
        NotFoundError: User not found
        ServiceUnavailableError: n8n agent service failed
    """
    # 1. Fetch user's home_address
    user = await get_user_by_id(db, user_id)
    home_address = user.home_address
    
    # 2. Call n8n main webhook (handles routing to all agents)
    n8n_webhook_url = os.getenv(
        "N8N_MAIN_WEBHOOK_URL",  # Your one webhook that handles everything
        "http://localhost:5678/webhook/chat"  # Or whatever your webhook path is
    )
    
    # Format as a chat message for your n8n webhook
    # Your n8n will parse this message and route to Coles + Maps agents
    message = f"Find grocery prices for {', '.join(grocery_list)} near {home_address}"
    
    payload = {
        "message": message,
        "grocery_list": grocery_list,  # Include structured data too
        "home_address": home_address,
        "type": "grocery_optimization"  # Help n8n identify the request type
    }
    
    # Get response from n8n
    n8n_response = await call_n8n_webhook(n8n_webhook_url, payload)
    
    # 3. Parse optimization results from n8n
    # Expected n8n response format:
    # {
    #   "optimal_cost": float,
    #   "store_recommendations": [str],
    #   "item_breakdown": [
    #     {"item_name": str, "current_price": float, "store_name": str}
    #   ]
    # }

    items = []
    for item_data in coles_data.get("item_breakdown", []):
        grocery_item = GroceryItem(
            item_name=item_data["item_name"],
            current_price=item_data["current_price"],
            store_name=item_data["store_name"],
            price_prediction=None
        )
        items.append(grocery_item)

    # 5. Enrich with price predictions from historical data
    enriched_items = await enrich_with_price_predictions(db, items)

    return {
        "optimal_cost": coles_data.get("optimal_cost", 0.0),
        "store_recommendations": coles_data.get("store_recommendations", []),
        "item_breakdown": [item.model_dump() for item in enriched_items]
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
