# Design Document: Student Money-Saving App

## Overview

The Student Money-Saving App is a mobile application that helps students save money by comparing grocery prices, finding cheap petrol, and optimizing public transport routes. The app follows a linear four-page flow with budget tracking, shopping list management, price comparison, and a gamified leaderboard system.

### Technology Stack

- **Frontend**: React Native (cross-platform mobile app for iOS and Android)
- **State Management**: React Context API with AsyncStorage for persistence
- **Navigation**: React Navigation (stack navigator)
- **APIs**: 
  - Coles/Woolworths price data (web scraping or third-party aggregator)
  - Australian Government Fuel Price API (NSW FuelCheck or VIC FuelWatch)
  - PTV API (Public Transport Victoria)
- **Storage**: AsyncStorage for local data persistence
- **Location Services**: React Native Geolocation

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App (React Native)                │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Budget  │→ │ Shopping │→ │  Product │→ │   Edit   │   │
│  │   Page   │  │   List   │  │ Compare  │  │ & Submit │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                      ↓                                       │
│              ┌──────────────┐                               │
│              │ Profile Page │                               │
│              └──────────────┘                               │
├─────────────────────────────────────────────────────────────┤
│                    Application State Layer                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Budget | Mode | Shopping List | Selections | User   │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      Service Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Grocery  │  │  Petrol  │  │   PTV    │  │  Leader  │  │
│  │ Service  │  │ Service  │  │ Service  │  │  board   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    External APIs                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │  Price   │  │   Fuel   │  │   PTV    │                 │
│  │   API    │  │   API    │  │   API    │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

The app uses a page-based architecture with shared state management:

1. **Navigation Layer**: Stack-based navigation between pages
2. **Page Components**: Budget, ShoppingList, ProductComparison, EditAndSubmit, Profile, Leaderboard
3. **State Management**: Global context for budget, mode, shopping list, and user data
4. **Service Layer**: Abstracted API calls for grocery prices, petrol prices, and PTV routes
5. **Storage Layer**: AsyncStorage for data persistence

## Components and Interfaces

### 1. Navigation Structure

```typescript
type RootStackParamList = {
  Budget: undefined;
  ShoppingList: undefined;
  ProductComparison: undefined;
  EditAndSubmit: undefined;
  Profile: undefined;
  Leaderboard: undefined;
};
```

### 2. State Management

#### AppContext Interface

```typescript
interface AppState {
  budget: number | null;
  mode: {
    groceries: boolean;
    ptvTravel: boolean;
    carTravel: boolean;
  };
  shoppingList: ShoppingItem[];
  selectedProducts: SelectedProduct[];
  user: UserProfile;
  leaderboard: LeaderboardEntry[];
}

interface ShoppingItem {
  id: string;
  name: string;
  addedAt: Date;
}

interface SelectedProduct {
  itemId: string;
  productId: string;
  retailer: 'coles' | 'woolworths';
  name: string;
  price: number;
}

interface UserProfile {
  id: string;
  name: string;
  totalSavings: number;
}

interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalSavings: number;
  rank: number;
}
```

### 3. Service Interfaces

#### GroceryService

```typescript
interface GroceryService {
  searchProduct(itemName: string): Promise<ProductComparison>;
  getPriceTrend(productId: string, days: number): Promise<PriceTrendAnalysis>;
  generateMockPriceHistory(productId: string, currentPrice: number, days: number): PriceHistoryPoint[];
}

interface ProductComparison {
  itemName: string;
  colesProduct: Product | null;
  woolworthsProduct: Product | null;
  trendAnalysis?: PriceTrendAnalysis;
}

interface Product {
  id: string;
  name: string;
  price: number;
  retailer: 'coles' | 'woolworths';
  imageUrl?: string;
  priceHistory?: PriceHistoryPoint[];
}

interface PriceHistoryPoint {
  date: Date;
  price: number;
  retailer: 'coles' | 'woolworths';
}

interface PriceTrendAnalysis {
  currentPrice: number;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendation: PurchaseRecommendation;
  explanation: string;
}

interface PurchaseRecommendation {
  action: 'buy_now' | 'wait' | 'neutral';
  confidence: 'high' | 'medium' | 'low';
  message: string;
}
```

