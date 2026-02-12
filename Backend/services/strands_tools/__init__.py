"""
Strands Agent tools for n8n agent integration.

Each tool wraps an individual n8n agent webhook, allowing the
Strands orchestrator agent to call them as needed.
"""

from .fuel_lookup import lookup_fuel_prices
from .coles_lookup import lookup_coles_prices
from .maps_search import search_location
from .list_manager import manage_list

__all__ = [
    "lookup_fuel_prices",
    "lookup_coles_prices",
    "search_location",
    "manage_list",
]
