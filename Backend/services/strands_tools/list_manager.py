"""
Strands tool: Shopping list manager.

Handles local shopping list operations (add, remove, update)
using a shared module-level list so the chat router
can read back the final list after the agent finishes.

Also checks historical price data to flag items at a good price
point, enabling gamification ("Good choice! +XP").
"""

import logging
from datetime import datetime, timedelta
from strands import tool

from services.shopping_list_context import get_list, set_list, lock

logger = logging.getLogger(__name__)


# ── Price trend helpers ────────────────────────────────────────────────

# Keywords used to fuzzy-match Coles product names to historical items
_KEYWORD_MAP = {
    "milk":    "Milk (1L)",
    "bread":   "Bread (Loaf)",
    "egg":     "Eggs (Dozen)",
    "chicken": "Chicken Breast (1kg)",
    "rice":    "Rice (1kg)",
}


def _match_historical_item(item_name: str) -> str | None:
    """Return the HistoricalPriceData item_name that best matches *item_name*."""
    lower = item_name.lower()
    for keyword, hist_name in _KEYWORD_MAP.items():
        if keyword in lower:
            return hist_name
    return None


def _is_good_buy(item_name: str, current_price: float) -> bool:
    """Check if *current_price* is below the recent average in HistoricalPriceData.

    Returns True (good buy) when the current price is ≤ the 7-day Coles
    average — meaning the user is buying at a low point.
    """
    if current_price <= 0:
        return False

    hist_name = _match_historical_item(item_name)
    if hist_name is None:
        return False

    try:
        from database import SessionLocal
        from models.db_models import HistoricalPriceData

        db = SessionLocal()
        try:
            cutoff = datetime.utcnow() - timedelta(days=7)
            rows = (
                db.query(HistoricalPriceData.price)
                .filter(
                    HistoricalPriceData.item_name == hist_name,
                    HistoricalPriceData.store_name == "Coles",
                    HistoricalPriceData.recorded_date >= cutoff,
                )
                .all()
            )
            if not rows:
                return False

            avg_price = sum(r.price for r in rows) / len(rows)
            is_good = current_price <= avg_price
            logger.info(
                f"Price trend for '{item_name}' (→{hist_name}): "
                f"${current_price:.2f} vs 7-day avg ${avg_price:.2f} → "
                f"{'GOOD BUY' if is_good else 'above avg'}"
            )
            return is_good
        finally:
            db.close()
    except Exception as e:
        logger.warning(f"Price trend check failed: {e}")
        return False


def _record_price(item_name: str, price: float) -> None:
    """Persist the current price into HistoricalPriceData so trends improve over time."""
    if price <= 0:
        return

    hist_name = _match_historical_item(item_name)
    if hist_name is None:
        return

    try:
        from database import SessionLocal
        from models.db_models import HistoricalPriceData

        db = SessionLocal()
        try:
            record = HistoricalPriceData(
                item_name=hist_name,
                price=price,
                store_name="Coles",
                recorded_date=datetime.utcnow(),
            )
            db.add(record)
            db.commit()
            logger.info(f"Recorded price ${price:.2f} for '{hist_name}'")
        finally:
            db.close()
    except Exception as e:
        logger.warning(f"Failed to record price: {e}")


# ── Tool ───────────────────────────────────────────────────────────────

@tool
def manage_list(action: str, item_name: str, quantity: int = 1, price: float = 0) -> dict:
    """Add, remove, or update items on the user's shopping list.

    Use this tool when the user wants to modify their shopping list,
    such as adding new items, removing items, or changing quantities.

    Args:
        action: The action to perform. One of: "add", "remove", "update".
        item_name: The name of the grocery item (e.g. "Milk (1L)", "Bread").
        quantity: The quantity for the item. Defaults to 1. For "update", this sets the new quantity.
        price: The unit price for the item in AUD (e.g. 3.50). Include this when you know the price from a lookup.

    Returns:
        dict with a summary message describing what changed and the updated list.
    """
    # Hold the lock for the entire read→modify→write so parallel
    # tool calls (Strands dispatches tools concurrently) don't
    # clobber each other.
    with lock:
        working_list = get_list()

        if action == "add":
            # Check if item already exists (case-insensitive)
            existing_idx = next(
                (i for i, item in enumerate(working_list)
                 if item.get("name", "").lower() == item_name.lower()),
                None
            )

            # Check price trend for gamification
            good_buy = _is_good_buy(item_name, price) if price > 0 else False

            if existing_idx is not None:
                working_list[existing_idx]["quantity"] = (
                    working_list[existing_idx].get("quantity", 1) + quantity
                )
                if price > 0:
                    working_list[existing_idx]["price"] = price
                if good_buy:
                    working_list[existing_idx]["isGoodBuy"] = True
                message = f"Updated {item_name} quantity to {working_list[existing_idx]['quantity']}"
            else:
                item_entry = {"name": item_name, "quantity": quantity}
                if price > 0:
                    item_entry["price"] = price
                if good_buy:
                    item_entry["isGoodBuy"] = True
                working_list.append(item_entry)
                message = f"Added {quantity}x {item_name} to the list"

            # Record price for future trend data
            if price > 0:
                _record_price(item_name, price)

            if good_buy:
                message += " 🌟 Great price — this item is at a low point!"

            logger.info(message)

        elif action == "remove":
            original_len = len(working_list)
            working_list = [
                item for item in working_list
                if item.get("name", "").lower() != item_name.lower()
            ]

            if len(working_list) < original_len:
                message = f"Removed {item_name} from the list"
            else:
                message = f"{item_name} was not found on the list"

            logger.info(message)

        elif action == "update":
            existing_idx = next(
                (i for i, item in enumerate(working_list)
                 if item.get("name", "").lower() == item_name.lower()),
                None
            )

            if existing_idx is not None:
                working_list[existing_idx]["quantity"] = quantity
                message = f"Updated {item_name} quantity to {quantity}"
            else:
                message = f"{item_name} was not found on the list. Use 'add' to add it first."

            logger.info(message)

        else:
            message = f"Unknown action '{action}'. Use 'add', 'remove', or 'update'."
            logger.warning(message)

        # Write the updated list back so the router can read it
        set_list(working_list)

        logger.info(f"Shopping list now has {len(working_list)} items")

    return {
        "updated_list": working_list,
        "message": message,
    }
