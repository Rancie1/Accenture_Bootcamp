"""
Tests for weekly plan recording functionality.
"""

import pytest
from models.db_models import User, WeeklyPlan


def test_record_weekly_plan_success(client, db_session):
    """Test successful weekly plan recording"""
    # Create a test user first
    user = User(
        user_id="test-user-1",
        name="Test User",
        weekly_budget=100.0,
        home_address="123 Test St"
    )
    db_session.add(user)
    db_session.commit()
    
    # Record weekly plan
    response = client.post("/weekly-plan/record", json={
        "user_id": "test-user-1",
        "optimal_cost": 80.0,
        "actual_cost": 85.0
    })
    
    assert response.status_code == 201
    data = response.json()
    
    assert data["user_id"] == "test-user-1"
    assert data["optimal_cost"] == 80.0
    assert data["actual_cost"] == 85.0
    # optimization_score = (100 - 85) / 100 = 0.15
    assert data["optimization_score"] == 0.15
    assert "id" in data
    assert "created_at" in data


def test_record_weekly_plan_negative_score(client, db_session):
    """Test weekly plan recording when actual cost exceeds budget (negative score)"""
    # Create a test user
    user = User(
        user_id="test-user-2",
        name="Test User 2",
        weekly_budget=100.0,
        home_address="456 Test Ave"
    )
    db_session.add(user)
    db_session.commit()
    
    # Record weekly plan with actual_cost > weekly_budget
    response = client.post("/weekly-plan/record", json={
        "user_id": "test-user-2",
        "optimal_cost": 80.0,
        "actual_cost": 120.0  # Over budget
    })
    
    assert response.status_code == 201
    data = response.json()
    
    # optimization_score = (100 - 120) / 100 = -0.2
    assert data["optimization_score"] == -0.2
    assert data["optimization_score"] < 0


def test_record_weekly_plan_user_not_found(client):
    """Test weekly plan recording with non-existent user"""
    response = client.post("/weekly-plan/record", json={
        "user_id": "non-existent-user",
        "optimal_cost": 80.0,
        "actual_cost": 85.0
    })
    
    assert response.status_code == 404
    data = response.json()
    assert data["detail"]["error_code"] == "NOT_FOUND"


def test_record_weekly_plan_invalid_actual_cost(client, db_session):
    """Test weekly plan recording with invalid actual_cost (non-positive)"""
    # Create a test user
    user = User(
        user_id="test-user-3",
        name="Test User 3",
        weekly_budget=100.0,
        home_address="789 Test Blvd"
    )
    db_session.add(user)
    db_session.commit()
    
    # Try with zero actual_cost
    response = client.post("/weekly-plan/record", json={
        "user_id": "test-user-3",
        "optimal_cost": 80.0,
        "actual_cost": 0.0
    })
    
    assert response.status_code == 422
    
    # Try with negative actual_cost
    response = client.post("/weekly-plan/record", json={
        "user_id": "test-user-3",
        "optimal_cost": 80.0,
        "actual_cost": -10.0
    })
    
    assert response.status_code == 422


def test_record_weekly_plan_persistence(client, db_session):
    """Test that weekly plan is persisted to database"""
    # Create a test user
    user = User(
        user_id="test-user-4",
        name="Test User 4",
        weekly_budget=150.0,
        home_address="321 Test Ln"
    )
    db_session.add(user)
    db_session.commit()
    
    # Record weekly plan
    response = client.post("/weekly-plan/record", json={
        "user_id": "test-user-4",
        "optimal_cost": 100.0,
        "actual_cost": 110.0
    })
    
    assert response.status_code == 201
    plan_id = response.json()["id"]
    
    # Verify it's in the database
    plan = db_session.query(WeeklyPlan).filter(WeeklyPlan.id == plan_id).first()
    
    assert plan is not None
    assert plan.user_id == "test-user-4"
    assert plan.optimal_cost == 100.0
    assert plan.actual_cost == 110.0
    # optimization_score = (150 - 110) / 150 = 0.2666...
    assert abs(plan.optimization_score - 0.26666666666666666) < 0.0001
