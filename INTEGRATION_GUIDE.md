# Frontend-Backend Integration Guide

## Koko Gamified Savings App

**Date:** December 2024  
**Purpose:** Complete integration strategy for Frontend (React) and Backend (FastAPI)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Backend API Summary](#backend-api-summary)
3. [Frontend Functionality Summary](#frontend-functionality-summary)
4. [Integration Gaps & Conflicts](#integration-gaps--conflicts)
5. [Integration Strategy](#integration-strategy)
6. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

### Current State

- **Backend**: Fully functional FastAPI with 5 endpoints, SQLite database, n8n integration
- **Frontend**: React app with gamification, local state management, mock n8n integration
- **Gap**: Frontend and Backend were developed independently with different feature sets

### Key Findings

1. Backend focuses on **budget optimization** (grocery, transport, leaderboard)
2. Frontend focuses on **gamification** (XP, mascot, streaks, shopping lists)
3. **No direct overlap** - they complement each other but need integration layer
4. Frontend expects different data shapes than Backend provides

---

## Backend API Summary

### Base URL

```
http://localhost:8000
```

### Authentication

- None currently implemented
- User identified by `user_id` from onboarding

### Endpoint 1: User Onboarding

**Method:** `POST`  
**Path:** `/onboard`  
**Purpose:** Register new user with budget and address

**Request Body:**

```json
{
  "name": "string (required, non-empty)",
  "weekly_budget": "number (required, > 0)",
  "home_address": "string (required, non-empty)"
}
```

**Response (201):**

```json
{
  "user_id": "usr_abc123def456",
  "name": "John Smith",
  "weekly_budget": 150.0,
  "home_address": "123 University Ave, Sydney NSW 2000",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**

- `400`: Validation error (invalid budget, empty name/address)
- `500`: Database error

---

### Endpoint 2: Grocery Optimization

**Method:** `POST`  
**Path:** `/optimise/groceries`  
**Purpose:** Get optimal grocery shopping strategy with price predictions

**Request Body:**

```json
{
  "user_id": "string (required)",
  "grocery_list": ["string array (required, non-empty)"]
}
```

**Response (200):**

```json
{
  "optimal_cost": 12.50,
  "store_recommendations": ["Woolworths", "Coles"],
  "item_breakdown": [
    {
      "item_name": "Milk (1L)",
      "current_price": 3.50,
      "store_name": "Woolworths",
      "price_prediction": "likely to drop next week" | "historically rising" | null
    }
  ]
}
```

**Price Prediction Logic:**

- Based on 4-week historical average
- "likely to drop next week": current price < average
- "historically rising": current price >= average
- `null`: no historical data

**Error Responses:**

- `400`: Empty grocery list
- `404`: User not found
- `503`: n8n service unavailable

---

### Endpoint 3: Transport Cost Comparison

**Method:** `POST`  
**Path:** `/transport/compare`  
**Purpose:** Compare fuel costs at nearby petrol stations

**Request Body:**

```json
{
  "user_id": "string (required)",
  "destination": "string (required)",
  "fuel_amount_needed": "number (required, > 0)"
}
```

**Response (200):**

```json
{
  "stations": [
    {
      "station_name": "7-Eleven Kensington",
      "address": "456 Anzac Parade, Kensington NSW 2033",
      "distance_from_home": 2.5,
      "price_per_liter": 1.85,
      "cost_to_reach_station": 0.5,
      "fuel_cost_at_station": 74.0,
      "total_cost": 74.5
    }
  ]
}
```

**Calculation:**

```
total_cost = cost_to_reach_station + (fuel_amount_needed × price_per_liter)
```

**Sorting:** By `total_cost` ascending (cheapest first)

**Error Responses:**

- `400`: Invalid fuel amount
- `404`: User not found
- `503`: n8n/NSW Fuel API unavailable

---

### Endpoint 4: Weekly Plan Recording

**Method:** `POST`  
**Path:** `/weekly-plan/record`  
**Purpose:** Record actual spending and calculate optimization score

**Request Body:**

```json
{
  "user_id": "string (required)",
  "optimal_cost": "number (required, >= 0)",
  "actual_cost": "number (required, > 0)"
}
```

**Response (201):**

```json
{
  "id": 42,
  "user_id": "usr_abc123def456",
  "optimal_cost": 85.5,
  "actual_cost": 92.3,
  "optimization_score": 0.385,
  "created_at": "2024-01-22T18:45:00Z"
}
```

**Score Calculation:**

```
optimization_score = (weekly_budget - actual_cost) / weekly_budget
```

**Score Interpretation:**

- Positive: Under budget (good)
- Zero: Exactly on budget
- Negative: Over budget (overspent)

**Error Responses:**

- `400`: Invalid costs
- `404`: User not found
- `500`: Database error

---

### Endpoint 5: Leaderboard

**Method:** `GET`  
**Path:** `/leaderboard`  
**Purpose:** Get ranked users by average optimization score

**Request:** None (no body)

**Response (200):**

```json
{
  "leaderboard": [
    {
      "user_id": "usr_abc123",
      "username": "Alice Johnson",
      "average_score": 0.25,
      "rank": 1
    },
    {
      "user_id": "usr_def456",
      "username": "Bob Smith",
      "average_score": 0.18,
      "rank": 2
    }
  ]
}
```

**Ranking Logic:**

1. Calculate average `optimization_score` per user
2. Exclude users with no weekly plans
3. Sort by average score descending
4. Assign ranks (1 = best)

**Error Responses:**

- `500`: Database error

---

### Backend Error Response Format

All errors follow this structure:

```json
{
  "error_code": "VALIDATION_ERROR" | "NOT_FOUND" | "DATABASE_ERROR" | "SERVICE_UNAVAILABLE" | "INTERNAL_ERROR",
  "message": "Descriptive error message",
  "details": {
    "field_name": "specific error"
  } | null
}
```

---

## Frontend Functionality Summary

### Core Features

#### 1. User Registration

**Page:** `/register`  
**Collects:**

- Name
- Budget (weekly)
- Transport preference ("public" | "driving")

**Stores:** In `AppContext` → `userPreferences`  
**Does NOT call Backend:** Currently stores locally only

#### 2. Shopping List Management

**Page:** `/shop`  
**Features:**

- Add items from default list
- AI chat mode (voice/text) via n8n
- Manual "Watch List" mode with product catalog
- Price history visualization
- Share products

**Data Shape:**

```javascript
shoppingList: [
  {
    id: "milk",
    name: "Milk",
    icon: "Milk", // Lucide icon name
    quantity: 2,
    price: 3.5 // Optional
  }
];
```

**API Calls:**

- `sendMessageToN8nWithFallback()` → n8n webhook for chat
- Does NOT call Backend grocery optimization

#### 3. Results & Submission

**Page:** `/results`  
**Features:**

- Shows multiple shopping options (cheapest, fastest, no-petrol-stop)
- Adjust actual cost
- Calculate savings & XP
- Submit shopping trip
- Streak saver system

**Data Shape Expected:**

```javascript
{
  storeName: "Budget Mart",
  totalPrice: 42.50,
  baselinePrice: 52.00,
  travelTime: 25,
  savingsPercentage: 18.3,
  xpEarned: 183
}
```

**Calculations (Frontend):**

```javascript
savingsPercentage = ((mostExpensive - actualCost) / mostExpensive) * 100;
xpEarned = Math.round(savingsPercentage * 10); // Simplified
```

**Does NOT call Backend:** All calculations done locally

#### 4. Dashboard

**Page:** `/dashboard`  
**Displays:**

- User profile with mascot
- Level & XP progress
- Streak counter
- Weekly XP
- Lifetime savings
- Past shopping trips

**Data Sources:**

- All from `AppContext` (local state)
- History stored in `localStorage`

**Does NOT call Backend:** No API calls

#### 5. Leaderboard

**Page:** `/leaderboard`  
**Features:**

- Shows ranked users by savings performance
- Custom scoring algorithm (anti-gaming measures)

**Scoring Formula (Frontend):**

```javascript
savingsRate = (weeklyBudget - weeklySpend) / weeklyBudget;
consistencyFactor = daysUnderBudget / totalDays;
leaderboardScore = savingsRate * 0.7 + consistencyFactor * 0.3;
```

**Data Shape:**

```javascript
{
  username: "Sarah M.",
  weeklyBudget: 150,
  weeklySpend: 112,
  daysUnderBudget: 7,
  totalDays: 7,
  leaderboardScore: 0.xxx,
  rank: 1
}
```

**Does NOT call Backend:** Uses mock data

#### 6. Gamification System

**Features:**

- XP & Levels
- Mascot customization (koala)
- Streak tracking
- Streak savers (protect streak when over budget)
- Lootbox animations
- Shop for mascot items

**All stored in:** `AppContext` + `localStorage`  
**No Backend integration**

---

## Integration Gaps & Conflicts

### Critical Gaps

#### Gap 1: User Registration

- **Frontend:** Collects name, budget, transport preference
- **Backend:** Expects name, budget, home_address
- **Issue:** Frontend doesn't collect `home_address`, Backend doesn't use `transport_preference`

#### Gap 2: Shopping List Format

- **Frontend:** `{id, name, icon, quantity, price?}`
- **Backend:** Expects `["item_name1", "item_name2"]` (array of strings)
- **Issue:** Frontend has rich objects, Backend expects simple strings

#### Gap 3: Results Data

- **Frontend:** Expects multiple options with travel time, store details
- **Backend:** Returns single optimization with item breakdown
- **Issue:** Different data structures and purposes

#### Gap 4: Leaderboard Calculation

- **Frontend:** Complex formula with consistency factor
- **Backend:** Simple average optimization score
- **Issue:** Different ranking algorithms

#### Gap 5: XP & Gamification

- **Frontend:** Full gamification system (XP, levels, mascot, streaks)
- **Backend:** No gamification features
- **Issue:** Backend doesn't track or calculate XP

#### Gap 6: Weekly Plan Recording

- **Frontend:** Submits after each shopping trip with XP calculation
- **Backend:** Records optimal_cost vs actual_cost
- **Issue:** Frontend doesn't have `optimal_cost` from Backend

### Data Flow Conflicts

```
Frontend Flow:
Registration → Shop (AI chat) → Results (mock data) → Submit → Dashboard

Backend Flow:
Onboard → Grocery Optimize → Weekly Plan Record → Leaderboard

PROBLEM: These are parallel flows with no connection points!
```

---

## Integration Strategy

### Phase 1: Minimal Integration (Quick Win)

**Goal:** Connect Frontend to Backend without breaking existing features

#### Step 1.1: User Onboarding Integration

**Changes Required:**

**Frontend (`Registration.jsx`):**

```javascript
// Add home address field
const [homeAddress, setHomeAddress] = useState("");

// Call Backend on submit
const handleSubmit = async () => {
  if (validateInputs()) {
    try {
      const response = await fetch("http://localhost:8000/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          weekly_budget: parseFloat(budget),
          home_address: homeAddress.trim()
        })
      });

      const data = await response.json();

      // Store user_id and preferences
      setUserPreferences({
        user_id: data.user_id, // NEW: Store Backend user_id
        name: data.name,
        budget: data.weekly_budget,
        homeAddress: data.home_address,
        transportPreference // Keep Frontend-only field
      });

      navigate("/shop");
    } catch (error) {
      // Handle error
    }
  }
};
```

**Impact:** ✅ Low risk, adds one field, stores `user_id` for future calls

#### Step 1.2: Grocery Optimization Integration (Optional)

**Changes Required:**

**Frontend (`Shop.jsx` or new Results flow):**

```javascript
// After building shopping list, call Backend
const getOptimization = async () => {
  try {
    const response = await fetch("http://localhost:8000/optimise/groceries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userPreferences.user_id,
        grocery_list: shoppingList.map((item) => item.name) // Convert to string array
      })
    });

    const data = await response.json();

    // Use Backend data for Results page
    return {
      optimal_cost: data.optimal_cost,
      stores: data.store_recommendations,
      items: data.item_breakdown,
      // Add price predictions to UI
      predictions: data.item_breakdown.map((item) => ({
        name: item.item_name,
        prediction: item.price_prediction
      }))
    };
  } catch (error) {
    // Fallback to Frontend mock data
  }
};
```

**Impact:** ⚠️ Medium risk, requires Results page redesign

#### Step 1.3: Weekly Plan Recording Integration

**Changes Required:**

**Frontend (`Results.jsx` → `completeSubmission()`):**

```javascript
const completeSubmission = async () => {
  if (!selectedResult) return;

  try {
    // Call Backend to record weekly plan
    const response = await fetch("http://localhost:8000/weekly-plan/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userPreferences.user_id,
        optimal_cost: selectedResult.totalPrice, // Use selected option as optimal
        actual_cost: customCost
      })
    });

    const data = await response.json();

    // Backend returns optimization_score
    // Convert to XP for Frontend gamification
    const backendScore = data.optimization_score;
    const xpFromBackend = Math.max(0, Math.round(backendScore * 1000)); // Scale to XP

    // Update Frontend state
    setXp(xp + xpFromBackend);
    setSavings(savings + savingsAmount);

    // ... rest of submission logic
  } catch (error) {
    // Fallback to Frontend-only submission
  }
};
```

**Impact:** ✅ Low risk, adds Backend tracking without breaking Frontend

#### Step 1.4: Leaderboard Integration

**Changes Required:**

**Frontend (`Leaderboard.jsx`):**

```javascript
// Add toggle between Frontend and Backend leaderboards
const [useBackendLeaderboard, setUseBackendLeaderboard] = useState(false);
const [backendLeaderboard, setBackendLeaderboard] = useState([]);

