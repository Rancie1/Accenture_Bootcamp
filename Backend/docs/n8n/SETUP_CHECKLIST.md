# Setup Checklist - Connect FastAPI to Your n8n

## Step 1: Find Your n8n Webhook URL

1. Open your n8n workflow
2. Click on your Webhook node (the one that receives messages)
3. Look at the **Path** field
4. Note it down (e.g., `chat`, `assistant`, `main`, etc.)

Your webhook URL is: `http://localhost:5678/webhook/{YOUR_PATH}`

Example:

- If Path = `chat` → `http://localhost:5678/webhook/chat`
- If Path = `assistant` → `http://localhost:5678/webhook/assistant`

---

## Step 2: Configure FastAPI Backend

1. Go to `Backend/` folder
2. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and set your webhook URL:

   ```bash
   N8N_MAIN_WEBHOOK_URL=http://localhost:5678/webhook/YOUR_PATH
   ```

   Replace `YOUR_PATH` with the path from Step 1.

---

## Step 3: Update Your n8n Workflow (If Needed)

Your n8n webhook should be able to handle this JSON format:

```json
{
  "message": "Find grocery prices for Milk (1L), Bread (Loaf) near 123 George St, Sydney NSW 2000",
  "grocery_list": ["Milk (1L)", "Bread (Loaf)"],
  "home_address": "123 George St, Sydney NSW 2000",
  "type": "grocery_optimization"
}
```

### Option A: Your n8n Already Handles This ✅

If your webhook can already parse messages and route to agents, you're done! Skip to Step 4.

### Option B: Need to Update n8n

Add a node after your webhook to extract the data:

```javascript
// In a Function node after webhook
const input = $input.item.json;

// Extract data
const message = input.message || "";
const groceryList = input.grocery_list || [];
const homeAddress = input.home_address || "";
const type = input.type || "";

// Pass to your switch/router
return {
  json: {
    message,
    groceryList,
    homeAddress,
    type
  }
};
```

---

## Step 4: Ensure n8n Returns Correct Format

The last node in your n8n workflow (before responding) must return:

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

**Required fields:**

- `optimal_cost` (number)
- `store_recommendations` (array of strings)
- `item_breakdown` (array of objects with `item_name`, `current_price`, `store_name`)

---

## Step 5: Test the Connection

### 5.1 Start n8n

```bash
n8n start
```

Make sure your workflow is **activated** (toggle in top-right of n8n).

### 5.2 Start FastAPI

```bash
cd Backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload
```

### 5.3 Create a Test User

```bash
curl -X POST http://localhost:8000/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "weekly_budget": 200,
    "home_address": "123 George St, Sydney NSW 2000"
  }'
```

**Copy the `user_id` from the response!**

### 5.4 Test Grocery Optimization

```bash
curl -X POST http://localhost:8000/optimise/groceries \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "PASTE_USER_ID_HERE",
    "grocery_list": ["Milk (1L)", "Bread (Loaf)"]
  }'
```

---

## Troubleshooting

### ❌ Error: "n8n service unavailable"

**Check:**

1. Is n8n running? (`n8n start`)
2. Is your workflow activated? (toggle in n8n)
3. Is the webhook URL correct in `.env`?
4. Can you access the webhook directly?
   ```bash
   curl -X POST http://localhost:5678/webhook/YOUR_PATH \
     -H "Content-Type: application/json" \
     -d '{"message": "test"}'
   ```

### ❌ Error: "User not found"

**Solution:** Make sure you created a user first (Step 5.3) and copied the correct `user_id`.

### ❌ n8n Returns Wrong Format

**Check:** The last node in your n8n workflow before "Respond to Webhook" should format the response correctly (see Step 4).

### ❌ Agents Not Being Called

**Check:** Your switch/router node in n8n. Make sure it's routing based on the `type` field or `message` content.

---

## Quick Reference

### What FastAPI Sends:

```json
{
  "message": "Find grocery prices for Milk (1L), Bread (Loaf) near 123 George St, Sydney NSW 2000",
  "grocery_list": ["Milk (1L)", "Bread (Loaf)"],
  "home_address": "123 George St, Sydney NSW 2000",
  "type": "grocery_optimization"
}
```

### What n8n Should Return:

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

### Configuration:

```bash
# Backend/.env
N8N_MAIN_WEBHOOK_URL=http://localhost:5678/webhook/YOUR_PATH
```

---

## Success! ✅

If you got a response with grocery prices and store recommendations, you're all set!

The FastAPI backend is now connected to your n8n multi-agent workflow.

---

## Next Steps

1. ✅ Connect real Coles API to your Coles agent
2. ✅ Add Google Maps API to Maps agent for accurate distances
3. ✅ Test the 5km radius filtering
4. ✅ Connect NSW Fuel API to Fuel agent
5. 🚀 Build the frontend to consume the API

Need help? Check `YOUR_ACTUAL_SETUP.md` for detailed explanation of your architecture.
