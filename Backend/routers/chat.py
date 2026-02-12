"""
Chat router for Strands Agent conversational interface.

Provides the POST /chat endpoint that accepts user messages and
returns AI-generated responses using the Strands orchestrator agent.
"""

import re
import logging

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from services.agent import create_agent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    """Request schema for chat messages."""
    shoppingList: list[dict] = []
    message: str
    audioData: str | None = None


class ChatResponse(BaseModel):
    """Response schema for chat replies."""
    reply: str
    updatedList: list[dict] = []


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a message to the Koko AI assistant.

    The Strands agent will reason about the message and decide which
    tools to call (fuel lookup, Coles prices, Maps, or list management).

    Args:
        request: Contains message, current shoppingList, and optional audioData

    Returns:
        ChatResponse with the agent's reply and optionally updated shopping list

    Raises:
        HTTPException 500: If the agent encounters an error
    """
    try:
        agent = create_agent()

        # Build context including the current shopping list
        context_parts = []
        if request.shoppingList:
            context_parts.append(
                f"The user's current shopping list: {request.shoppingList}"
            )
        context_parts.append(f"User message: {request.message}")

        context = "\n\n".join(context_parts)

        logger.info(f"Processing chat message: {request.message[:100]}...")

        # Invoke the agent
        response = agent(context)

        # Strip any <thinking>...</thinking> tags the model may leak
        reply_text = re.sub(r"<thinking>.*?</thinking>\s*", "", str(response), flags=re.DOTALL).strip()

        return ChatResponse(
            reply=reply_text,
            updatedList=request.shoppingList,
        )

    except Exception as e:
        logger.error(f"Chat agent error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error_code": "AGENT_ERROR",
                "message": "The AI assistant encountered an error. Please try again.",
            }
        )
