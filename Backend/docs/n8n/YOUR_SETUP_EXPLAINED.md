# Your Actual n8n Setup - Explained

## What You Have

You have **ONE webhook** in n8n that:

1. Receives ANY message (chat or API request)
2. Analyzes the message
3. Routes to the correct agent(s): Coles, Fuel, or Transit/Maps
4. Combines outputs from all agents
5. Returns the combined response

```
┌─────────────────────────────────────────────────────────────┐
│                    Your n8n Workflow                         │
│                                                              │
│  ┌────────────────────────────────────────────────┐        │
│  │  ONE Webhook                                    │        │
│  │  Receives: Chat messages OR API requests       │        │
│  └──────────────────┬─────────────────────────────┘        │
│                     │                                        │
│                     ▼                                        │
│  ┌────────────────────────────────────────────────┐        │
│  │  Analyze/Parse Input                            │        │
│  │  - Is it about groceries? → Coles              │        │
│  │  - Is it about fuel? → Fuel                    │        │
│  │  - Need locations? → Maps/Transit              │        │
│  └──────────────────┬─────────────────────────────┘        │
│                     │                                        │
│                     ▼                                        │
│  ┌────────────────────────────────────────────────┐        │
│  │  Switch/Router Node                             │        │
│  │  Routes to appropriate agent(s)                 │        │
│  └──────────────────┬─────────────────────────────┘        │
│                     │                                        │
│         ┌───────────┼───────────┐                          │
│         │           │           │                          │
│         ▼           ▼           ▼                          │
│  ┌──────────┐ ┌─────────┐ ┌──────────┐                   │
│  │  Coles   │ │  Fuel   │ │  Maps/   │                   │
│  │  Agent   │ │  Agent  │ │  Transit │                   │
│  │          │ │         │ │  Agent   │                   │
│  │ Gets     │ │ Gets    │ │ Filters  │                   │
│  │ grocery  │ │ petrol  │ │ within   │                   │
│  │ prices   │ │ prices  │ │ 5km      │                   │
│  └────┬─────┘ └────┬────┘ └────┬─────┘                   │
│       │            │           │                          │
│       └────────────┼───────────┘                          │
│                    │                                        │
│                    ▼                                        │
│  ┌────────────────────────────────────────────────┐        │
│  │  Combine Outputs                                │        │
│  │  Merge results from all agents                  │        │
│  └──────────────────┬─────────────────────────────┘        │
│                     │                                        │
│                     ▼                                        │
│  ┌────────────────────────────────────────────────┐        │
│  │  Return Response                                 │        │
│  └──────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## How FastAPI Backend Connects

The FastAPI backend should send requests to **YOUR ONE WEBHOOK**.

### What the Backend Sends Now:

```json
POST http://localhost:5678/webhook/chat
{
  "message": "Find grocery prices for Milk (1L), Bread (Loaf) near 123 George St, Sydney NSW 2000",
  "grocery_list": ["Milk (1L)", "Bread (Loaf)"],
  "home_address": "123 George St, Sydney NSW 2000",
  "type": "grocery_optimization"
}
```

### Why This Format?

1. **`message`** - Your n8n can read this like a chat message
2. **`grocery_list`** - Structured data for easy parsing
3. **`home_address`** - For the Maps agent to filter by 5km
4. **`type`** - Helps your switch/router know what to do

## Your n8n Workflow Should:

### 1. Receive the Request

```javascript
// In your webhook node
const input = $input.item.json;

