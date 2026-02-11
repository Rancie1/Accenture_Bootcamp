"""
Integration tests for grocery optimization endpoint.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from main import app
from database import get_db, init_db
from models.db_models import User
import uuid

# Initialize database before tests
init_db(seed_demo_data=True)

client = TestClient(app)


def test_grocery_optimization_endpoint_validation_empty_list():
    """Test that empty grocery list is rejected with 422 validation error"""
    response = client.post(
        "/optimise/groceries",
        json={
            "user_id": "test-user-id",
            "grocery_list": []
        }
    )
    assert response.status_code == 422  # Pydantic validation error


def test_grocery_optimization_endpoint_user_not_found():
    """Test that non-existent user returns 404 or 500"""
    response = client.post(
        "/optimise/groceries",
        json={
            "user_id": "non-existent-user-id",
            "grocery_list": ["Milk (1L)", "Bread (Loaf)"]
        }
    )
    # Should return 404 for non-existent user or 500 for database error
    assert response.status_code in [404, 500]


@patch('services.n8n_service.call_n8n_webhook', new_callable=AsyncMock)
def test_grocery_optimization_endpoint_success(mock_n8n):
    """Test successful grocery optimization with price predictions"""
    # Create a test user using the app's database
    from database import SessionLocal
    db = SessionLocal()
    try:
        user_id = str(uuid.uuid4())
        user = User(
            user_id=user_id,
            name="Test User",
            weekly_budget=200.0,
            home_address="123 Test St, Sydney NSW 2000"
        )
        db.add(user)
        db.commit()
        
        # Mock n8n response - AsyncMock automatically handles async functions
        mock_n8n.return_value = {
            "optimal_cost": 15.50,
            "store_recommendations": ["Coles", "Woolworths"],
            "item_breakdown": [
                {
                    "item_name": "Milk (1L)",
                    "current_price": 1.40,
                    "store_name": "Coles"
                },
                {
                    "item_name": "Bread (Loaf)",
                    "current_price": 3.20,
                    "store_name": "Woolworths"
                }
            ]
        }
        
        response = client.post(
            "/optimise/groceries",
            json={
                "user_id": user_id,
                "grocery_list": ["Milk (1L)", "Bread (Loaf)"]
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "optimal_cost" in data
        assert "store_recommendations" in data
        assert "item_breakdown" in data
        
        # Verify items have price predictions
        assert len(data["item_breakdown"]) == 2
        for item in data["item_breakdown"]:
            assert "item_name" in item
            assert "current_price" in item
            assert "store_name" in item
            assert "price_prediction" in item
    finally:
        db.close()


@patch('services.n8n_service.call_n8n_webhook', new_callable=AsyncMock)
def test_grocery_optimization_with_price_predictions(mock_n8n):
    """Test that price predictions are correctly added based on historical data"""
    # Create a test user
    from database import SessionLocal
    db = SessionLocal()
    try:
        user_id = str(uuid.uuid4())
        user = User(
            user_id=user_id,
            name="Test User",
            weekly_budget=200.0,
            home_address="123 Test St, Sydney NSW 2000"
        )
        db.add(user)
        db.commit()
        
        # Mock n8n response with items that have historical data - AsyncMock handles async
        mock_n8n.return_value = {
            "optimal_cost": 10.00,
            "store_recommendations": ["Coles"],
            "item_breakdown": [
                {
                    "item_name": "Milk (1L)",
                    "current_price": 1.30,  # Below average (should be ~1.50)
                    "store_name": "Coles"
                },
                {
                    "item_name": "Bread (Loaf)",
                    "current_price": 3.50,  # Above average (should be ~3.00)
                    "store_name": "Coles"
                }
            ]
        }
        
        response = client.post(
            "/optimise/groceries",
            json={
                "user_id": user_id,
                "grocery_list": ["Milk (1L)", "Bread (Loaf)"]
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check that price predictions are present
        milk_item = next(item for item in data["item_breakdown"] if item["item_name"] == "Milk (1L)")
        bread_item = next(item for item in data["item_breakdown"] if item["item_name"] == "Bread (Loaf)")
        
        # Milk is below average, should predict drop
        assert milk_item["price_prediction"] == "likely to drop next week"
        
        # Bread is above average, should predict rising
        assert bread_item["price_prediction"] == "historically rising"
    finally:
        db.close()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
