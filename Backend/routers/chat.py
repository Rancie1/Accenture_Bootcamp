"""
Chat router for Strands Agent conversational interface.

Provides the POST /chat endpoint that accepts user messages and
returns AI-generated responses using the Strands orchestrator agent.

Agent instances are cached per session so the agent retains full
conversation memory (including tool calls) across multiple turns.
"""

import re
import uuid
import time
import logging
from typing import Dict

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from services.agent import create_agent
from services.shopping_list_context import set_list, get_list, reset_list, lock as list_lock

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])

# ── Session store ────────────────────────────────────────────────────
# Maps sessionId -> {"agent": Agent, "last_used": timestamp}
_sessions: Dict[str, dict] = {}
SESSION_TTL_SECONDS = 30 * 60  # 30 minutes of inactivity before eviction


def _cleanup_sessions():
    """Remove sessions that have been idle longer than SESSION_TTL_SECONDS."""
    now = time.time()
    expired = [
        sid for sid, data in _sessions.items()
        if now - data["last_used"] > SESSION_TTL_SECONDS
    ]
    for sid in expired:
        logger.info(f"Evicting idle session: {sid}")
        del _sessions[sid]


def _get_or_create_agent(session_id: str | None):
    """Return an existing agent for the session, or create a new one."""
    _cleanup_sessions()

    if session_id and session_id in _sessions:
        logger.info(f"Reusing agent for session: {session_id}")
        _sessions[session_id]["last_used"] = time.time()
        return session_id, _sessions[session_id]["agent"]

    # New session
    new_id = session_id or str(uuid.uuid4())
    agent = create_agent()
    _sessions[new_id] = {"agent": agent, "last_used": time.time()}
    logger.info(f"Created new agent for session: {new_id}")
    return new_id, agent


# ── Request / Response models ────────────────────────────────────────

class ChatRequest(BaseModel):
    """Request schema for chat messages."""
    shoppingList: list[dict] = []
    message: str
    audioData: str | None = None
    sessionId: str | None = None  # Optional: reuse conversation
    homeAddress: str | None = None  # User's home address from registration


class ChatResponse(BaseModel):
    """Response schema for chat replies."""
    reply: str
    updatedList: list[dict] = []
    sessionId: str  # Return so frontend can send it back next turn


# ── Endpoint ─────────────────────────────────────────────────────────

@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a message to the Koko AI assistant.

    The Strands agent will reason about the message and decide which
    tools to call (fuel lookup, Coles prices, Maps, or list management).

    Passing the returned ``sessionId`` on subsequent requests keeps the
    conversation context alive so the agent remembers earlier messages.

    Args:
        request: Contains message, current shoppingList, optional audioData,
                 and optional sessionId for conversation continuity.

    Returns:
        ChatResponse with the agent's reply, updated shopping list,
        and the sessionId for follow-up requests.

    Raises:
        HTTPException 500: If the agent encounters an error
    """
    try:
        session_id, agent = _get_or_create_agent(request.sessionId)

        # Build context including the current shopping list and home address
        context_parts = []
        if request.homeAddress:
            context_parts.append(
                f"[USER_HOME_ADDRESS={request.homeAddress}] — "
                f"Whenever you call a tool that needs the user's location or "
                f"start address, pass the exact string \"{request.homeAddress}\"."
            )
        if request.shoppingList:
            context_parts.append(
                f"The user's current shopping list: {request.shoppingList}"
            )
        context_parts.append(f"User message: {request.message}")

        context = "\n\n".join(context_parts)

        logger.info(f"Processing chat message (session={session_id}): {request.message[:100]}...")
        logger.info(f"Home address received: '{request.homeAddress}'")

        # Seed the shared shopping list so manage_list can read/write it
        with list_lock:
            set_list(request.shoppingList)
        logger.info(f"Seeded shopping list with {len(request.shoppingList)} items")

        try:
            # Invoke the agent — it keeps its own message history internally
            response = agent(context)
        finally:
            # Read back the (possibly updated) shopping list
            with list_lock:
                final_list = get_list()
                reset_list()
            logger.info(f"Final shopping list has {len(final_list)} items: {[i.get('name') for i in final_list]}")

        # Strip any <thinking>...</thinking> tags the model may leak
        reply_text = re.sub(r"<thinking>.*?</thinking>\s*", "", str(response), flags=re.DOTALL).strip()

        return ChatResponse(
            reply=reply_text,
            updatedList=final_list,
            sessionId=session_id,
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
