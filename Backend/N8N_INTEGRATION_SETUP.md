# n8n Integration Setup

## Changes Made

### 1. Environment Configuration

**File:** `Backend/.env` (created)

```env
N8N_MAIN_WEBHOOK_URL=https://louisjean.app.n8n.cloud/webhook-test/26b8906b-6df5-4228-9d8b-859118b52338
N8N_TIMEOUT=30
```

**File:** `Backend/.env.example` (updated)

- Set production n8n webhook URL as default
- Added comments for local development

### 2. Payload Format Update

Both services now send the correct format your n8n expects:

```json
{
  "sessionId": "user_id",
  "userMessage": "natural language request"
}
```

**Updated Files:**

- `Backend/services/grocery_service.py`
- `Backend/services/transport_service.py`

### 3. Session Management

- Uses `user_id` as `sessionId` for conversation continuity
- Each user gets their own session with n8n
- Allows n8n to maintain context across multiple requests

## How It Works

### Grocery Optimization Flow

1. **Backend receives:** `POST /optimise/groceries`

   ```json
   {
     "user_id": "usr_abc123",
     "grocery_list": ["Milk", "Bread", "Eggs"]
   }
   ```

2. **Backend sends to n8n:**

   ```json
   {
     "sessionId": "usr_abc123",
     "userMessage": "I need to buy Milk, Bread, Eggs. My address is 123 Test St, Sydney NSW 2000. Please find the best prices and stores for these items."
   }
   ```

3. **n8n processes:** Routes to Coles agent + Maps agent

4. **n8n returns:** (expected format)

   ```json
   {
     "optimal_cost": 12.5,
     "store_recommendations": ["Woolworths", "Coles"],
     "item_breakdown": [
       {
         "item_name": "Milk",
         "current_price": 3.5,
         "store_name": "Woolworths"
       }
     ]
   }
   ```

5. **Backend enriches:** Adds price predictions from historical data

6. **Backend returns:** Complete optimization with predictions

### Transport Comparison Flow

1. **Backend receives:** `POST /transport/compare`

   ```json
   {
     "user_id": "usr_abc123",
     "destination": "UNSW Sydney",
     "fuel_amount_needed": 40.0
   }
   ```

2. **Backend sends to n8n:**

   ```json
   {
     "sessionId": "usr_abc123",
     "userMessage": "I need 40.0 liters of fuel. I'm traveling from 123 Test St, Sydney NSW 2000 to UNSW Sydney. Please compare fuel costs at nearby petrol stations and show me the cheapest options."
   }
   ```

3. **n8n processes:** Routes to Fuel agent + Maps agent

4. **n8n returns:** (expected format)

   ```json
   {
     "stations": [
       {
         "station_name": "7-Eleven Kensington",
         "address": "456 Anzac Parade",
         "distance_from_home": 2.5,
         "price_per_liter": 1.85,
         "cost_to_reach_station": 0.5,
         "fuel_cost_at_station": 74.0,
         "total_cost": 74.5
       }
     ]
   }
   ```

5. **Backend sorts:** By total_cost (if not already sorted)

6. **Backend returns:** Sorted station list

## Testing

### Quick Test

Run the test script to verify n8n integration:

```bash
cd Backend
./venv/bin/python test_n8n_integration.py
```

This will:

- Send a test request to your n8n webhook
- Show the request payload
- Display the response
- Indicate success or failure

### Expected Output

```
============================================================
n8n Webhook Integration Test
============================================================
Testing n8n webhook: https://louisjean.app.n8n.cloud/webhook-test/...
------------------------------------------------------------
Sending payload:
  sessionId: test-session-123
  userMessage: I need to buy milk, bread, and eggs...
------------------------------------------------------------
Response Status: 200
✅ SUCCESS! n8n webhook is working
Response Body:
{
  "optimal_cost": 12.50,
  "store_recommendations": ["Woolworths"],
  ...
}
```

### Full Integration Test

Test through the actual API:

```bash
# 1. Start the Backend
./venv/bin/python -m uvicorn main:app --reload

# 2. In another terminal, test onboarding
curl -X POST http://localhost:8000/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "weekly_budget": 150.0,
    "home_address": "123 Test St, Sydney NSW 2000"
  }'

# 3. Copy the user_id from response, then test grocery optimization
curl -X POST http://localhost:8000/optimise/groceries \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "usr_...",
    "grocery_list": ["Milk", "Bread", "Eggs"]
  }'
```

## Important Notes

### What n8n Should Return

Your n8n workflow MUST return data in this format for the Backend to work:

**For Grocery Optimization:**

```json
{
  "optimal_cost": number,
  "store_recommendations": ["string"],
  "item_breakdown": [
    {
      "item_name": "string",
      "current_price": number,
      "store_name": "string"
    }
  ]
}
```

**For Transport Comparison:**

```json
{
  "stations": [
    {
      "station_name": "string",
      "address": "string",
      "distance_from_home": number,
      "price_per_liter": number,
      "cost_to_reach_station": number,
      "fuel_cost_at_station": number,
      "total_cost": number
    }
  ]
}
```

### Session Management

- Each user gets a unique `sessionId` (their `user_id`)
- n8n can use this to maintain conversation context
- Multiple requests from the same user will have the same `sessionId`

### Error Handling

If n8n fails or returns an error:

- Backend will catch it and return 503 Service Unavailable
- Error message will be logged
- Client receives: `{"error_code": "SERVICE_UNAVAILABLE", "message": "..."}`

## Troubleshooting

### Issue: "n8n webhook returned status 400"

**Cause:** n8n doesn't recognize the payload format

**Solution:** Check that your n8n workflow expects:

```json
{ "sessionId": "...", "userMessage": "..." }
```

### Issue: "Failed to parse n8n response as JSON"

**Cause:** n8n returned non-JSON response

**Solution:** Ensure your n8n workflow returns valid JSON

### Issue: "Missing fields in n8n response"

**Cause:** n8n response doesn't match expected format

**Solution:** Update your n8n workflow to return the required fields (see "What n8n Should Return" above)

## Next Steps

1. ✅ Run `test_n8n_integration.py` to verify webhook works
2. ✅ Test full API flow with curl commands
3. ✅ Update your n8n workflow if response format doesn't match
4. ✅ Test with Frontend integration

## Questions?

If you encounter issues:

1. Check the Backend logs for detailed error messages
2. Verify the n8n webhook URL is correct
3. Test the webhook directly with curl or Postman
4. Ensure n8n workflow is active and deployed
