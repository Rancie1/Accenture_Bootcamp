# n8n Multi-Agent Setup Guide

## Your Architecture

Based on your setup, you have **multiple specialized agents** in n8n:

1. **Fuel Agent** - Gets petrol station data (NSW Fuel API)
2. **Coles Agent** - Gets grocery store data and prices
3. **Maps Agent** - Calculates distances (filters stores within 5km radius)

## How It Works with FastAPI Backend

The FastAPI backend calls **ONE main n8n webhook** which then orchestrates your multiple agents internally.

```
FastAPI Backend
    ↓
    POST /webhook/grocery
    ↓
n8n Main Workflow (Orchestrator)
    ↓
    ├─→ Switch Node (routes to different agents)
    │   ├─→ Fuel Agent
    │   ├─→ Coles Agent
    │   └─→ Maps Agent
    ↓
Response back to FastAPI
```

## Setup Options

You have **two approaches** to structure this:

### Option 1: Single Orchestrator Webhook (RECOMMENDED)

**Best for:** Your current setup with a switch node

The FastAPI backend calls ONE webhook, and n8n handles routing internally.

#### n8n Workflow Structure:

```
1. Webhook Node (receives request from FastAPI)
   ↓
2. Switch Node (routes based on request type or data)
   ↓
   ├─→ Branch 1: Coles Agent
   │   ├─→ HTTP Request to Coles API
   │   ├─→ Maps Agent (filter by distance)
   │   └─→ Format response
   │
   ├─→ Branch 2: Fuel Agent
   │   ├─→ HTTP Request to NSW Fuel API
   │   ├─→ Maps Agent (filter by distance)
   │   └─→ Format response
   │
   └─→ Branch 3: Combined (both Coles + Fuel)
       ├─→ Call both agents
       ├─→ Maps Agent (filter all by distance)
       └─→ Merge and format response
   ↓
3. Respond to Webhook (send back to FastAPI)
```

#### FastAPI Configuration:

```bash
# .env file
N8N_GROCERY_WEBHOOK_URL=http://localhost:5678/webhook/grocery
```

The backend sends:

```json
{
  "grocery_list": ["Milk (1L)", "Bread (Loaf)"],
  "home_address": "123 Main St, Sydney NSW 2000"
}
```

Your n8n workflow:

1. Receives the request
2. Uses Switch node to determine which agents to call
3. Calls Coles Agent to get grocery prices
4. Calls Maps Agent to filter stores within 5km of home_address
5. Returns formatted response to FastAPI

---

### Option 2: Multiple Webhooks (Alternative)

**Best for:** If you want FastAPI to control the orchestration

Create separate webhooks for each agent, and FastAPI calls them individually.

#### n8n Workflow Structure:

You'd create **3 separate workflows**:

1. **Coles Workflow** - `/webhook/coles`
2. **Fuel Workflow** - `/webhook/fuel`
3. **Maps Workflow** - `/webhook/maps`

#### FastAPI Configuration:

```bash
# .env file
N8N_COLES_WEBHOOK_URL=http://localhost:5678/webhook/coles
N8N_FUEL_WEBHOOK_URL=http://localhost:5678/webhook/fuel
N8N_MAPS_WEBHOOK_URL=http://localhost:5678/webhook/maps
```

**However**, this would require modifying the FastAPI backend code to call multiple webhooks and merge results. **Not recommended** unless you need this level of control.

---

## Recommended Setup: Single Orchestrator

Here's how to set up your n8n workflow with the switch node:

### Step 1: Create Main Webhook

1. **Add Webhook Node**
   - Path: `grocery`
   - Method: POST
   - Response Mode: "When Last Node Finishes"

### Step 2: Add Switch Node

The switch node routes to different agents based on your logic.

**Example Switch Logic:**

```javascript
// In Switch node
const groceryList = $input.item.json.grocery_list;
const homeAddress = $input.item.json.home_address;

// Determine which agents to call
// For grocery optimization, we need Coles + Maps
return 0; // Route to Coles branch
```

### Step 3: Coles Agent Branch

```
Switch → Coles Branch
  ↓
1. HTTP Request Node - Call Coles API
   - URL: Your Coles API endpoint
   - Method: POST
   - Body: { "items": {{ $json.grocery_list }} }
  ↓
2. Function Node - Process Coles Response
   - Extract prices and store locations
  ↓
3. HTTP Request Node - Call Maps Agent
   - URL: http://localhost:5678/webhook/maps
   - Method: POST
   - Body: {
       "home_address": {{ $json.home_address }},
       "stores": {{ $json.stores }},
       "radius_km": 5
     }
  ↓
4. Function Node - Format Final Response
```

### Step 4: Maps Agent (Separate Workflow)

Create a separate workflow for the Maps agent:

```
1. Webhook Node
   - Path: maps
   - Method: POST
  ↓
2. Function Node - Calculate Distances
```

**Maps Agent Function Code:**

```javascript
// Extract input
const homeAddress = $input.item.json.home_address;
const stores = $input.item.json.stores;
const radiusKm = $input.item.json.radius_km || 5;

// Mock distance calculation (replace with real Google Maps API)
const filteredStores = stores.filter((store) => {
  // Calculate distance (simplified - use real API in production)
  const distance = Math.random() * 10; // Random distance for demo
  return distance <= radiusKm;
});

return {
  json: {
    filtered_stores: filteredStores,
    radius_km: radiusKm
  }
};
```

### Step 5: Format Response for FastAPI

The final node in your main workflow must return this exact format:

