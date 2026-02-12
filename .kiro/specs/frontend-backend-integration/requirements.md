# Requirements Document

## Introduction

This document specifies the requirements for integrating the independently developed React Frontend with the FastAPI Backend. The Backend has completed n8n integration with all tests passing. The integration follows a phased approach to connect user onboarding, grocery optimization, weekly plan recording, and leaderboard features while maintaining graceful degradation when the Backend is unavailable.

## Glossary

- **Frontend**: The React-based web application (koko-app) that provides the user interface
- **Backend**: The FastAPI-based REST API that provides grocery optimization and data persistence
- **AppContext**: React Context that manages global application state in the Frontend
- **API_Client**: The centralized utility module for Backend API communication
- **Optimization_Score**: Backend metric (0.0-1.0) representing shopping efficiency
- **XP_System**: Frontend gamification metric for user progression
- **Shopping_List**: Collection of grocery items with name, quantity, and optional price
- **User_ID**: Backend-generated unique identifier for registered users
- **Graceful_Degradation**: System behavior that maintains Frontend functionality when Backend is unavailable
- **Data_Transformer**: Utility functions that convert between Frontend and Backend data formats
- **Home_Address**: User's residential address required for Backend optimization calculations
- **Weekly_Budget**: User's planned grocery spending amount per week
- **Leaderboard**: Ranked list of users based on optimization performance

## Requirements

### Requirement 1: User Onboarding Integration

**User Story:** As a new user, I want to register with my home address, so that the Backend can provide location-based grocery optimization.

#### Acceptance Criteria

1. WHEN a user completes the registration form, THE Frontend SHALL collect name, weekly_budget, and home_address
2. WHEN the registration form is submitted, THE Frontend SHALL call the Backend /onboard endpoint with the collected data
3. WHEN the Backend returns a user_id, THE Frontend SHALL store it in AppContext and localStorage
4. IF the Backend /onboard call fails, THEN THE Frontend SHALL log the error and continue with local-only mode
5. WHEN storing user_id in AppContext, THE Frontend SHALL add it to the userPreferences object

### Requirement 2: Grocery Optimization Integration

**User Story:** As a user viewing my shopping results, I want to see Backend price predictions and store recommendations, so that I can make informed shopping decisions.

#### Acceptance Criteria

1. WHEN a user navigates to the Results page with a shopping list, THE Frontend SHALL display a "Get Optimization" button
2. WHEN the "Get Optimization" button is clicked, THE Frontend SHALL transform the Shopping_List from Frontend format to Backend format
3. WHEN calling /optimise/groceries, THE Frontend SHALL send user_id and the transformed grocery_list array
4. WHEN the Backend returns optimization data, THE Frontend SHALL display price predictions and store recommendations
5. IF the Backend /optimise/groceries call fails, THEN THE Frontend SHALL display mock data and show a notice that Backend is unavailable
6. THE Data_Transformer SHALL convert Shopping_List objects to an array of item name strings

### Requirement 3: Weekly Plan Recording Integration

**User Story:** As a user completing a shopping trip, I want my spending recorded in the Backend, so that my optimization performance is tracked over time.

#### Acceptance Criteria

1. WHEN a user submits a shopping trip on the Results page, THE Frontend SHALL call the Backend /weekly-plan/record endpoint
2. WHEN calling /weekly-plan/record, THE Frontend SHALL send user_id, optimal_cost, and actual_cost
3. WHEN the Backend returns an optimization_score, THE Frontend SHALL transform it to XP by multiplying by 1000
4. WHEN updating XP, THE Frontend SHALL add the transformed score to the existing XP value in AppContext
5. IF the Backend /weekly-plan/record call fails, THEN THE Frontend SHALL continue with Frontend-only XP calculation
6. THE Frontend SHALL maintain both Frontend gamification and Backend tracking simultaneously

### Requirement 4: Leaderboard Integration

**User Story:** As a user viewing the leaderboard, I want to see Backend rankings based on optimization scores, so that I can compare my performance with other users.

#### Acceptance Criteria

