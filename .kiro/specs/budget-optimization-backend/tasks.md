# Implementation Plan: Budget Optimization Backend

## Overview

This implementation plan breaks down the FastAPI backend into incremental, testable steps. The backend uses a three-layer architecture (routers, services, models) with Supabase PostgreSQL for persistence and n8n for external optimization tasks. Each task builds on previous work, with property-based tests integrated throughout to catch errors early.

## Tasks

- [ ] 1. Set up project structure and dependencies
  - Create FastAPI project with three-layer architecture (routers/, services/, models/)
  - Install dependencies: fastapi, uvicorn, sqlalchemy, pydantic, httpx, python-dotenv, hypothesis (for property testing)
  - Configure Supabase connection with environment variables
  - Set up basic FastAPI app with CORS middleware
  - Create .env.example with required environment variables
  - _Requirements: 7.1, 7.7, 10.1_

- [ ] 2. Implement database models and connection
  - [ ] 2.1 Create SQLAlchemy models for User, WeeklyPlan, and HistoricalPriceData
    - Define User model with user_id (PK), name, weekly_budget, home_address, created_at
    - Define WeeklyPlan model with id (PK), user_id (FK), optimal_cost, actual_cost, optimization_score, created_at
    - Define HistoricalPriceData model with id (PK), item_name, price, store_name, recorded_date
    - Add indexes on user_id, item_name, recorded_date
    - _Requirements: 7.2, 7.3, 8.1, 8.7_
  - [ ] 2.2 Create Pydantic schemas for request/response validation
    - Define UserOnboardRequest, UserResponse schemas
    - Define GroceryOptimizationRequest, GroceryItem, GroceryOptimizationResponse schemas
    - Define TransportComparisonRequest, PetrolStation, TransportComparisonResponse schemas
    - Define WeeklyPlanRequest, WeeklyPlanResponse schemas
    - Define LeaderboardEntry, LeaderboardResponse schemas
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_
  - [ ] 2.3 Set up database connection and session management
    - Create database engine with Supabase connection string
    - Implement session factory and dependency injection
    - Add connection retry logic (retry once on failure)
    - _Requirements: 7.1, 7.6_

- [ ] 3. Implement user onboarding
  - [ ] 3.1 Create user service with create_user and get_user_by_id functions
    - Implement input validation (positive budget, non-empty strings)
    - Generate unique user_id
    - Persist user to database
    - Handle database errors with proper error codes
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.7_
  - [ ]\* 3.2 Write property test for user creation round trip
    - **Property 1: User Creation Round Trip**
    - **Validates: Requirements 1.1, 1.5, 1.7**
  - [ ]\* 3.3 Write property tests for input validation
    - **Property 2: Weekly Budget Validation**
    - **Property 3: Name Validation**
    - **Property 4: Home Address Validation**
    - **Validates: Requirements 1.2, 1.3, 1.4**
  - [ ] 3.4 Create user router with POST /onboard endpoint
    - Handle request/response with Pydantic models
    - Call user service
    - Return 201 on success with user details
    - Return 400 on validation errors with field-specific messages
    - _Requirements: 1.1, 1.5, 1.6_
  - [ ]\* 3.5 Write property test for validation error response format
    - **Property 5: Validation Error Response Format**
    - **Validates: Requirements 1.6, 11.1**

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement n8n integration service
  - [ ] 5.1 Create n8n service with generic webhook caller
    - Implement async HTTP POST with httpx
    - Set 30-second timeout
    - Handle connection errors, timeouts, non-200 responses
    - Return 503 on n8n failures with descriptive messages
    - Log all requests and responses
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [ ]\* 5.2 Write property tests for n8n integration
    - **Property 12: External Service Error Handling**
    - **Property 20: n8n Request Format**
    - **Property 21: n8n Response Validation**
    - **Validates: Requirements 2.9, 3.7, 6.1, 6.3, 6.4, 6.5, 6.6, 11.4**

