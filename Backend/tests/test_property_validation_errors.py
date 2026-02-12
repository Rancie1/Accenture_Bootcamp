"""
Property-based tests for validation error response format.

Feature: budget-optimization-backend
Property 5: Validation Error Response Format

Validates: Requirements 1.6, 11.1
"""

from hypothesis import given, strategies as st, settings
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


# Strategy for generating invalid user onboarding data
@st.composite
def invalid_user_data(draw):
    """Generate various invalid user onboarding payloads."""
    choice = draw(st.integers(min_value=0, max_value=3))
    
    if choice == 0:
        # Invalid weekly_budget (non-positive)
        return {
            "name": draw(st.text(min_size=1, max_size=50)),
            "weekly_budget": draw(st.floats(max_value=0, allow_nan=False, allow_infinity=False)),
            "home_address": draw(st.text(min_size=1, max_size=100))
        }
    elif choice == 1:
        # Invalid name (empty string)
        return {
            "name": "",
            "weekly_budget": draw(st.floats(min_value=0.01, max_value=10000)),
            "home_address": draw(st.text(min_size=1, max_size=100))
        }
    elif choice == 2:
        # Invalid home_address (empty string)
        return {
            "name": draw(st.text(min_size=1, max_size=50)),
            "weekly_budget": draw(st.floats(min_value=0.01, max_value=10000)),
            "home_address": ""
        }
    else:
        # Missing required field
        fields = ["name", "weekly_budget", "home_address"]
        exclude_field = draw(st.sampled_from(fields))
        data = {}
        if exclude_field != "name":
            data["name"] = draw(st.text(min_size=1, max_size=50))
        if exclude_field != "weekly_budget":
            data["weekly_budget"] = draw(st.floats(min_value=0.01, max_value=10000))
        if exclude_field != "home_address":
            data["home_address"] = draw(st.text(min_size=1, max_size=100))
        return data


@given(invalid_data=invalid_user_data())
@settings(max_examples=100)
def test_property_5_validation_error_response_format(invalid_data):
    """
    Feature: budget-optimization-backend, Property 5: Validation Error Response Format
    
    For any invalid input to any endpoint, the API should return a 400 status code
    with field-specific error messages in a consistent JSON format.
    
    Validates: Requirements 1.6, 11.1
    """
    # Send invalid data to onboard endpoint
    response = client.post("/onboard", json=invalid_data)
    
    # Should return 400 or 422 status code for validation errors
    # 422 = Pydantic validation errors (FastAPI default)
    # 400 = Custom validation errors from service layer
    assert response.status_code in [400, 422], \
        f"Expected 400 or 422 status code for invalid input, got {response.status_code}"
    
    # Response should be valid JSON
    response_json = response.json()
    assert isinstance(response_json, dict), \
        "Error response should be a JSON object"
    
    # Check for consistent error format
    # Our API uses error_code, message, and details fields
    assert "error_code" in response_json, \
        "Error response should contain 'error_code' field"
    assert "message" in response_json, \
        "Error response should contain 'message' field"
    
    # Verify error_code and message are strings
    assert isinstance(response_json["error_code"], str), \
        "error_code should be a string"
    assert isinstance(response_json["message"], str), \
        "message should be a string"
    
    # The details field contains field-specific errors (can be None or dict)
    if "details" in response_json and response_json["details"] is not None:
        assert isinstance(response_json["details"], dict), \
            "details field should be a dict with field-specific errors"


@given(
    name=st.text(min_size=0, max_size=0),  # Empty string
    weekly_budget=st.floats(min_value=0.01, max_value=10000),
    home_address=st.text(min_size=1, max_size=100)
)
@settings(max_examples=50)
def test_property_5_empty_name_validation(name, weekly_budget, home_address):
    """
    Test validation error format for empty name field.
    
    Validates: Requirements 1.3, 1.6
    """
    response = client.post("/onboard", json={
        "name": name,
        "weekly_budget": weekly_budget,
        "home_address": home_address
    })
    
    assert response.status_code == 400
    response_json = response.json()
    assert "error_code" in response_json
    assert response_json["error_code"] == "VALIDATION_ERROR"


@given(
    name=st.text(min_size=1, max_size=50),
    weekly_budget=st.floats(max_value=0, allow_nan=False, allow_infinity=False),
    home_address=st.text(min_size=1, max_size=100)
)
@settings(max_examples=50)
def test_property_5_negative_budget_validation(name, weekly_budget, home_address):
    """
    Test validation error format for non-positive weekly_budget.
    
    Validates: Requirements 1.2, 1.6
    """
    response = client.post("/onboard", json={
        "name": name,
        "weekly_budget": weekly_budget,
        "home_address": home_address
    })
    
    assert response.status_code == 400
    response_json = response.json()
    assert "error_code" in response_json
    assert response_json["error_code"] == "VALIDATION_ERROR"


@given(
    name=st.text(min_size=1, max_size=50),
    weekly_budget=st.floats(min_value=0.01, max_value=10000),
    home_address=st.text(min_size=0, max_size=0)  # Empty string
)
@settings(max_examples=50)
def test_property_5_empty_address_validation(name, weekly_budget, home_address):
    """
    Test validation error format for empty home_address field.
    
    Validates: Requirements 1.4, 1.6
    """
    response = client.post("/onboard", json={
        "name": name,
        "weekly_budget": weekly_budget,
        "home_address": home_address
    })
    
    assert response.status_code == 400
    response_json = response.json()
    assert "error_code" in response_json
    assert response_json["error_code"] == "VALIDATION_ERROR"