useEffect(() => {
  if (useBackendLeaderboard) {
    fetchBackendLeaderboard();
  }
}, [useBackendLeaderboard]);

const fetchBackendLeaderboard = async () => {
  try {
    const response = await fetch("http://localhost:8000/leaderboard");
    const data = await response.json();

    // Transform Backend data to Frontend format
    setBackendLeaderboard(
      data.leaderboard.map((entry) => ({
        username: entry.username,
        score: entry.average_score,
        rank: entry.rank
        // Note: Backend doesn't have weeklyBudget, weeklySpend, etc.
      }))
    );
  } catch (error) {
    console.error("Failed to fetch backend leaderboard:", error);
  }
};
```

**Impact:** ✅ Low risk, adds option without breaking existing

---

### Phase 2: Full Integration (Long-term)

**Goal:** Unified system with Backend as source of truth

#### Changes Required:

1. **Backend Enhancements:**
   - Add XP calculation endpoint
   - Add streak tracking
   - Add mascot customization storage
   - Add transport preference to user model
   - Add shopping history endpoint

2. **Frontend Refactoring:**
   - Replace `localStorage` with Backend API calls
   - Migrate state management to Backend
   - Add authentication/sessions
   - Sync gamification data

3. **New Endpoints Needed:**
   ```
   POST /users/{user_id}/xp          # Update XP
   GET  /users/{user_id}/profile     # Get full profile
   POST /users/{user_id}/streak      # Update streak
   GET  /users/{user_id}/history     # Get shopping history
   POST /users/{user_id}/mascot      # Save mascot customization
   ```

**Impact:** 🔴 High risk, major refactoring required

---

## Implementation Roadmap

### Week 1: Foundation (Phase 1.1)

**Priority:** HIGH  
**Risk:** LOW

- [ ] Add `home_address` field to Frontend registration
- [ ] Create API utility file (`src/utils/backendApi.js`)
- [ ] Implement user onboarding API call
- [ ] Store `user_id` in AppContext
- [ ] Test registration flow end-to-end
- [ ] Add error handling for Backend failures

**Deliverable:** Users can register and get a Backend `user_id`

---

### Week 2: Grocery Optimization (Phase 1.2)

**Priority:** MEDIUM  
**Risk:** MEDIUM

- [ ] Add "Get Optimization" button to Results page
- [ ] Call Backend grocery optimization API
- [ ] Display price predictions in UI
- [ ] Show store recommendations
- [ ] Fallback to Frontend mock if Backend fails
- [ ] Test with real n8n integration

**Deliverable:** Users can see Backend-powered grocery optimization

---

### Week 3: Weekly Plan Tracking (Phase 1.3)

**Priority:** HIGH  
**Risk:** LOW

- [ ] Integrate weekly plan recording on submission
- [ ] Convert Backend `optimization_score` to Frontend XP
- [ ] Keep Frontend gamification working
- [ ] Add Backend tracking alongside Frontend
- [ ] Test score calculations match expectations

**Deliverable:** Shopping trips recorded in Backend database

---

### Week 4: Leaderboard Integration (Phase 1.4)

**Priority:** LOW  
**Risk:** LOW

- [ ] Add Backend leaderboard fetch
- [ ] Create toggle UI for Frontend vs Backend leaderboard
- [ ] Display both leaderboards side-by-side
- [ ] Document differences in scoring
- [ ] Let users choose preferred view

**Deliverable:** Users can view Backend leaderboard

---

### Week 5-8: Testing & Refinement

**Priority:** HIGH  
**Risk:** LOW

- [ ] End-to-end testing of all integrated flows
- [ ] Performance testing with real data
- [ ] Error handling improvements
- [ ] UI/UX polish
- [ ] Documentation updates
- [ ] User acceptance testing

**Deliverable:** Stable integrated system

---

## Best Practices for Integration

### 1. Graceful Degradation

Always provide fallback behavior when Backend is unavailable:

```javascript
const callBackendWithFallback = async (endpoint, options, fallbackFn) => {
  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, options);
    if (!response.ok) throw new Error("Backend error");
    return await response.json();
  } catch (error) {
    console.warn("Backend unavailable, using fallback:", error);
    return fallbackFn();
  }
};
```

### 2. Data Transformation Layer

Create adapter functions to convert between Frontend and Backend formats:

```javascript
// adapters/shoppingList.js
export const toBackendFormat = (frontendList) => {
  return frontendList.map((item) => item.name);
};

