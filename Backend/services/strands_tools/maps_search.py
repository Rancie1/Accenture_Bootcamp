"""
Strands tool: Google Maps location search via n8n Maps agent webhook.

Wraps the n8n Google Maps Agent that resolves addresses, calculates
distances, and filters locations within a radius.
"""

import os
import asyncio
import logging

from strands import tool
from services.n8n_service import call_n8n_webhook

logger = logging.getLogger(__name__)


@tool
def search_location(query: str, radius_km: float = 5.0) -> dict:
    """Resolve an address or place name and find nearby points of interest using Google Maps.

    Use this tool when you need to:
    - Resolve a vague location into a specific address or coordinates
    - Find stores or stations within a certain radius of an address
    - Calculate distances between locations

    Args:
        query: The address, place name, or landmark to search for (e.g. "UNSW Sydney", "Parramatta Station").
        radius_km: Search radius in kilometres. Defaults to 5.0 km.

    Returns:
        dict with resolved location data including coordinates, formatted address,
        and nearby places within the specified radius.
    """
    webhook_url = os.getenv(
        "N8N_MAPS_WEBHOOK_URL",
        "http://localhost:5678/webhook/maps"
    )

    logger.info(f"Searching location: {query} (radius: {radius_km}km)")

    # n8n AI agent expects body.message
    message = f"Search for {query} within {radius_km}km radius"
    result = asyncio.run(call_n8n_webhook(webhook_url, {
        "message": message,
    }))

    return result