- [ ] 6. Implement historical price data management
  - [ ] 6.1 Create historical price service
    - Implement get_historical_average function (query past 4 weeks, calculate mean)
    - Implement seed_demo_data function for 5 items with 4 weeks of data
    - Handle cases where no historical data exists
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.6_
  - [ ]\* 6.2 Write property tests for historical price calculations
    - **Property 8: Historical Price Query Time Range**
    - **Property 26: Historical Price Data Persistence**
    - **Property 27: Historical Average Calculation**
    - **Validates: Requirements 2.4, 8.1, 8.2, 8.3, 8.7**
  - [ ]\* 6.3 Write unit test for demo data seeding
    - Verify 5 items created with 4 weeks of data each
    - Verify realistic price variations
    - _Requirements: 8.5, 8.6_

- [ ] 7. Implement grocery optimization
  - [ ] 7.1 Create grocery service with optimize_groceries function
    - Fetch user's home_address
    - Call n8n webhook with grocery_list and home_address
    - Receive optimization results from n8n
    - Enrich each item with price predictions
    - Return enriched results
    - _Requirements: 2.1, 2.2, 2.3_
  - [ ] 7.2 Implement price prediction enrichment logic
    - Query historical prices for each item (past 4 weeks)
    - Calculate 4-week average
    - Tag items: "likely to drop next week" if current < average
    - Tag items: "historically rising" if current >= average
    - Handle items with no historical data (no tag)
    - _Requirements: 2.4, 2.5, 2.6, 8.4_
  - [ ]\* 7.3 Write property tests for price predictions
    - **Property 7: Price Prediction Enrichment**
    - **Property 9: Price Below Average Prediction**
    - **Property 10: Price At or Above Average Prediction**
    - **Validates: Requirements 2.3, 2.5, 2.6, 2.7**
  - [ ] 7.4 Create grocery router with POST /optimise/groceries endpoint
    - Validate grocery_list is non-empty array
    - Call grocery service
    - Return 200 with optimization results including predictions
    - Return 400 on validation errors
    - Return 503 on n8n failures
    - _Requirements: 2.1, 2.7, 2.8, 2.9, 2.10_
  - [ ]\* 7.5 Write property tests for grocery optimization
    - **Property 6: Grocery Optimization n8n Integration**
    - **Property 11: Grocery List Validation**
    - **Validates: Requirements 2.1, 2.2, 2.8**

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement transport cost comparison
  - [ ] 9.1 Create transport service with compare_transport_costs function
    - Fetch user's home_address as origin
    - Call n8n webhook with destination and fuel_amount_needed
    - Receive petrol station data from n8n
    - Calculate total_cost for each station: cost_to_reach + (fuel_amount \* price_per_liter)
    - Sort stations by total_cost ascending
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_
  - [ ]\* 9.2 Write property tests for transport comparison
    - **Property 13: Transport Comparison n8n Integration**
    - **Property 14: Total Cost Calculation**
    - **Property 15: Station Sorting by Total Cost**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.6**
  - [ ] 9.3 Create transport router with POST /transport/compare endpoint
    - Validate fuel_amount_needed is positive
    - Call transport service
    - Return 200 with sorted station list
    - Return 400 on validation errors
    - Return 503 on n8n failures
    - _Requirements: 3.1, 3.7, 3.8, 3.9_
  - [ ]\* 9.4 Write property test for fuel amount validation
    - **Property 16: Fuel Amount Validation**
    - **Validates: Requirements 3.8**

- [ ] 10. Implement weekly plan recording
  - [ ] 10.1 Create weekly plan service with record_weekly_plan function
    - Fetch user's weekly_budget
    - Calculate optimization_score: (weekly_budget - actual_cost) / weekly_budget
    - Create WeeklyPlan record with timestamp
    - Persist to database
    - Handle negative scores (when actual_cost > weekly_budget)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [ ]\* 10.2 Write property tests for weekly plan recording
    - **Property 17: Weekly Plan Persistence with Score Calculation**
    - **Property 18: Actual Cost Validation**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.6**
  - [ ]\* 10.3 Write unit test for negative optimization score edge case
    - Test that actual_cost > weekly_budget results in negative score
    - _Requirements: 4.5_
  - [ ] 10.4 Create weekly plan router with POST /weekly-plan/record endpoint
    - Validate actual_cost is positive
    - Call weekly plan service
    - Return 201 with plan details including calculated score
    - Return 400 on validation errors
    - _Requirements: 4.1, 4.6, 4.7_

