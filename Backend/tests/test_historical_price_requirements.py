"""
Verification tests for historical price service requirements.

Tests Requirements 8.2, 8.3, 8.4, 8.5, 8.6 from the spec.
"""

import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base
from models.db_models import HistoricalPriceData
from services.historical_price_service import get_historical_average, seed_demo_data


@pytest.fixture
def test_db():
    """Create a test database session."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()


@pytest.mark.asyncio
async def test_requirement_8_2_query_past_4_weeks(test_db):
    """
    Requirement 8.2: WHEN querying historical prices, THE Backend_API SHALL 
    retrieve records from the past 4 weeks.
    """
    item_name = "Test Item"
    
    # Add data within 4 weeks
    within_range = HistoricalPriceData(
        item_name=item_name,
        price=10.0,
        store_name="Store A",
        recorded_date=datetime.utcnow() - timedelta(days=20)
    )
    test_db.add(within_range)
    
    # Add data older than 4 weeks (should be excluded)
    outside_range = HistoricalPriceData(
        item_name=item_name,
        price=50.0,
        store_name="Store A",
        recorded_date=datetime.utcnow() - timedelta(days=35)
    )
    test_db.add(outside_range)
    
    test_db.commit()
    
    # Get average - should only include data from past 4 weeks
    avg = await get_historical_average(test_db, item_name)
    
    assert avg is not None
    # Average should be 10.0, not affected by the 50.0 price from 35 days ago
    assert abs(avg - 10.0) < 0.01


@pytest.mark.asyncio
async def test_requirement_8_3_calculate_mean_across_stores(test_db):
    """
    Requirement 8.3: WHEN calculating average price, THE Backend_API SHALL 
    compute the mean of all price values for an item across all stores.
    """
    item_name = "Test Item"
    
    # Add prices from multiple stores
    prices = [10.0, 12.0, 14.0]
    stores = ["Store A", "Store B", "Store C"]
    
    for price, store in zip(prices, stores):
        record = HistoricalPriceData(
            item_name=item_name,
            price=price,
            store_name=store,
            recorded_date=datetime.utcnow() - timedelta(days=5)
        )
        test_db.add(record)
    
    test_db.commit()
    
    # Get average
    avg = await get_historical_average(test_db, item_name)
    
    assert avg is not None
    expected_avg = sum(prices) / len(prices)  # (10 + 12 + 14) / 3 = 12.0
    assert abs(avg - expected_avg) < 0.01


@pytest.mark.asyncio
async def test_requirement_8_4_no_historical_data(test_db):
    """
    Requirement 8.4: WHEN no historical data exists for an item, THE Backend_API 
    SHALL return the current price without a prediction tag.
    
    (This test verifies the service returns None, allowing the caller to handle it)
    """
    # Query for item with no data
    avg = await get_historical_average(test_db, "Nonexistent Item")
    
    # Should return None when no data exists
    assert avg is None


@pytest.mark.asyncio
async def test_requirement_8_5_seed_5_common_items(test_db):
    """
    Requirement 8.5: THE Backend_API SHALL support seeding the database with 
    demo Historical_Price_Data for at least 5 common grocery items.
    """
    # Seed demo data
    await seed_demo_data(test_db)
    
    # Verify 5 items exist
    expected_items = [
        "Milk (1L)",
        "Bread (Loaf)",
        "Eggs (Dozen)",
        "Chicken Breast (1kg)",
        "Rice (1kg)"
    ]
    
    for item in expected_items:
        count = test_db.query(HistoricalPriceData).filter(
            HistoricalPriceData.item_name == item
        ).count()
        
        # Each item should have records
        assert count > 0, f"Item '{item}' should have historical data"


@pytest.mark.asyncio
async def test_requirement_8_6_4_weeks_realistic_variations(test_db):
    """
    Requirement 8.6: WHEN seeding demo data, THE Backend_API SHALL create 
    4 weeks of price records with realistic price variations.
    """
    await seed_demo_data(test_db)
    
    # Check one item for 4 weeks of data
    item_name = "Milk (1L)"
    records = test_db.query(HistoricalPriceData).filter(
        HistoricalPriceData.item_name == item_name
    ).all()
    
    # Should have 28 days × 3 stores = 84 records
    assert len(records) == 84
    
    # Verify date range spans 4 weeks
    dates = [r.recorded_date for r in records]
    date_range = max(dates) - min(dates)
    assert date_range.days >= 27  # At least 27 days (28 days total)
    
    # Verify realistic price variations (base price for milk is 1.50)
    base_price = 1.50
    for record in records:
        # Prices should be positive
        assert record.price > 0
        # Prices should be within reasonable range (±10% variation means 1.35 to 1.65)
        # But we allow minimum of 0.50, so just check it's not extreme
        assert record.price >= 0.50
        assert record.price <= base_price * 2.0  # Not more than double


@pytest.mark.asyncio
async def test_all_requirements_integration(test_db):
    """
    Integration test verifying all requirements work together.
    """
    # Seed data (Req 8.5, 8.6)
    await seed_demo_data(test_db)
    
    # Query historical average for each item (Req 8.2, 8.3)
    items = ["Milk (1L)", "Bread (Loaf)", "Eggs (Dozen)", "Chicken Breast (1kg)", "Rice (1kg)"]
    
    for item in items:
        avg = await get_historical_average(test_db, item)
        
        # Should have data for all seeded items
        assert avg is not None, f"Should have average for {item}"
        assert avg > 0, f"Average for {item} should be positive"
    
    # Test item with no data (Req 8.4)
    no_data_avg = await get_historical_average(test_db, "Unknown Item")
    assert no_data_avg is None
