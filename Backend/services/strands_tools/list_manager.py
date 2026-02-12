"""
Strands tool: Shopping list manager.

Handles local shopping list operations (add, remove, update)
using a shared module-level list so the chat router
can read back the final list after the agent finishes.
"""

import logging
from strands import tool

from services.shopping_list_context import get_list, set_list, lock

logger = logging.getLogger(__name__)


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

            if existing_idx is not None:
                working_list[existing_idx]["quantity"] = (
                    working_list[existing_idx].get("quantity", 1) + quantity
                )
                if price > 0:
                    working_list[existing_idx]["price"] = price
                message = f"Updated {item_name} quantity to {working_list[existing_idx]['quantity']}"
            else:
                item_entry = {"name": item_name, "quantity": quantity}
                if price > 0:
                    item_entry["price"] = price
                working_list.append(item_entry)
                message = f"Added {quantity}x {item_name} to the list"

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
