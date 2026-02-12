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
    
    Creates 21 demo users (20 for leaderboard + 1 for frontend) with realistic data and fixed user_ids.
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
        {
            "user_id": "usr_fiona_demo_006",
            "name": "Fiona Smith",
            "weekly_budget": 140.00,
            "home_address": "University of Technology Sydney, Ultimo NSW 2007",
        },
        {
            "user_id": "usr_george_demo_007",
            "name": "George Kim",
            "weekly_budget": 175.00,
            "home_address": "Australian Catholic University, North Sydney NSW 2060",
        },
        {
            "user_id": "usr_hannah_demo_008",
            "name": "Hannah Brown",
            "weekly_budget": 130.00,
            "home_address": "University of Wollongong, Wollongong NSW 2522",
        },
        {
            "user_id": "usr_isaac_demo_009",
            "name": "Isaac Nguyen",
            "weekly_budget": 190.00,
            "home_address": "University of Newcastle, Callaghan NSW 2308",
        },
        {
            "user_id": "usr_julia_demo_010",
            "name": "Julia Garcia",
            "weekly_budget": 155.00,
            "home_address": "Charles Sturt University, Bathurst NSW 2795",
        },
        {
            "user_id": "usr_kevin_demo_011",
            "name": "Kevin O'Brien",
            "weekly_budget": 165.00,
            "home_address": "Southern Cross University, Lismore NSW 2480",
        },
        {
            "user_id": "usr_lily_demo_012",
            "name": "Lily Zhang",
            "weekly_budget": 145.00,
            "home_address": "University of New England, Armidale NSW 2351",
        },
        {
            "user_id": "usr_marcus_demo_013",
            "name": "Marcus Johnson",
            "weekly_budget": 185.00,
            "home_address": "UNSW Sydney, Kensington NSW 2052",
        },
        {
            "user_id": "usr_nina_demo_014",
            "name": "Nina Patel",
            "weekly_budget": 125.00,
            "home_address": "University of Sydney, Camperdown NSW 2006",
        },
        {
            "user_id": "usr_oliver_demo_015",
            "name": "Oliver Wilson",
            "weekly_budget": 170.00,
            "home_address": "UTS Sydney, Broadway NSW 2007",
        },
        {
            "user_id": "usr_priya_demo_016",
            "name": "Priya Singh",
            "weekly_budget": 135.00,
            "home_address": "Macquarie University, North Ryde NSW 2109",
        },
        {
            "user_id": "usr_quinn_demo_017",
            "name": "Quinn Taylor",
            "weekly_budget": 195.00,
            "home_address": "Western Sydney University, Parramatta NSW 2150",
        },
        {
            "user_id": "usr_rachel_demo_018",
            "name": "Rachel Lee",
            "weekly_budget": 150.00,
            "home_address": "University of Technology Sydney, Ultimo NSW 2007",
        },
        {
            "user_id": "usr_sam_demo_019",
            "name": "Sam Anderson",
            "weekly_budget": 160.00,
            "home_address": "Australian Catholic University, North Sydney NSW 2060",
        },
        {
            "user_id": "usr_tina_demo_020",
            "name": "Tina Rodriguez",
            "weekly_budget": 140.00,
            "home_address": "University of Wollongong, Wollongong NSW 2522",
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
    
    # Define budgets for each user (matching seed_demo_users order, excluding demo_user_001)
    budgets = [180.00, 150.00, 200.00, 120.00, 160.00, 140.00, 175.00, 130.00, 190.00, 155.00,
               165.00, 145.00, 185.00, 125.00, 170.00, 135.00, 195.00, 150.00, 160.00, 140.00]
    
    # Define demo weekly plans with varying performance
    # Format: (user_id_index, optimal_cost, actual_cost)
    # Creating 2-3 records per user for realistic averages
    plans = [
        # Alice - Top performer (avg score ~0.35)
        (0, 80.00, 115.00),   # score = (180-115)/180 = 0.361
        (0, 75.00, 120.00),   # score = (180-120)/180 = 0.333
        (0, 85.00, 118.00),   # score = (180-118)/180 = 0.344
        
        # Bob - Excellent (avg score ~0.28)
        (1, 70.00, 108.00),   # score = (150-108)/150 = 0.280
        (1, 65.00, 105.00),   # score = (150-105)/150 = 0.300
        (1, 72.00, 112.00),   # score = (150-112)/150 = 0.253
        
        # Charlie - Very Good (avg score ~0.20)
        (2, 90.00, 160.00),   # score = (200-160)/200 = 0.200
        (2, 88.00, 158.00),   # score = (200-158)/200 = 0.210
        (2, 85.00, 162.00),   # score = (200-162)/200 = 0.190
        
        # Diana - Good (avg score ~0.10)
        (3, 55.00, 108.00),   # score = (120-108)/120 = 0.100
        (3, 60.00, 110.00),   # score = (120-110)/120 = 0.083
        (3, 58.00, 106.00),   # score = (120-106)/120 = 0.117
        
        # Evan - Above Average (avg score ~0.15)
        (4, 68.00, 136.00),   # score = (160-136)/160 = 0.150
        (4, 72.00, 138.00),   # score = (160-138)/160 = 0.138
        (4, 70.00, 134.00),   # score = (160-134)/160 = 0.163
        
        # Fiona - Strong (avg score ~0.25)
        (5, 60.00, 105.00),   # score = (140-105)/140 = 0.250
        (5, 62.00, 108.00),   # score = (140-108)/140 = 0.229
        (5, 58.00, 102.00),   # score = (140-102)/140 = 0.271
        
        # George - Excellent (avg score ~0.30)
        (6, 75.00, 122.50),   # score = (175-122.5)/175 = 0.300
        (6, 78.00, 125.00),   # score = (175-125)/175 = 0.286
        (6, 72.00, 120.00),   # score = (175-120)/175 = 0.314
        
        # Hannah - Average (avg score ~0.18)
        (7, 58.00, 106.60),   # score = (130-106.6)/130 = 0.180
        (7, 60.00, 108.00),   # score = (130-108)/130 = 0.169
        (7, 56.00, 104.00),   # score = (130-104)/130 = 0.200
        
        # Isaac - Top Tier (avg score ~0.32)
        (8, 85.00, 129.20),   # score = (190-129.2)/190 = 0.320
        (8, 88.00, 132.00),   # score = (190-132)/190 = 0.305
        (8, 82.00, 126.00),   # score = (190-126)/190 = 0.337
        
        # Julia - Good (avg score ~0.22)
        (9, 68.00, 120.90),   # score = (155-120.9)/155 = 0.220
        (9, 70.00, 122.00),   # score = (155-122)/155 = 0.213
        (9, 65.00, 118.00),   # score = (155-118)/155 = 0.239
        
        # Kevin - Strong (avg score ~0.24)
        (10, 72.00, 125.40),  # score = (165-125.4)/165 = 0.240
        (10, 75.00, 128.00),  # score = (165-128)/165 = 0.224
        (10, 70.00, 122.00),  # score = (165-122)/165 = 0.261
        
        # Lily - Above Average (avg score ~0.19)
        (11, 63.00, 117.45),  # score = (145-117.45)/145 = 0.190
        (11, 65.00, 119.00),  # score = (145-119)/145 = 0.179
        (11, 60.00, 115.00),  # score = (145-115)/145 = 0.207
        
        # Marcus - Very Strong (avg score ~0.29)
        (12, 82.00, 131.35),  # score = (185-131.35)/185 = 0.290
        (12, 85.00, 134.00),  # score = (185-134)/185 = 0.276
        (12, 80.00, 128.00),  # score = (185-128)/185 = 0.308
        
        # Nina - Moderate (avg score ~0.12)
        (13, 55.00, 110.00),  # score = (125-110)/125 = 0.120
        (13, 58.00, 112.00),  # score = (125-112)/125 = 0.104
        (13, 52.00, 108.00),  # score = (125-108)/125 = 0.136
        
        # Oliver - Strong (avg score ~0.26)
        (14, 75.00, 125.80),  # score = (170-125.8)/170 = 0.260
        (14, 78.00, 128.00),  # score = (170-128)/170 = 0.247
        (14, 72.00, 122.00),  # score = (170-122)/170 = 0.282
        
        # Priya - Average (avg score ~0.16)
        (15, 60.00, 113.40),  # score = (135-113.4)/135 = 0.160
        (15, 62.00, 115.00),  # score = (135-115)/135 = 0.148
        (15, 58.00, 111.00),  # score = (135-111)/135 = 0.178
        
        # Quinn - Top Performer (avg score ~0.33)
        (16, 88.00, 130.65),  # score = (195-130.65)/195 = 0.330
        (16, 90.00, 133.00),  # score = (195-133)/195 = 0.318
        (16, 85.00, 127.00),  # score = (195-127)/195 = 0.349
        
        # Rachel - Good (avg score ~0.21)
        (17, 68.00, 118.50),  # score = (150-118.5)/150 = 0.210
        (17, 70.00, 120.00),  # score = (150-120)/150 = 0.200
        (17, 65.00, 116.00),  # score = (150-116)/150 = 0.227
        
        # Sam - Above Average (avg score ~0.17)
        (18, 70.00, 132.80),  # score = (160-132.8)/160 = 0.170
        (18, 72.00, 134.00),  # score = (160-134)/160 = 0.163
        (18, 68.00, 131.00),  # score = (160-131)/160 = 0.181
        
        # Tina - Average (avg score ~0.14)
        (19, 62.00, 120.40),  # score = (140-120.4)/140 = 0.140
        (19, 65.00, 122.00),  # score = (140-122)/140 = 0.129
        (19, 60.00, 118.00),  # score = (140-118)/140 = 0.157
    ]
    
    # Create WeeklyPlan records
    records = []
    base_date = datetime.utcnow() - timedelta(weeks=4)
    
    for i, (user_idx, optimal_cost, actual_cost) in enumerate(plans):
        weekly_budget = budgets[user_idx]
        optimization_score = (weekly_budget - actual_cost) / weekly_budget
        
        record = WeeklyPlan(
            user_id=leaderboard_user_ids[user_idx],
            optimal_cost=optimal_cost,
            actual_cost=actual_cost,
            optimization_score=optimization_score,
            created_at=base_date + timedelta(weeks=i // 10)  # Spread across weeks
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
