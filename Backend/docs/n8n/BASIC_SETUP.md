# n8n Setup Guide for Grocery Optimization

This guide explains how to set up n8n workflows to handle grocery optimization requests from the FastAPI backend.

## Overview

The backend sends HTTP POST requests to n8n webhooks, which process the data and return optimization results. You need to create n8n workflows that:

1. Receive grocery lists and home addresses
2. Process optimization logic (find stores, calculate costs, etc.)
3. Return structured JSON responses

## Prerequisites

- n8n installed (local or cloud)
- Access to n8n workflow editor
- Basic understanding of n8n webhooks

## Installation Options

### Option 1: n8n Cloud (Easiest)

1. Sign up at https://n8n.io/
2. Create a new workflow
3. Your webhook URL will be: `https://your-instance.app.n8n.cloud/webhook/grocery`

### Option 2: Local n8n (Development)

```bash
# Install n8n globally
npm install n8n -g

# Start n8n
n8n start

# Access at http://localhost:5678
```

## Step-by-Step Setup

### Step 1: Create the Grocery Optimization Workflow

1. **Open n8n** (http://localhost:5678 or your cloud instance)

2. **Create a new workflow** called "Grocery Optimization"

3. **Add a Webhook node** (this receives requests from FastAPI):
   - Click the "+" button
   - Search for "Webhook"
   - Configure:
     - **HTTP Method**: POST
     - **Path**: `grocery` (or `webhook/grocery`)
     - **Response Mode**: "When Last Node Finishes"
     - **Response Data**: "First Entry JSON"

4. **Test the webhook**:
   - Click "Listen for Test Event" in the webhook node
   - Copy the webhook URL (e.g., `http://localhost:5678/webhook/grocery`)
   - You'll use this URL in your `.env` file

### Step 2: Build the Workflow Logic

Add nodes to process the grocery optimization. Here's a simple example:

#### Node 2: Function Node - Parse Input

```javascript
// Extract data from the webhook
const groceryList = $input.item.json.grocery_list;
const homeAddress = $input.item.json.home_address;

// Example: Simple optimization logic
// In production, you'd call external APIs, databases, etc.
const items = groceryList.map((itemName) => ({
  item_name: itemName,
  current_price: Math.random() * 10 + 1, // Random price for demo
  store_name: ["Coles", "Woolworths", "Aldi"][Math.floor(Math.random() * 3)]
}));

const optimalCost = items.reduce((sum, item) => sum + item.current_price, 0);

return {
  json: {
    optimal_cost: Math.round(optimalCost * 100) / 100,
    store_recommendations: ["Coles", "Woolworths"],
    item_breakdown: items
  }
};
```

#### Node 3: Respond to Webhook

- Add a "Respond to Webhook" node
- Connect it to the Function node
- This sends the response back to FastAPI

### Step 3: Expected Request Format

The FastAPI backend sends this JSON structure:

```json
{
  "grocery_list": ["Milk (1L)", "Bread (Loaf)", "Eggs (Dozen)"],
  "home_address": "123 Main St, Sydney NSW 2000"
}
```

### Step 4: Required Response Format

Your n8n workflow MUST return this exact structure:

```json
{
  "optimal_cost": 15.5,
  "store_recommendations": ["Coles", "Woolworths"],
  "item_breakdown": [
    {
      "item_name": "Milk (1L)",
      "current_price": 1.5,
      "store_name": "Coles"
    },
    {
      "item_name": "Bread (Loaf)",
      "current_price": 3.0,
      "store_name": "Woolworths"
    },
    {
      "item_name": "Eggs (Dozen)",
      "current_price": 5.5,
      "store_name": "Coles"
    }
  ]
}
```

**Required fields:**

- `optimal_cost` (float): Total optimized cost
- `store_recommendations` (array of strings): Recommended stores
- `item_breakdown` (array of objects): Each item must have:
  - `item_name` (string)
  - `current_price` (float)
  - `store_name` (string)

### Step 5: Configure Backend to Use Your Webhook

1. **Create or edit `.env` file** in the Backend directory:

```bash
# Backend/.env

# n8n Webhook URLs
N8N_GROCERY_WEBHOOK_URL=http://localhost:5678/webhook/grocery
N8N_TRANSPORT_WEBHOOK_URL=http://localhost:5678/webhook/transport
N8N_TIMEOUT=30

# Database (optional - defaults to SQLite in-memory)
# DATABASE_URL=postgresql://user:password@localhost/dbname
```

2. **For n8n Cloud**, use your cloud webhook URL:

```bash
N8N_GROCERY_WEBHOOK_URL=https://your-instance.app.n8n.cloud/webhook/grocery
```

### Step 6: Test the Integration

1. **Start n8n** (if local):

```bash
n8n start
```

2. **Activate your workflow** in n8n (toggle the switch in top-right)

3. **Start the FastAPI backend**:

```bash
cd Backend
python3 -m uvicorn main:app --reload
```

4. **Test the endpoint**:

```bash
# First, create a user
curl -X POST http://localhost:8000/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "weekly_budget": 200,
    "home_address": "123 Main St, Sydney NSW 2000"
  }'

# Copy the user_id from the response, then test grocery optimization
curl -X POST http://localhost:8000/optimise/groceries \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "YOUR_USER_ID_HERE",
    "grocery_list": ["Milk (1L)", "Bread (Loaf)", "Eggs (Dozen)"]
  }'
```

## Advanced: Production-Ready Workflow

For a production workflow, you might want to:

1. **Add external API calls** to get real grocery prices
2. **Use HTTP Request nodes** to call store APIs
3. **Add error handling** with IF nodes
4. **Store data** in a database for analytics
5. **Add authentication** to secure your webhook

### Example: Call External Price API

```javascript
// In a Function node
const items = [];

for (const itemName of groceryList) {
  // This would call a real price API
  const price = await fetch(
    `https://api.groceryprices.com/search?item=${itemName}`
  )
    .then((r) => r.json())
    .then((data) => data.price);

  items.push({
    item_name: itemName,
    current_price: price,
    store_name: "Coles"
  });
}

