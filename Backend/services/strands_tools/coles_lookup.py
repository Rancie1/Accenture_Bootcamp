"""
Strands tool: Coles grocery price lookup via n8n Coles agent webhook.

Wraps the n8n Coles Agent that queries Coles store data and
grocery prices near a given location.
"""

import os
import asyncio
import logging

from strands import tool
from services.n8n_service import call_n8n_webhook

logger = logging.getLogger(__name__)


@tool
def lookup_coles_prices(location: str, items: list[str]) -> dict:
    """Look up current Coles grocery prices near a given location.

    Use this tool when the user asks about grocery prices, Coles prices,
    or wants to compare prices for specific items.

    Args:
        location: The suburb, city, or address to search near (e.g. "Randwick", "123 George St Sydney").
        items: List of grocery item names to look up prices for (e.g. ["Milk (1L)", "Bread (Loaf)"]).

    Returns:
        dict with Coles store locations near the address and current prices
        for the requested items, including store names and item breakdowns.
    """
    webhook_url = os.getenv(
        "N8N_COLES_WEBHOOK_URL",
        "http://localhost:5678/webhook/coles"
    )

    logger.info(f"Looking up Coles prices for {len(items)} items near: {location}")

    # n8n AI agent expects body.message
    items_str = ", ".join(items)
    message = f"Find prices for {items_str} at Coles near {location}"
    result = asyncio.run(call_n8n_webhook(webhook_url, {
        "message": message,
    }))

    return result
