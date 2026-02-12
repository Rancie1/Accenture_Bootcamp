"""
Strands tool: Fuel price lookup via n8n fuel agent webhook.

Wraps the n8n Fuel Agent that queries the NSW Fuel API for
petrol station prices near a given location.
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
def lookup_fuel_prices(location: str, fuel_type: str = "unleaded") -> dict:
    """Look up current fuel prices near a given location.

    Use this tool when the user asks about petrol, fuel, or gas prices.
    It queries real-time fuel station data via the NSW Fuel API.

    Args:
        location: The suburb, city, or address to search near (e.g. "Parramatta", "UNSW Sydney").
        fuel_type: Type of fuel to search for. One of: unleaded, diesel, e10, premium. Defaults to unleaded.

    Returns:
        dict with nearby fuel stations and their current prices, including
        station names, addresses, distances, and price per litre.
    """
    webhook_url = os.getenv(
        "N8N_FUEL_WEBHOOK_URL",
        "http://localhost:5678/webhook/fuel"
    )

    location = _clean_location(location)
    logger.info(f"Looking up {fuel_type} fuel prices near: {location}")

    # n8n AI agent expects body.message
    message = f"Find {fuel_type} fuel prices near {location}"
    result = asyncio.run(call_n8n_webhook(webhook_url, {
        "message": message,
    }))

    return result
