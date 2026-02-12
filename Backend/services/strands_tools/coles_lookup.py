"""
Strands tool: Coles grocery price lookup via n8n Coles agent webhook.

Wraps the n8n Coles Agent that queries current Coles grocery prices
and can find nearby Coles stores via Google Places.
"""

import os
import asyncio
import logging

from strands import tool
from services.n8n_service import call_n8n_webhook

logger = logging.getLogger(__name__)


@tool
def lookup_coles_prices(items: list[str], location: str = "") -> dict:
    """Look up current grocery prices at Coles and find nearby stores.

    Use this tool when the user asks about grocery prices, Coles prices,
    or wants to know how much items cost. Coles has national pricing but
    if the user provides a location, nearby Coles stores will also be returned.

    Args:
        items: List of grocery item names to look up prices for (e.g. ["Milk 1L", "Bread", "Eggs"]).
        location: Optional address or suburb to find nearby Coles stores (e.g. "30 Campbell St, Parramatta NSW 2150").

    Returns:
        dict with current Coles prices for the requested items and optionally nearby store locations.
    """
    webhook_url = os.getenv(
        "N8N_COLES_WEBHOOK_URL",
        "http://localhost:5678/webhook/coles"
    )

    logger.info(f"Looking up Coles prices for {len(items)} items, location: {location or 'none'}")

    # n8n AI agent expects body.message
    items_str = ", ".join(items)
    if location:
        message = f"What are the current Coles prices for: {items_str}. Also find nearby Coles stores to {location}"
    else:
        message = f"What are the current Coles prices for: {items_str}"

    result = asyncio.run(call_n8n_webhook(webhook_url, {
        "message": message,
    }))

    return result
