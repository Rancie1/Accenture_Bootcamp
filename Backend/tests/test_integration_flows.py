"""
Integration tests for full user flows.

Tests complete user journeys through the system:
- Onboard → Optimize Groceries → Record Plan → View Leaderboard
- Onboard → Compare Transport
- Concurrent user operations
"""

import pytest
from fastapi.testclient import TestClient
from main import app
from models.db_models import User, WeeklyPlan
from unittest.mock import patch, MagicMock
import uuid
import threading
import time


@pytest.fixture
def client():
    """Provide a TestClient for API endpoint tests."""
    from fastapi.testclient import TestClient
    return TestClient(app)


@pytest.fixture
def mock_n8n_grocery_response():
    """Mock n8n grocery optimization response."""
    return {
        "optimal_cost": 45.50,
        "store_recommendations": ["Coles", "Woolworths"],
        "item_breakdown": [
            {
                "item_name": "Milk (1L)",
                "current_price": 1.40,
                "store_name": "Coles"
            },
            {
                "item_name": "Bread (Loaf)",
                "current_price": 2.80,
                "store_name": "Woolworths"
            },
            {
                "item_name": "Eggs (Dozen)",
                "current_price": 5.20,
                "store_name": "Coles"
            }
        ]
    }


@pytest.fixture
def mock_n8n_transport_response():
    """Mock n8n transport comparison response."""
    return {
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


class TestFullUserFlows:
    """Test complete user journeys through the system."""
    
    def test_complete_grocery_optimization_flow(
        self, 
        client, 
        db_session, 
        seed_demo_data,
        mock_n8n_grocery_response
    ):
        """
        Test: onboard → optimize groceries → record plan → view leaderboard
        
        This tests the complete flow of a user:
        1. Creating an account
        2. Optimizing their grocery list
        3. Recording their actual spending
        4. Appearing on the leaderboard
        """
        # Mock n8n service - need to patch where it's imported, not where it's defined
        with patch('services.grocery_service.call_n8n_webhook') as mock_n8n:
            mock_n8n.return_value = mock_n8n_grocery_response
            
            # Step 1: Onboard user
            onboard_response = client.post("/onboard", json={
                "name": "Integration Test User",
                "weekly_budget": 100.00,
                "home_address": "UNSW Sydney, Kensington NSW 2052"
            })
            
            assert onboard_response.status_code == 201
            user_data = onboard_response.json()
            user_id = user_data["user_id"]
            assert user_data["name"] == "Integration Test User"
            assert user_data["weekly_budget"] == 100.00
            
            # Verify user exists in database
            user = db_session.query(User).filter(User.user_id == user_id).first()
            assert user is not None
            assert user.name == "Integration Test User"
            
            # Step 2: Optimize groceries
            grocery_response = client.post("/optimise/groceries", json={
                "user_id": user_id,
                "grocery_list": ["Milk (1L)", "Bread (Loaf)", "Eggs (Dozen)"]
            })
            
            assert grocery_response.status_code == 200
            grocery_data = grocery_response.json()
            assert grocery_data["optimal_cost"] == 45.50
            assert len(grocery_data["item_breakdown"]) == 3
            
            # Verify price predictions are added
            for item in grocery_data["item_breakdown"]:
                assert "price_prediction" in item
                # Price predictions should be present for items with historical data
                if item["item_name"] in ["Milk (1L)", "Bread (Loaf)", "Eggs (Dozen)"]:
                    assert item["price_prediction"] in [
                        "likely to drop next week",
                        "historically rising",
                        None
                    ]
            
            # Step 3: Record weekly plan
            optimal_cost = grocery_data["optimal_cost"]
            actual_cost = 50.00  # User spent slightly more than optimal
            
            plan_response = client.post("/weekly-plan/record", json={
                "user_id": user_id,
                "optimal_cost": optimal_cost,
                "actual_cost": actual_cost
            })
            
            assert plan_response.status_code == 201
            plan_data = plan_response.json()
            assert plan_data["user_id"] == user_id
            assert plan_data["optimal_cost"] == optimal_cost
            assert plan_data["actual_cost"] == actual_cost
            
            # Verify optimization score calculation
            expected_score = (100.00 - actual_cost) / 100.00
            assert abs(plan_data["optimization_score"] - expected_score) < 0.001
            
            # Verify plan exists in database
            plan = db_session.query(WeeklyPlan).filter(
                WeeklyPlan.user_id == user_id
            ).first()
            assert plan is not None
            assert plan.actual_cost == actual_cost
            
            # Step 4: View leaderboard
            leaderboard_response = client.get("/leaderboard")
            
            assert leaderboard_response.status_code == 200
            leaderboard_data = leaderboard_response.json()
            assert "leaderboard" in leaderboard_data
            
            # User should appear on leaderboard
            user_entries = [
                entry for entry in leaderboard_data["leaderboard"]
                if entry["user_id"] == user_id
            ]
            assert len(user_entries) == 1
            assert user_entries[0]["username"] == "Integration Test User"
            assert abs(user_entries[0]["average_score"] - expected_score) < 0.001
            assert user_entries[0]["rank"] == 1  # Only user on leaderboard
    
    def test_transport_comparison_flow(
        self,
        client,
        db_session,
        mock_n8n_transport_response
    ):
        """
        Test: onboard → compare transport
        
        This tests the flow of a user:
        1. Creating an account
        2. Comparing transport costs for fuel
        """
        # Mock n8n service - need to patch where it's imported, not where it's defined
        with patch('services.transport_service.call_n8n_webhook') as mock_n8n:
            mock_n8n.return_value = mock_n8n_transport_response
            
            # Step 1: Onboard user
            onboard_response = client.post("/onboard", json={
                "name": "Transport Test User",
                "weekly_budget": 150.00,
                "home_address": "UNSW Sydney, Kensington NSW 2052"
            })
            
            assert onboard_response.status_code == 201
            user_data = onboard_response.json()
            user_id = user_data["user_id"]
            
            # Step 2: Compare transport costs
            transport_response = client.post("/transport/compare", json={
                "user_id": user_id,
                "destination": "Sydney CBD",
                "fuel_amount_needed": 20.0
            })
            
            assert transport_response.status_code == 200
            transport_data = transport_response.json()
            assert "stations" in transport_data
            assert len(transport_data["stations"]) == 2
            
            # Verify total cost calculation
            stations = transport_data["stations"]
            for station in stations:
                expected_fuel_cost = 20.0 * station["price_per_liter"]
                assert abs(station["fuel_cost_at_station"] - expected_fuel_cost) < 0.01
                
                expected_total = station["cost_to_reach_station"] + expected_fuel_cost
                assert abs(station["total_cost"] - expected_total) < 0.01
            
            # Verify stations are sorted by total cost (ascending)
            total_costs = [s["total_cost"] for s in stations]
            assert total_costs == sorted(total_costs)
    
    def test_concurrent_user_operations(self, client, db_session, seed_demo_data):
        """
        Test: concurrent user operations
        
        This tests that multiple users can perform operations simultaneously
        without data corruption or race conditions.
        """
        results = []
        errors = []
        
        def create_user_and_record_plan(user_name, budget, actual_cost):
            """Helper function to create user and record plan in a thread."""
            try:
                # Create user
                onboard_response = client.post("/onboard", json={
                    "name": user_name,
                    "weekly_budget": budget,
                    "home_address": f"Address for {user_name}"
                })
                
                if onboard_response.status_code != 201:
                    errors.append(f"Failed to create {user_name}: {onboard_response.text}")
                    return
                
                user_id = onboard_response.json()["user_id"]
                
                # Record weekly plan
                plan_response = client.post("/weekly-plan/record", json={
                    "user_id": user_id,
                    "optimal_cost": budget * 0.8,  # Optimal is 80% of budget
                    "actual_cost": actual_cost
                })
                
                if plan_response.status_code != 201:
                    errors.append(f"Failed to record plan for {user_name}: {plan_response.text}")
                    return
                
                results.append({
                    "user_name": user_name,
                    "user_id": user_id,
                    "plan_data": plan_response.json()
                })
            except Exception as e:
                errors.append(f"Exception for {user_name}: {str(e)}")
        
        # Create multiple threads to simulate concurrent users
        threads = []
        user_configs = [
            ("Concurrent User 1", 100.00, 85.00),
            ("Concurrent User 2", 150.00, 120.00),
            ("Concurrent User 3", 200.00, 180.00),
            ("Concurrent User 4", 120.00, 100.00),
            ("Concurrent User 5", 180.00, 150.00),
        ]
        
        for user_name, budget, actual_cost in user_configs:
            thread = threading.Thread(
                target=create_user_and_record_plan,
                args=(user_name, budget, actual_cost)
            )
            threads.append(thread)
        
        # Start all threads simultaneously
        for thread in threads:
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Verify no errors occurred
        assert len(errors) == 0, f"Errors during concurrent operations: {errors}"
        
        # Verify all users were created successfully
        assert len(results) == 5
        
        # Verify all users have unique IDs
        user_ids = [r["user_id"] for r in results]
        assert len(user_ids) == len(set(user_ids)), "Duplicate user IDs detected"
        
        # Verify all users appear in database
        for result in results:
            user = db_session.query(User).filter(
                User.user_id == result["user_id"]
            ).first()
            assert user is not None
            assert user.name == result["user_name"]
            
            plan = db_session.query(WeeklyPlan).filter(
                WeeklyPlan.user_id == result["user_id"]
            ).first()
            assert plan is not None
        
        # Verify leaderboard includes all users
        leaderboard_response = client.get("/leaderboard")
        assert leaderboard_response.status_code == 200
        leaderboard_data = leaderboard_response.json()
        
        assert len(leaderboard_data["leaderboard"]) == 5
        
        # Verify leaderboard is properly sorted
        scores = [entry["average_score"] for entry in leaderboard_data["leaderboard"]]
        assert scores == sorted(scores, reverse=True)
        
        # Verify ranks are sequential
        ranks = [entry["rank"] for entry in leaderboard_data["leaderboard"]]
        assert ranks == list(range(1, 6))
    
    def test_multiple_weekly_plans_affect_leaderboard(
        self,
        client,
        db_session
    ):
        """
        Test that recording multiple weekly plans correctly updates leaderboard averages.
        """
        # Create two users
        user1_response = client.post("/onboard", json={
            "name": "Consistent User",
            "weekly_budget": 100.00,
            "home_address": "Address 1"
        })
        user1_id = user1_response.json()["user_id"]
        
        user2_response = client.post("/onboard", json={
            "name": "Improving User",
            "weekly_budget": 100.00,
            "home_address": "Address 2"
        })
        user2_id = user2_response.json()["user_id"]
        
        # User 1: Record 3 consistent weeks (score = 0.3 each)
        for _ in range(3):
            client.post("/weekly-plan/record", json={
                "user_id": user1_id,
                "optimal_cost": 60.00,
                "actual_cost": 70.00  # Score: (100-70)/100 = 0.3
            })
        
        # User 2: Record 3 improving weeks
        client.post("/weekly-plan/record", json={
            "user_id": user2_id,
            "optimal_cost": 60.00,
            "actual_cost": 90.00  # Score: 0.1
        })
        client.post("/weekly-plan/record", json={
            "user_id": user2_id,
            "optimal_cost": 60.00,
            "actual_cost": 80.00  # Score: 0.2
        })
        client.post("/weekly-plan/record", json={
            "user_id": user2_id,
            "optimal_cost": 60.00,
            "actual_cost": 50.00  # Score: 0.5
        })
        
        # Check leaderboard
        leaderboard_response = client.get("/leaderboard")
        leaderboard_data = leaderboard_response.json()["leaderboard"]
        
        # User 1 average: 0.3
        # User 2 average: (0.1 + 0.2 + 0.5) / 3 = 0.267
        # User 1 should rank higher
        
        assert len(leaderboard_data) == 2
        assert leaderboard_data[0]["user_id"] == user1_id
        assert leaderboard_data[0]["rank"] == 1
        assert abs(leaderboard_data[0]["average_score"] - 0.3) < 0.001
        
        assert leaderboard_data[1]["user_id"] == user2_id
        assert leaderboard_data[1]["rank"] == 2
        assert abs(leaderboard_data[1]["average_score"] - 0.267) < 0.01
    
    def test_error_handling_in_flow(self, client, db_session):
        """
        Test that errors in one step don't corrupt the system state.
        """
        # Create a user
        onboard_response = client.post("/onboard", json={
            "name": "Error Test User",
            "weekly_budget": 100.00,
            "home_address": "Test Address"
        })
        user_id = onboard_response.json()["user_id"]
        
        # Try to record plan with invalid data (negative actual_cost)
        invalid_plan_response = client.post("/weekly-plan/record", json={
            "user_id": user_id,
            "optimal_cost": 80.00,
            "actual_cost": -10.00  # Invalid
        })
        
        assert invalid_plan_response.status_code == 400  # Validation error
        
        # Verify no plan was created
        plans = db_session.query(WeeklyPlan).filter(
            WeeklyPlan.user_id == user_id
        ).all()
        assert len(plans) == 0
        
        # Verify user still exists and can create valid plan
        valid_plan_response = client.post("/weekly-plan/record", json={
            "user_id": user_id,
            "optimal_cost": 80.00,
            "actual_cost": 75.00
        })
        
        assert valid_plan_response.status_code == 201
        
        # Verify plan was created
        plans = db_session.query(WeeklyPlan).filter(
            WeeklyPlan.user_id == user_id
        ).all()
        assert len(plans) == 1