export const toFrontendFormat = (backendItems) => {
  return backendItems.map((item) => ({
    id: item.item_name.toLowerCase().replace(/\s+/g, "-"),
    name: item.item_name,
    icon: "ShoppingBag",
    quantity: 1,
    price: item.current_price,
    store: item.store_name,
    prediction: item.price_prediction
  }));
};
```

### 3. Environment Configuration

Use environment variables for Backend URL:

```javascript
// .env
VITE_BACKEND_URL=http://localhost:8000
VITE_USE_BACKEND=true

// src/config.js
export const config = {
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',
  useBackend: import.meta.env.VITE_USE_BACKEND === 'true'
}
```

### 4. Error Handling

Handle Backend errors gracefully:

```javascript
const handleBackendError = (error, response) => {
  if (response?.error_code === "NOT_FOUND") {
    // User not found - redirect to registration
    navigate("/register");
  } else if (response?.error_code === "SERVICE_UNAVAILABLE") {
    // n8n down - show user-friendly message
    showNotification("Optimization service temporarily unavailable");
  } else {
    // Generic error
    showNotification("Something went wrong. Please try again.");
  }
};
```

### 5. State Synchronization

Keep Frontend and Backend state in sync:

```javascript
// Sync on mount
useEffect(() => {
  if (userPreferences.user_id) {
    syncWithBackend();
  }
}, [userPreferences.user_id]);

