# Budget Optimization Backend

FastAPI-based REST API for university students to optimize weekly budgets.

## Quick Start

The backend uses **SQLite in-memory database** by default - no external database setup required!

1. Create a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

> If using python3
```bash
pip3 install -r requirements.txt
```

3. Run the development server:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

**Note:** Data is stored in-memory and resets when the server restarts. Perfect for demos and development!

## Optional: Using Supabase PostgreSQL

To use a persistent database instead:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env`
3. Add your Supabase connection string:
   ```bash
   DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres
   ```
4. Restart the server

## API Documentation

Interactive API documentation is available at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## n8n Integration Setup

The backend delegates complex optimization tasks to n8n workflows via webhooks. To set up n8n:

**📖 See [N8N_SETUP_GUIDE.md](./N8N_SETUP_GUIDE.md) for complete setup instructions**

Quick setup:

1. Install n8n: `npm install n8n -g`
2. Start n8n: `n8n start`
3. Import the workflow template from the guide
4. Add webhook URL to `.env`:
   ```bash
   N8N_GROCERY_WEBHOOK_URL=http://localhost:5678/webhook/grocery
   ```

Without n8n configured, grocery optimization endpoints will return 503 errors.

## Project Structure

```
Backend/
├── main.py              # FastAPI app entry point
├── database.py          # Database configuration
├── routers/             # HTTP request handlers
├── services/            # Business logic
├── models/              # Data models (SQLAlchemy & Pydantic)
├── requirements.txt     # Python dependencies
└── .env.example         # Environment variables template
```

## Architecture

The backend follows a three-layer architecture:

1. **Router Layer** (`routers/`): Handles HTTP requests/responses
2. **Service Layer** (`services/`): Contains business logic
3. **Model Layer** (`models/`): Defines data structures

## Testing

Run tests with:

```bash
pytest tests/
```

Run property-based tests:

```bash
pytest tests/ -v -k property
```

Run specific test file:

```bash
pytest tests/test_grocery_optimization.py -v
```
