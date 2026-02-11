# Implementation Plan: Koko - Gamified Savings App

## Overview

This implementation plan breaks down the Koko app into incremental coding tasks. The app is a React-based mobile web application with React Router navigation, Context API state management, and integration with n8n for chat functionality. The implementation follows a bottom-up approach, building core functionality first, then adding features incrementally.

## Tasks

- [x] 1. Project setup and core infrastructure
  - Install React Router v6 and configure routing
  - Install and configure Tailwind CSS
  - Set up Tailwind config with custom purple theme colors
  - Configure Josefin Sans font in Tailwind config
  - Set up index.css with Tailwind directives
  - Configure dark mode (class-based) in Tailwind config
  - Create base layout structure
  - _Requirements: 10.4, 11.4, 11.5, 13.1_

- [x] 2. Implement core state management and utilities
  - [x] 2.1 Create AppContext with all state variables
    - Implement xp, savings, streak, streakSavers, darkMode states
    - Implement userPreferences, defaultItems, shoppingList states
    - Implement savedLists, history, mascotItems, equippedItems states
    - Calculate derived values (level, progress, weeklyXp)
    - _Requirements: 12.1, 12.3, 6.5, 6.6, 6.7_
  
  - [ ]* 2.2 Write property test for level calculation
    - **Property 4: Level Display Consistency**
    - **Validates: Requirements 2.5, 6.3, 6.6**
  
  - [x] 2.3 Create localStorage utility functions
    - Implement save and load functions for all state
    - Handle localStorage errors gracefully
    - _Requirements: 13.6_
  
  - [x] 2.4 Create calculations utility
    - Implement XP/level calculations
    - Implement savings percentage calculation
    - Implement weekly XP calculation with Monday reset logic
    - _Requirements: 12.1, 12.3, 4.5, 4.8, 6.6, 6.7_
  
  - [ ]* 2.5 Write property tests for calculations
    - **Property 6: Savings Percentage Calculation**
    - **Property 7: XP Equals Savings Percentage**
    - **Validates: Requirements 4.5, 4.8, 9.1**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement navigation and routing
  - [x] 4.1 Set up React Router with all routes
    - Configure routes for all pages (/, /register, /shop, /edit-list, /results, /leaderboard, /dashboard, /settings, /mascot, /saved, /grimace)
    - _Requirements: 10.4_
  
  - [x] 4.2 Create BottomNavigation component with Tailwind
    - Implement 5-tab navigation (Dashboard, Saved, Shop, Mascot, Leaderboard)
    - Use Tailwind utility classes for styling
    - Highlight active tab based on current route (text-primary class)
    - Apply dark mode styles with dark: variants
    - _Requirements: 10.1, 10.2, 10.5_
  
  - [ ]* 4.3 Write property test for navigation
    - **Property 13: Navigation Tab Behavior**
    - **Validates: Requirements 10.5**

