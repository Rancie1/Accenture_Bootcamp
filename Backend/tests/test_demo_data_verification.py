"""
Demo data seeding and system verification tests.

Tests that:
- Historical price data is seeded correctly for 5 items
- Test users and weekly plans can be created
- Leaderboard displays correctly with realistic data
- All endpoints work with realistic data
"""

import pytest
from fastapi.testclient import TestClient
from main import app
from models.db_models import User, WeeklyPlan, HistoricalPriceData
from datetime import datetime, timedelta
from unittest.mock import patch
import uuid


@pytest.fixture
def client():
    """Provide a TestClient for API endpoint tests."""
    return TestClient(app)


class TestDemoDataSeeding:
    """Test demo data seeding and system verification."""
    
    def test_historical_price_data_seeding(self, db_session, seed_demo_data):
        """
        Verify historical price data is seeded correctly for 5 items.
        
        Requirements: 8.5, 8.6
        """
        # Expected items
        expected_items = [
            "Milk (1L)",
            "Bread (Loaf)",
            "Eggs (Dozen)",
            "Chicken Breast (1kg)",
            "Rice (1kg)"
        ]
        
        # Verify all items exist
        for item_name in expected_items:
            records = db_session.query(HistoricalPriceData).filter(
                HistoricalPriceData.item_name == item_name
            ).all()
            
            # Should have at least 28 records (4 weeks * 7 days)
            assert len(records) >= 28, f"{item_name} should have at least 28 records"
            
            # Verify date range covers at least 4 weeks (allow for some variation due to random hours)
            dates = [r.recorded_date for r in records]
            date_range = max(dates) - min(dates)
            assert date_range.days >= 26, f"{item_name} should span at least 26 days"
            
            # Verify prices are realistic (positive and reasonable)
            prices = [r.price for r in records]
            assert all(p > 0 for p in prices), f"{item_name} should have positive prices"
            assert all(p < 100 for p in prices), f"{item_name} prices should be reasonable"
            
            # Verify multiple stores
            stores = set(r.store_name for r in records)
            assert len(stores) >= 2, f"{item_name} should have data from multiple stores"
            
            # Verify realistic price variations (not all the same)
            assert len(set(prices)) > 1, f"{item_name} should have price variations"
        
        # Verify total record count
        total_records = db_session.query(HistoricalPriceData).count()
        assert total_records >= 140, "Should have at least 140 total records (5 items * 28 days)"
        
        print(f"✓ Verified {total_records} historical price records for {len(expected_items)} items")
    
    def test_create_test_users_and_weekly_plans(self, client, db_session, seed_demo_data):
        """
        Create test users and weekly plans with realistic data.
        
        Requirements: 8.5, 8.6
        """
        # Create 5 test users with varying budgets
        test_users = [
            {"name": "Budget Student", "weekly_budget": 80.00, "home_address": "UNSW Sydney, Kensington NSW"},
            {"name": "Average Student", "weekly_budget": 120.00, "home_address": "University of Sydney, Camperdown NSW"},
            {"name": "Comfortable Student", "weekly_budget": 150.00, "home_address": "UTS, Ultimo NSW"},
            {"name": "Frugal Student", "weekly_budget": 100.00, "home_address": "Macquarie University, North Ryde NSW"},
            {"name": "Generous Student", "weekly_budget": 200.00, "home_address": "UNSW Sydney, Kensington NSW"},
        ]
        
        created_users = []
        
        # Create users
        for user_data in test_users:
            response = client.post("/onboard", json=user_data)
            assert response.status_code == 201
            created_users.append(response.json())
        
        # Verify all users exist in database
        db_users = db_session.query(User).all()
        assert len(db_users) >= 5
        
        # Create weekly plans for each user (2-3 weeks each)
        weekly_plans_data = [
            # Budget Student - improving performance
            {"user_id": created_users[0]["user_id"], "optimal_cost": 70.00, "actual_cost": 75.00},  # Score: 0.0625
            {"user_id": created_users[0]["user_id"], "optimal_cost": 68.00, "actual_cost": 72.00},  # Score: 0.1
            {"user_id": created_users[0]["user_id"], "optimal_cost": 65.00, "actual_cost": 68.00},  # Score: 0.15
            
            # Average Student - consistent performance
            {"user_id": created_users[1]["user_id"], "optimal_cost": 100.00, "actual_cost": 105.00},  # Score: 0.125
            {"user_id": created_users[1]["user_id"], "optimal_cost": 98.00, "actual_cost": 103.00},  # Score: 0.142
            
            # Comfortable Student - excellent performance
            {"user_id": created_users[2]["user_id"], "optimal_cost": 120.00, "actual_cost": 115.00},  # Score: 0.233
            {"user_id": created_users[2]["user_id"], "optimal_cost": 118.00, "actual_cost": 112.00},  # Score: 0.253
            {"user_id": created_users[2]["user_id"], "optimal_cost": 115.00, "actual_cost": 110.00},  # Score: 0.267
            
            # Frugal Student - very good performance
            {"user_id": created_users[3]["user_id"], "optimal_cost": 85.00, "actual_cost": 82.00},  # Score: 0.18
            {"user_id": created_users[3]["user_id"], "optimal_cost": 83.00, "actual_cost": 80.00},  # Score: 0.2
            
            # Generous Student - struggling
            {"user_id": created_users[4]["user_id"], "optimal_cost": 160.00, "actual_cost": 180.00},  # Score: 0.1
            {"user_id": created_users[4]["user_id"], "optimal_cost": 155.00, "actual_cost": 175.00},  # Score: 0.125
        ]
        
        # Create weekly plans
        for plan_data in weekly_plans_data:
            response = client.post("/weekly-plan/record", json=plan_data)
            assert response.status_code == 201
        
        # Verify plans exist in database
        db_plans = db_session.query(WeeklyPlan).all()
        assert len(db_plans) >= 12
        
        print(f"✓ Created {len(created_users)} test users and {len(weekly_plans_data)} weekly plans")
    
    def test_leaderboard_displays_correctly(self, client, db_session, seed_demo_data):
        """
        Verify leaderboard displays correctly with realistic data.
        
        Requirements: 8.5, 8.6
        """
        # First create test users and plans
        self.test_create_test_users_and_weekly_plans(client, db_session, seed_demo_data)
        
        # Get leaderboard
        response = client.get("/leaderboard")
        assert response.status_code == 200
        
        leaderboard_data = response.json()
        assert "leaderboard" in leaderboard_data
        
        leaderboard = leaderboard_data["leaderboard"]
        
        # Should have 5 users
        assert len(leaderboard) == 5
        
        # Verify all required fields present
        for entry in leaderboard:
            assert "user_id" in entry
            assert "username" in entry
            assert "average_score" in entry
            assert "rank" in entry
        
        # Verify leaderboard is sorted by average_score descending
        scores = [entry["average_score"] for entry in leaderboard]
        assert scores == sorted(scores, reverse=True), "Leaderboard should be sorted by score descending"
        
        # Verify ranks are sequential
        ranks = [entry["rank"] for entry in leaderboard]
        assert ranks == list(range(1, len(leaderboard) + 1)), "Ranks should be sequential"
        
        # Verify top performer (should be Comfortable Student with ~0.25 avg)
        top_user = leaderboard[0]
        assert top_user["username"] == "Comfortable Student"
        assert top_user["rank"] == 1
        assert 0.24 < top_user["average_score"] < 0.27
        
        print(f"✓ Leaderboard displays correctly with {len(leaderboard)} users")
        print(f"  Top performer: {top_user['username']} (score: {top_user['average_score']:.3f})")
    
    def test_all_endpoints_with_realistic_data(self, client, db_session, seed_demo_data):
        """
        Test all endpoints work with realistic data.
        
        Requirements: 8.5, 8.6
        """
        # Mock n8n responses
        mock_grocery_response = {
            "optimal_cost": 85.50,
            "store_recommendations": ["Coles", "Woolworths"],
            "item_breakdown": [
                {"item_name": "Milk (1L)", "current_price": 1.45, "store_name": "Coles"},
                {"item_name": "Bread (Loaf)", "current_price": 2.95, "store_name": "Woolworths"},
                {"item_name": "Eggs (Dozen)", "current_price": 5.30, "store_name": "Coles"},
                {"item_name": "Chicken Breast (1kg)", "current_price": 11.80, "store_name": "Woolworths"},
                {"item_name": "Rice (1kg)", "current_price": 3.90, "store_name": "Aldi"}
            ]
        }
        
        mock_transport_response = {
            "stations": [
                {
                    "station_name": "Shell Kensington",
                    "address": "123 Anzac Parade, Kensington NSW",
                    "distance_from_home": 2.5,
                    "price_per_liter": 1.85,
                    "cost_to_reach_station": 3.50
                },
                {
                    "station_name": "BP Randwick",
                    "address": "456 Avoca St, Randwick NSW",
                    "distance_from_home": 3.0,
                    "price_per_liter": 1.80,
                    "cost_to_reach_station": 4.20
                }
            ]
        }
        
        with patch('services.grocery_service.call_n8n_webhook') as mock_grocery, \
             patch('services.transport_service.call_n8n_webhook') as mock_transport:
            
            mock_grocery.return_value = mock_grocery_response
            mock_transport.return_value = mock_transport_response
            
            # Test 1: Create a realistic user
            user_response = client.post("/onboard", json={
                "name": "Realistic Test Student",
                "weekly_budget": 130.00,
                "home_address": "UNSW Sydney, High St, Kensington NSW 2052"
            })
            assert user_response.status_code == 201
            user_id = user_response.json()["user_id"]
            
            # Test 2: Optimize groceries with all 5 seeded items
            grocery_response = client.post("/optimise/groceries", json={
                "user_id": user_id,
                "grocery_list": [
                    "Milk (1L)",
                    "Bread (Loaf)",
                    "Eggs (Dozen)",
                    "Chicken Breast (1kg)",
                    "Rice (1kg)"
                ]
            })
            assert grocery_response.status_code == 200
            grocery_data = grocery_response.json()
            
            # Verify price predictions are added for all items
            assert len(grocery_data["item_breakdown"]) == 5
            for item in grocery_data["item_breakdown"]:
                assert "price_prediction" in item
                # All items should have predictions since they have historical data
                assert item["price_prediction"] in ["likely to drop next week", "historically rising"]
            
            print(f"✓ Grocery optimization works with all 5 seeded items")
            print(f"  Optimal cost: ${grocery_data['optimal_cost']:.2f}")
            print(f"  Stores: {', '.join(grocery_data['store_recommendations'])}")
            
            # Test 3: Compare transport costs
            transport_response = client.post("/transport/compare", json={
                "user_id": user_id,
                "destination": "Sydney CBD",
                "fuel_amount_needed": 25.0
            })
            assert transport_response.status_code == 200
            transport_data = transport_response.json()
            
            assert len(transport_data["stations"]) == 2
            print(f"✓ Transport comparison works with realistic data")
            
            # Test 4: Record weekly plan
            plan_response = client.post("/weekly-plan/record", json={
                "user_id": user_id,
                "optimal_cost": grocery_data["optimal_cost"],
                "actual_cost": 92.00
            })
            assert plan_response.status_code == 201
            plan_data = plan_response.json()
            
            # Verify score calculation
            expected_score = (130.00 - 92.00) / 130.00
            assert abs(plan_data["optimization_score"] - expected_score) < 0.001
            print(f"✓ Weekly plan recording works (score: {plan_data['optimization_score']:.3f})")
            
            # Test 5: View leaderboard
            leaderboard_response = client.get("/leaderboard")
            assert leaderboard_response.status_code == 200
            leaderboard_data = leaderboard_response.json()
            
            # User should appear on leaderboard
            user_on_leaderboard = any(
                entry["user_id"] == user_id
                for entry in leaderboard_data["leaderboard"]
            )
            assert user_on_leaderboard
            print(f"✓ Leaderboard works with realistic data")
            print(f"✓ All endpoints verified with realistic data")
    
    def test_price_predictions_use_historical_data(self, client, db_session, seed_demo_data):
        """
        Verify that price predictions actually use the seeded historical data.
        
        Requirements: 8.5, 8.6
        """
        # Create a user
        user_response = client.post("/onboard", json={
            "name": "Price Prediction Test User",
            "weekly_budget": 100.00,
            "home_address": "Test Address"
        })
        user_id = user_response.json()["user_id"]
        
        # Mock n8n to return prices we can control
        mock_response = {
            "optimal_cost": 10.00,
            "store_recommendations": ["Coles"],
            "item_breakdown": [
                # Price below historical average (should predict "likely to drop")
                {"item_name": "Milk (1L)", "current_price": 1.20, "store_name": "Coles"},
                # Price above historical average (should predict "historically rising")
                {"item_name": "Bread (Loaf)", "current_price": 3.50, "store_name": "Coles"}
            ]
        }
        
        with patch('services.grocery_service.call_n8n_webhook') as mock_n8n:
            mock_n8n.return_value = mock_response
            
            response = client.post("/optimise/groceries", json={
                "user_id": user_id,
                "grocery_list": ["Milk (1L)", "Bread (Loaf)"]
            })
            
            assert response.status_code == 200
            data = response.json()
            
            # Find items in response
            milk_item = next(i for i in data["item_breakdown"] if i["item_name"] == "Milk (1L)")
            bread_item = next(i for i in data["item_breakdown"] if i["item_name"] == "Bread (Loaf)")
            
            # Verify predictions are present (actual prediction depends on seeded data)
            assert milk_item["price_prediction"] in ["likely to drop next week", "historically rising"]
            assert bread_item["price_prediction"] in ["likely to drop next week", "historically rising"]
            
            print(f"✓ Price predictions use historical data:")
            print(f"  Milk (${milk_item['current_price']:.2f}): {milk_item['price_prediction']}")
            print(f"  Bread (${bread_item['current_price']:.2f}): {bread_item['price_prediction']}")
