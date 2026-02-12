"""
Database configuration and session management.

Uses SQLite in-memory database by default for easy demo/testing.
Can be configured to use Supabase PostgreSQL via DATABASE_URL environment variable.
"""

import os
import time
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError

# Get database URL from environment, default to in-memory SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///:memory:")

# Determine if using SQLite
is_sqlite = DATABASE_URL.startswith("sqlite")

# Create SQLAlchemy engine with appropriate settings
if is_sqlite:
    # SQLite-specific configuration
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},  # Allow multi-threading
        echo=False  # Set to True for SQL query logging
    )
    
    # Enable foreign key constraints for SQLite
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
else:
    # PostgreSQL/Supabase configuration
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Enable connection health checks
        pool_recycle=3600,   # Recycle connections after 1 hour
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create declarative base for ORM models
Base = declarative_base()


def init_db(seed_demo_data: bool = True):
    """
    Initialize database by creating all tables.
    Call this on application startup.
    
    Args:
        seed_demo_data: Whether to seed demo historical price data (default: True)
    """
    from models.db_models import User, WeeklyPlan, HistoricalPriceData
    Base.metadata.create_all(bind=engine)
    
    # Seed demo data if requested (only for in-memory database)
    if seed_demo_data and is_sqlite:
        from seed_data import seed_all
        db = SessionLocal()
        try:
            # Check if data already exists
            existing_count = db.query(HistoricalPriceData).count()
            if existing_count == 0:
                seed_all(db)
        finally:
            db.close()


def get_db():
    """
    Dependency injection for database sessions with retry logic.
    
    Retries connection once on failure before raising exception.
    
    Yields:
        Session: SQLAlchemy database session
        
    Raises:
        OperationalError: If connection fails after retry
    """
    db = None
    retry_count = 0
    max_retries = 1
    
    while retry_count <= max_retries:
        try:
            db = SessionLocal()
            # Test connection (skip for in-memory SQLite)
            if not is_sqlite:
                db.execute("SELECT 1")
            yield db
            break
        except OperationalError as e:
            if db:
                db.close()
            retry_count += 1
            if retry_count > max_retries:
                raise e
            # Wait briefly before retry
            time.sleep(0.5)
        finally:
            if db:
                db.close()