#### PetrolService

```typescript
interface PetrolService {
  findCheapestPetrol(latitude: number, longitude: number, radiusKm: number): Promise<PetrolStation[]>;
}

interface PetrolStation {
  id: string;
  name: string;
  address: string;
  pricePerLiter: number;
  distanceKm: number;
  latitude: number;
  longitude: number;
}
```

#### PTVService

```typescript
interface PTVService {
  findShortestRoute(origin: Location, destination: Location): Promise<PTVRoute[]>;
}

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface PTVRoute {
  id: string;
  durationMinutes: number;
  legs: RouteLeg[];
  totalDistance: number;
}

interface RouteLeg {
  mode: 'train' | 'tram' | 'bus' | 'walk';
  from: string;
  to: string;
  durationMinutes: number;
  departureTime: Date;
  arrivalTime: Date;
}
```

### 4. Page Components

#### BudgetPage

**Purpose**: Collect user budget and mode selection

**State**:
- Local: budgetInput (string), selectedModes (object)
- Updates: AppContext.budget, AppContext.mode

**Validation**:
- Budget must be positive number
- At least one mode must be selected

**Navigation**: Proceeds to ShoppingList on valid submission

#### ShoppingListPage

**Purpose**: Allow users to create shopping list and access profile

**State**:
- Local: itemInput (string)
- Updates: AppContext.shoppingList

**UI Elements**:
- Item input field
- Add button
- List of added items
- Profile icon (top right)
- Continue button

**Navigation**: 
- Profile icon → Profile page
- Continue → ProductComparison page

#### ProductComparisonPage

**Purpose**: Display price comparisons, price trends, and allow product selection

**State**:
- Local: currentItemIndex (number), loading (boolean), selectedTab ('comparison' | 'trend')
- Reads: AppContext.shoppingList
- Updates: AppContext.selectedProducts

**UI Elements**:
- Two product cards side-by-side (Coles vs Woolworths)
- Price trend chart (line chart showing 30-day history)
- AI-generated purchase recommendation badge
- Key statistics panel (current, average, low, high prices)
- Tab switcher (Comparison view / Trend view)
- Product selection buttons

**Behavior**:
- Fetch prices for each item in shopping list
- Fetch or generate price trend data (30 days)
- Display two products side-by-side (Coles vs Woolworths)
- Show price trend chart with both retailers' data
- Generate AI recommendation based on trend analysis
- Allow user to select one product
- Move to next item after selection
- Navigate to EditAndSubmit when all items processed

**Price Trend Logic**:
```typescript
function analyzePriceTrend(history: PriceHistoryPoint[]): PriceTrendAnalysis {
  const currentPrice = history[history.length - 1].price;
  const avgPrice = calculateAverage(history.map(h => h.price));
  const minPrice = Math.min(...history.map(h => h.price));
  const maxPrice = Math.max(...history.map(h => h.price));
  
  // Calculate trend direction
  const recentPrices = history.slice(-7); // Last 7 days
  const trend = calculateTrend(recentPrices);
  
  // Generate recommendation
  if (currentPrice <= minPrice * 1.05) {
    return {
      action: 'buy_now',
      confidence: 'high',
      message: 'Great price! This is near the lowest price in 30 days.',
      explanation: `Current price ($${currentPrice}) is within 5% of the 30-day low ($${minPrice}). Buy now to maximize savings.`
    };
  } else if (currentPrice >= maxPrice * 0.95) {
    return {
      action: 'wait',
      confidence: 'high',
      message: 'Price is high. Consider waiting for a better deal.',
      explanation: `Current price ($${currentPrice}) is near the 30-day high ($${maxPrice}). Prices typically drop within 1-2 weeks.`
    };
  } else if (trend === 'decreasing') {
    return {
      action: 'wait',
      confidence: 'medium',
      message: 'Price is trending down. Might drop further.',
      explanation: `Prices have been decreasing over the past week. Average price is $${avgPrice.toFixed(2)}.`
    };
  } else if (trend === 'increasing') {
    return {
      action: 'buy_now',
      confidence: 'medium',
      message: 'Price is rising. Buy soon before it increases more.',
      explanation: `Prices have been increasing. Current price ($${currentPrice}) is still below the 30-day high.`
    };
  } else {
    return {
      action: 'neutral',
      confidence: 'medium',
      message: 'Stable price. Buy when you need it.',
      explanation: `Price has been stable around $${avgPrice.toFixed(2)}. No significant changes expected.`
    };
  }
}
```