- [ ] 11. Implement leaderboard
  - [ ] 11.1 Create leaderboard service with calculate_leaderboard function
    - Query all WeeklyPlan records grouped by user_id
    - Calculate average optimization_score for each user
    - Exclude users with no WeeklyPlan records
    - Sort by average_score descending
    - Assign ranks (1, 2, 3, ...)
    - Join with User table to get usernames
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6_
  - [ ]\* 11.2 Write property test for leaderboard calculation
    - **Property 19: Leaderboard Calculation and Ranking**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.5, 5.6**
  - [ ] 11.3 Create leaderboard router with GET /leaderboard endpoint
    - Call leaderboard service
    - Return 200 with ranked list
    - Handle database errors
    - _Requirements: 5.1, 5.7_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement comprehensive error handling
  - [ ] 13.1 Create error handling middleware and exception classes
    - Define custom exceptions: ValidationError, NotFoundError, ServiceUnavailableError, DatabaseError
    - Create error response format with error_code and message fields
    - Implement exception handlers for each error type
    - Ensure 400, 404, 500, 503 status codes are used correctly
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  - [ ]\* 13.2 Write property tests for error handling
    - **Property 28: Resource Not Found Error Handling**
    - **Property 29: Internal Error Handling**
    - **Property 30: Consistent Error Response Format**
    - **Validates: Requirements 11.2, 11.3, 11.5, 11.6**
  - [ ]\* 13.3 Write unit tests for security of error responses
    - Verify no stack traces exposed to clients
    - Verify no internal implementation details exposed
    - _Requirements: 11.6_

- [ ] 14. Implement database constraints and integrity
  - [ ] 14.1 Add database constraints and test enforcement
    - Ensure unique constraint on user_id
    - Ensure foreign key constraint on weekly_plans.user_id
    - Test constraint violations return appropriate errors
    - _Requirements: 7.2, 7.3_
  - [ ]\* 14.2 Write property tests for database integrity
    - **Property 22: User ID Uniqueness**
    - **Property 23: Foreign Key Integrity**
    - **Property 24: Database Error Handling**
    - **Property 25: Transaction Atomicity**
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5, 7.6**

- [ ] 15. Add OpenAPI documentation and finalize API
  - [ ] 15.1 Configure OpenAPI documentation
    - Add endpoint descriptions and examples
    - Document all request/response schemas
    - Document all error responses with status codes
    - Configure /docs endpoint
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  - [ ]\* 15.2 Write unit tests for documentation completeness
    - Verify /docs endpoint is accessible
    - Verify OpenAPI spec includes all endpoints
    - Verify examples are present
    - _Requirements: 9.2, 9.3, 9.4, 9.5_

- [ ] 16. Integration and final testing
  - [ ] 16.1 Create integration tests for full user flows
    - Test: onboard → optimize groceries → record plan → view leaderboard
    - Test: onboard → compare transport
    - Test: concurrent user operations
    - _Requirements: All_
  - [ ] 16.2 Run demo data seeding and verify system
    - Seed historical price data for 5 items
    - Create test users and weekly plans
    - Verify leaderboard displays correctly
    - Test all endpoints with realistic data
    - _Requirements: 8.5, 8.6_

- [ ] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each property test should run minimum 100 iterations
- Use `hypothesis` library for property-based testing in Python
- Mock n8n webhook responses during testing using `respx` or similar
- Use separate test database or Supabase test project
- All property tests must be tagged with: **Feature: budget-optimization-backend, Property {number}: {property_text}**
- Checkpoints ensure incremental validation and provide opportunities for user feedback
