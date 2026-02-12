"""
Strands tool: Directions & travel time via Google Routes API.

Calls https://routes.googleapis.com/directions/v2:computeRoutes directly,
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
        _API_KEY = os.getenv("GOOGLE_ROUTES_API_KEY", "")
    return _API_KEY


def _clean_location(loc: str) -> str:
    """Strip [USER_HOME_ADDRESS=...] wrapper if the agent passed the tag verbatim."""
    m = re.search(r"\[USER_HOME_ADDRESS=(.+?)\]", loc)
    return m.group(1).strip() if m else loc


def _format_duration(seconds: int) -> str:
    """Convert seconds to a human-readable duration string."""
    if seconds < 60:
        return f"{seconds} seconds"
    mins = seconds // 60
    if mins < 60:
        return f"{mins} minute{'s' if mins != 1 else ''}"
    hours = mins // 60
    remaining_mins = mins % 60
    if remaining_mins:
        return f"{hours} hour{'s' if hours != 1 else ''} {remaining_mins} min"
    return f"{hours} hour{'s' if hours != 1 else ''}"


@tool
def get_directions(start_location: str, end_location: str, travel_mode: str = "DRIVE") -> dict:
    """Get directions, distance, and travel time between two locations using Google Routes API.

    Use this tool when the user asks about:
    - How to get from one place to another
    - Travel time or distance between locations
    - Directions to a store, fuel station, or any destination
    - Driving, walking, or bus/transit routes

    Args:
        start_location: The starting address or place name (e.g. "30 Campbell St, Parramatta NSW 2150").
        end_location: The destination address or place name (e.g. "Coles Parramatta, Campbell St").
        travel_mode: How to travel. One of "DRIVE", "WALK", "TRANSIT", "TWO_WHEELER", "BICYCLE". Defaults to "DRIVE".

    Returns:
        dict with route details: distance (metres and text), duration (seconds and text),
        travel mode, and a human-readable summary.
    """
    api_key = _get_api_key()
    if not api_key:
        return {"error": "GOOGLE_ROUTES_API_KEY not configured"}

    start_location = _clean_location(start_location)
    end_location = _clean_location(end_location)

    # Normalise travel mode
    mode = travel_mode.upper().replace("WALKING", "WALK").replace("BUS", "TRANSIT").replace("PUBLIC_TRANSPORT", "TRANSIT")
    if mode not in ("DRIVE", "WALK", "TRANSIT", "TWO_WHEELER", "BICYCLE"):
        mode = "DRIVE"

    logger.info(f"Google Routes: {start_location} -> {end_location} ({mode})")

    url = "https://routes.googleapis.com/directions/v2:computeRoutes"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.legs.steps.navigationInstruction",
    }
    body = {
        "origin": {"address": start_location},
        "destination": {"address": end_location},
        "travelMode": mode,
        "routingPreference": "TRAFFIC_AWARE" if mode == "DRIVE" else "ROUTING_PREFERENCE_UNSPECIFIED",
    }
    # TRANSIT doesn't support routingPreference
    if mode in ("WALK", "TRANSIT", "BICYCLE", "TWO_WHEELER"):
        body.pop("routingPreference", None)

    try:
        with httpx.Client(timeout=15) as client:
            resp = client.post(url, headers=headers, json=body)
            resp.raise_for_status()
            data = resp.json()

        routes = data.get("routes", [])
        if not routes:
            return {
                "error": "No route found",
                "start": start_location,
                "end": end_location,
                "mode": mode,
            }

        route = routes[0]
        distance_m = route.get("distanceMeters", 0)
        duration_str = route.get("duration", "0s")  # e.g. "542s"
        duration_secs = int(duration_str.rstrip("s")) if duration_str.endswith("s") else 0

        # Human-readable distance
        if distance_m >= 1000:
            dist_text = f"{distance_m / 1000:.1f} km"
        else:
            dist_text = f"{distance_m} m"

        result = {
            "start": start_location,
            "end": end_location,
            "travel_mode": mode,
            "distance_metres": distance_m,
            "distance_text": dist_text,
            "duration_seconds": duration_secs,
            "duration_text": _format_duration(duration_secs),
            "summary": (
                f"Route from {start_location} to {end_location} by {mode.lower()}: "
                f"~{dist_text}, ~{_format_duration(duration_secs)}."
            ),
        }

        logger.info(f"Route: {dist_text}, {_format_duration(duration_secs)}")
        return result

    except httpx.HTTPStatusError as e:
        logger.error(f"Google Routes API error: {e.response.status_code} - {e.response.text[:300]}")
        return {"error": f"Google Routes API returned {e.response.status_code}"}
    except Exception as e:
        logger.error(f"Google Routes lookup failed: {e}")
        return {"error": str(e)}
