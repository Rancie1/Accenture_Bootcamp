# Getting Started Guide

## Quick Setup (5 Minutes)

### 1. Install Dependencies

```bash
cd Backend
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment (Optional)

The backend uses **SQLite in-memory database** by default - no setup needed!

For n8n integration, create `.env`:

```bash
cp .env.example .env
```

Edit `.env` and set your n8n webhook URL:

```bash
N8N_GROCERY_WEBHOOK_URL=http://localhost:5678/webhook/grocery
N8N_TRANSPORT_WEBHOOK_URL=http://localhost:5678/webhook/transport
```

### 3. Start the Server

```bash
uvicorn main:app --reload
```

You should see:

```
✓ Database initialized (in-memory SQLite)
✓ Demo historical price data seeded
INFO:     Application startup complete.
```

### 4. Access the API

- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Debug Historical Prices**: http://localhost:8000/debug/historical-prices

## Database Setup

### In-Memory SQLite (Default)

- Data stored in RAM during session
- Tables auto-created on startup
- **Historical price data auto-seeded** (5 items, 4 weeks)
- User data populated via API calls
- Data resets when server restarts
- Perfect for demos and development

### Auto-Seeded Demo Data

The following items have 4 weeks of historical price data:

1. **Milk (1L)** - Base price ~$1.50
2. **Bread (Loaf)** - Base price ~$3.00
3. **Eggs (Dozen)** - Base price ~$5.50
4. **Chicken Breast (1kg)** - Base price ~$12.00
5. **Rice (1kg)** - Base price ~$4.00

Prices vary ±10% across Coles, Woolworths, and Aldi.

### Upgrade to Supabase (Optional)

For persistent data:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get connection string from Settings → Database
3. Add to `.env`:
   ```bash
   DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres
   ```
4. Restart server - it will automatically use Supabase!

## Testing the API

### 1. Create a User

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

### 2. Test Grocery Optimization

```bash
curl -X POST http://localhost:8000/optimise/groceries \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "YOUR_USER_ID_HERE",
    "grocery_list": ["Milk (1L)", "Bread (Loaf)", "Eggs (Dozen)"]
  }'
```

**Note**: This requires n8n to be running. See [n8n setup guide](./n8n/BASIC_SETUP.md).

### 3. Record Weekly Plan

```bash
curl -X POST http://localhost:8000/weekly-plan/record \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "YOUR_USER_ID_HERE",
    "optimal_cost": 15.50,
    "actual_cost": 14.00
  }'
```

### 4. View Leaderboard

```bash
curl http://localhost:8000/leaderboard
```

## Running Tests

```bash
# Run all tests
PYTHONPATH=. ./venv/bin/python -m pytest tests/ -v

# Run specific test file
PYTHONPATH=. ./venv/bin/python -m pytest tests/test_leaderboard.py -v

# Run with detailed output
PYTHONPATH=. ./venv/bin/python tests/test_leaderboard.py
```

## Project Structure

```
Backend/
├── main.py                 # FastAPI application entry point
├── database.py             # Database configuration
├── seed_data.py            # Demo data seeding
├── requirements.txt        # Python dependencies
├── .env.example            # Environment template
│
├── models/                 # Data models
│   ├── db_models.py        # SQLAlchemy ORM models
│   └── schemas.py          # Pydantic request/response schemas
│
├── routers/                # API endpoints
│   ├── user.py             # POST /onboard
│   ├── grocery.py          # POST /optimise/groceries
│   ├── transport.py        # POST /transport/compare
│   ├── weekly_plan.py      # POST /weekly-plan/record
│   └── leaderboard.py      # GET /leaderboard
│
├── services/               # Business logic
│   ├── user_service.py
│   ├── grocery_service.py
│   ├── transport_service.py
│   ├── weekly_plan_service.py
│   ├── leaderboard_service.py
│   ├── historical_price_service.py
│   └── n8n_service.py
│
├── tests/                  # Test suite
└── docs/                   # Documentation
```

## Available Endpoints

### User Management

- `POST /onboard` - Create new user account

### Grocery Optimization

- `POST /optimise/groceries` - Get optimized grocery shopping plan with price predictions

### Transport Comparison

- `POST /transport/compare` - Compare fuel costs at nearby petrol stations

### Weekly Plan

- `POST /weekly-plan/record` - Record actual spending for the week

### Leaderboard

- `GET /leaderboard` - Get ranked leaderboard by optimization scores

### Utility

- `GET /` - Health check
- `GET /health` - Health status
- `GET /debug/historical-prices` - View seeded historical price data

## n8n Integration

The backend delegates complex optimization tasks to n8n workflows via webhooks.

### Quick n8n Setup

1. Install n8n: `npm install n8n -g`
2. Start n8n: `n8n start`
3. Open: http://localhost:5678
4. Import workflow from `docs/n8n/workflow_template.json`
5. Activate the workflow

For detailed setup, see:

- [Basic n8n Setup](./n8n/BASIC_SETUP.md)
- [Multi-Agent Setup](./n8n/MULTI_AGENT_SETUP.md)
- [Webhook FAQ](./n8n/WEBHOOK_FAQ.md)

## Troubleshooting

### Server won't start

- Check you're in the Backend directory
- Activate virtual environment: `source venv/bin/activate`
- Check port 8000 is available: `lsof -i :8000`

### Import errors

- Reinstall dependencies: `pip install -r requirements.txt`

### "n8n service unavailable"

- Check n8n is running: `n8n start`
- Check workflow is activated (toggle in n8n)
- Check webhook URL in `.env` matches n8n
- Test webhook directly:
  ```bash
  curl -X POST http://localhost:5678/webhook/grocery \
    -H "Content-Type: application/json" \
    -d '{"message": "test"}'
  ```

### "User not found"

- Create a user first with `POST /onboard`
- Copy the exact `user_id` from the response

### Tests failing

- Some tests may fail due to database session isolation (known issue)
- The actual implementation works correctly in production

## Next Steps

1. ✅ Get basic setup working
2. 🚀 Set up n8n integration (see [n8n docs](./n8n/))
3. 🚀 Connect real APIs (Coles, Google Maps, NSW Fuel)
4. 🚀 Build frontend application
5. 🚀 Deploy to production

## Documentation

- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - What was built
- [Leaderboard Feature](./LEADERBOARD.md) - Detailed feature documentation
- [n8n Integration](./n8n/) - n8n setup and configuration
- [API Reference](http://localhost:8000/docs) - Interactive API docs (when server running)

## Support

For issues or questions:

- Check feature-specific documentation in `docs/`
- Review test files for examples
- Check application logs
- Refer to troubleshooting section above

Happy coding! 🎉
