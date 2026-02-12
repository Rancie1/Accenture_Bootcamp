# Implementation Plan: Student Money-Saving App

## Overview

This implementation plan breaks down the Student Money-Saving App into discrete coding tasks. The app is a React Native mobile application with four main pages (Budget, Shopping List, Product Comparison, Edit & Submit) plus Profile and Leaderboard pages. The implementation follows a bottom-up approach: core utilities → services → state management → UI components → integration.

## Tasks

- [ ] 1. Set up project structure and dependencies
  - Initialize React Native project with TypeScript
  - Install dependencies: React Navigation, AsyncStorage, Geolocation, fast-check for property testing, Jest and React Native Testing Library
  - Create directory structure: src/components, src/services, src/context, src/utils, src/types, __tests__
  - Set up TypeScript configuration
  - _Requirements: All requirements (foundation)_

- [ ] 2. Define core types and interfaces
  - [ ] 2.1 Create type definitions file
    - Define AppState, ShoppingItem, SelectedProduct, UserProfile, LeaderboardEntry interfaces
    - Define Product, ProductComparison, PetrolStation, PTVRoute, Location interfaces
    - Define RootStackParamList for navigation
    - Define ErrorHandler interfaces
    - _Requirements: 1.1-1.5, 2.1-2.6, 3.1-3.5, 5.1-5.6, 6.1-6.6, 7.1-7.6, 9.1-9.6, 10.1-10.5, 12.1-12.5_

- [ ] 3. Implement utility functions and validation
  - [ ] 3.1 Create validation utilities
    - Implement budget validation (positive number check)
    - Implement item name validation (non-empty check)
    - Implement mode selection validation (at least one mode)
    - _Requirements: 1.2, 1.3, 3.3, 2.6_
  
  - [ ]* 3.2 Write property test for budget validation
    - **Property 1: Budget Validation**
    - **Validates: Requirements 1.2, 1.3**
  
  - [ ]* 3.3 Write property test for item name validation
    - **Property 7: Empty Item Validation**
    - **Validates: Requirements 3.3**

- [ ] 4. Implement calculations module
  - [ ] 4.1 Create calculations utilities
    - Implement total cost calculation (sum of selected product prices)
    - Implement remaining budget calculation (budget - total cost)
    - Implement savings calculation (sum of price differences)
    - _Requirements: 1.5, 5.5, 8.4, 8.5, 9.2_
  
  - [ ]* 4.2 Write property test for spending tracking invariant
    - **Property 3: Spending Tracking Invariant**
    - **Validates: Requirements 1.5, 5.5, 8.4**
  
  - [ ]* 4.3 Write property test for budget display accuracy
    - **Property 20: Budget Display Accuracy**
    - **Validates: Requirements 8.5**
  
  - [ ]* 4.4 Write property test for savings calculation
    - **Property 22: Savings Calculation Accuracy**
    - **Validates: Requirements 9.2**

- [ ] 5. Implement storage service
  - [ ] 5.1 Create AsyncStorage wrapper
    - Implement save and load functions for all data types
    - Implement storage keys constants
    - Add error handling for storage operations
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ]* 5.2 Write property test for data persistence
    - **Property 26: Data Persistence Round-Trip**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**
  
  - [ ]* 5.3 Write property test for budget storage
    - **Property 2: Budget Storage Round-Trip**
    - **Validates: Requirements 1.4**

- [ ] 6. Implement error handling module
  - [ ] 6.1 Create error handler
    - Implement ErrorHandler interface
    - Create error categorization logic (validation, API, permission, network, data)
    - Implement user-friendly error message generation
    - Add error logging functionality
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [ ]* 6.2 Write property test for error messages
    - **Property 29: Error Message Appropriateness**
    - **Validates: Requirements 12.3, 12.4**
  
  - [ ]* 6.3 Write unit tests for error handling edge cases
    - Test API failure scenarios
    - Test network connectivity loss
    - Test permission denial
    - _Requirements: 12.1, 12.2, 12.5_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement GroceryService
  - [ ] 8.1 Create grocery price service
    - Implement GroceryService interface
    - Create mock API for testing (returns predictable Coles/Woolworths products)
    - Implement searchProduct function
    - Add error handling for missing price data
    - _Requirements: 5.1, 5.2, 5.3, 5.6_
  
  - [ ]* 8.2 Write property test for price retrieval
    - **Property 9: Price Retrieval Completeness**
    - **Validates: Requirements 5.1**
  
  - [ ]* 8.3 Write property test for product display
    - **Property 10: Product Display Completeness**
    - **Validates: Requirements 5.2**
  
  - [ ]* 8.4 Write property test for product information
    - **Property 11: Product Information Completeness**
    - **Validates: Requirements 5.3**
  
  - [ ]* 8.5 Write unit test for missing price data
    - Test graceful handling when price unavailable
    - _Requirements: 5.6_