**Mock Data Generation** (for MVP):
```typescript
function generateMockPriceHistory(
  productId: string, 
  currentPrice: number, 
  days: number = 30
): PriceHistoryPoint[] {
  const history: PriceHistoryPoint[] = [];
  const today = new Date();
  
  // Generate realistic price variations
  // - Base price with ±15% variation
  // - Weekly cycles (lower on weekends)
  // - Occasional promotions (20-30% off)
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Add realistic variation
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isPromoWeek = Math.floor(i / 7) % 3 === 0; // Promo every 3 weeks
    
    let price = currentPrice;
    if (i > 0) {
      price += (Math.random() - 0.5) * currentPrice * 0.1; // ±10% variation
      if (isWeekend) price *= 0.95; // 5% lower on weekends
      if (isPromoWeek) price *= 0.8; // 20% off during promo
    }
    
    history.push({
      date,
      price: Math.round(price * 100) / 100,
      retailer: 'coles' // Generate for both retailers
    });
  }
  
  return history;
}
```

**Error Handling**:
- Display message if product not found
- Allow skipping items with missing data
- Show "Using simulated data" indicator when using mock prices

#### EditAndSubmitPage

**Purpose**: Review selections, edit list, and submit

**State**:
- Reads: AppContext.budget, AppContext.selectedProducts
- Computes: totalCost, remainingBudget, totalSavings

**UI Elements**:
- List of selected products with prices
- Remove/change buttons for each item
- Total cost display
- Budget remaining display
- Submit button

**Validation**:
- Warn if over budget (but allow submission)

**Navigation**: Submit → Leaderboard page

#### ProfilePage

**Purpose**: Display and manage user profile

**State**:
- Reads: AppContext.user
- Updates: User profile information

**UI Elements**:
- User name
- Total savings
- Purchase history (optional)
- Settings (optional)

**Navigation**: Back button → ShoppingList page

#### LeaderboardPage

**Purpose**: Display savings leaderboard

**State**:
- Reads: AppContext.leaderboard
- Updates: Leaderboard after submission

**UI Elements**:
- Ranked list of users
- Current user highlighted
- Savings amounts

**Behavior**:
- Calculate savings based on price differences
- Update user's total savings
- Refresh leaderboard rankings

## Data Models

### Price Trend UI Components

#### PriceTrendChart Component

**Purpose**: Display historical price data as an interactive line chart

**Props**:
```typescript
interface PriceTrendChartProps {
  colesHistory: PriceHistoryPoint[];
  woolworthsHistory: PriceHistoryPoint[];
  currentSelection?: 'coles' | 'woolworths';
  onDateSelect?: (date: Date) => void;
}
```

**UI Elements**:
- Line chart with two lines (Coles in red, Woolworths in green)
- X-axis: Dates (last 30 days)
- Y-axis: Price in AUD
- Interactive tooltips on hover showing exact price and date
- Current price indicator (highlighted point)
- Average price line (dashed horizontal line)
- Responsive design for mobile

**Chart Library**: Recharts or Victory Native (React Native compatible)

#### PurchaseRecommendationBadge Component

**Purpose**: Display AI-generated purchase timing advice

**Props**:
```typescript
interface PurchaseRecommendationBadgeProps {
  recommendation: PurchaseRecommendation;
  productName: string;
}
```

