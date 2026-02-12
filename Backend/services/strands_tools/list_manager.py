"""
Strands tool: Shopping list manager.

Handles local shopping list operations (add, remove, update)
without calling any external service.
"""

import logging
from strands import tool

logger = logging.getLogger(__name__)


@tool
def manage_list(action: str, item_name: str, quantity: int = 1, current_list: list[dict] | None = None) -> dict:
    """Add, remove, or update items on the user's shopping list.

    Use this tool when the user wants to modify their shopping list,
    such as adding new items, removing items, or changing quantities.

    Args:
        action: The action to perform. One of: "add", "remove", "update".
        item_name: The name of the grocery item (e.g. "Milk (1L)", "Bread").
        quantity: The quantity for the item. Defaults to 1. For "update", this sets the new quantity.
        current_list: The current shopping list as a list of dicts with "name" and "quantity" keys.
                      If not provided, assumes an empty list.

    Returns:
        dict with the updated shopping list and a summary message describing what changed.
    """
    if current_list is None:
        current_list = []

    # Work on a copy to avoid mutating the input
    updated_list = [item.copy() for item in current_list]

    if action == "add":
        # Check if item already exists (case-insensitive)
        existing_idx = next(
            (i for i, item in enumerate(updated_list)
             if item.get("name", "").lower() == item_name.lower()),
            None
        )

        if existing_idx is not None:
            updated_list[existing_idx]["quantity"] = (
                updated_list[existing_idx].get("quantity", 1) + quantity
            )
            message = f"Updated {item_name} quantity to {updated_list[existing_idx]['quantity']}"
        else:
            updated_list.append({"name": item_name, "quantity": quantity})
            message = f"Added {quantity}x {item_name} to the list"

        logger.info(message)

    elif action == "remove":
        original_len = len(updated_list)
        updated_list = [
            item for item in updated_list
            if item.get("name", "").lower() != item_name.lower()
        ]

        if len(updated_list) < original_len:
            message = f"Removed {item_name} from the list"
        else:
            message = f"{item_name} was not found on the list"

        logger.info(message)

    elif action == "update":
        existing_idx = next(
            (i for i, item in enumerate(updated_list)
             if item.get("name", "").lower() == item_name.lower()),
            None
        )

        if existing_idx is not None:
            updated_list[existing_idx]["quantity"] = quantity
            message = f"Updated {item_name} quantity to {quantity}"
        else:
            message = f"{item_name} was not found on the list. Use 'add' to add it first."

        logger.info(message)

    else:
        message = f"Unknown action '{action}'. Use 'add', 'remove', or 'update'."
        logger.warning(message)

    return {
        "updated_list": updated_list,
        "message": message,
    }
