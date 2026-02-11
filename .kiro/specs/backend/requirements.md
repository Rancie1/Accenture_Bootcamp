# Requirements Document

## Introduction

The Budget Optimization Backend is a FastAPI-based REST API service designed for university students living at home. The system provides user onboarding, grocery optimization, transport cost comparison, and leaderboard functionality. The backend delegates complex optimization tasks to an external n8n service via webhooks while maintaining responsibility for authentication, data persistence, and leaderboard calculations.

## Glossary

- **Backend_API**: The FastAPI application that handles HTTP requests and responses
- **n8n_Service**: External workflow automation service accessed via HTTP webhooks
- **User**: A university student registered in the system
- **Weekly_Plan**: A record of a user's weekly budget optimization results
- **Leaderboard**: A ranked list of users based on optimization scores
- **Optimization_Score**: Calculated as (budget - actual_spent) / budget
- **NSW_Fuel_API**: External API providing fuel price data for New South Wales
- **Grocery_Optimization**: Process of finding optimal grocery shopping strategies
- **Transport_Comparison**: Analysis comparing fuel costs for different transport options
- **Historical_Price_Data**: Record of grocery item prices over time used for trend analysis
- **Price_Prediction**: Analysis indicating whether an item's price is likely to rise or fall
- **Actual_Cost**: The amount a user actually spent on groceries in a given week
- **Supabase**: PostgreSQL database service used for data persistence

## Requirements

### Requirement 1: User Onboarding

**User Story:** As a university student, I want to register with my details, so that I can start using the budget optimization service.

#### Acceptance Criteria

1. WHEN a POST request is sent to /onboard with name, weekly_budget, and home_address, THE Backend_API SHALL create a new User record
2. WHEN creating a User record, THE Backend_API SHALL validate that weekly_budget is a positive number
3. WHEN creating a User record, THE Backend_API SHALL validate that name is a non-empty string
4. WHEN creating a User record, THE Backend_API SHALL validate that home_address is a non-empty string
5. WHEN a User is successfully created, THE Backend_API SHALL return the User ID and a 201 status code
6. IF a User creation fails validation, THEN THE Backend_API SHALL return a 400 status code with descriptive error messages
7. WHEN a User is created, THE Backend_API SHALL persist the User data to the database

### Requirement 2: Grocery Optimization

**User Story:** As a user, I want to optimize my grocery shopping with price predictions, so that I can save money and know when to wait for better prices.

#### Acceptance Criteria

1. WHEN a POST request is sent to /optimise/groceries with user_id and grocery_list, THE Backend_API SHALL forward the request to the n8n_Service webhook
2. WHEN forwarding to n8n_Service, THE Backend_API SHALL include the user's home_address from the User record
3. WHEN the n8n_Service responds with optimization results, THE Backend_API SHALL enrich each item with price prediction data
4. WHEN enriching items with predictions, THE Backend_API SHALL query Historical_Price_Data for the past 4 weeks for each item
5. WHEN an item's current price is below the 4-week average, THE Backend_API SHALL tag it with "likely to drop next week"
6. WHEN an item's current price is at or above the 4-week average, THE Backend_API SHALL tag it with "historically rising"
7. WHEN optimization results are returned, THE Backend_API SHALL include optimal_cost, store_recommendations, and item_breakdown with price_prediction tags
8. WHEN a grocery_list is provided, THE Backend_API SHALL validate that it is a non-empty array
9. IF the n8n_Service webhook fails or times out, THEN THE Backend_API SHALL return a 503 status code with an error message
10. WHEN optimization completes successfully, THE Backend_API SHALL return a 200 status code

### Requirement 3: Transport Cost Comparison

**User Story:** As a user, I want to compare fuel costs at different petrol stations, so that I can choose the most economical place to refuel for my journey.

#### Acceptance Criteria

1. WHEN a POST request is sent to /transport/compare with user_id, destination, and fuel_amount_needed, THE Backend_API SHALL request nearby petrol station data from the n8n_Service
2. WHEN requesting petrol station data, THE Backend_API SHALL provide the user's home_address as the origin
3. WHEN the n8n_Service returns petrol station data, THE Backend_API SHALL calculate total cost for each station
4. WHEN calculating total cost for a station, THE Backend_API SHALL compute (fuel_cost_to_reach_station + fuel_amount_needed \* price_per_liter_at_station)
5. WHEN returning comparison results, THE Backend_API SHALL include station_name, address, distance_from_home, price_per_liter, cost_to_reach_station, fuel_cost_at_station, and total_cost for each station
6. WHEN returning comparison results, THE Backend_API SHALL order stations by total_cost in ascending order
7. IF the n8n_Service fails to provide petrol station data, THEN THE Backend_API SHALL return a 503 status code with an error message
8. WHEN fuel_amount_needed is not provided or is not a positive number, THE Backend_API SHALL return a 400 status code with an error message
9. WHEN transport comparison completes successfully, THE Backend_API SHALL return a 200 status code

### Requirement 4: Weekly Plan Recording

**User Story:** As a user, I want to record how much I actually spent, so that my optimization performance can be accurately tracked.

#### Acceptance Criteria

1. WHEN a POST request is sent to /weekly-plan/record with user_id, optimal_cost, and actual_cost, THE Backend_API SHALL create a Weekly_Plan record
2. WHEN creating a Weekly_Plan, THE Backend_API SHALL store user_id, optimal_cost, actual_cost, and optimization_score
3. WHEN calculating optimization_score, THE Backend_API SHALL use the formula (weekly_budget - actual_cost) / weekly_budget
4. WHEN a Weekly_Plan is created, THE Backend_API SHALL persist it to the database with a timestamp
5. WHEN actual_cost exceeds weekly_budget, THE Backend_API SHALL record a negative optimization_score
6. WHEN actual_cost is not provided or is not a positive number, THE Backend_API SHALL return a 400 status code with an error message
7. WHEN a Weekly_Plan is successfully created, THE Backend_API SHALL return the plan details with a 201 status code

