# n8n Architecture Diagram

## Current Setup: Single Orchestrator with Multiple Agents

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FastAPI Backend                              │
│                                                                      │
│  POST /optimise/groceries                                           │
│  {                                                                   │
│    "user_id": "123",                                                │
│    "grocery_list": ["Milk", "Bread"],                              │
│    "home_address": "123 George St, Sydney"                         │
│  }                                                                   │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         │ HTTP POST
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    n8n Main Workflow                                 │
│                 (Orchestrator Webhook)                               │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  1. Webhook Node                                            │   │
│  │     Path: /webhook/grocery                                  │   │
│  │     Receives: grocery_list, home_address                    │   │
│  └──────────────────────┬─────────────────────────────────────┘   │
│                         │                                            │
│                         ▼                                            │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  2. Switch Node                                             │   │
│  │     Routes based on request type or always to Coles         │   │
│  └──────────────────────┬─────────────────────────────────────┘   │
│                         │                                            │
│         ┌───────────────┼───────────────┐                          │
│         │               │               │                          │
│         ▼               ▼               ▼                          │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐                      │
│  │  Coles   │   │   Fuel   │   │ Combined │                      │
│  │  Branch  │   │  Branch  │   │  Branch  │                      │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘                      │
│       │              │              │                              │
└───────┼──────────────┼──────────────┼──────────────────────────────┘
        │              │              │
        │              │              │
        ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Agent Workflows                                 │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  Coles Agent                                              │     │
│  │  ┌────────────────────────────────────────────────┐      │     │
│  │  │ 1. HTTP Request to Coles API                   │      │     │
│  │  │    Get prices for grocery items                │      │     │
│  │  └────────────────┬───────────────────────────────┘      │     │
│  │                   │                                       │     │
│  │                   ▼                                       │     │
│  │  ┌────────────────────────────────────────────────┐      │     │
│  │  │ 2. Extract store locations (lat/lng)           │      │     │
│  │  └────────────────┬───────────────────────────────┘      │     │
│  │                   │                                       │     │
│  │                   ▼                                       │     │
│  │  ┌────────────────────────────────────────────────┐      │     │
│  │  │ 3. Call Maps Agent                              │      │     │
│  │  │    Filter stores within 5km radius             │      │     │
│  │  └────────────────┬───────────────────────────────┘      │     │
│  │                   │                                       │     │
│  │                   ▼                                       │     │
│  │  ┌────────────────────────────────────────────────┐      │     │
│  │  │ 4. Format response for FastAPI                 │      │     │
│  │  └────────────────────────────────────────────────┘      │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  Maps Agent (Separate Workflow)                          │     │
│  │  Webhook: /webhook/maps                                  │     │
│  │  ┌────────────────────────────────────────────────┐      │     │
│  │  │ 1. Receive: home_address, stores[], radius_km  │      │     │
│  │  └────────────────┬───────────────────────────────┘      │     │
│  │                   │                                       │     │
│  │                   ▼                                       │     │
│  │  ┌────────────────────────────────────────────────┐      │     │
│  │  │ 2. Calculate distance for each store           │      │     │
│  │  │    (Google Maps API or similar)                │      │     │
│  │  └────────────────┬───────────────────────────────┘      │     │
│  │                   │                                       │     │
│  │                   ▼                                       │     │
│  │  ┌────────────────────────────────────────────────┐      │     │
│  │  │ 3. Filter: distance <= 5km                     │      │     │
│  │  └────────────────┬───────────────────────────────┘      │     │
│  │                   │                                       │     │
│  │                   ▼                                       │     │
│  │  ┌────────────────────────────────────────────────┐      │     │
│  │  │ 4. Return filtered stores                      │      │     │
│  │  └────────────────────────────────────────────────┘      │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  Fuel Agent                                               │     │
│  │  ┌────────────────────────────────────────────────┐      │     │
│  │  │ 1. HTTP Request to NSW Fuel API                │      │     │
│  │  └────────────────┬───────────────────────────────┘      │     │
│  │                   │                                       │     │
│  │                   ▼                                       │     │
│  │  ┌────────────────────────────────────────────────┐      │     │
│  │  │ 2. Call Maps Agent (filter by 5km)             │      │     │
│  │  └────────────────┬───────────────────────────────┘      │     │
│  │                   │                                       │     │
│  │                   ▼                                       │     │
│  │  ┌────────────────────────────────────────────────┐      │     │
│  │  │ 3. Format response                              │      │     │
│  │  └────────────────────────────────────────────────┘      │     │
│  └──────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
                         │
                         │ Response
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                                   │
│                                                                      │
│  Response:                                                           │
│  {                                                                   │
│    "optimal_cost": 15.50,                                           │
│    "store_recommendations": ["Coles Bondi", "Coles Randwick"],     │
│    "item_breakdown": [                                              │
│      {                                                               │
│        "item_name": "Milk (1L)",                                    │
│        "current_price": 1.50,                                       │
│        "store_name": "Coles Bondi"                                  │
│      }                                                               │
│    ]                                                                 │
│  }                                                                   │
│                                                                      │
│  Backend adds price predictions based on historical data            │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Points

1. **One Webhook URL**: FastAPI only needs `N8N_GROCERY_WEBHOOK_URL`
2. **Switch Node**: Routes to different agent branches
3. **Maps Agent**: Separate workflow called by other agents
4. **5km Radius**: Maps agent filters stores within 5km of home_address
5. **Response Format**: Must match FastAPI's expected structure

## Configuration

```bash
# Backend/.env
N8N_GROCERY_WEBHOOK_URL=http://localhost:5678/webhook/grocery
```

## Workflow URLs

- Main Orchestrator: `http://localhost:5678/webhook/grocery` (called by FastAPI)
- Maps Agent: `http://localhost:5678/webhook/maps` (called by Coles/Fuel agents)
- Coles Agent: Part of main workflow or separate
- Fuel Agent: Part of main workflow or separate
