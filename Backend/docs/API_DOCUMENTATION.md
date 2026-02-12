# Budget Optimization Backend - API Documentation

## Overview

The Budget Optimization Backend provides a comprehensive REST API for university students to optimize their weekly budgets. The API is built with FastAPI and follows OpenAPI 3.0 specification.

## Interactive Documentation

The API provides interactive documentation through Swagger UI and ReDoc:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

## Base URL

```
http://localhost:8000
```

## Authentication

Currently, the API does not require authentication. User identification is done via `user_id` obtained during onboarding.

## API Endpoints

### User Management

#### POST /onboard

Create a new user account.

**Request Body:**

```json
{
  "name": "John Smith",
  "weekly_budget": 150.0,
  "home_address": "123 University Ave, Sydney NSW 2000"
}
```

**Success Response (201):**

```json
{
  "user_id": "usr_abc123def456",
  "name": "John Smith",
  "weekly_budget": 150.0,
  "home_address": "123 University Ave, Sydney NSW 2000",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**

- `400`: Validation error (invalid input)
- `500`: Database error

---

### Grocery Optimization

#### POST /optimise/groceries

Optimize grocery shopping with AI-powered price predictions.

**Request Body:**

```json
{
  "user_id": "usr_abc123def456",
  "grocery_list": ["Milk (1L)", "Bread (Loaf)", "Eggs (Dozen)"]
}
```

**Success Response (200):**

```json
{
  "optimal_cost": 12.5,
  "store_recommendations": ["Woolworths", "Coles"],
  "item_breakdown": [
    {
      "item_name": "Milk (1L)",
      "current_price": 3.5,
      "store_name": "Woolworths",
      "price_prediction": "likely to drop next week"
    },
    {
      "item_name": "Bread (Loaf)",
      "current_price": 4.0,
      "store_name": "Coles",
      "price_prediction": "historically rising"
    }
  ]
}
```

**Price Predictions:**

- `"likely to drop next week"`: Current price is below 4-week average
- `"historically rising"`: Current price is at or above 4-week average
- `null`: No historical data available

**Error Responses:**

- `400`: Validation error (empty grocery list)
- `404`: User not found
- `503`: n8n service unavailable

---

### Transport Cost Comparison

#### POST /transport/compare

Compare fuel costs at nearby petrol stations.

**Request Body:**

```json
{
  "user_id": "usr_abc123def456",
  "destination": "UNSW Sydney, Kensington NSW 2052",
  "fuel_amount_needed": 40.0
}
```

**Success Response (200):**

```json
{
  "stations": [
    {
      "station_name": "7-Eleven Kensington",
      "address": "456 Anzac Parade, Kensington NSW 2033",
      "distance_from_home": 2.5,
      "price_per_liter": 1.85,
      "cost_to_reach_station": 0.5,
      "fuel_cost_at_station": 74.0,
      "total_cost": 74.5
    }
  ]
}
```

**Calculation:**

```
total_cost = cost_to_reach_station + (fuel_amount_needed × price_per_liter)
```

Stations are sorted by `total_cost` (cheapest first).

**Error Responses:**

- `400`: Validation error (invalid fuel amount)
- `404`: User not found
- `503`: n8n service or NSW Fuel API unavailable

---

### Weekly Plan Recording

#### POST /weekly-plan/record

Record actual spending and calculate optimization score.

**Request Body:**

```json
{
  "user_id": "usr_abc123def456",
  "optimal_cost": 85.5,
  "actual_cost": 92.3
}
```

**Success Response (201):**

```json
{
  "id": 42,
  "user_id": "usr_abc123def456",
  "optimal_cost": 85.5,
  "actual_cost": 92.3,
  "optimization_score": 0.385,
  "created_at": "2024-01-22T18:45:00Z"
}
```

**Optimization Score Calculation:**

```
optimization_score = (weekly_budget - actual_cost) / weekly_budget
```

**Score Interpretation:**

- Positive: Spent less than budget (good!)
- Zero: Spent exactly the budget
- Negative: Overspent

**Error Responses:**

- `400`: Validation error (invalid costs)
- `404`: User not found
- `500`: Database error

---

### Leaderboard

#### GET /leaderboard

Get ranked leaderboard of users by average optimization score.

**Success Response (200):**

```json
{
  "leaderboard": [
    {
      "user_id": "usr_abc123",
      "username": "Alice Johnson",
      "average_score": 0.25,
      "rank": 1
    },
    {
      "user_id": "usr_def456",
      "username": "Bob Smith",
      "average_score": 0.18,
      "rank": 2
    }
  ]
}
```

**Ranking Logic:**

1. Calculate average optimization_score for each user
2. Exclude users with no weekly plans
3. Sort by average_score descending
4. Assign ranks (1 = best)

**Error Responses:**

- `500`: Database error

---

### System Endpoints

#### GET /

Root health check endpoint.

**Response (200):**

```json
{
  "status": "ok",
  "message": "Budget Optimization Backend is running"
}
```

#### GET /health

Health check for monitoring systems.

**Response (200):**

```json
{
  "status": "healthy"
}
```

#### GET /debug/historical-prices

Debug endpoint to view seeded historical price data.

**Response (200):**

```json
{
  "total_records": 140,
  "items_available": [
    "Milk (1L)",
    "Bread (Loaf)",
    "Eggs (Dozen)",
    "Chicken Breast (1kg)",
    "Rice (1kg)"
  ],
  "sample_data": {
    "Milk (1L)": [
      {
        "price": 3.5,
        "store": "Woolworths",
        "date": "2024-01-20"
      }
    ]
  }
}
```

---

## Error Response Format

All error responses follow a consistent JSON structure:

```json
{
  "error_code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional context (optional)"
  }
}
```

### Error Codes

| Code                  | Status | Description                  |
| --------------------- | ------ | ---------------------------- |
| `VALIDATION_ERROR`    | 400    | Input validation failed      |
| `NOT_FOUND`           | 404    | Resource does not exist      |
| `INTERNAL_ERROR`      | 500    | Internal server error        |
| `SERVICE_UNAVAILABLE` | 503    | External service unavailable |
| `DATABASE_ERROR`      | 500    | Database operation failed    |

---

## Data Models

### UserOnboardRequest

```json
{
  "name": "string (required, non-empty)",
  "weekly_budget": "number (required, positive)",
  "home_address": "string (required, non-empty)"
}
```

### GroceryOptimizationRequest

```json
{
  "user_id": "string (required)",
  "grocery_list": "array of strings (required, non-empty)"
}
```

### TransportComparisonRequest

```json
{
  "user_id": "string (required)",
  "destination": "string (required, non-empty)",
  "fuel_amount_needed": "number (required, positive)"
}
```

### WeeklyPlanRequest

```json
{
  "user_id": "string (required)",
  "optimal_cost": "number (required, >= 0)",
  "actual_cost": "number (required, positive)"
}
```

---

## Testing the API

### Using Swagger UI

1. Start the server: `uvicorn main:app --reload`
2. Open browser: `http://localhost:8000/docs`
3. Click "Try it out" on any endpoint
4. Fill in the request body
5. Click "Execute"