- [ ] 9. Implement PetrolService
  - [ ] 9.1 Create petrol price service
    - Implement PetrolService interface
    - Create mock API for testing (returns stations with distances)
    - Implement findCheapestPetrol function with 5km radius filter
    - Implement sort by price (ascending)
    - Add error handling for location access denial
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ]* 9.2 Write property test for radius constraint
    - **Property 13: Petrol Station Radius Constraint**
    - **Validates: Requirements 6.2**
  
  - [ ]* 9.3 Write property test for sort order
    - **Property 14: Petrol Station Sort Order**
    - **Validates: Requirements 6.3**
  
  - [ ]* 9.4 Write property test for station information
    - **Property 15: Petrol Station Information Completeness**
    - **Validates: Requirements 6.4**
  
  - [ ]* 9.5 Write unit tests for edge cases
    - Test no stations found within 5km
    - Test location access denied
    - _Requirements: 6.5, 6.6_

- [ ] 10. Implement PTVService
  - [ ] 10.1 Create PTV route service
    - Implement PTVService interface
    - Create mock API for testing (returns routes with durations)
    - Implement findShortestRoute function
    - Implement sort by travel time (ascending)
    - Add error handling for no routes available
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [ ]* 10.2 Write property test for route sort order
    - **Property 16: PTV Route Sort Order**
    - **Validates: Requirements 7.4**
  
  - [ ]* 10.3 Write property test for route information
    - **Property 17: Route Information Completeness**
    - **Validates: Requirements 7.5**
  
  - [ ]* 10.4 Write unit test for no routes available
    - Test graceful handling when no routes found
    - _Requirements: 7.6_

- [ ] 11. Checkpoint - Ensure all service tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement AppContext for state management
  - [ ] 12.1 Create AppContext and provider
    - Define AppContext with all state fields
    - Implement AppProvider component
    - Create state update functions (setBudget, setMode, addShoppingItem, etc.)
    - Integrate storage service for persistence
    - _Requirements: 1.4, 1.5, 2.1-2.6, 3.2, 3.4, 10.1-10.5_
  
  - [ ]* 12.2 Write property test for mode selection
    - **Property 4: Mode Selection Feature Enablement**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5**
  
  - [ ]* 12.3 Write property test for shopping list addition
    - **Property 6: Shopping List Item Addition**
    - **Validates: Requirements 3.2, 3.4**

- [ ] 13. Set up navigation structure
  - [ ] 13.1 Create navigation stack
    - Set up React Navigation stack navigator
    - Define all screens (Budget, ShoppingList, ProductComparison, EditAndSubmit, Profile, Leaderboard)
    - Implement navigation flow enforcement
    - Add back navigation support
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [ ]* 13.2 Write property test for navigation sequence
    - **Property 27: Navigation Sequence Enforcement**
    - **Validates: Requirements 11.1, 11.2, 11.5**
  
  - [ ]* 13.3 Write property test for backward navigation
    - **Property 28: Backward Navigation Availability**
    - **Validates: Requirements 11.3**

- [ ] 14. Implement BudgetPage component
  - [ ] 14.1 Create BudgetPage UI
    - Create budget input field
    - Create mode selection checkboxes (groceries, PTV, car)
    - Implement validation on submit
    - Display error messages for invalid inputs
    - Navigate to ShoppingList on valid submission
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [ ]* 14.2 Write unit test for budget page rendering
    - Test budget input field is displayed
    - Test mode selection options are displayed
    - _Requirements: 1.1, 2.1_
  
  - [ ]* 14.3 Write property test for mode validation
    - **Property 5: Mode Selection Validation**
    - **Validates: Requirements 2.6**

- [ ] 15. Implement ShoppingListPage component
  - [ ] 15.1 Create ShoppingListPage UI
    - Create item input field
    - Create add button
    - Display list of added items
    - Add profile icon in top right corner
    - Implement navigation to Profile page
    - Implement continue button to ProductComparison
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2_
  
  - [ ]* 15.2 Write unit test for shopping list page rendering
    - Test item input field is displayed
    - Test profile icon is displayed
    - _Requirements: 3.1, 3.5_

- [ ] 16. Implement ProfilePage component
  - [ ] 16.1 Create ProfilePage UI
    - Display user name
    - Display total savings
    - Implement back navigation to ShoppingList
    - _Requirements: 4.1, 4.3, 4.4_
  
  - [ ]* 16.2 Write unit test for profile page rendering
    - Test user information is displayed
    - _Requirements: 4.3_
  
  - [ ]* 16.3 Write property test for profile navigation
    - **Property 8: Profile Navigation Round-Trip**
    - **Validates: Requirements 4.1, 4.4**

- [ ] 17. Implement ProductComparisonPage component
  - [ ] 17.1 Create ProductComparisonPage UI
    - Display current item being compared
    - Fetch and display Coles and Woolworths products side-by-side
    - Implement product selection (one per item)
    - Show loading state during API calls
    - Handle missing price data gracefully
    - Navigate to next item after selection
    - Navigate to EditAndSubmit when all items processed
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [ ]* 17.2 Write property test for single product selection
    - **Property 12: Single Product Selection**
    - **Validates: Requirements 5.4**

