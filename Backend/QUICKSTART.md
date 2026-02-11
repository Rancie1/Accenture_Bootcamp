# Quick Start Guide

## 🚀 Get Started in 30 Seconds

The backend uses **SQLite in-memory database** - no external setup needed!

### 1. Install Dependencies

```bash
cd Backend
source venv/bin/activate  # Already created
pip install -r requirements.txt  # Already installed
```

### 2. Start the Server

```bash
uvicorn main:app --reload
```

You should see:

```
✓ Database initialized (in-memory SQLite)
INFO:     Application startup complete.
```

### 3. Test the API

Open your browser to:

- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

Or use curl:

```bash
curl http://localhost:8000/
```

## 📊 How It Works

### In-Memory Database

- Data is stored in RAM during the session
- Tables are auto-created on startup
- **Historical price data is auto-seeded** for demo
- User data comes from API calls
- Data resets when server restarts
- Perfect for demos and development

### Database Tables Created:

- `users` - User accounts with weekly budgets (empty, populated via `/onboard` API)
- `weekly_plans` - Weekly spending records (empty, populated via `/weekly-plan/record` API)
- `historical_price_data` - **Pre-seeded with 4 weeks of price data for 5 items**

### Auto-Seeded Demo Data:

The following items have 4 weeks of historical price data (28 days × 3 stores = 84 records per item):

1. **Milk (1L)** - Base price ~$1.50
2. **Bread (Loaf)** - Base price ~$3.00
3. **Eggs (Dozen)** - Base price ~$5.50
4. **Chicken Breast (1kg)** - Base price ~$12.00
5. **Rice (1kg)** - Base price ~$4.00

Prices vary ±10% across Coles, Woolworths, and Aldi.

**View seeded data:** http://localhost:8000/debug/historical-prices

## 🔄 Upgrading to Supabase (Optional)

When you're ready for persistent data:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your connection string from Settings → Database
3. Create a `.env` file:
   ```bash
   DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres
   ```
4. Restart the server - it will automatically use Supabase!

## 🧪 Testing

Run tests:

```bash
./venv/bin/python -m pytest
```

Run with verbose output:

```bash
./venv/bin/python -m pytest -v
```

## 📝 Next Steps

1. ✅ Database models are ready
2. ⏭️ Next: Implement user onboarding (Task 3)
3. ⏭️ Then: Add grocery optimization (Task 7)
4. ⏭️ Finally: Build leaderboard (Task 11)

## 🐛 Troubleshooting

**Server won't start?**

- Make sure you're in the Backend directory
- Activate the virtual environment: `source venv/bin/activate`
- Check port 8000 is not in use: `lsof -i :8000`

**Import errors?**

- Reinstall dependencies: `pip install -r requirements.txt`

**Database errors?**

- The in-memory database auto-creates on startup
- No manual setup needed!
