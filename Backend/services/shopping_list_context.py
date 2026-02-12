"""
Shared mutable state for the current request's shopping list.

The chat router sets the list before invoking the Strands agent,
and the manage_list tool reads/writes it during tool execution.
After the agent finishes, the router reads the final state and
returns it to the frontend.

Uses a module-level list with a threading.Lock so that parallel
tool calls (the Strands agent can dispatch tools concurrently)
serialise their read-modify-write cycles correctly.
"""

import threading
from copy import deepcopy

# Expose the lock so manage_list can hold it across get→modify→set
lock = threading.Lock()
_current_list: list[dict] = []


def get_list() -> list[dict]:
    """Return a deep copy of the current shopping list."""
    return deepcopy(_current_list)


def set_list(items: list[dict]) -> None:
    """Replace the current shopping list."""
    global _current_list
    _current_list = deepcopy(items)


def reset_list() -> None:
    """Clear the shopping list."""
    global _current_list
    _current_list = []
