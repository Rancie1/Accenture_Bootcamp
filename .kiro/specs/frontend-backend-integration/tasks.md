# Implementation Plan: Frontend-Backend Integration

## Overview

This implementation plan integrates the React Frontend with the FastAPI Backend through a phased approach. The integration adds Backend features as optional enhancements while maintaining full Frontend functionality and graceful degradation when the Backend is unavailable.

Key principles:

- Backend features are optional enhancements, not replacements
- Frontend continues working when Backend is down
- Existing n8n chat interface remains unchanged
- Dual XP system (Frontend + Backend bonus)

## Tasks

- [-] 1. Create Backend API client utility
  - Create `Frontend/koko-app/src/utils/backendApi.js` file
  - Implement `onboardUser(name, weeklyBudget, homeAddress)` function
  - Implement `optimizeGroceries(userId, groceryList)` function
  - Implement `recordWeeklyPlan(userId, optimalCost, actualCost)` function
  - Implement `fetchLeaderboard()` function
  - Add environment-based URL configuration (VITE_BACKEND_URL)
  - Implement consistent error handling for all HTTP status codes (404, 503, 400, network errors)
  - Return standardized response format: `{success: boolean, data?: object, error?: object}`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ]\* 1.1 Write property test for API error type mapping
  - **Property 4: API Error Types Map Consistently to HTTP Status Codes**
  - **Validates: Requirements 5.4, 5.5, 5.6, 5.7**

- [ ]\* 1.2 Write unit tests for API client functions
  - Test each endpoint function with mock responses
  - Test error scenarios (network failures, invalid responses)
  - Test environment configuration
  - _Requirements: 5.2, 5.3_

- [ ] 2. Create data transformation utilities
  - Create `Frontend/koko-app/src/utils/dataTransformers.js` file
  - Implement `toBackendGroceryList(frontendShoppingList)` function
  - Implement `scoreToXp(optimizationScore)` function
  - Implement `toFrontendLeaderboard(backendLeaderboard)` function
  - Add JSDoc comments for all functions
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ]\* 2.1 Write property test for shopping list transformation
  - **Property 1: Shopping List Transformation Preserves Item Names**
  - **Validates: Requirements 2.6, 6.2**

- [ ]\* 2.2 Write property test for score to XP conversion
  - **Property 2: Optimization Score to XP Conversion is Linear**
  - **Validates: Requirements 3.3, 6.4**

- [ ]\* 2.3 Write property test for leaderboard transformation
  - **Property 3: Leaderboard Transformation Preserves User Data**
  - **Validates: Requirements 4.3, 6.6**

- [ ]\* 2.4 Write unit tests for data transformers
  - Test edge cases (empty arrays, null values, boundary values)
  - Test special characters in names
  - Test score boundaries (0, 0.5, 1.0)
  - _Requirements: 6.2, 6.4, 6.6_

- [ ] 3. Update AppContext to support Backend user ID
  - Add `userId: null` field to `userPreferences` state in `Frontend/koko-app/src/context/AppContext.jsx`
  - Verify localStorage persistence includes userId
  - _Requirements: 1.5, 9.4_

- [ ]\* 3.1 Write property test for user ID persistence
  - **Property 5: User Registration Stores ID in Both AppContext and localStorage**
  - **Validates: Requirements 1.3, 1.5**

- [ ]\* 3.2 Write property test for localStorage data persistence
  - **Property 11: localStorage Data Persists Across Sessions**
  - **Validates: Requirements 9.4**

- [ ] 4. Add environment configuration
  - Create `Frontend/koko-app/.env.example` file with VITE_BACKEND_URL variable
  - Document the environment variable with example value
  - Add instructions to README if needed
  - _Requirements: 8.1, 8.2, 8.3_

