# Integration Quick Reference

## Frontend ↔ Backend Mapping

### Backend Endpoints Summary

| Method | Endpoint              | Purpose                   | Frontend Usage              |
| ------ | --------------------- | ------------------------- | --------------------------- |
| POST   | `/onboard`            | Register user             | Registration page           |
| POST   | `/optimise/groceries` | Get shopping optimization | Results page (optional)     |
| POST   | `/transport/compare`  | Compare fuel costs        | Not used yet                |
| POST   | `/weekly-plan/record` | Record spending           | Results submission          |
| GET    | `/leaderboard`        | Get rankings              | Leaderboard page (optional) |

### Frontend Pages Summary

| Page         | Route          | Backend Calls                     | Data Source          |
| ------------ | -------------- | --------------------------------- | -------------------- |
| Registration | `/register`    | Should call `/onboard`            | Currently local only |
| Shop         | `/shop`        | None                              | Local + n8n webhook  |
| Results      | `/results`     | Should call `/optimise/groceries` | Currently mock data  |
| Dashboard    | `/dashboard`   | None                              | Local state          |
| Leaderboard  | `/leaderboard` | Should call `/leaderboard`        | Currently mock data  |

### Data Format Conversions

#### Shopping List

```javascript
// Frontend Format
{
  id: "milk",
  name: "Milk",
  icon: "Milk",
  quantity: 2,
  price: 3.50
}

// Backend Format (convert to)
["Milk", "Bread", "Eggs"]  // Array of strings
```

#### User Data

```javascript
// Frontend Collects
{
  name: "John",
  budget: 150,
  transportPreference: "driving"
}

// Backend Expects
{
  name: "John",
  weekly_budget: 150,
  home_address: "123 Main St"  // ADD THIS
}
```

### Integration Priority

1. **HIGH:** User onboarding (Week 1)
2. **HIGH:** Weekly plan recording (Week 3)
3. **MEDIUM:** Grocery optimization (Week 2)
4. **LOW:** Leaderboard (Week 4)
5. **FUTURE:** Transport comparison

### Quick Start Commands

```bash
# Start Backend
cd Backend
./venv/bin/python -m uvicorn main:app --reload --port 8000

# Start Frontend
cd Frontend/koko-app
npm run dev

# Test Backend
curl http://localhost:8000/docs

# Test Frontend
open http://localhost:5173
```