// You can use either:
const message = input.message; // "Find grocery prices for..."
// OR
const groceryList = input.grocery_list; // ["Milk (1L)", "Bread (Loaf)"]
const homeAddress = input.home_address; // "123 George St, Sydney"
const type = input.type; // "grocery_optimization"
```

### 2. Route to Agents

```javascript
// In your switch/router node
if (
  type === "grocery_optimization" ||
  message.includes("grocery") ||
  message.includes("prices")
) {
  // Route to Coles agent
  return 0; // Branch 0: Coles
} else if (
  type === "fuel" ||
  message.includes("fuel") ||
  message.includes("petrol")
) {
  // Route to Fuel agent
  return 1; // Branch 1: Fuel
}
// etc.
```

### 3. Call Coles Agent

Your Coles agent should:

- Get prices for items in `grocery_list`
- Get store locations (lat/lng)
- Pass to Maps agent

### 4. Call Maps Agent

Your Maps agent should:

- Receive `home_address` and store locations
- Calculate distances
- Filter stores where distance ≤ 5km
- Return filtered stores

### 5. Combine and Return

```javascript
// Final node before responding
return {
  json: {
    optimal_cost: 15.5,
    store_recommendations: ["Coles Bondi", "Coles Randwick"],
    item_breakdown: [
      {
        item_name: "Milk (1L)",
        current_price: 1.5,
        store_name: "Coles Bondi"
      },
      {
        item_name: "Bread (Loaf)",
        current_price: 3.0,
        store_name: "Coles Randwick"
      }
    ]
  }
};
```

## Configuration

### Backend .env File:

```bash
# Your ONE webhook that handles everything
N8N_MAIN_WEBHOOK_URL=http://localhost:5678/webhook/chat

# Replace "chat" with whatever your webhook path is
# For example, if your webhook is at /webhook/assistant:
# N8N_MAIN_WEBHOOK_URL=http://localhost:5678/webhook/assistant
```

### Find Your Webhook Path:

1. Open your n8n workflow
2. Click on the Webhook node
3. Look at the "Path" field
4. Your full URL is: `http://localhost:5678/webhook/{PATH}`

Example:

- If Path = `chat` → URL = `http://localhost:5678/webhook/chat`
- If Path = `assistant` → URL = `http://localhost:5678/webhook/assistant`
- If Path = `main` → URL = `http://localhost:5678/webhook/main`

## Why One Webhook for 3 Agents?

Think of it like a restaurant:

- **One entrance** (webhook) for all customers
- **One host** (switch/router) who directs you to the right section
- **Multiple sections** (agents):
  - Coles section (grocery prices)
  - Fuel section (petrol prices)
  - Maps section (location filtering)
- **One kitchen** (combines outputs) that prepares your order
- **One exit** (response) where you get your food

The FastAPI backend is like a customer calling ahead to make a reservation. They call **one phone number** (webhook), and the restaurant handles routing them to the right section internally.

## Testing

### 1. Test Your n8n Webhook Directly:

```bash
# Test with a chat message
curl -X POST http://localhost:5678/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Find grocery prices for Milk near Sydney"
  }'

# Test with structured data (what FastAPI sends)
curl -X POST http://localhost:5678/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Find grocery prices for Milk (1L), Bread (Loaf) near 123 George St, Sydney NSW 2000",
    "grocery_list": ["Milk (1L)", "Bread (Loaf)"],
    "home_address": "123 George St, Sydney NSW 2000",
    "type": "grocery_optimization"
  }'
```

### 2. Test via FastAPI:

```bash
# Start FastAPI
cd Backend
uvicorn main:app --reload

# Create a user
curl -X POST http://localhost:8000/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "weekly_budget": 200,
    "home_address": "123 George St, Sydney NSW 2000"
  }'

# Test grocery optimization (calls your n8n webhook)
curl -X POST http://localhost:8000/optimise/groceries \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "YOUR_USER_ID",
    "grocery_list": ["Milk (1L)", "Bread (Loaf)"]
  }'
```

## Summary

✅ **You have ONE webhook** in n8n  
✅ **FastAPI calls that ONE webhook**  
✅ **n8n routes to 3 agents internally** (Coles, Fuel, Maps)  
✅ **Maps agent filters within 5km**  
✅ **All outputs are combined** before returning to FastAPI

The key is: **FastAPI doesn't need to know about your 3 agents**. It just calls one webhook, and n8n handles everything internally!