- [ ]\* 4.1 Write property test for environment configuration
  - **Property 9: Environment Configuration Determines Backend URL**
  - **Validates: Requirements 5.3, 8.1, 8.2, 8.4**

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Integrate Backend onboarding in Registration page
  - [ ] 6.1 Add `homeAddress` field to registration form in `Frontend/koko-app/src/pages/Registration.jsx`
    - Add text input for home address
    - Add validation for required field
    - Update form state to include homeAddress
    - _Requirements: 1.1_

  - [ ] 6.2 Call Backend API on form submission
    - Import `backendApi.onboardUser` function
    - Call API with name, budget, and homeAddress
    - Handle success: store userId in AppContext
    - Handle error: continue with local-only mode, log error
    - _Requirements: 1.2, 1.3, 1.4_

  - [ ]\* 6.3 Write property test for API payload fields
    - **Property 6: API Calls Include Required Payload Fields**
    - **Validates: Requirements 1.2, 2.3, 3.2**

  - [ ]\* 6.4 Write integration test for registration flow
    - Test successful registration with Backend
    - Test registration with Backend unavailable
    - Test userId storage in AppContext and localStorage
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 7. Integrate Backend optimization in Results page
  - [ ] 7.1 Add optional "Get AI Price Predictions" button
    - Add button that only shows when userId exists
    - Style button to match existing UI
    - Add loading state during API call
    - _Requirements: 2.1_

  - [ ] 7.2 Implement Backend optimization fetch
    - Import `backendApi.optimizeGroceries` and `dataTransformers.toBackendGroceryList`
    - Transform shopping list to Backend format
    - Call Backend API with userId and grocery list
    - Display optimization data (optimal cost, stores, item breakdown)
    - Handle errors gracefully (show toast, continue with Frontend calculations)
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ] 7.3 Integrate Backend weekly plan recording
    - Import `backendApi.recordWeeklyPlan` and `dataTransformers.scoreToXp`
    - Call Backend API on shopping trip submission (if userId exists)
    - Calculate Backend XP from optimization_score
    - Add Backend XP on top of Frontend XP
    - Handle errors silently (continue with Frontend-only XP)
    - Maintain existing Frontend XP calculation
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]\* 7.4 Write property test for graceful degradation
    - **Property 7: Failed API Calls Enable Graceful Degradation**
    - **Validates: Requirements 1.4, 2.5, 3.5, 4.5, 7.2, 7.4, 7.6**

  - [ ]\* 7.5 Write property test for XP accumulation
    - **Property 8: XP Updates Accumulate Correctly**
    - **Validates: Requirements 3.4, 3.6**

  - [ ]\* 7.6 Write integration tests for Results page
    - Test optimization fetch with Backend available
    - Test optimization fetch with Backend unavailable
    - Test shopping trip submission with Backend available
    - Test shopping trip submission with Backend unavailable
    - Test dual XP system (Frontend + Backend)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Integrate Backend leaderboard in Leaderboard page
  - [ ] 9.1 Add toggle to switch between Frontend and Backend leaderboards
    - Add toggle UI component
    - Add state to track current leaderboard source
    - Style toggle to match existing UI
    - _Requirements: 4.2_

  - [ ] 9.2 Fetch and display Backend leaderboard
    - Import `backendApi.fetchLeaderboard` and `dataTransformers.toFrontendLeaderboard`
    - Fetch Backend leaderboard on page load
    - Transform Backend data to Frontend format
    - Display Backend leaderboard when toggle is active
    - Show both Backend scores and Frontend XP side-by-side
    - Handle errors gracefully (show Frontend leaderboard only, display notice)
    - _Requirements: 4.1, 4.3, 4.4, 4.5_

  - [ ]\* 9.3 Write integration tests for Leaderboard page
    - Test leaderboard fetch with Backend available
    - Test leaderboard fetch with Backend unavailable
    - Test toggle between Frontend and Backend leaderboards
    - Test data transformation
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 10. Implement error handling UI components
  - [ ] 10.1 Add toast notification system (if not already present)
    - Create reusable toast component
    - Support success, warning, and error types
    - Auto-dismiss after timeout
    - _Requirements: 7.2_

  - [ ] 10.2 Add error message displays
    - Add inline error messages for validation errors
    - Add fallback UI states for Backend unavailable
    - Add notices for local-only mode
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]\* 10.3 Write property tests for error handling
    - **Property 12: Validation Errors Display Field-Specific Messages**
    - **Validates: Requirements 7.3**
    - **Property 13: NOT_FOUND Errors Trigger Re-registration**
    - **Validates: Requirements 7.1**
    - **Property 14: Local-Only Mode Maintains Full Gamification**
    - **Validates: Requirements 7.5**

  - [ ]\* 10.4 Write unit tests for error handling
    - Test each error type triggers correct UI behavior
    - Test error messages display correctly
    - Test fallback data is used appropriately
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 11. Verify backward compatibility
  - [ ] 11.1 Test existing Frontend features
    - Verify gamification features work without Backend
    - Verify localStorage persistence works
    - Verify n8n chat integration still works
    - Verify existing data in localStorage is preserved
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]\* 11.2 Write property test for backward compatibility
    - **Property 10: Existing Features Remain Functional After Integration**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.5**

  - [ ]\* 11.3 Write integration tests for backward compatibility
    - Test all existing features work without Backend
    - Test app works offline
    - Test no breaking changes to existing features
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. End-to-end testing
  - [ ] 13.1 Test complete user journey with Backend available
    - Register new user
    - Build shopping list via chat
    - Get Backend optimization
    - Submit shopping trip
    - View Backend leaderboard
    - Verify all data flows correctly

  - [ ] 13.2 Test complete user journey with Backend unavailable
    - Register new user (local-only mode)
    - Build shopping list via chat
    - Submit shopping trip (Frontend-only XP)
    - View Frontend leaderboard
    - Verify graceful degradation

  - [ ] 13.3 Test error scenarios
    - Test network failures
    - Test Backend returning errors
    - Test invalid data
    - Verify app remains functional in all cases

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
- The n8n chat interface for building shopping lists remains unchanged
- Backend features are optional enhancements that don't break existing functionality
- All Frontend features must continue working when Backend is unavailable
