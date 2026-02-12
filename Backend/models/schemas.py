"""
Pydantic schemas for request/response validation.
"""

from datetime import datetime
from pydantic import BaseModel, Field


# User schemas
class UserOnboardRequest(BaseModel):
    """Request schema for user onboarding."""
    name: str = Field(..., min_length=1, description="User's full name", examples=["John Smith"])
    weekly_budget: float = Field(..., gt=0, description="Weekly budget in dollars", examples=[150.00])
    home_address: str = Field(..., min_length=1, description="User's home address", examples=["123 University Ave, Sydney NSW 2000"])


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
    user_id: str = Field(..., description="User identifier from onboarding", examples=["usr_abc123def456"])
    grocery_list: list[str] = Field(..., min_length=1, description="List of grocery item names", examples=[["Milk (1L)", "Bread (Loaf)", "Eggs (Dozen)"]])


class GroceryItem(BaseModel):
    """Schema for individual grocery item with price prediction."""
    item_name: str = Field(..., description="Name of the grocery item", examples=["Milk (1L)"])
    current_price: float = Field(..., description="Current price at recommended store", examples=[3.50])
    store_name: str = Field(..., description="Store with best price", examples=["Woolworths"])
    price_prediction: str | None = Field(None, description="Price trend prediction based on historical data", examples=["likely to drop next week"])


class GroceryOptimizationResponse(BaseModel):
    """Response schema for grocery optimization results."""
    optimal_cost: float
    store_recommendations: list[str]
    item_breakdown: list[GroceryItem]
    conversational_response: str | None = Field(None, description="Natural language response from n8n agent")
    needs_clarification: bool | None = Field(False, description="Whether the agent needs more information from user")


# Transport comparison schemas
class TransportComparisonRequest(BaseModel):
    """Request schema for transport cost comparison."""
    user_id: str = Field(..., description="User identifier from onboarding", examples=["usr_abc123def456"])
    destination: str = Field(..., min_length=1, description="Destination address", examples=["UNSW Sydney, Kensington NSW 2052"])
    fuel_amount_needed: float = Field(..., gt=0, description="Liters of fuel needed", examples=[40.0])


class PetrolStation(BaseModel):
    """Schema for petrol station data."""
    station_name: str = Field(..., description="Name of the petrol station", examples=["7-Eleven Kensington"])
    address: str = Field(..., description="Station address", examples=["456 Anzac Parade, Kensington NSW 2033"])
    distance_from_home: float = Field(..., description="Distance from user's home in kilometers", examples=[2.5])
    price_per_liter: float = Field(..., description="Fuel price per liter at this station", examples=[1.85])
    cost_to_reach_station: float = Field(..., description="Fuel cost to drive to this station", examples=[0.50])
    fuel_cost_at_station: float = Field(..., description="Cost of fuel purchase at this station", examples=[74.00])
    total_cost: float = Field(..., description="Total cost (cost_to_reach + fuel_cost_at_station)", examples=[74.50])


class TransportComparisonResponse(BaseModel):
    """Response schema for transport comparison results."""
    stations: list[PetrolStation]
    conversational_response: str | None = Field(None, description="Natural language response from n8n fuel agent")
    location_details: str | None = Field(None, description="Location information from n8n location agent")
    has_error: bool | None = Field(False, description="Whether the fuel price service encountered an error")


# Weekly plan schemas
class WeeklyPlanRequest(BaseModel):
    """Request schema for recording weekly plan."""
    user_id: str = Field(..., description="User identifier from onboarding", examples=["usr_abc123def456"])
    optimal_cost: float = Field(..., ge=0, description="Optimal cost from grocery optimization", examples=[85.50])
    actual_cost: float = Field(..., gt=0, description="Amount actually spent", examples=[92.30])


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


# Error response schemas
class ErrorDetail(BaseModel):
    """Schema for field-specific error details."""
    field: str | None = None
    message: str


class ErrorResponse(BaseModel):
    """
    Standardized error response format.
    
    All error responses from the API follow this consistent structure
    to ensure predictable error handling on the client side.
    """
    error_code: str = Field(..., description="Machine-readable error code")
    message: str = Field(..., description="Human-readable error message")
    details: dict | None = Field(None, description="Additional error context")
