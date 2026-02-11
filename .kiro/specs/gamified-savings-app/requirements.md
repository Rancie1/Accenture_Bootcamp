# Requirements Document

## Introduction

The Gamified Savings App is a mobile application that incentivizes users to save money by helping them find the cheapest grocery items and the most cost-effective way to reach stores. The app gamifies the savings experience through ranks, leaderboards, and progress tracking, encouraging users to make economical shopping decisions.

## Glossary

- **App**: Koko, the Gamified Savings App mobile application
- **User**: A person who has registered and uses the App
- **Shopping_List**: A collection of grocery items selected by the User
- **XP**: Experience points earned from savings (10% savings = 10 XP)
- **Level**: A numeric value representing User progress, calculated from XP (Math.floor(xp / 100) + 1)
- **Leaderboard**: A ranked display of the top 100 Users based on XP
- **Results**: The optimal store location, price, and travel time for a Shopping_List
- **Navigation_Bar**: The bottom navigation component with Dashboard, Saved, Shop, Mascot, and Leaderboard tabs
- **Chat_Interface**: The n8n-linked interface for editing Shopping_Lists
- **Transport_Preference**: User's preferred mode of transportation (public transport OR driving)
- **Mascot**: The Purple Koala character that visually represents the User's Level
- **Mascot_Item**: A customization item for the Mascot (hat, accessory, background, or outfit)
- **Savings_Percentage**: The percentage of money saved on a shopping trip compared to a baseline price
- **Default_Items**: The customizable list of prefilled grocery items displayed on the Shop page
- **Lootbox**: An in-app purchase that provides a random premium Mascot_Item
- **IAP**: In-App Purchase, a real-money transaction within the App

## Requirements

### Requirement 1: User Registration and Onboarding

**User Story:** As a new user, I want to register with my preferences, so that I can start using the app with personalized recommendations.

#### Acceptance Criteria

1. WHEN the App launches, THE App SHALL display a splash screen with the Purple Koala mascot and a Start button
2. WHEN the User clicks the Start button, THE App SHALL navigate to the registration page
3. THE Registration_Page SHALL provide text input fields for name and budget
4. THE Registration_Page SHALL provide a two-button selector for Transport_Preference with exactly two options: public transport OR driving
5. WHEN the User completes registration, THE App SHALL store the User's name, budget, and Transport_Preference
6. WHEN the User completes registration, THE App SHALL navigate to the Shop page

### Requirement 2: Shopping List Creation

**User Story:** As a user, I want to create shopping lists from customizable grocery items, so that I can quickly build my shopping needs with items I actually buy.

#### Acceptance Criteria

1. THE Shop_Page SHALL display card elements for Default_Items
2. WHEN the User clicks a grocery card, THE App SHALL add that item to the current Shopping_List
3. WHEN the User swipes left on a grocery card, THE App SHALL display a delete button
4. WHEN the User confirms deletion of a Default_Item, THE App SHALL remove it from the Default_Items list
5. THE Shop_Page SHALL display a "+ New default item" card at the bottom of the grid
6. WHEN the User clicks "+ New default item", THE App SHALL display a modal to add a custom item with name and icon
7. WHEN the User adds a custom Default_Item, THE App SHALL add it to the Default_Items list and persist it
8. THE Shop_Page SHALL display a wide button labeled "Start a new list" at the bottom
9. WHEN the User clicks "Start a new list", THE App SHALL clear the current Shopping_List
10. THE Shop_Page SHALL display the User's current Level in the title area
11. THE Shop_Page SHALL display the Navigation_Bar at the bottom

### Requirement 3: Shopping List Editing via Chat Interface

**User Story:** As a user, I want to edit my shopping list through a chat interface using text or voice, so that I can customize items using natural language.

#### Acceptance Criteria