return { json: { items } };
```

## Troubleshooting

### Issue: "n8n service unavailable" error

**Solution**: Check that:

1. n8n is running (`n8n start`)
2. Workflow is activated (toggle in top-right)
3. Webhook URL in `.env` matches your n8n webhook URL
4. No firewall blocking localhost:5678

### Issue: "Invalid response format" error

**Solution**: Ensure your n8n workflow returns the exact JSON structure shown above. Use the "Respond to Webhook" node and check the response in n8n's execution log.

### Issue: Timeout errors

**Solution**:

1. Increase timeout in `.env`: `N8N_TIMEOUT=60`
2. Optimize your n8n workflow to run faster
3. Check n8n execution logs for slow nodes

## Quick Start Template

Here's a minimal n8n workflow JSON you can import:

```json
{
  "name": "Grocery Optimization",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "grocery",
        "responseMode": "lastNode",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "webhookId": "grocery-webhook"
    },
    {
      "parameters": {
        "functionCode": "const groceryList = $input.item.json.grocery_list;\nconst homeAddress = $input.item.json.home_address;\n\nconst items = groceryList.map(itemName => ({\n  item_name: itemName,\n  current_price: Math.round((Math.random() * 10 + 1) * 100) / 100,\n  store_name: [\"Coles\", \"Woolworths\", \"Aldi\"][Math.floor(Math.random() * 3)]\n}));\n\nconst optimalCost = items.reduce((sum, item) => sum + item.current_price, 0);\n\nreturn {\n  json: {\n    optimal_cost: Math.round(optimalCost * 100) / 100,\n    store_recommendations: [\"Coles\", \"Woolworths\"],\n    item_breakdown: items\n  }\n};"
      },
      "name": "Process Groceries",
      "type": "n8n-nodes-base.function",
      "position": [450, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Process Groceries", "type": "main", "index": 0 }]]
    }
  }
}
```

**To import:**

1. Copy the JSON above
2. In n8n, click "..." menu → "Import from File"
3. Paste the JSON
4. Activate the workflow

## Next Steps

1. ✅ Set up n8n workflow
2. ✅ Configure `.env` with webhook URL
3. ✅ Test the integration
4. 🚀 Build more sophisticated optimization logic
5. 🚀 Add real grocery price APIs
6. 🚀 Implement store location services

## Support

- n8n Documentation: https://docs.n8n.io/
- n8n Community: https://community.n8n.io/
- FastAPI Backend Issues: Check `Backend/README.md`