**UI Elements**:
- Color-coded badge:
  - Green: "Buy now" recommendation
  - Yellow: "Neutral" recommendation
  - Red: "Wait" recommendation
- Icon indicating confidence level
- Short message (e.g., "Great price!")
- Expandable section showing detailed explanation
- Animated entrance for visual appeal

**Example UI**:
```
┌─────────────────────────────────────────┐
│  🟢 Buy Now - Great Price!              │
│  ────────────────────────────────────   │
│  Current price ($3.50) is within 5% of │
│  the 30-day low ($3.40). Buy now to    │
│  maximize savings.                      │
└─────────────────────────────────────────┘
```

#### PriceStatisticsPanel Component

**Purpose**: Display key price metrics at a glance

**Props**:
```typescript
interface PriceStatisticsPanelProps {
  currentPrice: number;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  retailer: 'coles' | 'woolworths';
}
```

**UI Layout**:
```
┌──────────────────────────────────────┐
│  Current    Average   Low     High   │
│  $3.50      $3.75     $3.40   $4.20  │
│  ────────────────────────────────    │
│  You're saving $0.25 vs average      │
└──────────────────────────────────────┘
```

### Mock Data Strategy

For MVP, use deterministic mock data generation:

```typescript
class MockPriceHistoryService {
  // Seed-based generation for consistency
  generateHistory(productId: string, currentPrice: number): PriceHistoryPoint[] {
    const seed = this.hashProductId(productId);
    const random = this.seededRandom(seed);
    
    // Generate 30 days of realistic price variations
    // - Weekly patterns (lower prices on weekends)
    // - Promotional cycles (every 2-3 weeks)
    // - Gradual trends (slight increase/decrease over time)
    // - Random noise (±5% daily variation)
    
    return this.generateRealisticPricePattern(currentPrice, random);
  }
  
  private generateRealisticPricePattern(
    basePrice: number, 
    random: () => number
  ): PriceHistoryPoint[] {
    // Implementation generates realistic grocery price patterns
    // Based on actual retail pricing behavior
  }
}
```

**Mock Data Indicator**:
- Display small badge: "📊 Simulated data for demo"
- Tooltip explaining: "Historical price data will be available once we collect real pricing information"

## Data Models

### Storage Schema

Data persisted to AsyncStorage:

```typescript
// Keys
const STORAGE_KEYS = {
  USER_PROFILE: '@user_profile',
  SHOPPING_LIST: '@shopping_list',
  SELECTED_PRODUCTS: '@selected_products',
  BUDGET: '@budget',
  MODE: '@mode',
  LEADERBOARD: '@leaderboard',
};

// Stored data structure
interface StoredData {
  userProfile: UserProfile;
  shoppingList: ShoppingItem[];
  selectedProducts: SelectedProduct[];
  budget: number | null;
  mode: ModeSelection;
  leaderboard: LeaderboardEntry[];
}
```

### Savings Calculation