- [ ] 18. Implement EditAndSubmitPage component
  - [ ] 18.1 Create EditAndSubmitPage UI
    - Display all selected products
    - Implement remove item functionality
    - Implement change selection functionality
    - Display total cost and remaining budget
    - Display warning if over budget
    - Implement submit button
    - Navigate to Leaderboard on submit
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 9.1, 9.2, 9.3_
  
  - [ ]* 18.2 Write unit test for edit page rendering
    - Test submit button is displayed
    - _Requirements: 9.1_
  
  - [ ]* 18.3 Write property test for shopping list removal
    - **Property 18: Shopping List Removal**
    - **Validates: Requirements 8.2**
  
  - [ ]* 18.4 Write property test for product selection change
    - **Property 19: Product Selection Change**
    - **Validates: Requirements 8.3**
  
  - [ ]* 18.5 Write property test for over-budget warning
    - **Property 21: Over-Budget Warning**
    - **Validates: Requirements 8.6**

- [ ] 19. Implement LeaderboardPage component
  - [ ] 19.1 Create LeaderboardPage UI
    - Display leaderboard entries sorted by savings
    - Highlight current user's entry
    - Show user names and savings amounts
    - Update current user's position after submission
    - _Requirements: 9.3, 9.4, 9.5, 9.6_
  
  - [ ]* 19.2 Write property test for leaderboard sort order
    - **Property 23: Leaderboard Sort Order**
    - **Validates: Requirements 9.4**
  
  - [ ]* 19.3 Write property test for leaderboard entry completeness
    - **Property 24: Leaderboard Entry Completeness**
    - **Validates: Requirements 9.5**
  
  - [ ]* 19.4 Write property test for leaderboard update
    - **Property 25: Leaderboard Update After Submission**
    - **Validates: Requirements 9.6**

- [ ] 20. Checkpoint - Ensure all component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 21. Implement petrol and PTV features (conditional on mode)
  - [ ] 21.1 Add petrol price display to EditAndSubmit page
    - Show cheapest petrol station when car mode selected
    - Request location permission
    - Display station name, price, and distance
    - Handle location denial gracefully
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ] 21.2 Add PTV route display to EditAndSubmit page
    - Show shortest route when PTV mode selected
    - Request origin and destination
    - Display route details, time, and transport modes
    - Handle no routes available gracefully
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 22. Wire all components together
  - [ ] 22.1 Integrate AppProvider at root level
    - Wrap navigation with AppProvider
    - Ensure all pages have access to context
    - Test data flow between pages
    - _Requirements: All requirements_
  
  - [ ] 22.2 Test complete user flow
    - Test Budget → ShoppingList → ProductComparison → EditAndSubmit → Leaderboard flow
    - Test profile navigation from ShoppingList
    - Test back navigation preserves state
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ]* 23. Write integration tests
  - Test complete user flows end-to-end
  - Test state persistence across app restart
  - Test error recovery scenarios
  - _Requirements: All requirements_

- [ ] 24. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 25. Implement Product Catalog Feature
  - [ ] 25.1 Create product catalog data model
    - Define CatalogProduct interface with id, name, price, stock, isOnSale, originalPrice
    - Create sample product data for testing
    - _Requirements: 14.1, 14.2, 14.3, 14.4_
  
  - [ ] 25.2 Update Shop.jsx with product catalog display
    - Display each product's name, price, and stock availability
    - Show "(On Sale!)" indicator for products with isOnSale=true
    - Add "Share" button for each product
    - Display footer message: "Predicted price trends coming soon..."
    - Ensure only one default export for Shop component
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.7, 14.8_
  
  - [ ] 25.3 Implement share popup functionality
    - Create SharePopup component
    - Display popup when Share button is clicked
    - Show message encouraging users to share saving tips
    - Implement close functionality
    - _Requirements: 14.6_
  
  - [ ]* 25.4 Write property test for product display completeness
    - **Property 36: Product Display Completeness**
    - **Validates: Requirements 14.1, 14.2, 14.3**
  
  - [ ]* 25.5 Write property test for sale indicator
    - **Property 37: Sale Indicator Display**
    - **Validates: Requirements 14.4**
  
  - [ ]* 25.6 Write property test for share button presence
    - **Property 38: Share Button Presence**
    - **Validates: Requirements 14.5**
  
  - [ ]* 25.7 Write property test for share popup functionality
    - **Property 39: Share Popup Functionality**
    - **Validates: Requirements 14.6**
  
  - [ ]* 25.8 Write unit tests for product catalog
    - Test product catalog renders with sample data
    - Test share popup opens and closes correctly
    - Test footer message is displayed
    - _Requirements: 14.1-14.7_

- [ ] 26. Final validation and cleanup
  - Run all tests to ensure nothing broke
  - Verify Shop.jsx has only one default export
  - Test product catalog feature end-to-end
  - _Requirements: 14.8_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check library with minimum 100 iterations
- All property tests tagged with: **Feature: student-money-saving-app, Property N: [property text]**
- Mock APIs used for testing (real API integration can be added later)
- Focus on core functionality first, then add petrol/PTV features
- Checkpoints ensure incremental validation throughout development
