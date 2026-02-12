"""
Seed demo data for in-memory database.

This module provides functions to populate the database with demo data
for historical prices, making the grocery optimization demo work immediately.
"""

from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from models.db_models import HistoricalPriceData


def seed_historical_prices(db: Session) -> None:
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
    """
    
    # Define items with base prices (in AUD)
    # Prices are set slightly ABOVE typical Coles prices so that
    # current real Coles prices often fall at or below the average,
    # triggering "good buy" gamification.
    items = {
        "Milk (1L)": 5.00,       # Coles Full Cream Milk ~$4.65
        "Bread (Loaf)": 4.80,    # Coles Wholemeal Bread ~$4.50
        "Eggs (Dozen)": 7.00,    # Coles Free Range 12pk ~$6.50
        "Chicken Breast (1kg)": 14.00,  # Coles Chicken ~$12.99
        "Rice (1kg)": 5.00,      # Coles Rice ~$4.50
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
    
    print(f"✓ Seeded {len(records)} historical price records for {len(items)} items")


def seed_demo_users(db: Session) -> None:
    """
    Optionally seed demo users for testing.
    
    Creates 2-3 demo users with realistic data.
    """
    from models.db_models import User
    import uuid
    
    demo_users = [
        {
            "user_id": str(uuid.uuid4()),
            "name": "Demo Student 1",
            "weekly_budget": 150.00,
            "home_address": "UNSW Sydney, Kensington NSW 2052",
        },
        {
            "user_id": str(uuid.uuid4()),
            "name": "Demo Student 2",
            "weekly_budget": 200.00,
            "home_address": "University of Sydney, Camperdown NSW 2006",
        },
    ]
    
    for user_data in demo_users:
        user = User(**user_data)
        db.add(user)
    
    db.commit()
    print(f"✓ Seeded {len(demo_users)} demo users")


def seed_all(db: Session, include_users: bool = False) -> None:
    """
    Seed all demo data.
    
    Args:
        db: Database session
        include_users: Whether to seed demo users (default: False)
    """
    # Always seed historical prices (required for grocery optimization)
    seed_historical_prices(db)
    
    # Optionally seed demo users
    if include_users:
        seed_demo_users(db)