```typescript
interface SavingsCalculation {
  calculateSavings(selectedProducts: SelectedProduct[]): number;
}

// Savings = sum of (higher price - selected price) for each item
// If user selected Coles at $3 and Woolworths was $4, savings = $1
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Budget Validation

*For any* input value, the budget validation should accept only positive numbers and reject zero, negative numbers, and non-numeric values, displaying appropriate error messages for invalid inputs.

**Validates: Requirements 1.2, 1.3**

### Property 2: Budget Storage Round-Trip

*For any* valid positive budget amount, submitting the budget and then retrieving it from storage should return the same value.

**Validates: Requirements 1.4**

### Property 3: Spending Tracking Invariant

*For any* shopping session with selected products, the tracked total spending should always equal the sum of all selected product prices.

**Validates: Requirements 1.5, 5.5, 8.4**

### Property 4: Mode Selection Feature Enablement

*For any* combination of selected modes (groceries, PTV, car), the corresponding features should be enabled if and only if that mode is selected.

**Validates: Requirements 2.2, 2.3, 2.4, 2.5**

### Property 5: Mode Selection Validation

*For any* mode selection state where no modes are selected, navigation to the next page should be blocked.

**Validates: Requirements 2.6**

### Property 6: Shopping List Item Addition

*For any* valid (non-empty) item name, adding it to the shopping list should result in the list length increasing by one and the item being retrievable from the list.

**Validates: Requirements 3.2, 3.4**

### Property 7: Empty Item Validation

*For any* string composed entirely of whitespace or empty string, attempting to add it to the shopping list should be rejected and the list should remain unchanged.

**Validates: Requirements 3.3**

### Property 8: Profile Navigation Round-Trip

*For any* shopping list state, navigating from the shopping list page to the profile page and back should preserve the shopping list state.

**Validates: Requirements 4.1, 4.4**

### Property 9: Price Retrieval Completeness

*For any* shopping list with N items, submitting the list should trigger price retrieval attempts for all N items from both Coles and Woolworths.

**Validates: Requirements 5.1**

### Property 10: Product Display Completeness

*For any* product comparison where both Coles and Woolworths products are available, exactly two product options should be displayed.

**Validates: Requirements 5.2**

### Property 11: Product Information Completeness

*For any* product displayed to the user, the rendered output should contain the product name, price, and retailer name.

**Validates: Requirements 5.3**

### Property 12: Single Product Selection

*For any* item with multiple product options, the user should be able to select exactly one product, and attempting to select a second should replace the first selection.

**Validates: Requirements 5.4**

### Property 13: Petrol Station Radius Constraint

*For any* user location and 5km radius search, all returned petrol stations should have a distance less than or equal to 5km from the user's location.

**Validates: Requirements 6.2**

### Property 14: Petrol Station Sort Order

*For any* list of petrol stations returned, they should be sorted in ascending order by price per liter (cheapest first).

**Validates: Requirements 6.3**

### Property 15: Petrol Station Information Completeness

*For any* petrol station displayed to the user, the rendered output should contain the station name, price per liter, and distance from user.

**Validates: Requirements 6.4**

### Property 16: PTV Route Sort Order

*For any* list of PTV routes returned, they should be sorted in ascending order by travel time (shortest first).

**Validates: Requirements 7.4**

### Property 17: Route Information Completeness

*For any* PTV route displayed to the user, the rendered output should contain route details, travel time, and transport modes used.

**Validates: Requirements 7.5**

### Property 18: Shopping List Removal

*For any* shopping list with N items, removing one item should result in a list with N-1 items, and the removed item should no longer be present.

**Validates: Requirements 8.2**

### Property 19: Product Selection Change

*For any* selected product, changing the selection to the alternative retailer's product should update the total cost to reflect the new price.

**Validates: Requirements 8.3**

### Property 20: Budget Display Accuracy

*For any* shopping session, the displayed remaining budget should always equal the initial budget minus the total cost of selected products.

**Validates: Requirements 8.5**

### Property 21: Over-Budget Warning

*For any* shopping session state where the total cost exceeds the budget, a warning message should be displayed to the user.

**Validates: Requirements 8.6**

### Property 22: Savings Calculation Accuracy

*For any* set of selected products where alternative options exist, the total savings should equal the sum of (alternative price - selected price) for each item where the selected price is lower.

**Validates: Requirements 9.2**

### Property 23: Leaderboard Sort Order

*For any* leaderboard with multiple users, entries should be sorted in descending order by total savings (highest savings first).

**Validates: Requirements 9.4**

### Property 24: Leaderboard Entry Completeness

*For any* leaderboard entry displayed, the rendered output should contain the user name and their total savings amount.

**Validates: Requirements 9.5**

### Property 25: Leaderboard Update After Submission

*For any* user submission, the user's leaderboard entry should be updated to reflect their new total savings, calculated as previous total plus current session savings.

**Validates: Requirements 9.6**

### Property 26: Data Persistence Round-Trip

*For any* app state including shopping list, user profile, selected products, budget, mode, and leaderboard data, saving to storage and then loading should return equivalent data.

**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

### Property 27: Navigation Sequence Enforcement

*For any* attempt to navigate forward in the app, the user should only be able to access pages in the defined sequence: Budget → Shopping List → Product Comparison → Edit & Submit, and should not be able to skip required pages.

**Validates: Requirements 11.1, 11.2, 11.5**

### Property 28: Backward Navigation Availability

*For any* page in the app (except the first page), the user should be able to navigate backward to the previous page.

**Validates: Requirements 11.3**

### Property 29: Error Message Appropriateness

*For any* invalid input or error condition, the displayed error message should be user-friendly (non-technical) and specific to the type of error encountered.

**Validates: Requirements 13.3, 13.4**

### Property 30: Price Trend Data Completeness

*For any* product with price history, the trend analysis should include current price, 30-day average, lowest price, and highest price.

**Validates: Requirements 12.8**

### Property 31: Purchase Recommendation Consistency

*For any* product where the current price is within 5% of the 30-day low, the recommendation should be "buy_now" with high confidence.

**Validates: Requirements 12.4**

### Property 32: Purchase Recommendation for High Prices

*For any* product where the current price is within 5% of the 30-day high, the recommendation should be "wait" with high confidence.

**Validates: Requirements 12.5**

### Property 33: Stable Price Recommendation

*For any* product where the price variation over 30 days is less than 10%, the recommendation should be "neutral" indicating stable pricing.

**Validates: Requirements 12.6**

### Property 34: Price History Chart Display

*For any* product comparison, the price trend chart should display data points for both Coles and Woolworths on the same chart.

**Validates: Requirements 12.1, 12.2**

### Property 35: Natural Language Explanation Presence

*For any* price trend analysis, a natural-language explanation should be generated and displayed to the user.

**Validates: Requirements 12.3, 12.7**

### Property 36: Product Display Completeness

*For any* product displayed in the catalog, the rendered output should contain the product name, price, and stock availability.

**Validates: Requirements 14.1, 14.2, 14.3**

### Property 37: Sale Indicator Display

*For any* product marked as on sale (discounted), the display should include an "(On Sale!)" indicator.

**Validates: Requirements 14.4**

### Property 38: Share Button Presence

*For any* product displayed in the catalog, a "Share" button should be present and clickable.

**Validates: Requirements 14.5**

### Property 39: Share Popup Functionality

*For any* product's share button clicked, a popup should appear encouraging users to share their saving tips.

**Validates: Requirements 14.6**

## Product Catalog Component Design

### ProductCatalog Component

**Purpose**: Display browsable product catalog with sharing functionality

**State**:
- Local: products (array), showSharePopup (boolean), selectedProduct (object)
- Reads: Product data from API or context

**UI Elements**:
- Product grid/list displaying:
  - Product name
  - Product price
  - Stock availability
  - "(On Sale!)" badge for discounted items
  - "Share" button per product
- Share popup modal
- Footer with message: "Predicted price trends coming soon..."

**Product Interface**:
```typescript
interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  stock: number | 'in_stock' | 'out_of_stock';
  isOnSale: boolean;
  originalPrice?: number;
  imageUrl?: string;
}
```

**Share Popup Component**:
```typescript
interface SharePopupProps {
  isOpen: boolean;
  product: CatalogProduct;
  onClose: () => void;
}
```

**Example UI Layout**:
```
┌─────────────────────────────────────────┐
│  Product Name                           │
│  $3.50  [In Stock]  (On Sale!)         │
│  [Share] button                         │
└─────────────────────────────────────────┘

