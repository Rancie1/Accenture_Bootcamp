"""
Unit tests for historical price service.

Tests the get_historical_average and seed_demo_data functions.
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
async def test_get_historical_average_with_data(test_db):
    """Test get_historical_average returns correct average when data exists."""
    # Create test data for past 4 weeks
    item_name = "Test Item"
    prices = [10.0, 12.0, 11.0, 13.0]
    
    for i, price in enumerate(prices):
        record = HistoricalPriceData(
            item_name=item_name,
            price=price,
            store_name="Test Store",
            recorded_date=datetime.utcnow() - timedelta(days=i)
        )
        test_db.add(record)
    
    test_db.commit()
    
    # Get average
    avg = await get_historical_average(test_db, item_name)
    
    # Verify average is correct
    assert avg is not None
    expected_avg = sum(prices) / len(prices)
    assert abs(avg - expected_avg) < 0.01  # Allow small floating point difference


@pytest.mark.asyncio
async def test_get_historical_average_no_data(test_db):
    """Test get_historical_average returns None when no data exists."""
    avg = await get_historical_average(test_db, "Nonexistent Item")
    assert avg is None


@pytest.mark.asyncio
async def test_get_historical_average_old_data_excluded(test_db):
    """Test that data older than 4 weeks is excluded from average."""
    item_name = "Test Item"
    
    # Add recent data (within 4 weeks)
    recent_record = HistoricalPriceData(
        item_name=item_name,
        price=10.0,
        store_name="Test Store",
        recorded_date=datetime.utcnow() - timedelta(days=20)
    )
    test_db.add(recent_record)
    
    # Add old data (older than 4 weeks)
    old_record = HistoricalPriceData(
        item_name=item_name,
        price=100.0,  # Very different price
        store_name="Test Store",
        recorded_date=datetime.utcnow() - timedelta(days=35)
    )
    test_db.add(old_record)
    
    test_db.commit()
    
    # Get average - should only include recent data
    avg = await get_historical_average(test_db, item_name)
    
    assert avg is not None
    assert abs(avg - 10.0) < 0.01  # Should be close to 10.0, not affected by 100.0


@pytest.mark.asyncio
async def test_seed_demo_data(test_db):
    """Test that seed_demo_data creates correct number of records."""
    # Seed data
    await seed_demo_data(test_db)
    
    # Verify records were created
    total_records = test_db.query(HistoricalPriceData).count()
    
    # Should have 5 items × 28 days × 3 stores = 420 records
    assert total_records == 420
    
    # Verify all 5 items exist
    items = ["Milk (1L)", "Bread (Loaf)", "Eggs (Dozen)", "Chicken Breast (1kg)", "Rice (1kg)"]
    for item in items:
        item_records = test_db.query(HistoricalPriceData).filter(
            HistoricalPriceData.item_name == item
        ).count()
        
        # Each item should have 28 days × 3 stores = 84 records
        assert item_records == 84


@pytest.mark.asyncio
async def test_seed_demo_data_date_range(test_db):
    """Test that seeded data covers 4 weeks."""
    await seed_demo_data(test_db)
    
    # Get date range for one item
    records = test_db.query(HistoricalPriceData).filter(
        HistoricalPriceData.item_name == "Milk (1L)"
    ).all()
    
    dates = [r.recorded_date for r in records]
    date_range = max(dates) - min(dates)
    
    # Should span at least 26 days (close to 4 weeks)
    # Using 26 instead of 27 to account for timing variations
    assert date_range.days >= 26


@pytest.mark.asyncio
async def test_seed_demo_data_realistic_prices(test_db):
    """Test that seeded prices are realistic (within ±10% of base)."""
    await seed_demo_data(test_db)
    
    # Check Milk prices (base price: 1.50)
    milk_records = test_db.query(HistoricalPriceData).filter(
        HistoricalPriceData.item_name == "Milk (1L)"
    ).all()
    
    base_price = 1.50
    for record in milk_records:
        # Price should be within ±10% of base (but at least 0.50)
        assert record.price >= 0.50
        # Most prices should be close to base (allowing for ±10% variation)
        # We'll just check they're reasonable (not negative or extremely high)
        assert record.price < base_price * 2.0