1. WHEN the User navigates to the Edit List page, THE App SHALL display an empty chat interface
2. THE Chat_Interface SHALL link to n8n for message processing
3. THE Edit_List_Page SHALL provide a chatbox for User text messages
4. THE Edit_List_Page SHALL provide a voice input button that records audio
5. WHEN the User sends a voice recording, THE App SHALL transcribe it and send to n8n
6. WHEN the User describes items in natural language, THE n8n integration SHALL parse the items and add them to the Shopping_List
7. THE Edit_List_Page SHALL display a checkmark button at the bottom
8. WHEN the User clicks the checkmark button, THE App SHALL mark the Shopping_List as complete and navigate to the Results page
9. THE Edit_List_Page SHALL NOT display the Navigation_Bar

### Requirement 4: Results Display and Actions

**User Story:** As a user, I want to see the best place to buy my groceries with price, travel time, and XP earned, so that I can make an informed decision and choose how to proceed.

#### Acceptance Criteria

1. THE Results_Page SHALL display the optimal store location for the Shopping_List
2. THE Results_Page SHALL display the total price for the Shopping_List at the optimal store
3. THE Results_Page SHALL display the travel time from the User's location to the optimal store
4. THE Results_Page SHALL calculate travel time based on the User's Transport_Preference
5. THE Results_Page SHALL calculate the Savings_Percentage for the shopping trip
6. THE Results_Page SHALL display the XP earned, which equals the Savings_Percentage
7. THE Results_Page SHALL display three buttons at the bottom: "Try Again", "Save for Later", and "Submit"
8. WHEN the User clicks "Try Again", THE App SHALL navigate to the Shop page
9. WHEN the User clicks "Save for Later", THE App SHALL add the Shopping_List and Results to the Saved page, then navigate to the Shop page
10. WHEN the User clicks "Submit", THE App SHALL add the XP earned to the User's total XP, add the money saved to total savings, add the trip to history, then navigate to the Shop page
11. THE Results_Page SHALL display an animated refresh icon in the top right corner
12. THE Results_Page SHALL NOT display the Navigation_Bar

### Requirement 5: Leaderboard Display

**User Story:** As a user, I want to see how my XP compares to other users, so that I can be motivated to save more.

#### Acceptance Criteria

1. THE Leaderboard_Page SHALL display the top 100 Users ranked by XP
2. THE Leaderboard_Page SHALL display the current User's position in the rankings
3. WHEN the current User is not in the top 100, THE Leaderboard_Page SHALL display the User's position separately
4. THE Leaderboard SHALL rank Users based on their total XP
5. THE Leaderboard_Page SHALL display the Navigation_Bar at the bottom

### Requirement 6: Dashboard Display

**User Story:** As a user, I want to view my mascot, stats, and shopping history on my dashboard, so that I can track my progress and manage my history.

#### Acceptance Criteria

1. THE Dashboard_Page SHALL display the User's profile picture
2. THE Dashboard_Page SHALL display the Purple Koala Mascot with equipped customization items
3. THE Dashboard_Page SHALL display the User's current Level alongside the Mascot
4. THE Dashboard_Page SHALL display the User's total XP
5. THE Dashboard_Page SHALL display the User's weekly XP score
6. THE Dashboard_Page SHALL reset the weekly XP score every Monday at midnight
7. THE Dashboard_Page SHALL display a progress bar showing progress toward the next Level
8. THE Dashboard_Page SHALL display a Settings button in the top right corner
9. WHEN the User clicks the Settings button, THE App SHALL navigate to the Settings page
10. THE Dashboard_Page SHALL display the total money saved since the User started using the App
11. THE Dashboard_Page SHALL display a History section with submitted shopping trips
12. WHEN the User swipes left on a history entry and confirms deletion, THE App SHALL remove it from history and subtract its XP from the weekly score
13. THE Dashboard_Page SHALL display the Navigation_Bar at the bottom

### Requirement 7: Saved Lists Management

**User Story:** As a user, I want to view and manage my saved shopping lists, so that I can revisit them later or remove them if no longer needed.

#### Acceptance Criteria

1. THE Saved_Page SHALL display all shopping lists saved via "Save for Later" button
2. THE Saved_Page SHALL display each saved list with date, item count, total price, and savings
3. WHEN the User taps a saved list, THE App SHALL navigate to the Results page with that list's data
4. WHEN the User swipes left on a saved list and confirms deletion, THE App SHALL remove it from the Saved page
5. WHEN the User deletes a saved list, THE App SHALL NOT affect the User's XP or history
6. THE Saved_Page SHALL display the Navigation_Bar at the bottom