Footer: "Predicted price trends coming soon..."
```

## Error Handling

### Error Categories

1. **Validation Errors**
   - Invalid budget (non-positive, non-numeric)
   - Empty shopping list items
   - No mode selected
   - Handle locally with immediate user feedback

2. **API Errors**
   - Price data unavailable
   - Petrol station API failure
   - PTV API failure
   - Display user-friendly message with retry option
   - Log technical details for debugging

3. **Permission Errors**
   - Location access denied
   - Disable location-dependent features
   - Inform user of impact

4. **Network Errors**
   - Connection timeout
   - No internet connectivity
   - Display offline message
   - Provide retry mechanism
   - Cache last successful data when possible

5. **Data Errors**
   - Corrupted local storage
   - Missing required data
   - Attempt recovery or reset to clean state

### Error Handling Strategy

```typescript
interface ErrorHandler {
  handleError(error: AppError): ErrorResponse;
}

interface AppError {
  type: 'validation' | 'api' | 'permission' | 'network' | 'data';
  code: string;
  message: string;
  technicalDetails?: any;
}

interface ErrorResponse {
  userMessage: string;
  recoveryAction?: 'retry' | 'reset' | 'disable_feature' | 'none';
  shouldLog: boolean;
}
```

### Graceful Degradation

- If Coles data unavailable, show only Woolworths
- If both unavailable, allow manual price entry
- If location unavailable, allow manual address entry
- If PTV API down, show cached routes or disable feature

## Testing Strategy

### Dual Testing Approach

The app will use both unit testing and property-based testing for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Both approaches are complementary and necessary

### Unit Testing

Unit tests will focus on:
- Specific UI component rendering examples
- Integration between services and components
- Edge cases (empty lists, missing data, permission denials)
- Error handling scenarios
- Navigation flows

**Framework**: Jest with React Native Testing Library

**Example Unit Tests**:
- Budget page renders with input field (Req 1.1)
- Shopping list page displays profile icon (Req 3.5)
- Profile page displays user information (Req 4.3)
- Submit button appears on edit page (Req 9.1)
- Empty petrol results show notification (Req 6.5)
- Missing price data handled gracefully (Req 5.6)
- Price trend chart renders with 30 days of data (Req 12.1)
- Purchase recommendation badge displays correct color (Req 12.4, 12.5)
- Mock data indicator shown when using simulated prices (Req 12.9)
- Price statistics panel shows all four metrics (Req 12.8)

### Property-Based Testing

Property tests will verify universal correctness properties across randomized inputs.

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with: **Feature: student-money-saving-app, Property N: [property text]**

**Property Test Coverage**:
- All 29 correctness properties defined above
- Each property implemented as a single property-based test
- Tests placed close to implementation to catch errors early

**Example Property Tests**:
- Property 1: Budget validation with random inputs
- Property 3: Spending tracking invariant with random product selections
- Property 6: Shopping list addition with random item names
- Property 13: Petrol station radius with random locations
- Property 26: Data persistence round-trip with random app states
- Property 30: Price trend data completeness with random price histories
- Property 31: Purchase recommendation consistency for low prices
- Property 35: Natural language explanation generation

### Test Organization

```
__tests__/
├── unit/
│   ├── components/
│   │   ├── BudgetPage.test.tsx
│   │   ├── ShoppingListPage.test.tsx
│   │   ├── ProductComparisonPage.test.tsx
│   │   ├── PriceTrendChart.test.tsx
│   │   ├── PurchaseRecommendationBadge.test.tsx
│   │   ├── PriceStatisticsPanel.test.tsx
│   │   ├── EditAndSubmitPage.test.tsx
│   │   ├── ProfilePage.test.tsx
│   │   └── LeaderboardPage.test.tsx
│   ├── services/
│   │   ├── GroceryService.test.ts
│   │   ├── PriceTrendService.test.ts
│   │   ├── MockPriceHistoryService.test.ts
│   │   ├── PetrolService.test.ts
│   │   └── PTVService.test.ts
│   └── utils/
│       ├── validation.test.ts
│       ├── calculations.test.ts
│       └── priceTrendAnalysis.test.ts
└── properties/
    ├── budget.properties.test.ts
    ├── shopping-list.properties.test.ts
    ├── price-comparison.properties.test.ts
    ├── price-trend.properties.test.ts
    ├── petrol.properties.test.ts
    ├── ptv.properties.test.ts
    ├── persistence.properties.test.ts
    └── navigation.properties.test.ts