```json
{
  "optimal_cost": 15.5,
  "store_recommendations": ["Coles Bondi", "Coles Randwick"],
  "item_breakdown": [
    {
      "item_name": "Milk (1L)",
      "current_price": 1.5,
      "store_name": "Coles Bondi"
    },
    {
      "item_name": "Bread (Loaf)",
      "current_price": 3.0,
      "store_name": "Coles Randwick"
    }
  ]
}
```

---

## Complete Example: Grocery Optimization Flow

### 1. FastAPI sends request:

```json
POST http://localhost:5678/webhook/grocery
{
  "grocery_list": ["Milk (1L)", "Bread (Loaf)", "Eggs (Dozen)"],
  "home_address": "123 George St, Sydney NSW 2000"
}
```

### 2. n8n Main Workflow:

```
Webhook (receives request)
  ↓
Switch Node (route to Coles branch)
  ↓
HTTP Request → Coles API
  Response: [
    { "item": "Milk (1L)", "price": 1.50, "store": "Coles Bondi", "lat": -33.89, "lng": 151.27 },
    { "item": "Milk (1L)", "price": 1.45, "store": "Coles Randwick", "lat": -33.91, "lng": 151.24 },
    { "item": "Bread (Loaf)", "price": 3.00, "store": "Coles Bondi", "lat": -33.89, "lng": 151.27 }
  ]
  ↓
HTTP Request → Maps Agent
  Request: {
    "home_address": "123 George St, Sydney NSW 2000",
    "stores": [...],
    "radius_km": 5
  }
  Response: {
    "filtered_stores": [
      { "store": "Coles Bondi", "distance_km": 2.3 },
      { "store": "Coles Randwick", "distance_km": 4.1 }
    ]
  }
  ↓
Function Node (merge and format)
  ↓
Respond to Webhook
```

### 3. FastAPI receives response:

```json
{
  "optimal_cost": 5.95,
  "store_recommendations": ["Coles Randwick", "Coles Bondi"],
  "item_breakdown": [
    {
      "item_name": "Milk (1L)",
      "current_price": 1.45,
      "store_name": "Coles Randwick"
    },
    {
      "item_name": "Bread (Loaf)",
      "current_price": 3.0,
      "store_name": "Coles Bondi"
    },
    {
      "item_name": "Eggs (Dozen)",
      "current_price": 5.5,
      "store_name": "Coles Bondi"
    }
  ]
}
```

---

## Configuration Summary

### For Single Orchestrator (Recommended):

**Backend .env:**

```bash
N8N_GROCERY_WEBHOOK_URL=http://localhost:5678/webhook/grocery
```

**n8n Workflows:**

- Main workflow: `/webhook/grocery` (orchestrates everything)
- Maps agent: `/webhook/maps` (called internally by main workflow)
- Coles agent: Can be part of main workflow or separate
- Fuel agent: Can be part of main workflow or separate

### Key Points:

1. ✅ FastAPI calls **ONE webhook** (`/webhook/grocery`)
2. ✅ n8n main workflow uses **Switch node** to route to agents
3. ✅ Agents can be **sub-workflows** or **HTTP Request nodes** to other n8n workflows
4. ✅ Maps agent filters stores within **5km radius**
5. ✅ Final response must match FastAPI's expected format

---

## Testing Your Setup

1. **Start n8n:**

   ```bash
   n8n start
   ```

2. **Activate all workflows** in n8n

3. **Test Maps Agent directly:**

   ```bash
   curl -X POST http://localhost:5678/webhook/maps \
     -H "Content-Type: application/json" \
     -d '{
       "home_address": "123 George St, Sydney NSW 2000",
       "stores": [
         {"name": "Coles Bondi", "lat": -33.89, "lng": 151.27},
         {"name": "Coles Randwick", "lat": -33.91, "lng": 151.24}
       ],
       "radius_km": 5
     }'
   ```

4. **Test Main Workflow via FastAPI:**

   ```bash
   # Start FastAPI
   cd Backend
   uvicorn main:app --reload

   # Create user
   curl -X POST http://localhost:8000/onboard \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "weekly_budget": 200,
       "home_address": "123 George St, Sydney NSW 2000"
     }'

   # Test grocery optimization
   curl -X POST http://localhost:8000/optimise/groceries \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "YOUR_USER_ID",
       "grocery_list": ["Milk (1L)", "Bread (Loaf)"]
     }'
   ```

---

## Troubleshooting

### Issue: Switch node not routing correctly

**Solution:** Check your switch conditions. Make sure the output index matches your branch connections.

### Issue: Maps agent not filtering correctly

**Solution:** Verify the Maps agent is receiving correct lat/lng coordinates and home_address.

### Issue: Response format doesn't match

**Solution:** Add a final Function node before "Respond to Webhook" to ensure the exact format FastAPI expects.

---

## Next Steps

1. ✅ Set up main orchestrator workflow with Switch node
2. ✅ Create Maps agent workflow
3. ✅ Connect Coles agent to main workflow
4. ✅ Connect Fuel agent to main workflow (for transport endpoint)
5. ✅ Test end-to-end flow
6. 🚀 Add real Google Maps API for distance calculation
7. 🚀 Add real Coles API integration
8. 🚀 Add NSW Fuel API integration

## Questions?

- Does your Switch node route based on request type or always call all agents?
- Are your agents separate n8n workflows or nodes within the main workflow?
- Do you need help with the Switch node configuration?

Let me know and I can provide more specific guidance!
