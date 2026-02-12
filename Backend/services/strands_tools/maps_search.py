"""
Strands tool: Google Maps routes/directions via n8n Maps agent webhook.

Wraps the n8n Google Maps Agent that calculates routes between
two locations using the Google Routes API.
"""

import os
import asyncio
import logging

from strands import tool
from services.n8n_service import call_n8n_webhook

logger = logging.getLogger(__name__)


@tool
def get_directions(start_location: str, end_location: str, travel_mode: str = "DRIVE") -> dict:
    """Get directions and travel time between two locations using Google Maps.

    Use this tool when the user asks about:
    - How to get from one place to another
    - Travel time or distance between locations
    - Directions to a store, fuel station, or any destination
    - Bus or driving routes

    Args:
        start_location: The starting address or place name (e.g. "UNSW Sydney", "30 Campbell St Parramatta NSW 2150").
        end_location: The destination address or place name (e.g. "Coles Parramatta", "nearest petrol station").
        travel_mode: How to travel. Use "DRIVE" for car or "TRANSIT" for bus. Defaults to "DRIVE".

    Returns:
        dict with route details including distance, duration, and directions.
    """
    webhook_url = os.getenv(
        "N8N_MAPS_WEBHOOK_URL",
        "http://localhost:5678/webhook/maps"
    )

    logger.info(f"Getting directions: {start_location} -> {end_location} ({travel_mode})")

    # n8n AI agent expects body.message
    message = f"Get directions from {start_location} to {end_location} by {travel_mode.lower()}"
    result = asyncio.run(call_n8n_webhook(webhook_url, {
        "message": message,
    }))

    return result