const syncWithBackend = async () => {
  // Fetch latest data from Backend
  // Update Frontend state
  // Resolve conflicts (Backend wins)
};
```

---

## Testing Strategy

### Unit Tests

- Test data transformation functions
- Test API utility functions
- Test error handling logic

### Integration Tests

- Test Frontend → Backend → Frontend flow
- Test fallback mechanisms
- Test error scenarios

### End-to-End Tests

- Complete user journey: Register → Shop → Optimize → Submit → Leaderboard
- Test with real Backend and n8n
- Test offline/Backend-down scenarios

---

## Deployment Considerations

### Development

```bash
# Terminal 1: Backend
cd Backend
./venv/bin/python -m uvicorn main:app --reload

# Terminal 2: Frontend
cd Frontend/koko-app
npm run dev
```

### Production

- **Backend:** Deploy to Railway, Render, or AWS
- **Frontend:** Deploy to Vercel, Netlify, or Cloudflare Pages
- **CORS:** Configure Backend to allow Frontend domain
- **Environment Variables:** Set production URLs

---

## Conclusion

### Recommended Approach: **Phase 1 (Minimal Integration)**

**Why:**

1. ✅ Low risk - doesn't break existing features
2. ✅ Quick wins - can be done in 4 weeks
3. ✅ Validates integration patterns
4. ✅ Provides immediate value (Backend tracking)
5. ✅ Keeps both systems functional independently

**Next Steps:**

1. Start with Week 1 (User Onboarding)
2. Test thoroughly before moving to Week 2
3. Gather user feedback on integrated features
4. Decide on Phase 2 based on results

### Long-term Vision: **Phase 2 (Full Integration)**

Only pursue after Phase 1 is stable and proven. Requires:

- Backend team to add gamification endpoints
- Frontend team to refactor state management
- Significant testing and QA effort
- User migration strategy

---

## Contact & Support

For questions about this integration guide:

- Backend: See `Backend/README.md`
- Frontend: See `Frontend/koko-app/README.md`
- API Docs: `http://localhost:8000/docs` (when Backend running)

**Last Updated:** December 2024
