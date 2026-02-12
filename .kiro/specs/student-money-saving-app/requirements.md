# Requirements Document

## Introduction

The Student Money-Saving App is a mobile application designed to help students save money and time by comparing grocery prices between Coles and Woolworths, finding the cheapest petrol prices within a 5km radius, and recommending the shortest public transport routes. The app provides budget tracking, shopping list management, and a leaderboard system to gamify savings.

## Glossary

- **App**: The Student Money-Saving App system
- **User**: A student using the app to save money
- **Shopping_List**: A collection of grocery items the user wants to purchase
- **Budget**: The maximum amount of money the user wants to spend
- **Product**: A grocery item available at Coles or Woolworths
- **Petrol_Station**: A fuel station within the user's search radius
- **PTV**: Public Transport Victoria - the public transport system
- **Route**: A public transport journey from origin to destination
- **Profile**: User account information and preferences
- **Leaderboard**: A ranking system showing users' savings achievements
- **Price_Comparison**: The process of comparing product prices between retailers
- **Price_Trend**: Historical price data for a product over time
- **Purchase_Recommendation**: AI-generated advice on optimal purchase timing

## Requirements

### Requirement 1: Budget Management

**User Story:** As a student, I want to set and track my budget, so that I can control my spending and stay within my financial limits.

#### Acceptance Criteria

1. WHEN a user opens the app, THE App SHALL display a budget entry field on the first page
2. WHEN a user enters a budget amount, THE App SHALL validate that the amount is a positive number
3. WHEN a user enters an invalid budget, THE App SHALL display an error message and prevent progression
4. WHEN a user submits a valid budget, THE App SHALL store the budget for the current session
5. THE App SHALL track spending against the budget throughout the shopping session

### Requirement 2: Mode Selection

**User Story:** As a student, I want to select my transportation mode, so that the app can provide relevant recommendations for my journey.

#### Acceptance Criteria

1. WHEN a user is on the budget page, THE App SHALL display mode selection options for groceries, travel (PTV), travel (car), or both
2. WHEN a user selects groceries only, THE App SHALL enable grocery price comparison features
3. WHEN a user selects PTV travel, THE App SHALL enable public transport route recommendations
4. WHEN a user selects car travel, THE App SHALL enable petrol price comparison within 5km radius
5. WHEN a user selects both travel modes, THE App SHALL enable both PTV and petrol price features
6. THE App SHALL require at least one mode to be selected before allowing progression

### Requirement 3: Shopping List Creation

**User Story:** As a student, I want to create and manage a shopping list, so that I can organize the items I need to purchase.

#### Acceptance Criteria

1. WHEN a user navigates to the shopping list page, THE App SHALL display an interface for adding items
2. WHEN a user adds an item to the list, THE App SHALL store the item in the Shopping_List
3. WHEN a user adds an item, THE App SHALL validate that the item name is not empty
4. THE App SHALL allow users to add multiple items to the Shopping_List
5. WHEN a user views the shopping list page, THE App SHALL display a profile icon in the top right corner

### Requirement 4: Profile Access

**User Story:** As a student, I want to access my profile, so that I can view and manage my account information.

#### Acceptance Criteria

1. WHEN a user clicks the profile icon, THE App SHALL navigate to the profile page
2. THE App SHALL display the profile icon on the shopping list page
3. WHEN a user is on the profile page, THE App SHALL display user account information
4. THE App SHALL allow users to return to the shopping list from the profile page

### Requirement 5: Grocery Price Comparison

**User Story:** As a student, I want to compare prices between Coles and Woolworths, so that I can choose the cheapest option for each product.

#### Acceptance Criteria

1. WHEN a user submits a Shopping_List, THE App SHALL retrieve prices for each item from both Coles and Woolworths
2. WHEN displaying product comparisons, THE App SHALL show two product options per item (one from Coles, one from Woolworths)
3. WHEN displaying a product, THE App SHALL show the product name, price, and retailer
4. THE App SHALL allow users to select one product option per item
5. WHEN a user selects a product, THE App SHALL add the selected product price to the total cost
6. WHEN price data is unavailable for an item, THE App SHALL notify the user and handle the missing data gracefully

### Requirement 6: Petrol Price Comparison

**User Story:** As a student with a car, I want to find the cheapest petrol prices within 5km, so that I can save money on fuel.