- [x] 5. Implement authentication and onboarding flow
  - [x] 5.1 Create SplashScreen component with Tailwind
    - Display Purple Koala mascot (#9e8fb2)
    - Use Tailwind utility classes for layout and styling
    - Implement Start button navigation with active:scale-95 transition
    - _Requirements: 1.1, 1.2_
  
  - [x] 5.2 Create Registration component with Tailwind
    - Implement name and budget input fields with Tailwind form styles
    - Implement transport preference two-button selector
    - Use focus:ring-2 focus:ring-primary for input focus states
    - Validate inputs before submission
    - Save to context and navigate to /shop
    - _Requirements: 1.3, 1.4, 1.5, 1.6_
  
  - [ ]* 5.3 Write property test for registration
    - **Property 1: Registration Data Persistence**
    - **Validates: Requirements 1.5**

- [x] 6. Implement Shop page and grocery management
  - [x] 6.1 Create Shop component with Tailwind grid layout
    - Display level in title area with text-primary
    - Render grid of grocery cards using grid grid-cols-2 gap-4
    - Use Tailwind utility classes for card styling (rounded-xl, shadow-md)
    - Implement card click to add to shopping list with active:scale-95
    - Display "Start a new list" button with bg-primary
    - _Requirements: 2.1, 2.2, 2.5, 2.8, 2.11_
  
  - [x] 6.2 Implement swipe-to-delete for grocery cards
    - Create useSwipeGesture custom hook
    - Detect left swipe on cards
    - Show delete button on swipe
    - Remove from defaultItems on confirm
    - _Requirements: 2.3, 2.4_
  
  - [x] 6.3 Implement "+ New default item" functionality
    - Create AddItemModal component
    - Allow user to input name and icon
    - Add to defaultItems and persist
    - _Requirements: 2.6, 2.7_
  
  - [ ]* 6.4 Write property tests for shop functionality
    - **Property 2: Shopping List Item Addition**
    - **Property 3: Shopping List Clearing**
    - **Property 15: Custom Default Item Addition**
    - **Validates: Requirements 2.2, 2.4, 2.7**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement chat interface for list editing
  - [x] 8.1 Create EditList component with Tailwind
    - Display chat interface with flex flex-col layout
    - Style message bubbles with Tailwind (rounded-2xl, bg-primary for user)
    - Implement message input with rounded-full border styling
    - Display voice input button with bg-primary rounded-full
    - Implement checkmark button navigation
    - _Requirements: 3.1, 3.3, 3.4, 3.7, 3.8_
  
  - [x] 8.2 Integrate with n8n API
    - Create api.js utility for n8n integration
    - Implement POST request with shopping list and message
    - Parse response and update shopping list
    - Handle voice transcription
    - _Requirements: 3.2, 3.5, 3.6_
  
  - [ ]* 8.3 Write unit tests for n8n integration
    - Test message sending
    - Test response parsing
    - Test error handling
    - _Requirements: 3.2_

- [x] 9. Implement Results page with streak logic
  - [x] 9.1 Create Results component with Tailwind
    - Display store info in rounded-2xl card with shadow-lg
    - Use text-6xl font-bold text-primary for savings percentage
    - Style XP earned with bg-primary/10 rounded-full badge
    - Implement "Adjust Cost" button with border-primary
    - Display three action buttons with grid grid-cols-3 gap-3
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.8, 4.9, 4.10, 4.11, 4.17, 4.18_
  
  - [x] 9.2 Implement streak logic on submit
    - Check if totalSpent <= budget
    - Increment streak if within budget
    - Show streak saver prompt if over budget
    - Reset streak if no savers and over budget
    - Add to history with totalSpent
    - _Requirements: 4.13, 4.14, 4.15, 4.16_
  
  - [ ]* 9.3 Write property tests for streak logic
    - **Property 20: Streak Increment on Budget Compliance**
    - **Property 21: Streak Break on Budget Overspend**
    - **Property 22: Streak Saver Protection**
    - **Validates: Requirements 4.13, 4.14, 4.15, 4.16**
  
  - [ ]* 9.4 Write property tests for results calculations
    - **Property 5: Travel Time Calculation by Transport Mode**
    - **Property 8: Save for Later Persistence**
    - **Property 9: XP and Savings Accumulation on Submit**
    - **Validates: Requirements 4.4, 4.12, 4.13**

- [x] 10. Implement Dashboard with history and streak display
  - [x] 10.1 Create Dashboard component with Tailwind
    - Display profile picture with rounded-full
    - Display mascot with equipped items
    - Use text-primary for level badge and streak display
    - Style progress bar with bg-primary rounded-full
    - Display weekly XP and savings with appropriate Tailwind classes
    - Implement settings button navigation
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.8, 6.9, 6.10, 6.11, 6.14_
  
  - [x] 10.2 Implement history section with swipe-to-delete
    - Display scrollable list of submitted trips
    - Implement swipe-to-delete gesture
    - Subtract XP from weekly score on delete
    - _Requirements: 6.12, 6.13_
  
  - [x] 10.3 Implement mascot tap Easter egg trigger
    - Track 3 taps within 2 seconds
    - Show passcode prompt
    - Navigate to /grimace on correct passcode
    - _Requirements: 14.1, 14.2_
  
  - [ ]* 10.4 Write unit tests for dashboard features
    - Test weekly XP calculation
    - Test history deletion
    - Test Easter egg trigger
    - _Requirements: 6.6, 6.7, 6.13, 14.1_

- [x] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement Settings page
  - [x] 12.1 Create Settings component with Tailwind
    - Display editable fields with focus:ring-2 focus:ring-primary
    - Implement dark mode toggle switch with Tailwind
    - Style save button with bg-primary rounded-xl
    - Implement save and back buttons
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_
  
  - [ ]* 12.2 Write property tests for settings
    - **Property 12: Profile Preference Updates**
    - **Property 19: Settings Persistence**
    - **Property 23: Dark Mode Persistence**
    - **Validates: Requirements 8.5, 13.6, 13.7**

- [x] 13. Implement dark mode theming with Tailwind
  - [x] 13.1 Configure dark mode in App component
    - Add/remove 'dark' class on root element based on darkMode state
    - Ensure all components use dark: variant classes
    - _Requirements: 13.2, 13.3, 13.4, 13.5_
  
  - [x] 13.2 Verify dark mode styles across all components
    - Check all page components use dark: prefixed classes
    - Verify primary purple and mascot color work in both modes
    - _Requirements: 6.15, 8.8, 9.15, 13.7_
  
  - [ ]* 13.3 Write unit tests for dark mode
    - Test theme toggle
    - Test persistence
    - _Requirements: 13.1, 13.6_

- [x] 14. Implement Mascot customization page
  - [x] 14.1 Create Mascot component with Tailwind tabs
    - Display mascot preview with equipped items (#9e8fb2)
    - Display XP balance with text-primary font-bold
    - Style streak savers with bg-primary/10 rounded-full
    - Implement tab navigation with border-b-2 border-primary for active
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.14_
  
  - [x] 14.2 Implement Customize tab with Tailwind grid
    - Display grid of owned items using grid grid-cols-3 gap-4
    - Use ring-2 ring-primary for equipped items
    - Style rarity badges with appropriate Tailwind colors
    - Implement equip/unequip functionality
    - _Requirements: 9.5, 9.6_
  
  - [x] 14.3 Implement Shop tab with Tailwind
    - Display grid of purchasable items
    - Style purchase buttons with bg-primary
    - Include Streak Saver item (50 XP)
    - Disable purchase button with opacity-50 if insufficient XP
    - _Requirements: 9.7, 9.8, 9.9, 9.10_
  
  - [x] 14.4 Implement Lootbox tab with Tailwind animations
    - Display lootbox with bg-gradient-to-br from-primary to-purple-700
    - Use animate-pulse for lootbox glow effect
    - Create LootboxAnimation component
    - Implement random item generation with rarity weights
    - _Requirements: 9.11, 9.12, 9.13_
  
  - [ ]* 14.5 Write property tests for mascot features
    - **Property 16: Mascot Item Purchase with XP**
    - **Property 17: Mascot Item Equipping**
    - **Property 18: Lootbox Random Item Distribution**
    - **Validates: Requirements 9.9, 9.6, 9.13**

- [x] 15. Implement Leaderboard page
  - [x] 15.1 Create Leaderboard component with Tailwind
    - Display top 100 users with space-y-2 for spacing
    - Style rank badges with rounded-full (gold for top 3)
    - Highlight current user with bg-primary/20 border-2 border-primary
    - Display XP with font-bold text-primary
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 15.2 Write property tests for leaderboard
    - **Property 10: Leaderboard Ranking Order**
    - **Property 11: User Position in Leaderboard**
    - **Validates: Requirements 5.1, 5.2, 5.4**

- [x] 16. Implement Saved lists page
  - [x] 16.1 Create Saved component with Tailwind
    - Display scrollable list with space-y-3 spacing
    - Style cards with rounded-xl shadow-sm
    - Use text-primary for savings percentage
    - Implement tap with active:scale-95 transition
    - Implement swipe-to-delete
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [ ]* 16.2 Write unit tests for saved lists
    - Test list display
    - Test deletion
    - Test navigation to results
    - _Requirements: 7.3, 7.4_

- [x] 17. Implement Grimace Easter egg page
  - [x] 17.1 Create Grimace component with Tailwind
    - Display with bg-gradient-to-br from-purple-600 to-purple-900
    - Use animate-bounce for character animation
    - Style with backdrop-blur-sm for card effects
    - Implement back button to dashboard
    - Optionally award special Grimace mascot item on first visit
    - _Requirements: 14.3, 14.4, 14.5, 14.6_
  
  - [ ]* 17.2 Write unit test for Easter egg
    - Test passcode validation
    - Test navigation
    - Test special item award
    - _Requirements: 14.2, 14.5_

- [x] 18. Implement MascotPreview component
  - [x] 18.1 Create MascotPreview component
    - Render base koala mascot (#9e8fb2)
    - Layer equipped items (hat, accessory, background, outfit)
    - Support different sizes for different contexts
    - _Requirements: 6.2, 9.1_
  
  - [ ]* 18.2 Write unit tests for mascot rendering
    - Test base mascot rendering
    - Test equipped items layering
    - _Requirements: 6.2_

- [x] 19. Final integration and polish
  - [x] 19.1 Wire all components together
    - Ensure all navigation flows work correctly
    - Verify state persistence across page transitions
    - Test all user journeys end-to-end
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 19.2 Apply Apple HIG design guidelines with Tailwind
    - Verify touch target sizes using py-3 py-4 (44px minimum)
    - Implement smooth transitions with transition-transform transition-colors
    - Use Tailwind spacing scale (p-4, p-6, gap-4, space-y-3)
    - Verify rounded corners (rounded-lg, rounded-xl, rounded-2xl)
    - _Requirements: 11.1, 11.6, 11.7, 11.8_
  
  - [x] 19.3 Optimize performance
    - Implement lazy loading for page components
    - Memoize expensive calculations
    - Optimize mascot image
    - Cache leaderboard data
    - _Requirements: Performance considerations from design_
  
  - [ ]* 19.4 Write integration tests
    - Test complete user journey from splash to results
    - Test navigation between all pages
    - Test state persistence
    - _Requirements: 1.1 through 14.6_

- [x] 20. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based and unit tests
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check library (minimum 100 iterations)
- Unit tests validate specific examples, edge cases, and integration points
- The implementation follows a bottom-up approach: infrastructure → core features → advanced features → polish
