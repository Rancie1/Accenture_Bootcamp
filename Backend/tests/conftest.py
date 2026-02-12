"""
Pytest configuration and fixtures for test suite.

Provides shared database fixtures with proper setup and cleanup.
"""

import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from database import Base
from models.db_models import User, WeeklyPlan, HistoricalPriceData


# Use a file-based SQLite database for tests so it persists across connections
TEST_DATABASE_URL = "sqlite:///./test.db"

# Create test engine
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Enable foreign key constraints for SQLite test database
@event.listens_for(test_engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

# Create test session factory
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function", autouse=True)
def setup_database():
    """
    Setup and teardown database for each test function.
    
    This fixture:
    1. Creates all tables before each test
    2. Yields control to the test
    3. Drops all tables after each test (cleanup)
    
    autouse=True means this runs automatically for every test.
    """
    # Create all tables
    Base.metadata.create_all(bind=test_engine)
    
    yield
    
    # Drop all tables (cleanup)
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def db_session():
    """
    Provide a database session for tests.
    
    Returns a session connected to the test database.
    Session is automatically closed after the test.
    """
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def seed_demo_data(db_session):
    """
    Seed demo historical price data for tests that need it.
    
    Creates 4 weeks of historical price data for 5 common items.
    """
    from seed_data import seed_historical_prices
    seed_historical_prices(db_session)
    return db_session


# Override the database dependency for FastAPI TestClient
from fastapi.testclient import TestClient
from main import app
from database import get_db


def override_get_db():
    """Override get_db dependency to use test database."""
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Apply the override
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="module")
def client():
    """
    Provide a TestClient for API endpoint tests.
    
    This client uses the test database via the dependency override.
    """
    return TestClient(app)
