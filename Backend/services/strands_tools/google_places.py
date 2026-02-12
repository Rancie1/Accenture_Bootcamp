"""
Strands tool: Find nearby Coles/grocery stores via Google Places API (new).

Calls https://places.googleapis.com/v1/places:searchText directly,
eliminating the n8n middleware hop.
"""

import os
import re
import json
import httpx
import logging

from strands import tool

logger = logging.getLogger(__name__)

_API_KEY = None  # Lazy-loaded from env


def _get_api_key() -> str:
    global _API_KEY
    if _API_KEY is None:
        _API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "")
    return _API_KEY


def _clean_location(loc: str) -> str:
    """Strip [USER_HOME_ADDRESS=...] wrapper if the agent passed the tag verbatim."""
    m = re.search(r"\[USER_HOME_ADDRESS=(.+?)\]", loc)
    return m.group(1).strip() if m else loc


@tool
def find_nearby_stores(location: str, store_type: str = "Coles") -> dict:
    """Find nearby grocery stores (Coles, Woolworths, etc.) using Google Places.

    Use this tool when you need to find the nearest store to the user's
    location. Returns store names, addresses, and coordinates (lat/lng)
    that can be passed to get_directions.

    Args:
        location: The user's address or suburb to search near (e.g. "30 Campbell St, Parramatta NSW 2150").
        store_type: The type of store to search for (e.g. "Coles", "Woolworths"). Defaults to "Coles".

    Returns:
        dict with nearby stores including name, address, latitude, and longitude.
    """
    api_key = _get_api_key()
    if not api_key:
        return {"error": "GOOGLE_PLACES_API_KEY not configured"}

    location = _clean_location(location)
    query = f"{store_type} supermarket near {location}"
    logger.info(f"Google Places search: {query}")

    url = "https://places.googleapis.com/v1/places:searchText"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location",
    }
    body = {
        "textQuery": query,
        "maxResultCount": 5,
    }

    try:
        with httpx.Client(timeout=15) as client:
            resp = client.post(url, headers=headers, json=body)
            resp.raise_for_status()
            data = resp.json()

        stores = []
        for place in data.get("places", []):
            loc_data = place.get("location", {})
            stores.append({
                "name": place.get("displayName", {}).get("text", "Unknown"),
                "address": place.get("formattedAddress", ""),
                "latitude": loc_data.get("latitude"),
                "longitude": loc_data.get("longitude"),
            })

        logger.info(f"Found {len(stores)} {store_type} stores near {location}")
        return {"nearby_stores": stores}

    except httpx.HTTPStatusError as e:
        logger.error(f"Google Places API error: {e.response.status_code} - {e.response.text[:300]}")
        return {"error": f"Google Places API returned {e.response.status_code}"}
    except Exception as e:
        logger.error(f"Google Places lookup failed: {e}")
        return {"error": str(e)}
