"""
Pydantic schemas for request/response validation.
"""

from datetime import datetime
from pydantic import BaseModel, Field


# User schemas
class UserOnboardRequest(BaseModel):
    """Request schema for user onboarding."""
    name: str = Field(..., min_length=1)
    weekly_budget: float = Field(..., gt=0)
    home_address: str = Field(..., min_length=1)


class UserResponse(BaseModel):
    """Response schema for user data."""
    user_id: str
    name: str
    weekly_budget: float
    home_address: str
    created_at: datetime

    class Config:
        from_attributes = True


# Grocery optimization schemas
class GroceryOptimizationRequest(BaseModel):
    """Request schema for grocery optimization."""
    user_id: str
    grocery_list: list[str] = Field(..., min_length=1)


class GroceryItem(BaseModel):
    """Schema for individual grocery item with price prediction."""
    item_name: str
    current_price: float
    store_name: str
    price_prediction: str | None = None


class GroceryOptimizationResponse(BaseModel):
    """Response schema for grocery optimization results."""
    optimal_cost: float
    store_recommendations: list[str]
    item_breakdown: list[GroceryItem]


# Transport comparison schemas
class TransportComparisonRequest(BaseModel):
    """Request schema for transport cost comparison."""
    user_id: str
    destination: str = Field(..., min_length=1)
    fuel_amount_needed: float = Field(..., gt=0)


class PetrolStation(BaseModel):
    """Schema for petrol station data."""
    station_name: str
    address: str
    distance_from_home: float
    price_per_liter: float
    cost_to_reach_station: float
    fuel_cost_at_station: float
    total_cost: float


class TransportComparisonResponse(BaseModel):
    """Response schema for transport comparison results."""
    stations: list[PetrolStation]


# Weekly plan schemas
class WeeklyPlanRequest(BaseModel):
    """Request schema for recording weekly plan."""
    user_id: str
    optimal_cost: float = Field(..., ge=0)
    actual_cost: float = Field(..., gt=0)


class WeeklyPlanResponse(BaseModel):
    """Response schema for weekly plan data."""
    id: int
    user_id: str
    optimal_cost: float
    actual_cost: float
    optimization_score: float
    created_at: datetime

    class Config:
        from_attributes = True


# Leaderboard schemas
class LeaderboardEntry(BaseModel):
    """Schema for individual leaderboard entry."""
    user_id: str
    username: str
    average_score: float
    rank: int


class LeaderboardResponse(BaseModel):
    """Response schema for leaderboard data."""
    leaderboard: list[LeaderboardEntry]