### Requirement 8: Settings Management

**User Story:** As a user, I want to edit my preferences in a dedicated settings page, so that I can update my information without cluttering the dashboard.

#### Acceptance Criteria

1. THE Settings_Page SHALL display editable fields for name, budget, and Transport_Preference
2. THE Settings_Page SHALL display a Save button at the bottom
3. THE Settings_Page SHALL display a Back button in the top left corner
4. WHEN the User clicks the Save button, THE App SHALL update the stored User preferences and navigate to the Dashboard
5. WHEN the User clicks the Back button, THE App SHALL navigate to the Dashboard without saving changes
6. THE Settings_Page SHALL NOT display the Navigation_Bar

### Requirement 9: Mascot Customization

**User Story:** As a user, I want to customize my mascot with items I can purchase or unlock, so that I can personalize my experience.

#### Acceptance Criteria

1. THE Mascot_Page SHALL display a large preview of the Mascot with equipped items
2. THE Mascot_Page SHALL display the User's current XP balance
3. THE Mascot_Page SHALL provide three tabs: Customize, Shop, and Lootbox
4. THE Customize_Tab SHALL display a grid of owned Mascot_Items organized by type
5. WHEN the User taps an owned item in the Customize tab, THE App SHALL equip or unequip that item
6. THE Shop_Tab SHALL display a grid of purchasable Mascot_Items with XP costs
7. WHEN the User purchases an item from the Shop, THE App SHALL deduct the XP cost and add the item to owned items
8. WHEN the User has insufficient XP, THE App SHALL disable the purchase button for that item
9. THE Lootbox_Tab SHALL display a lootbox image and price ($0.99)
10. WHEN the User purchases a lootbox, THE App SHALL process the IAP and reveal a random premium Mascot_Item
11. THE Lootbox SHALL provide items with rarity distribution: 60% rare, 30% epic, 10% legendary
12. THE Mascot_Page SHALL display the Navigation_Bar at the bottom

### Requirement 10: Navigation Structure

**User Story:** As a user, I want consistent navigation throughout the app, so that I can easily move between different sections.

#### Acceptance Criteria

1. THE Navigation_Bar SHALL contain five tabs in order from left to right: Dashboard, Saved, Shop, Mascot, Leaderboard
2. THE App SHALL display the Navigation_Bar on the Shop page, Leaderboard page, Dashboard page, Mascot page, and Saved page
3. THE App SHALL NOT display the Navigation_Bar on the Edit List page, Results page, or Settings page
4. THE App SHALL use React Router for page navigation
5. WHEN the User taps a Navigation_Bar tab, THE App SHALL navigate to the corresponding route

### Requirement 11: Mobile Design Compliance

**User Story:** As a user, I want the app to follow mobile design best practices with a vibrant purple theme, so that I have a familiar and intuitive experience.

#### Acceptance Criteria

1. THE App SHALL follow Apple's Human Interface Guidelines for mobile design
2. THE App SHALL use a vibrant purple as the primary color that complies with Apple HIG
3. THE App SHALL implement a mobile-first interface optimized for touch interactions
4. THE App SHALL use sequential flow with clear navigation patterns
5. THE App SHALL minimize the use of placeholder data in the interface

### Requirement 12: XP and Leveling System

**User Story:** As a user, I want to earn XP from my savings and level up, so that I feel motivated to continue saving money.

#### Acceptance Criteria

1. THE App SHALL award XP equal to the Savings_Percentage when a User submits a shopping trip (10% savings = 10 XP)
2. WHEN the User submits a shopping trip, THE App SHALL add the XP earned to the User's total XP
3. THE App SHALL calculate User Level as Math.floor(xp / 100) + 1
4. THE App SHALL track and display total money saved since the User started using the App
5. THE Leaderboard SHALL rank Users by their total XP
6. THE App SHALL display Level information on the Shop page and Dashboard page
7. THE Dashboard_Page SHALL display the Mascot alongside the User's Level and XP
