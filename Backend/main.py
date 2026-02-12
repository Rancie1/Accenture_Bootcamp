"""
FastAPI Budget Optimization Backend

Main application entry point with CORS middleware configuration.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import init_db
from routers import user, grocery, chat

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Budget Optimization Backend",
    description="REST API for university students to optimize weekly budgets",
    version="1.0.0"
)

# Include routers
app.include_router(user.router)
app.include_router(grocery.router)
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
    print("✓ Demo historical price data seeded")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Budget Optimization Backend is running"}


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/debug/historical-prices")
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
