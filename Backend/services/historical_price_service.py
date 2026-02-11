"""
Historical price service for grocery items.

Provides functions to query historical price data and calculate averages
for price prediction enrichment.
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.db_models import HistoricalPriceData


async def get_historical_average(db: Session, item_name: str) -> float | None:
    """
    Calculate 4-week average price for an item.
    
    Queries historical price data from the past 4 weeks and calculates
    the mean price across all stores.
    
    Args:
        db: Database session
        item_name: Name of grocery item
        
    Returns:
        Average price over past 4 weeks, or None if no data exists
        
    Example:
        >>> avg_price = await get_historical_average(db, "Milk (1L)")
        >>> if avg_price:
        ...     print(f"Average price: ${avg_price:.2f}")
    """
    # Calculate date 4 weeks ago
    four_weeks_ago = datetime.utcnow() - timedelta(weeks=4)
    
    # Query average price for the item in the past 4 weeks
    result = db.query(
        func.avg(HistoricalPriceData.price).label('avg_price')
    ).filter(
        HistoricalPriceData.item_name == item_name,
        HistoricalPriceData.recorded_date >= four_weeks_ago
    ).first()
    
    # Return None if no data exists, otherwise return the average
    if result and result.avg_price is not None:
        return float(result.avg_price)
    
    return None


async def seed_demo_data(db: Session) -> None:
    """
    Seed database with 4 weeks of demo historical price data.
    
    Creates realistic price variations for 5 common items:
    - Milk (1L)
    - Bread (Loaf)
    - Eggs (Dozen)
    - Chicken Breast (1kg)
    - Rice (1kg)
    
    For each item, creates 28 records (4 weeks * 7 days) with:
    - Random price variations (±10% from base price)
    - Multiple stores (Coles, Woolworths, Aldi)
    - Realistic timestamps
    
    Args:
        db: Database session
        
    Example:
        >>> await seed_demo_data(db)
        # Seeds 420 records (5 items × 28 days × 3 stores)
    """
    import random
    
    # Define items with base prices (in AUD)
    items = {
        "Milk (1L)": 1.50,
        "Bread (Loaf)": 3.00,
        "Eggs (Dozen)": 5.50,
        "Chicken Breast (1kg)": 12.00,
        "Rice (1kg)": 4.00,
    }
    
    stores = ["Coles", "Woolworths", "Aldi"]
    
    # Generate data for past 4 weeks (28 days)
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=27)  # 28 days total including today
    
    records = []
    
    for item_name, base_price in items.items():
        # Create daily records for each store
        current_date = start_date
        
        for day in range(28):
            for store in stores:
                # Add random variation (±10% from base price)
                variation = random.uniform(-0.10, 0.10)
                price = round(base_price * (1 + variation), 2)
                
                # Ensure price is positive
                price = max(0.50, price)
                
                record = HistoricalPriceData(
                    item_name=item_name,
                    price=price,
                    store_name=store,
                    recorded_date=current_date + timedelta(hours=random.randint(8, 18))
                )
                records.append(record)
            
            current_date += timedelta(days=1)
    
    # Bulk insert all records
    db.bulk_save_objects(records)
    db.commit()