#### Acceptance Criteria

1. WHEN a user selects car travel mode, THE App SHALL request the user's location
2. WHEN the user's location is obtained, THE App SHALL retrieve petrol prices from stations within a 5km radius
3. THE App SHALL display petrol stations sorted by price (cheapest first)
4. WHEN displaying a Petrol_Station, THE App SHALL show the station name, price per liter, and distance from user
5. WHEN no petrol stations are found within 5km, THE App SHALL notify the user
6. IF location access is denied, THEN THE App SHALL display an error message and disable petrol price features

### Requirement 7: Public Transport Route Recommendations

**User Story:** As a student using public transport, I want to find the shortest route to my destination, so that I can save time on my journey.

#### Acceptance Criteria

1. WHEN a user selects PTV travel mode, THE App SHALL request origin and destination locations
2. WHEN origin and destination are provided, THE App SHALL retrieve available PTV routes
3. THE App SHALL calculate travel time for each available route
4. THE App SHALL display routes sorted by travel time (shortest first)
5. WHEN displaying a Route, THE App SHALL show the route details, travel time, and transport modes used
6. WHEN no routes are available, THE App SHALL notify the user

### Requirement 8: Shopping List Editing

**User Story:** As a student, I want to edit my shopping list after seeing price comparisons, so that I can adjust my purchases to fit my budget.

#### Acceptance Criteria

1. WHEN a user is on the edit list page, THE App SHALL display all selected products
2. THE App SHALL allow users to remove items from the Shopping_List
3. THE App SHALL allow users to change product selections (switch between Coles and Woolworths options)
4. WHEN a user modifies the list, THE App SHALL recalculate the total cost
5. THE App SHALL display the current total cost and remaining budget
6. WHEN the total cost exceeds the budget, THE App SHALL display a warning message

### Requirement 9: List Submission and Leaderboard

**User Story:** As a student, I want to submit my shopping list and see my savings on a leaderboard, so that I can track my progress and compete with others.

#### Acceptance Criteria

1. WHEN a user is on the edit list page, THE App SHALL display a submit button
2. WHEN a user clicks the submit button, THE App SHALL calculate the total savings achieved
3. WHEN the list is submitted, THE App SHALL navigate to the leaderboard page
4. THE App SHALL display the Leaderboard showing users ranked by total savings
5. WHEN displaying the Leaderboard, THE App SHALL show user names and their savings amounts
6. THE App SHALL update the current user's position on the Leaderboard after submission

### Requirement 10: Data Persistence

**User Story:** As a student, I want my shopping lists and preferences to be saved, so that I can resume my session later.

#### Acceptance Criteria

1. WHEN a user creates a Shopping_List, THE App SHALL persist the list to local storage
2. WHEN a user closes and reopens the app, THE App SHALL restore the previous Shopping_List if available
3. THE App SHALL persist user profile information
4. WHEN a user makes product selections, THE App SHALL save the selections to the current session
5. THE App SHALL persist leaderboard data across sessions

### Requirement 11: Navigation Flow

**User Story:** As a student, I want to navigate smoothly through the app, so that I can complete my shopping efficiently.

#### Acceptance Criteria

1. THE App SHALL display pages in the following order: Budget & Mode Selection → Shopping List → Product Comparison → Edit List & Submit
2. WHEN a user completes a page, THE App SHALL enable navigation to the next page
3. THE App SHALL allow users to navigate backward to previous pages
4. WHEN a user navigates backward, THE App SHALL preserve previously entered data
5. THE App SHALL prevent users from skipping required pages in the flow

### Requirement 12: Price Trend Analysis and Purchase Timing

**User Story:** As a student, I want to see historical price trends and get AI-powered advice on when to buy, so that I can make smarter purchasing decisions and maximize my savings.

#### Acceptance Criteria

1. WHEN a user views a product comparison, THE App SHALL display a price trend chart showing historical prices for the past 30 days
2. WHEN displaying a price trend, THE App SHALL show data points for both Coles and Woolworths on the same chart
3. THE App SHALL generate a natural-language explanation of the price trend for each product
4. WHEN the current price is near the 30-day low, THE App SHALL recommend "Buy now - great price!"
5. WHEN the current price is near the 30-day high, THE App SHALL recommend "Wait - price likely to drop"
6. WHEN the price trend is stable, THE App SHALL recommend "Stable price - buy when needed"
7. THE App SHALL display the recommendation prominently with the product comparison
8. THE App SHALL show key statistics: current price, 30-day average, lowest price, highest price
9. WHEN historical data is unavailable, THE App SHALL use mock/simulated data and indicate this to the user
10. THE App SHALL allow users to tap the chart to see detailed price information for specific dates

