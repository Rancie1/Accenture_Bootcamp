"""
Debug test to see what's happening with grocery optimization
"""

from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from main import app
from database import SessionLocal, init_db
from models.db_models import User
import uuid

# Initialize database
init_db(seed_demo_data=True)

client = TestClient(app)

# Create a test user
db = SessionLocal()
user_id = str(uuid.uuid4())
user = User(
    user_id=user_id,
    name="Test User",
    weekly_budget=200.0,
    home_address="123 Test St, Sydney NSW 2000"
)
db.add(user)
db.commit()
db.refresh(user)

print(f"Created test user: {user.user_id}")

# Test with mock - patch where it's USED, not where it's defined
with patch('services.n8n_service.call_n8n_webhook', new_callable=AsyncMock) as mock_n8n:
    mock_n8n.return_value = {
        "optimal_cost": 15.50,
        "store_recommendations": ["Coles"],
        "item_breakdown": [
            {
                "item_name": "Milk (1L)",
                "current_price": 1.40,
                "store_name": "Coles"
            }
        ]
    }
    
    response = client.post(
        "/optimise/groceries",
        json={
            "user_id": user.user_id,
            "grocery_list": ["Milk (1L)"]
        }
    )
    
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.json()}")
    print(f"Mock called: {mock_n8n.called}")
    print(f"Mock call count: {mock_n8n.call_count}")

db.close()
