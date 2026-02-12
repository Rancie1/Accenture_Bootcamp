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

    Creates realistic price variations for 8 common items:
    - Australian Full Cream Long Life Milk
    - White Bread
    - Free Range Eggs 6 Pack
    - RSPCA Approved Chicken Breast Fillets Large Pack
    - Basmati Rice
    - Bananas
    - Cheese Fetta Aust Style
    - Pasta Spirals

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


def seed_demo_users(db: Session) -> list[str]:
    """
    Seed demo users for leaderboard testing.
    
    Creates 6 demo users (5 for leaderboard + 1 for frontend) with realistic data and fixed user_ids.
    Returns list of user_ids for weekly plan seeding.
    """
    from models.db_models import User
    
    demo_users = [
        {
            "user_id": "demo_user_001",
            "name": "Demo User",
            "weekly_budget": 100.00,
            "home_address": "Sydney NSW 2000",
        },
        {
            "user_id": "usr_alice_demo_001",
            "name": "Alice Chen",
            "weekly_budget": 180.00,
            "home_address": "UNSW Sydney, Kensington NSW 2052",
        },
        {
            "user_id": "usr_bob_demo_002",
            "name": "Bob Martinez",
            "weekly_budget": 150.00,
            "home_address": "University of Sydney, Camperdown NSW 2006",
        },
        {
            "user_id": "usr_charlie_demo_003",
            "name": "Charlie Wong",
            "weekly_budget": 200.00,
            "home_address": "UTS Sydney, Broadway NSW 2007",
        },
        {
            "user_id": "usr_diana_demo_004",
            "name": "Diana Patel",
            "weekly_budget": 120.00,
            "home_address": "Macquarie University, North Ryde NSW 2109",
        },
        {
            "user_id": "usr_evan_demo_005",
            "name": "Evan Lee",
            "weekly_budget": 160.00,
            "home_address": "Western Sydney University, Parramatta NSW 2150",
        },
    ]
    
    user_ids = []
    for user_data in demo_users:
        user = User(**user_data)
        db.add(user)
        user_ids.append(user_data["user_id"])
    
    db.commit()
    print(f"✓ Seeded {len(demo_users)} demo users")
    return user_ids


def seed_weekly_plans(db: Session, user_ids: list[str]) -> None:
    """
    Seed demo weekly plan records for leaderboard.
    
    Creates multiple weekly plan records per user with varying optimization scores
    to demonstrate leaderboard ranking. Skips the first user (demo_user_001) as they're
    for frontend API calls only.
    """
    from models.db_models import WeeklyPlan
    
    # Skip demo_user_001, only create plans for leaderboard users
    leaderboard_user_ids = user_ids[1:]  # Skip first user
    
    # Define demo weekly plans with varying performance
    # Format: (user_id_index, optimal_cost, actual_cost)
    # Indices are now relative to leaderboard_user_ids (0-4 instead of 0-5)
    plans = [
        # Alice - Best performer (avg score ~0.35)
        (0, 80.00, 115.00),   # score = (180-115)/180 = 0.361
        (0, 75.00, 120.00),   # score = (180-120)/180 = 0.333
        (0, 85.00, 118.00),   # score = (180-118)/180 = 0.344
        
        # Bob - Good performer (avg score ~0.28)
        (1, 70.00, 108.00),   # score = (150-108)/150 = 0.280
        (1, 65.00, 105.00),   # score = (150-105)/150 = 0.300
        (1, 72.00, 112.00),   # score = (150-112)/150 = 0.253
        
        # Charlie - Average performer (avg score ~0.20)
        (2, 90.00, 160.00),   # score = (200-160)/200 = 0.200
        (2, 88.00, 158.00),   # score = (200-158)/200 = 0.210
        (2, 85.00, 162.00),   # score = (200-162)/200 = 0.190
        
        # Diana - Struggling performer (avg score ~0.10)
        (3, 55.00, 108.00),   # score = (120-108)/120 = 0.100
        (3, 60.00, 110.00),   # score = (120-110)/120 = 0.083
        (3, 58.00, 106.00),   # score = (120-106)/120 = 0.117
        
        # Evan - Moderate performer (avg score ~0.15)
        (4, 68.00, 136.00),   # score = (160-136)/160 = 0.150
        (4, 72.00, 138.00),   # score = (160-138)/160 = 0.138
    ]
    
    # Create WeeklyPlan records
    records = []
    base_date = datetime.utcnow() - timedelta(weeks=4)
    
    for i, (user_idx, optimal_cost, actual_cost) in enumerate(plans):
        # Get the user's budget for score calculation (skip demo_user_001's budget)
        budgets = [180.00, 150.00, 200.00, 120.00, 160.00]
        weekly_budget = budgets[user_idx]
        
        optimization_score = (weekly_budget - actual_cost) / weekly_budget
        
        record = WeeklyPlan(
            user_id=leaderboard_user_ids[user_idx],
            optimal_cost=optimal_cost,
            actual_cost=actual_cost,
            optimization_score=optimization_score,
            created_at=base_date + timedelta(weeks=i // 3)  # Spread across weeks
        )
        records.append(record)
    
    # Bulk insert all records
    db.bulk_save_objects(records)
    db.commit()
    
    print(f"✓ Seeded {len(records)} weekly plan records for leaderboard demo")


def seed_all(db: Session) -> None:
    """
    Seed all demo data for complete application demo.
    
    Seeds:
    - Historical price data (4 weeks for 10 items)
    - Demo users (5 students)
    - Weekly plan records (multiple per user for leaderboard)
    
    Args:
        db: Database session
    """
    # 1. Seed historical prices (required for grocery optimization)
    seed_historical_prices(db)
    
    # 2. Seed demo users and get their IDs
    user_ids = seed_demo_users(db)
    
    # 3. Seed weekly plans for leaderboard
    seed_weekly_plans(db, user_ids)
