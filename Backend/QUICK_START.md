# Quick Start Guide

## 1. Setup Backend (2 minutes)

```bash
cd Backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and set your n8n webhook URL
# N8N_GROCERY_WEBHOOK_URL=http://localhost:5678/webhook/grocery
```

## 2. Setup n8n (5 minutes)

```bash
# Install n8n (if not already installed)
npm install n8n -g

# Start n8n
n8n start

# Open browser: http://localhost:5678
```

### Import Workflow

1. In n8n, click "..." menu → "Import from File"
2. Use `QUICK_N8N_WORKFLOW.json` for a simple demo
3. Or build your own with Switch node for multiple agents
4. **Activate the workflow** (toggle in top-right)

## 3. Start Backend

```bash
cd Backend
uvicorn main:app --reload
```

API available at: http://localhost:8000  
Docs available at: http://localhost:8000/docs

## 4. Test It

### Create a user:

```bash
curl -X POST http://localhost:8000/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "weekly_budget": 200,
    "home_address": "123 George St, Sydney NSW 2000"
  }'
```

Copy the `user_id` from the response.

### Test grocery optimization:

```bash
curl -X POST http://localhost:8000/optimise/groceries \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "YOUR_USER_ID_HERE",
    "grocery_list": ["Milk (1L)", "Bread (Loaf)", "Eggs (Dozen)"]
  }'
```

## Configuration Files

- **Backend/.env** - Environment variables (webhook URLs)
- **Backend/requirements.txt** - Python dependencies
- **n8n workflow** - Your agent orchestration

## Architecture

```
FastAPI Backend → n8n Webhook → Switch Node → Agents (Coles/Fuel/Maps)
```

## Troubleshooting

### "n8n service unavailable"

- Check n8n is running: `n8n start`
- Check workflow is activated (toggle in n8n)
- Check webhook URL in `.env` matches n8n

### "User not found"

- Make sure you created a user first with `/onboard`
- Copy the exact `user_id` from the response

### Tests failing

- Tests are in `Backend/tests/` folder
- Run with: `pytest tests/`
- Some tests may fail due to database session isolation (known issue)

## Documentation

- `README.md` - Full backend documentation
- `N8N_SETUP_GUIDE.md` - Detailed n8n setup
- `N8N_MULTI_AGENT_SETUP.md` - Multi-agent architecture
- `ANSWER_YOUR_QUESTION.md` - Webhook configuration explained

## Next Steps

1. ✅ Get basic setup working
2. 🚀 Add real Coles API integration
3. 🚀 Add Google Maps API for distance calculation
4. 🚀 Add NSW Fuel API integration
5. 🚀 Build frontend to consume the API

Happy coding! 🎉
