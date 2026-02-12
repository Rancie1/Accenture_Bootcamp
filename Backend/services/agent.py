"""
Strands Agent definition for the Koko shopping assistant.

This module creates the orchestrator agent that replaces the n8n Switch-node
orchestrator. The agent uses Amazon Bedrock for LLM reasoning and decides
which n8n agent tools to call based on the user's message.
"""

import os
import logging

from strands import Agent
from strands.models.bedrock import BedrockModel

from services.strands_tools.fuel_lookup import lookup_fuel_prices
from services.strands_tools.coles_lookup import lookup_coles_prices
from services.strands_tools.maps_search import get_directions
from services.strands_tools.list_manager import manage_list

logger = logging.getLogger(__name__)


def _get_model() -> BedrockModel:
    """Lazy-create the Bedrock model so that env vars from .env are loaded first."""
    region = os.getenv("AWS_REGION", "ap-southeast-2")
    # Default to Amazon Nova Lite (no use-case form required).
    # Switch to "anthropic.claude-3-5-sonnet-20241022-v2:0" once Anthropic access is approved.
    model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")

    logger.info(f"Initialising Bedrock model: {model_id} in {region}")
    return BedrockModel(
        model_id=model_id,
        region_name=region,
    )

SYSTEM_PROMPT = """You are Koko, a friendly koala mascot that helps university students save money on groceries and fuel in Australia.

You have access to these tools:
- lookup_fuel_prices: Find current fuel/petrol prices near a location using the NSW Fuel API
- lookup_coles_prices: Find current Coles grocery prices and nearby Coles stores (pass location if the user provides one)
- get_directions: Get directions, travel time and distance between two locations (supports DRIVE and TRANSIT/bus)
- manage_list: Add, remove, or update items on the user's shopping list

When a user asks about prices at a location:
1. Pass the location name directly to the relevant price tool(s) (e.g. lookup_coles_prices or lookup_fuel_prices)
2. If the user wants directions to a store or station, use get_directions with their start location and the destination
3. Summarise the results in a friendly, concise way with savings tips

When a user wants to modify their shopping list:
1. Use manage_list to add, remove, or update items
2. Confirm what was changed

Always be encouraging about their savings goals. Use a conversational, friendly tone.
Keep responses concise and helpful. Use Australian English spelling (e.g. "optimise", "litre").
If you don't have enough information to use a tool, ask the user for clarification."""


def create_agent() -> Agent:
    """
    Create and return a new Strands Agent instance with all tools.

    Returns:
        Agent: Configured Strands Agent ready to process messages.
    """
    model = _get_model()

    return Agent(
        model=model,
        system_prompt=SYSTEM_PROMPT,
        tools=[lookup_fuel_prices, lookup_coles_prices, get_directions, manage_list],
    )