### Requirement 5: Leaderboard Calculation

**User Story:** As a user, I want to see how my optimization performance compares to others, so that I can stay motivated to save money.

#### Acceptance Criteria

1. WHEN a GET request is sent to /leaderboard, THE Backend_API SHALL calculate rankings based on average optimization_score
2. WHEN calculating rankings, THE Backend_API SHALL aggregate all Weekly_Plan records for each User
3. WHEN calculating average optimization_score, THE Backend_API SHALL compute the mean of all optimization_score values for each User
4. WHEN returning leaderboard data, THE Backend_API SHALL include user_id, username, average_score, and rank
5. WHEN returning leaderboard data, THE Backend_API SHALL order results by average_score in descending order
6. WHEN a User has no Weekly_Plan records, THE Backend_API SHALL exclude that User from the leaderboard
7. WHEN leaderboard calculation completes, THE Backend_API SHALL return a 200 status code with the ranked list

### Requirement 6: n8n Service Integration

**User Story:** As a system administrator, I want the backend to reliably communicate with n8n, so that optimization tasks are properly delegated.

#### Acceptance Criteria

1. WHEN calling the n8n_Service, THE Backend_API SHALL use HTTP POST requests to configured webhook URLs
2. WHEN calling the n8n_Service, THE Backend_API SHALL set a timeout of 30 seconds
3. IF the n8n_Service returns a non-200 status code, THEN THE Backend_API SHALL log the error and return a 503 status code
4. WHEN the n8n_Service is unreachable, THE Backend_API SHALL return a descriptive error message to the client
5. WHEN sending data to n8n_Service, THE Backend_API SHALL format requests as JSON
6. WHEN receiving data from n8n_Service, THE Backend_API SHALL validate the response structure before processing

### Requirement 7: Data Persistence

**User Story:** As a system administrator, I want all user data and optimization results stored reliably in Supabase, so that the system maintains data integrity.

#### Acceptance Criteria

1. THE Backend_API SHALL use Supabase PostgreSQL database for data persistence
2. WHEN storing User records, THE Backend_API SHALL enforce unique user_id constraints
3. WHEN storing Weekly_Plan records, THE Backend_API SHALL enforce foreign key relationships to User records
4. WHEN database operations fail, THE Backend_API SHALL return a 500 status code with an error message
5. WHEN database operations succeed, THE Backend_API SHALL commit transactions atomically
6. THE Backend_API SHALL handle database connection failures gracefully and retry once before failing
7. WHEN connecting to Supabase, THE Backend_API SHALL use environment variables for connection credentials

### Requirement 8: Historical Price Data Management

**User Story:** As a system, I want to maintain historical price data for grocery items, so that price predictions can be generated.

#### Acceptance Criteria

1. THE Backend_API SHALL store Historical_Price_Data records with item_name, price, store_name, and recorded_date
2. WHEN querying historical prices, THE Backend_API SHALL retrieve records from the past 4 weeks
3. WHEN calculating average price, THE Backend_API SHALL compute the mean of all price values for an item across all stores
4. WHEN no historical data exists for an item, THE Backend_API SHALL return the current price without a prediction tag
5. THE Backend_API SHALL support seeding the database with demo Historical_Price_Data for at least 5 common grocery items
6. WHEN seeding demo data, THE Backend_API SHALL create 4 weeks of price records with realistic price variations
7. THE Backend_API SHALL store Historical_Price_Data with timestamps for accurate time-based queries

### Requirement 9: API Documentation

**User Story:** As a frontend developer, I want comprehensive API documentation, so that I can integrate with the backend effectively.

#### Acceptance Criteria

1. THE Backend_API SHALL generate OpenAPI 3.0 specification documentation
2. WHEN the Backend_API starts, THE Backend_API SHALL serve interactive documentation at /docs
3. WHEN serving documentation, THE Backend_API SHALL include request schemas, response schemas, and status codes for all endpoints
4. WHEN serving documentation, THE Backend_API SHALL include example requests and responses
5. THE Backend_API SHALL document all error responses with their corresponding status codes

### Requirement 10: Service Layer Architecture

**User Story:** As a developer, I want clear separation of concerns, so that the codebase is maintainable and testable.

#### Acceptance Criteria

1. THE Backend_API SHALL implement a three-layer architecture with routers, services, and models
2. WHEN handling requests, THE Backend_API SHALL use router modules only for HTTP request/response handling
3. WHEN implementing business logic, THE Backend_API SHALL place all logic in service modules
4. WHEN defining data structures, THE Backend_API SHALL use model modules for database schemas and Pydantic models
5. WHEN a router calls business logic, THE Backend_API SHALL delegate to service layer functions
6. THE Backend_API SHALL ensure no business logic exists in router modules

### Requirement 11: Error Handling

**User Story:** As a user, I want clear error messages when something goes wrong, so that I understand what happened and how to fix it.

#### Acceptance Criteria

1. WHEN validation fails, THE Backend_API SHALL return a 400 status code with field-specific error messages
2. WHEN a resource is not found, THE Backend_API SHALL return a 404 status code with a descriptive message
3. WHEN an internal error occurs, THE Backend_API SHALL return a 500 status code and log the full error details
4. WHEN an external service fails, THE Backend_API SHALL return a 503 status code with service-specific error information
5. WHEN returning error responses, THE Backend_API SHALL use a consistent JSON error format with error_code and message fields
6. THE Backend_API SHALL never expose internal implementation details or stack traces to clients
