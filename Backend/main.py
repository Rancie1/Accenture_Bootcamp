"""
FastAPI Budget Optimization Backend

Main application entry point with CORS middleware configuration.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import init_db
from routers import user, grocery, transport, weekly_plan, leaderboard, chat
from error_handlers import register_exception_handlers

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Budget Optimization Backend",
    description="""
## Budget Optimization Backend API

A comprehensive REST API designed for university students to optimize their weekly budgets through:

* **User Onboarding**: Register with personal details and weekly budget
* **Grocery Optimization**: Get optimal shopping strategies with price predictions
* **Transport Cost Comparison**: Compare fuel costs at nearby petrol stations
* **Weekly Plan Recording**: Track actual spending vs. optimal costs
* **Leaderboard**: View rankings based on optimization performance

### Key Features

- **Price Predictions**: Historical price analysis to identify items likely to drop in price
- **Smart Recommendations**: Store recommendations based on optimal cost calculations
- **Real-time Fuel Prices**: Integration with NSW Fuel API for accurate petrol pricing
- **Gamification**: Leaderboard system to motivate budget optimization

### Architecture

The backend uses a three-layer architecture:
- **Router Layer**: HTTP request/response handling
- **Service Layer**: Business logic and external integrations
- **Model Layer**: Database schemas and validation

### External Services

- **n8n Workflow Service**: Handles complex optimization calculations
- **Supabase PostgreSQL**: Data persistence (or SQLite in-memory for demos)
- **NSW Fuel API**: Real-time petrol price data (via n8n)

### Error Handling

All endpoints return consistent error responses with:
- `error_code`: Machine-readable error identifier
- `message`: Human-readable error description
- `details`: Additional context (optional)

Common status codes:
- `200/201`: Success
- `400`: Validation error
- `404`: Resource not found
- `500`: Internal server error
- `503`: External service unavailable
    """,
    version="1.0.0",
    contact={
        "name": "Budget Optimization Team",
        "email": "support@budgetoptimization.example.com"
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT"
    },
    openapi_tags=[
        {
            "name": "users",
            "description": "User onboarding and management operations"
        },
        {
            "name": "grocery",
            "description": "Grocery optimization with price predictions"
        },
        {
            "name": "transport",
            "description": "Transport cost comparison for fuel purchases"
        },
        {
            "name": "weekly-plan",
            "description": "Weekly spending tracking and optimization scoring"
        },
        {
            "name": "leaderboard",
            "description": "User rankings based on optimization performance"
        },
        {
            "name": "chat",
            "description": "AI chat assistant powered by Strands agent"
        },
        {
            "name": "system",
            "description": "System health and debugging endpoints"
        }
    ]
)

# Register exception handlers
register_exception_handlers(app)

# Include routers
app.include_router(user.router)
app.include_router(grocery.router)
app.include_router(transport.router)
app.include_router(weekly_plan.router)
app.include_router(leaderboard.router)
app.include_router(chat.router)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for specific frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database on application startup"""
    init_db(seed_demo_data=True)
    print("✓ Database initialized (in-memory SQLite)")
    print("✓ Demo data seeded: 8 items @ 4 weeks, 6 users, 14 weekly plans")


@app.get("/", tags=["system"])
async def root():
    """
    Root endpoint - API health check.
    
    Returns basic status information to confirm the API is running.
    """
    return {"status": "ok", "message": "Budget Optimization Backend is running"}


@app.get("/health", tags=["system"])
async def health():
    """
    Health check endpoint.
    
    Used by monitoring systems to verify API availability.
    """
    return {"status": "healthy"}


@app.get("/debug/historical-prices", tags=["system"])
async def debug_historical_prices():
    """
    Debug endpoint to view seeded historical price data.
    Shows available items and sample prices.
    """
    from database import SessionLocal
    from models.db_models import HistoricalPriceData
    from sqlalchemy import func
    
    db = SessionLocal()
    try:
        # Get total count
        total_count = db.query(HistoricalPriceData).count()
        
        # Get distinct items
        items = db.query(HistoricalPriceData.item_name).distinct().all()
        item_names = [item[0] for item in items]
        
        # Get sample data for each item (latest 3 records)
        samples = {}
        for item_name in item_names:
            records = (
                db.query(HistoricalPriceData)
                .filter(HistoricalPriceData.item_name == item_name)
                .order_by(HistoricalPriceData.recorded_date.desc())
                .limit(3)
                .all()
            )
            samples[item_name] = [
                {
                    "price": record.price,
                    "store": record.store_name,
                    "date": record.recorded_date.strftime("%Y-%m-%d")
                }
                for record in records
            ]
        
        return {
            "total_records": total_count,
            "items_available": item_names,
            "sample_data": samples,
            "note": "This data is used for price predictions in grocery optimization"
        }
    finally:
        db.close()