### Requirement 13: Error Handling

**User Story:** As a student, I want clear error messages when something goes wrong, so that I can understand and resolve issues.

#### Acceptance Criteria

1. WHEN an API request fails, THE App SHALL display a user-friendly error message
2. WHEN network connectivity is lost, THE App SHALL notify the user and provide retry options
3. WHEN invalid data is entered, THE App SHALL display specific validation error messages
4. THE App SHALL log errors for debugging purposes without exposing technical details to users
5. WHEN a critical error occurs, THE App SHALL provide a way to recover or restart the session

### Requirement 14: Product Catalog Display

**User Story:** As a student, I want to browse available products with their details, so that I can make informed purchasing decisions and share saving tips with others.

#### Acceptance Criteria

1. WHEN a user views the product catalog, THE App SHALL display each product's name
2. WHEN displaying a product, THE App SHALL show the product's price
3. WHEN displaying a product, THE App SHALL show the product's stock availability
4. WHEN a product is on sale, THE App SHALL display "(On Sale!)" indicator next to the product
5. WHEN a user views a product, THE App SHALL provide a "Share" button for that product
6. WHEN a user clicks the "Share" button, THE App SHALL open a popup encouraging users to share their saving tips
7. WHEN a user views the product catalog, THE App SHALL display a footer message: "Predicted price trends coming soon..."
8. THE App SHALL maintain only one default export for the Shop component

### Requirement 15: Advanced Product Intelligence

**User Story:** As a student, I want to see price history, smart alerts, and buying recommendations, so that I can make data-driven purchasing decisions and maximize my savings.

#### Acceptance Criteria

1. WHEN a user views a product, THE App SHALL display the last 3-4 historical prices as a mini graph or text list
2. WHEN a price drop is predicted, THE App SHALL display a "Price drop soon" alert on the product
3. WHEN stock is low, THE App SHALL display a countdown or low stock alert
4. WHEN displaying a product, THE App SHALL show smart suggestions for the best time to buy
5. WHEN displaying a product, THE App SHALL show related product recommendations
6. THE App SHALL display price trend indicators (up arrow, down arrow, or stable)
7. THE App SHALL calculate and display potential savings based on price history

### Requirement 16: User-Generated Content and Gamification

**User Story:** As a student, I want to share reviews, deals, and wishlist items while earning points and badges, so that I can engage with the community and be rewarded for my contributions.

#### Acceptance Criteria

1. WHEN a user views a product, THE App SHALL display user reviews with ratings
2. WHEN a user submits a review, THE App SHALL award points to the user
3. WHEN a user shares a deal, THE App SHALL award points and display the deal to other users
4. WHEN a user adds items to their wishlist, THE App SHALL allow sharing wishlist posts
5. THE App SHALL display user badges based on points earned (Bronze, Silver, Gold, Platinum)
6. WHEN a user earns enough points, THE App SHALL unlock new badges and display achievements
7. THE App SHALL display a mini leaderboard showing top savers
8. WHEN displaying user content, THE App SHALL show the contributor's username and badge
9. THE App SHALL allow users to upvote helpful reviews and deals
10. THE App SHALL track user engagement metrics (reviews posted, deals shared, points earned)

### Requirement 17: Responsive Design

**User Story:** As a student using various devices, I want the product catalog to work seamlessly on both mobile and desktop, so that I can shop conveniently from any device.

#### Acceptance Criteria

1. WHEN a user views the catalog on mobile, THE App SHALL display products in a single column layout
2. WHEN a user views the catalog on desktop, THE App SHALL display products in a multi-column grid layout
3. THE App SHALL adapt font sizes and spacing based on screen size
4. THE App SHALL ensure all interactive elements are touch-friendly on mobile devices
5. THE App SHALL maintain readability and usability across all screen sizes
6. THE App SHALL optimize images and content loading for mobile networks