```

### Integration Testing

- Test complete user flows end-to-end
- Mock external APIs (Coles/Woolworths, Fuel, PTV)
- Verify data flows between components
- Test state management across navigation

### API Mocking Strategy

For testing, mock all external APIs:
- Grocery price API: Return predictable test data
- Petrol API: Return stations at known distances
- PTV API: Return routes with known durations
- Use dependency injection to swap real services with mocks

## Implementation Notes

### API Integration Considerations

1. **Grocery Prices**: Coles and Woolworths don't provide official public APIs. Options:
   - Use third-party aggregator services (e.g., grocery price comparison APIs)
   - Web scraping (legal and ethical considerations apply)
   - Manual price database (requires maintenance)

2. **Petrol Prices**: 
   - NSW: FuelCheck API (official government API)
   - VIC: FuelWatch API
   - Requires API key registration

3. **PTV API**:
   - Official Public Transport Victoria API
   - Requires API key (free for developers)
   - Rate limits apply

### Performance Considerations

- Cache API responses to reduce network calls
- Implement request debouncing for search inputs
- Use pagination for large leaderboards
- Optimize image loading for product images
- Implement loading states for all async operations

### Security Considerations

- Store API keys securely (environment variables, not in code)
- Validate all user inputs before processing
- Sanitize data from external APIs
- Implement rate limiting for API calls
- Use HTTPS for all API communications

### Accessibility

- Ensure all interactive elements have proper labels
- Support screen readers
- Provide sufficient color contrast
- Support text scaling
- Keyboard navigation support

### Future Enhancements

- Push notifications for price drops
- Barcode scanning for quick item addition
- Recipe suggestions based on budget
- Social features (share savings with friends)
- Real historical price tracking (replace mock data)
- Multi-store comparison (beyond Coles/Woolworths)
- Price prediction using ML models
- Personalized price alerts based on purchase history
- Export price trend data as CSV/PDF reports

## AI Integration for Price Trends

### Kiro AI Service

The price trend feature leverages Kiro for intelligent analysis:

**Kiro Responsibilities**:
1. **Trend Analysis**: Analyze 30-day price patterns to identify trends
2. **Recommendation Generation**: Generate contextual purchase timing advice
3. **Natural Language Explanations**: Create human-readable explanations of price behavior
4. **Confidence Scoring**: Assess recommendation confidence based on data quality

**Example Kiro API Call**:
```typescript
// POST /ai/analyze-price-trend
{
  "productId": "coles-milk-2l",
  "productName": "Full Cream Milk 2L",
  "currentPrice": 3.50,
  "priceHistory": [
    { "date": "2024-01-15", "price": 3.40 },
    { "date": "2024-01-16", "price": 3.45 },
    // ... 30 days of data
  ],
  "userContext": {
    "budget": 100,
    "purchaseFrequency": "weekly"
  }
}

