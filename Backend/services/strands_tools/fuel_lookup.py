"""
Strands tool: Fuel price lookup via NSW FuelCheck API v2.

Calls the NSW Government FuelCheck API directly:
  1. Geocodes the user's location to lat/lng via Google Geocoding API
  2. Authenticates with the NSW FuelCheck OAuth endpoint
  3. Fetches nearby fuel prices sorted by price (ascending)
"""

import os
import re
import uuid
import logging
from datetime import datetime

import httpx
from strands import tool

logger = logging.getLogger(__name__)

# ── Lazy-loaded env vars ─────────────────────────────────────────────
_NSW_FUEL_API_KEY: str | None = None
_NSW_FUEL_AUTH_BASIC: str | None = None
_GOOGLE_API_KEY: str | None = None


def _env(name: str, fallback: str = "") -> str:
    return os.getenv(name, fallback)


def _get_fuel_api_key() -> str:
    global _NSW_FUEL_API_KEY
    if _NSW_FUEL_API_KEY is None:
        _NSW_FUEL_API_KEY = _env("NSW_FUEL_API_KEY")
    return _NSW_FUEL_API_KEY


def _get_fuel_auth() -> str:
    global _NSW_FUEL_AUTH_BASIC
    if _NSW_FUEL_AUTH_BASIC is None:
        _NSW_FUEL_AUTH_BASIC = _env("NSW_FUEL_AUTH_BASIC")
    return _NSW_FUEL_AUTH_BASIC


def _get_google_key() -> str:
    global _GOOGLE_API_KEY
    if _GOOGLE_API_KEY is None:
        _GOOGLE_API_KEY = _env("GOOGLE_PLACES_API_KEY")
    return _GOOGLE_API_KEY


def _clean_location(loc: str) -> str:
    """Strip [USER_HOME_ADDRESS=...] wrapper if the agent passed the tag verbatim."""
    m = re.search(r"\[USER_HOME_ADDRESS=(.+?)\]", loc)
    return m.group(1).strip() if m else loc


# ── Helpers ──────────────────────────────────────────────────────────

def _geocode(address: str) -> tuple[float, float] | None:
    """Convert an address string to (latitude, longitude) via Google Geocoding."""
    api_key = _get_google_key()
    if not api_key:
        logger.warning("No GOOGLE_PLACES_API_KEY — cannot geocode for fuel lookup")
        return None

    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {"address": address, "key": api_key}

    try:
        with httpx.Client(timeout=10) as client:
            resp = client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        results = data.get("results", [])
        if not results:
            logger.warning(f"Geocode returned 0 results for: {address}")
            return None

        loc = results[0]["geometry"]["location"]
        return (loc["lat"], loc["lng"])
    except Exception as e:
        logger.error(f"Geocode failed for '{address}': {e}")
        return None


def _get_access_token() -> str | None:
    """Fetch an OAuth2 access token from the NSW FuelCheck API."""
    auth_basic = _get_fuel_auth()
    if not auth_basic:
        logger.error("NSW_FUEL_AUTH_BASIC not configured")
        return None

    url = "https://api.onegov.nsw.gov.au/oauth/client_credential/accesstoken"
    headers = {"Authorization": auth_basic}
    params = {"grant_type": "client_credentials"}

    try:
        with httpx.Client(timeout=10) as client:
            resp = client.get(url, headers=headers, params=params)
            resp.raise_for_status()
            return resp.json().get("access_token")
    except Exception as e:
        logger.error(f"NSW Fuel auth failed: {e}")
        return None


FUEL_TYPE_MAP = {
    "unleaded": "U91",
    "u91": "U91",
    "e10": "E10",
    "premium": "P95",
    "p95": "P95",
    "p98": "P98",
    "diesel": "DL",
    "dl": "DL",
    "pdl": "PDL",
    "lpg": "LPG",
}


# ── Strands tool ─────────────────────────────────────────────────────

@tool
def lookup_fuel_prices(location: str, fuel_type: str = "unleaded") -> dict:
    """Look up current fuel prices near a given location using the NSW FuelCheck API.

    Use this tool when the user asks about petrol, fuel, or gas prices.
    It queries real-time fuel station data.

    Args:
        location: The suburb, city, or address to search near (e.g. "Parramatta", "30 Campbell St, Parramatta NSW 2150").
        fuel_type: Type of fuel. One of: unleaded, e10, premium, p98, diesel, lpg. Defaults to unleaded.

    Returns:
        dict with nearby fuel stations and their current prices, sorted
        cheapest first, including station name, address, distance (km),
        price (cents/litre), and last-updated timestamp.
    """
    location = _clean_location(location)
    code = FUEL_TYPE_MAP.get(fuel_type.lower(), "U91")
    logger.info(f"Looking up {code} fuel prices near: {location}")

    # 1. Geocode
    coords = _geocode(location)
    if coords is None:
        return {"error": f"Could not geocode location: {location}"}
    lat, lng = coords
    logger.info(f"Geocoded '{location}' → ({lat}, {lng})")

    # 2. Auth
    token = _get_access_token()
    if token is None:
        return {"error": "Failed to authenticate with NSW Fuel API"}

    # 3. Fetch nearby prices
    url = "https://api.onegov.nsw.gov.au/FuelPriceCheck/v2/fuel/prices/nearby"
    now = datetime.now().strftime("%d/%m/%Y %I:%M:%S %p")
    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": _get_fuel_api_key(),
        "Content-Type": "application/json",
        "transactionid": str(uuid.uuid4()),
        "requesttimestamp": now,
    }
    body = {
        "fueltype": code,
        "latitude": str(lat),
        "longitude": str(lng),
        "radius": "5",
        "sortby": "price",
        "sortascending": "true",
    }

    try:
        with httpx.Client(timeout=15) as client:
            resp = client.post(url, headers=headers, json=body)
            resp.raise_for_status()
            data = resp.json()

        stations_raw = data.get("stations", [])
        prices_raw = data.get("prices", [])
        station_map = {s["code"]: s for s in stations_raw}

        results = []
        for p in prices_raw[:10]:  # Top 10 cheapest
            stn = station_map.get(p.get("stationcode"), {})
            loc_info = stn.get("location", {})
            results.append({
                "name": stn.get("name", "Unknown"),
                "brand": stn.get("brand", ""),
                "address": stn.get("address", ""),
                "price_cents_per_litre": p.get("price"),
                "price_dollars_per_litre": round(p.get("price", 0) / 100, 3),
                "distance_km": loc_info.get("distance"),
                "latitude": loc_info.get("latitude"),
                "longitude": loc_info.get("longitude"),
                "last_updated": p.get("lastupdated", ""),
            })

        logger.info(f"Found {len(results)} {code} stations near ({lat}, {lng})")

        cheapest = results[0] if results else None
        summary = ""
        if cheapest:
            summary = (
                f"Cheapest {code} near {location}: "
                f"{cheapest['name']} at {cheapest['price_cents_per_litre']} c/L "
                f"({cheapest['distance_km']} km away, {cheapest['address']}). "
                f"Last updated {cheapest['last_updated']}."
            )

        return {
            "fuel_type": code,
            "search_location": location,
            "stations": results,
            "summary": summary,
        }

    except httpx.HTTPStatusError as e:
        logger.error(f"NSW Fuel API error: {e.response.status_code} - {e.response.text[:300]}")
        return {"error": f"NSW Fuel API returned {e.response.status_code}"}
    except Exception as e:
        logger.error(f"Fuel lookup failed: {e}")
        return {"error": str(e)}
