# n8n Response Format Documentation

## Overview

Your n8n workflow uses a **multi-agent architecture** that returns conversational responses from multiple specialized agents (groceries, fuel, location). The Backend has been updated to parse this format.

## n8n Response Format

### Structure

```json
[
  {
    "user_message": "Original user request",
    "agent_answers": [
      {
        "route": "groceries",
        "answer": "Conversational response from Coles agent"
      },
      {
        "route": "fuel",
        "answer": "Conversational response from Fuel agent"
      },
      {
        "route": "location",
        "answer": "Conversational response from Location/Maps agent"
      }
    ]
  }
]
```

### Example Response

```json
[
  {
    "user_message": "I am living in Dubbo need to refuel. Also what is the price of milk, eggs and biscuits I need to get to Coles to.",
    "agent_answers": [
      {
        "route": "groceries",
        "answer": "I can help with Coles groceries in Dubbo. Do you have preferred sizes/brands for each — e.g. 2L full‑cream (or lactose‑free), a dozen standard or free‑range eggs, and any biscuit brand (Arnott's, Coles Brand, etc.)? Reply with your choices and I'll fetch current Coles prices."
      },
      {
        "route": "fuel",
        "answer": "Sorry — I couldn't fetch live fuel prices due to an internal error..."
      },
      {
        "route": "location",
        "answer": "Short answer — here are Coles and nearby petrol stations I found in Dubbo...\n\n- Coles Dubbo\n  - Address: 177 Macquarie St, Dubbo NSW 2830\n  - Coordinates: -32.2499826, 148.5994851\n\nFuel stations (near Dubbo)\n1) bp Truckstop\n  - Address: 107 Erskine St, Dubbo NSW 2830\n  - Coordinates: -32.2443213, 148.6112578\n..."
      }
    ]
  }
]
```

## Backend Processing

### Parser Module

The Backend includes `services/n8n_response_parser.py` which:

1. **Parses** the multi-agent response structure
2. **Extracts** structured data from conversational text
3. **Formats** data for Backend API responses

### Grocery Optimization

**Input to n8n:**

```json
{
  "sessionId": "usr_abc123",
  "userMessage": "I need to buy Milk, Bread, Eggs. My address is 123 Test St, Sydney NSW 2000. Please find the best prices and stores for these items."
}
```

**n8n Returns:**

- `groceries` route: Conversational response about prices
- `location` route: Store locations and details

**Backend Transforms To:**

```json
{
  "optimal_cost": 0.0,
  "store_recommendations": ["Coles Dubbo"],
  "item_breakdown": [
    {
      "item_name": "Milk",
      "current_price": 0.0,
      "store_name": "Coles Dubbo",
      "price_prediction": "likely to drop next week"
    }
  ],
  "conversational_response": "I can help with Coles groceries...",
  "needs_clarification": true
}
```

### Transport Comparison

**Input to n8n:**

```json
{
  "sessionId": "usr_abc123",
  "userMessage": "I need 40.0 liters of fuel. I'm traveling from 123 Test St to UNSW Sydney. Please compare fuel costs at nearby petrol stations."
}
```

**n8n Returns:**

- `fuel` route: Fuel price information or error
- `location` route: Petrol station locations

**Backend Transforms To:**

```json
{
  "stations": [
    {
      "station_name": "bp Truckstop",
      "address": "107 Erskine St, Dubbo NSW 2830",
      "distance_from_home": 0.0,
      "price_per_liter": 0.0,
      "cost_to_reach_station": 0.0,
      "fuel_cost_at_station": 0.0,
      "total_cost": 0.0
    }
  ],
  "conversational_response": "Sorry — I couldn't fetch live fuel prices...",
  "location_details": "Short answer — here are Coles and nearby petrol stations...",
  "has_error": true
}
```

## Parsing Logic

### Store Name Extraction

Looks for patterns like:

- "Coles [Location]"
- "Woolworths", "Aldi", "IGA"

### Fuel Station Extraction

Parses numbered list format:

```
1) bp Truckstop
  - Address: 107 Erskine St, Dubbo NSW 2830
  - Coordinates: -32.2443213, 148.6112578
```

Extracts:

- Station name
- Address
- Coordinates (lat/lng)

### Price Extraction

Looks for price patterns:

- `$3.50`
- `3.50`
- Dollar amounts in text

## Handling Clarifications

When n8n needs more information (e.g., "Do you have preferred sizes/brands?"):

**Backend Response:**

```json
{
  "optimal_cost": 0.0,
  "store_recommendations": ["Coles"],
  "item_breakdown": [],
  "conversational_response": "I can help with Coles groceries in Dubbo. Do you have preferred sizes/brands...",
  "needs_clarification": true
}
```

**Frontend should:**

1. Display the `conversational_response` to user
2. Allow user to provide more details
3. Make another API call with clarified information

## Error Handling

### Fuel Service Errors

When fuel API fails, n8n returns:

```json
{
  "route": "fuel",
  "answer": "Sorry — I couldn't fetch live fuel prices due to an internal error..."
}
```

**Backend detects this and sets:**

```json
{
  "has_error": true,
  "conversational_response": "Sorry — I couldn't fetch live fuel prices..."
}
```

**Frontend should:**

- Show the error message to user
- Offer retry options
- Provide alternative guidance

## Future Enhancements

### Improved Price Parsing

Currently uses simple regex. Could be enhanced with:

- NLP to extract structured price data
- Pattern matching for specific product formats
- Integration with Coles API for accurate prices

### Distance Calculation

Currently returns 0.0 for distances. Could add:

- Google Maps Distance Matrix API
- Calculate from coordinates
- Estimate fuel costs based on distance

### Session Continuity

Backend uses `user_id` as `sessionId`. This allows:

- Multi-turn conversations
- Context preservation across requests
- Personalized responses

## Testing

### Test the Parser

```bash
cd Backend
./venv/bin/python -c "
from services.n8n_response_parser import parse_n8n_response, format_for_grocery_api
import json

# Your n8n response
response = [{
  'user_message': 'test',
  'agent_answers': [
    {'route': 'groceries', 'answer': 'Coles has milk for \$3.50'},
    {'route': 'location', 'answer': 'Coles Dubbo - Address: 177 Macquarie St'}
  ]
}]

parsed = parse_n8n_response(response)
formatted = format_for_grocery_api(parsed)
print(json.dumps(formatted, indent=2))
"
```

### Test Full Integration

```bash
# Run test script
./venv/bin/python test_n8n_integration.py
```

## Summary

✅ Backend now understands your n8n multi-agent format  
✅ Parses conversational responses into structured data  
✅ Handles clarifications and errors gracefully  
✅ Returns both structured data AND conversational context  
✅ Frontend can display natural language responses to users