// Response
{
  "recommendation": {
    "action": "buy_now",
    "confidence": "high",
    "message": "Great price! This is near the lowest price in 30 days."
  },
  "explanation": "Current price ($3.50) is within 5% of the 30-day low ($3.40). Based on historical patterns, this product typically goes on sale every 2-3 weeks. Buy now to maximize savings.",
  "statistics": {
    "currentPrice": 3.50,
    "averagePrice": 3.75,
    "lowestPrice": 3.40,
    "highestPrice": 4.20,
    "percentileRank": 15
  },
  "insights": [
    "Price is 6.7% below the 30-day average",
    "This is the 2nd lowest price in the past month",
    "Next expected promotion: ~14 days"
  ]
}
```

### n8n Workflow for Price History

**Workflow: Daily Price Collection**
```
Trigger: Cron (daily at 6 AM)
  ↓
Get list of tracked products from DB
  ↓
[For each product]
  ├─→ Scrape current Coles price
  ├─→ Scrape current Woolworths price
  ↓
Store price points in time-series DB
  ↓
If significant price change (>10%):
  ├─→ Trigger Kiro analysis
  ├─→ Update recommendations
  └─→ Send push notification to users tracking this product
```

This architecture separates concerns: n8n handles data collection and orchestration, while Kiro provides intelligent analysis and recommendations.
