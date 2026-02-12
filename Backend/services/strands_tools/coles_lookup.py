"""
Strands tool: Coles grocery price lookup via n8n Coles agent webhook.

Wraps the n8n Coles Agent that queries current Coles grocery prices
and can find nearby Coles stores via Google Places.
"""

import os
import re
import asyncio
import logging

from strands import tool
from services.n8n_service import call_n8n_webhook

logger = logging.getLogger(__name__)


def _clean_location(loc: str) -> str:
    """Strip [USER_HOME_ADDRESS=...] wrapper if the agent passed the tag verbatim."""
    m = re.search(r"\[USER_HOME_ADDRESS=(.+?)\]", loc)
    return m.group(1).strip() if m else loc


@tool
def lookup_coles_prices(items: list[str] = None, location: str = "") -> dict:
    """Look up current grocery prices at Coles and/or find nearby Coles stores.

    Use this tool when the user asks about grocery prices, Coles prices,
    wants to know how much items cost, OR wants to find nearby Coles stores.
    Items and location are both optional — you can use this tool with just
    a location to find nearby stores without looking up prices.

    Args:
        items: Optional list of grocery item names to look up prices for (e.g. ["Milk 1L", "Bread", "Eggs"]). Can be empty or omitted if you only need store locations.
        location: Optional address or suburb to find nearby Coles stores (e.g. "30 Campbell St, Parramatta NSW 2150").

    Returns:
        dict with current Coles prices for the requested items (if any) and nearby
        store locations including latitude/longitude coordinates. When a location is
        provided, the response may include store name, address, lat, and lon for each
        nearby Coles store — these coordinates can be passed to get_directions for
        precise navigation.
    """
    webhook_url = os.getenv(
        "N8N_COLES_WEBHOOK_URL",
        "http://localhost:5678/webhook/coles"
    )

    items = items or []
    items_str = ", ".join(items) if items else ""
    location = _clean_location(location) if location else ""

    logger.info(f"Looking up Coles prices for {len(items)} items, location: {location or 'none'}")

    # Build natural language message for the n8n AI agent
    if items_str and location:
        message = f"What are the current Coles prices for: {items_str}. Also find nearby Coles stores to {location}"
    elif items_str:
        message = f"What are the current Coles prices for: {items_str}"
    elif location:
        message = f"Find the nearest Coles stores to {location}"
    else:
        message = "What are the current Coles specials?"

    result = asyncio.run(call_n8n_webhook(webhook_url, {
        "message": message,
    }))

    return result