1. WHEN a user navigates to the Leaderboard page, THE Frontend SHALL fetch data from the Backend /leaderboard endpoint
2. WHEN displaying leaderboard data, THE Frontend SHALL provide a toggle to switch between Frontend and Backend leaderboards
3. WHEN transforming Backend leaderboard data, THE Data_Transformer SHALL convert username, average_score, and rank to Frontend format
4. WHEN the Backend leaderboard is displayed, THE Frontend SHALL show both Backend optimization scores and Frontend XP scores side-by-side
5. IF the Backend /leaderboard call fails, THEN THE Frontend SHALL display only the Frontend leaderboard with a notice

### Requirement 5: API Client Utilities

**User Story:** As a developer, I want centralized API utilities with error handling, so that Backend integration is consistent and maintainable.

#### Acceptance Criteria

1. THE Frontend SHALL create a backendApi.js file in the src/utils directory
2. THE API_Client SHALL provide functions for each Backend endpoint: onboardUser, optimizeGroceries, recordWeeklyPlan, fetchLeaderboard
3. THE API_Client SHALL read the Backend URL from environment configuration (VITE_BACKEND_URL)
4. WHEN any Backend API call fails with a network error, THE API_Client SHALL return an error object with type "NETWORK_ERROR"
5. WHEN the Backend returns a 404 status, THE API_Client SHALL return an error object with type "NOT_FOUND"
6. WHEN the Backend returns a 503 status, THE API_Client SHALL return an error object with type "SERVICE_UNAVAILABLE"
7. WHEN the Backend returns a 400 status, THE API_Client SHALL return an error object with type "VALIDATION_ERROR" and include field-specific error messages

### Requirement 6: Data Transformation Layer

**User Story:** As a developer, I want data transformation utilities, so that Frontend and Backend data formats are converted correctly.

#### Acceptance Criteria

1. THE Data_Transformer SHALL provide a function to convert Frontend Shopping_List objects to Backend string arrays
2. WHEN converting Shopping_List to Backend format, THE Data_Transformer SHALL extract only the name field from each item
3. THE Data_Transformer SHALL provide a function to convert Backend optimization_score to Frontend XP
4. WHEN converting optimization_score to XP, THE Data_Transformer SHALL multiply the score by 1000
5. THE Data_Transformer SHALL provide a function to convert Backend leaderboard entries to Frontend format
6. WHEN converting leaderboard data, THE Data_Transformer SHALL map username, average_score, and rank to Frontend leaderboard structure

### Requirement 7: Error Handling and Graceful Degradation

**User Story:** As a user, I want the app to work even when the Backend is unavailable, so that I can continue using Frontend features without interruption.

#### Acceptance Criteria

1. WHEN a Backend API call returns a NOT_FOUND error during onboarding, THE Frontend SHALL redirect the user to the registration page
2. WHEN a Backend API call returns a SERVICE_UNAVAILABLE error, THE Frontend SHALL display a user-friendly message and use Frontend fallback data
3. WHEN a Backend API call returns a VALIDATION_ERROR, THE Frontend SHALL display field-specific error messages to the user
4. WHEN a Backend API call returns a NETWORK_ERROR, THE Frontend SHALL enable local-only mode and display a notice
5. WHEN operating in local-only mode, THE Frontend SHALL continue all gamification features using Frontend-only calculations
6. THE Frontend SHALL NOT break or crash when the Backend is unavailable

### Requirement 8: Environment Configuration

**User Story:** As a developer, I want environment-based configuration, so that the Backend URL can be changed for different deployment environments.

#### Acceptance Criteria

1. THE Frontend SHALL read the Backend URL from the VITE_BACKEND_URL environment variable
2. WHEN VITE_BACKEND_URL is not set, THE Frontend SHALL use a default localhost URL for development
3. THE Frontend SHALL provide a .env.example file documenting the VITE_BACKEND_URL variable
4. WHEN the Backend URL is configured, THE API_Client SHALL use it for all Backend API calls

### Requirement 9: Backward Compatibility

**User Story:** As an existing user, I want all current Frontend features to continue working, so that the integration does not disrupt my experience.

#### Acceptance Criteria

1. WHEN the Backend integration is complete, THE Frontend SHALL maintain all existing gamification features
2. THE Frontend SHALL continue to support localStorage-based state persistence
3. THE Frontend SHALL continue to support the existing n8n webhook integration for shopping list management
4. WHEN a user has existing data in localStorage, THE Frontend SHALL preserve it during the integration
5. THE Frontend SHALL NOT remove or break any existing Frontend-only features