### Using curl

**Onboard a user:**

```bash
curl -X POST "http://localhost:8000/onboard" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "weekly_budget": 150.00,
    "home_address": "123 University Ave, Sydney NSW 2000"
  }'
```

**Optimize groceries:**

```bash
curl -X POST "http://localhost:8000/optimise/groceries" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "usr_abc123def456",
    "grocery_list": ["Milk (1L)", "Bread (Loaf)"]
  }'
```

**Get leaderboard:**

```bash
curl -X GET "http://localhost:8000/leaderboard"
```

---

## External Dependencies

### n8n Workflow Service

The backend delegates complex optimization tasks to n8n:

- **Grocery Optimization**: Calculates optimal shopping strategies
- **Transport Comparison**: Fetches petrol station data from NSW Fuel API

**Configuration:**
Set environment variables in `.env`:

```
N8N_GROCERY_WEBHOOK_URL=https://your-n8n.app/webhook/grocery
N8N_TRANSPORT_WEBHOOK_URL=https://your-n8n.app/webhook/transport
N8N_TIMEOUT=30
```

### Database

- **Development**: SQLite in-memory (default, no setup required)
- **Production**: Supabase PostgreSQL

**Configuration:**

```
DATABASE_URL=postgresql://user:password@host:port/database
```

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting for production deployment.

---

## CORS Configuration

CORS is configured to allow all origins in development:

```python
allow_origins=["*"]
```

For production, configure specific frontend domains:

```python
allow_origins=["https://your-frontend.com"]
```

---

## Support

For issues or questions:

- Email: support@budgetoptimization.example.com
- Documentation: `/docs` endpoint
- GitHub: [Repository URL]

---

## License

MIT License - See LICENSE file for details
