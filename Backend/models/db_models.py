"""
SQLAlchemy ORM models for database tables.
"""

from datetime import datetime
from sqlalchemy import String, Float, Integer, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class User(Base):
    """User model representing registered students."""
    __tablename__ = "users"

    user_id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    weekly_budget: Mapped[float] = mapped_column(Float, nullable=False)
    home_address: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationship to weekly plans
    weekly_plans: Mapped[list["WeeklyPlan"]] = relationship(back_populates="user")


class WeeklyPlan(Base):
    """Weekly plan model tracking user spending and optimization scores."""
    __tablename__ = "weekly_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.user_id"), nullable=False, index=True)
    optimal_cost: Mapped[float] = mapped_column(Float, nullable=False)
    actual_cost: Mapped[float] = mapped_column(Float, nullable=False)
    optimization_score: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    # Relationship to user
    user: Mapped["User"] = relationship(back_populates="weekly_plans")


class HistoricalPriceData(Base):
    """Historical price data for grocery items."""
    __tablename__ = "historical_price_data"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    item_name: Mapped[str] = mapped_column(String, nullable=False, index=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    store_name: Mapped[str] = mapped_column(String, nullable=False)
    recorded_date: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)

    __table_args__ = (
        Index('idx_historical_price_item_date', 'item_name', 'recorded_date'),
    )
