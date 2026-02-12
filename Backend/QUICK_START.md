# Quick Start Guide

## ✅ Your Backend is Ready!

All 61 tests passing. n8n integration complete. Here's how to use it:

## 1. Start the Backend

```bash
cd Backend
./venv/bin/python main.py
```

Server runs on: `http://localhost:8000`

## 2. Test n8n Integration (Optional)

```bash
cd Backend
./venv/bin/python test_n8n_integration.py
```

This sends a real request to your n8n webhook and shows the response.

## 3. Use the API

### Create a User

```bash
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "home_address": "123 Test St, Dubbo NSW 2830",
    "weekly_budget": 200.0
  }'
```

### Get Grocery Recommendations

```bash
curl -X POST http://localhost:8000/optimise/groceries \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "grocery_list": ["Milk", "Eggs", "Biscuits"]
  }'
```

This will:

1. Send your request to n8n with the user's address
2. n8n's grocery + location agents will respond
3. Backend parses the response and returns structured data

### Compare Fuel Costs

```bash
curl -X POST http://localhost:8000/transport/compare \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "destination": "Coles Dubbo",
    "fuel_amount_needed": 40.0
  }'
```

This will:

1. Send your request to n8n with origin and destination
2. n8n's fuel + location agents will respond
3. Backend parses and returns nearby fuel stations

## 4. View API Documentation

Open in browser: `http://localhost:8000/docs`

Interactive Swagger UI with all endpoints documented.

## Key Features

✅ **n8n Integration**: Sends requests in format n8n expects  
✅ **Multi-Agent Parsing**: Handles groceries, fuel, location agents  
✅ **Conversational Responses**: Returns both structured data AND natural language  
✅ **Error Handling**: Gracefully handles n8n service errors  
✅ **Session Continuity**: Uses user_id as sessionId for multi-turn conversations  
✅ **Price Predictions**: Enriches grocery items with historical price analysis  
✅ **Fuel Optimization**: Compares total costs including travel to stations

## Configuration

### n8n Webhook

Located in: `Backend/.env`

```env
N8N_MAIN_WEBHOOK_URL=https://louisjean.app.n8n.cloud/webhook-test/26b8906b-6df5-4228-9d8b-859118b52338
```

### Database

Default: SQLite in-memory (no setup needed)  
Optional: Supabase PostgreSQL (configure in `.env`)

## Documentation

- `N8N_INTEGRATION_STATUS.md` - Complete integration status
- `N8N_RESPONSE_FORMAT.md` - Detailed n8n format documentation
- `N8N_INTEGRATION_SETUP.md` - Setup instructions
- `INTEGRATION_GUIDE.md` - Frontend-Backend integration strategy
- `INTEGRATION_QUICK_REFERENCE.md` - API endpoint cheat sheet

## Troubleshooting

### n8n webhook not responding?

1. Check the webhook URL in `.env`
2. Verify n8n workflow is active
3. Run `./venv/bin/python test_n8n_integration.py` to test

### Tests failing?

```bash
cd Backend
./venv/bin/pytest tests/ -v
```

All 61 tests should pass.

### Need to see logs?

Backend logs show:

- n8n requests and responses
- Parser operations
- Error details

## Next Steps

1. **Test the live integration** with your n8n workflow
2. **Start the Backend server** and try the API endpoints
3. **Integrate with Frontend** using the integration guides
4. **Customize** the parser logic for your specific needs

🚀 You're all set! The Backend is ready to work with your n8n multi-agent workflow.
