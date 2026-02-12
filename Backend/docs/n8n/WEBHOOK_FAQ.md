# Answer: Do I Add a Webhook to Each Agent?

## Short Answer

**No, you don't need to add a webhook to each agent in the FastAPI backend.**

You only need **ONE webhook URL** configured in FastAPI that points to your main n8n orchestrator workflow.

## Why?

The FastAPI backend is designed to call **one n8n endpoint** which then handles all the internal routing to your different agents (Fuel, Coles, Maps).

## Current Backend Setup

```python
# Backend/services/grocery_service.py (lines 48-51)

n8n_webhook_url = os.getenv(
    "N8N_GROCERY_WEBHOOK_URL",
    "http://localhost:5678/webhook/grocery"  # Default
)
```

The backend sends a single request to this URL with:

```json
{
  "grocery_list": ["Milk (1L)", "Bread (Loaf)"],
  "home_address": "123 George St, Sydney NSW 2000"
}
```

## Your n8n Setup

Your n8n workflow should look like this:

```
FastAPI Backend
    ↓
    ONE webhook: /webhook/grocery
    ↓
n8n Main Workflow
    ↓
    Switch Node (your existing switch)
    ↓
    ├─→ Fuel Agent
    ├─→ Coles Agent
    └─→ Maps Agent (filters within 5km)
    ↓
Response back to FastAPI
```

## What You Need to Do

### 1. Configure Backend

Create a `.env` file in the Backend directory:

```bash
# Backend/.env
N8N_GROCERY_WEBHOOK_URL=http://localhost:5678/webhook/grocery
```

That's it! Just **one URL**.

### 2. Configure n8n

Your n8n main workflow should:

1. **Have a Webhook node** at the start
   - Path: `grocery`
   - This receives requests from FastAPI

2. **Use your existing Switch node** to route to agents
   - Branch 1: Coles Agent
   - Branch 2: Fuel Agent
   - Branch 3: Combined

3. **Each agent can call the Maps Agent** internally
   - Maps Agent can be a separate workflow at `/webhook/maps`
   - Or part of the same workflow

4. **Return the response** in the format FastAPI expects:
   ```json
   {
     "optimal_cost": 15.5,
     "store_recommendations": ["Coles Bondi"],
     "item_breakdown": [
       {
         "item_name": "Milk (1L)",
         "current_price": 1.5,
         "store_name": "Coles Bondi"
       }
     ]
   }
   ```

## Maps Agent: Within 5km Radius

Your Maps Agent should:

1. Receive store locations from Coles/Fuel agents
2. Calculate distance from `home_address` to each store
3. Filter stores where `distance <= 5km`
4. Return only the filtered stores

The Maps Agent can be:

- **Option A**: A separate n8n workflow that Coles/Fuel agents call via HTTP Request
- **Option B**: Nodes within the same workflow after Coles/Fuel processing

## Example Flow

```
1. FastAPI sends:
   POST http://localhost:5678/webhook/grocery
   {
     "grocery_list": ["Milk (1L)"],
     "home_address": "123 George St, Sydney"
   }

2. n8n Main Workflow:
   - Webhook receives request
   - Switch routes to Coles branch
   - Coles Agent gets prices from Coles API
   - Maps Agent filters stores within 5km
   - Response formatted and sent back

3. FastAPI receives:
   {
     "optimal_cost": 1.50,
     "store_recommendations": ["Coles Bondi"],
     "item_breakdown": [...]
   }
```

## Summary

✅ **You only need ONE webhook URL** in FastAPI  
✅ **Your n8n Switch node handles routing** to different agents  
✅ **Maps Agent filters within 5km** (can be separate workflow or part of main)  
✅ **No changes needed to FastAPI backend code**

## Need Help?

See these guides:

- `N8N_MULTI_AGENT_SETUP.md` - Detailed setup instructions
- `n8n_architecture_diagram.md` - Visual architecture
- `N8N_SETUP_GUIDE.md` - Basic n8n setup

The backend is already set up correctly for your multi-agent architecture! 🎉
