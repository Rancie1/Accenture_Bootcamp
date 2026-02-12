# Leaderboard Feature Documentation

## Overview

The leaderboard feature ranks users based on their average optimization scores from weekly spending plans. Users who consistently spend less than their budget achieve higher optimization scores and rank higher on the leaderboard.

## Architecture

### Components

1. **Service Layer** (`services/leaderboard_service.py`)
   - Business logic for leaderboard calculation
   - Database queries and aggregations
   - Rank assignment

2. **Router Layer** (`routers/leaderboard.py`)
   - HTTP endpoint handling
   - Request/response formatting
   - Error handling

3. **Data Models** (`models/schemas.py`)
   - `LeaderboardEntry`: Individual leaderboard entry
   - `LeaderboardResponse`: Complete leaderboard response

## API Endpoint

### GET /leaderboard

Retrieves the ranked leaderboard of all users with weekly plans.

**Request:**

```http
GET /leaderboard HTTP/1.1
Host: localhost:8000
```

**Response (200 OK):**

```json
{
  "leaderboard": [
    {
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "Alice",
      "average_score": 0.225,
      "rank": 1
    },
    {
      "user_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "username": "Bob",
      "average_score": 0.1,
      "rank": 2
    },
    {
      "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "username": "Charlie",
      "average_score": -0.1,
      "rank": 3
    }
  ]
}
```

**Error Response (500):**

```json
{
  "detail": {
    "error_code": "DATABASE_ERROR",
    "message": "Failed to calculate leaderboard"
  }
}
```

## Calculation Logic

### Optimization Score Formula

For each weekly plan:

```
optimization_score = (weekly_budget - actual_cost) / weekly_budget
```

**Examples:**

- Budget: $100, Spent: $75 → Score: 0.25 (saved 25%)
- Budget: $100, Spent: $90 → Score: 0.10 (saved 10%)
- Budget: $100, Spent: $110 → Score: -0.10 (overspent by 10%)

### Leaderboard Calculation Process

1. **Query Weekly Plans**: Retrieve all WeeklyPlan records from database
2. **Group by User**: Group plans by user_id
3. **Calculate Averages**: Compute mean optimization_score for each user
4. **Filter Users**: Exclude users with no weekly plans
5. **Sort**: Order by average_score descending (highest first)
6. **Assign Ranks**: Assign sequential ranks (1, 2, 3, ...)
7. **Join User Data**: Fetch usernames from User table

### SQL Query

```sql
SELECT
    u.user_id,
    u.name as username,
    AVG(wp.optimization_score) as average_score,
    RANK() OVER (ORDER BY AVG(wp.optimization_score) DESC) as rank
FROM users u
INNER JOIN weekly_plans wp ON u.user_id = wp.user_id
GROUP BY u.user_id, u.name
ORDER BY average_score DESC
```

## Business Rules

### Inclusion Criteria

- ✓ Users MUST have at least one weekly plan to appear on leaderboard
- ✓ All weekly plans for a user are included in average calculation
- ✓ Negative scores (overspending) are included in calculations

### Exclusion Criteria

- ✗ Users without any weekly plans are excluded
- ✗ Deleted or inactive users are excluded (if user record doesn't exist)

### Ranking Rules

1. **Primary Sort**: Average optimization score (descending)
2. **Rank Assignment**: Sequential integers starting from 1
3. **Tie Handling**: Users with identical scores receive different sequential ranks
4. **Score Range**: Scores can be negative (overspending) to positive (saving)

## Data Models

### LeaderboardEntry

```python
class LeaderboardEntry(BaseModel):
    user_id: str          # UUID of the user
    username: str         # Display name
    average_score: float  # Average optimization score
    rank: int            # Position on leaderboard (1 = best)
```

### LeaderboardResponse

```python
class LeaderboardResponse(BaseModel):
    leaderboard: list[LeaderboardEntry]  # Sorted list of entries
```

## Usage Examples

### Python Client

```python
import httpx

async def get_leaderboard():
    async with httpx.AsyncClient() as client:
        response = await client.get("http://localhost:8000/leaderboard")
        data = response.json()

        for entry in data["leaderboard"]:
            print(f"Rank {entry['rank']}: {entry['username']} - {entry['average_score']:.2%}")
```

### cURL

```bash
# Get leaderboard
curl -X GET http://localhost:8000/leaderboard | jq

# Pretty print with formatting
curl -X GET http://localhost:8000/leaderboard | \
  jq -r '.leaderboard[] | "\(.rank). \(.username) - \(.average_score)"'
```

### JavaScript/Fetch

```javascript
async function getLeaderboard() {
  const response = await fetch("http://localhost:8000/leaderboard");
  const data = await response.json();

  data.leaderboard.forEach((entry) => {
    console.log(
      `${entry.rank}. ${entry.username} - ${entry.average_score.toFixed(4)}`
    );
  });
}
```

## Testing

### Running Tests

```bash
# Run all leaderboard tests
cd Backend
./venv/bin/python -m pytest tests/test_leaderboard.py -v

# Run specific test
./venv/bin/python -m pytest tests/test_leaderboard.py::test_leaderboard_integration -v

# Run with detailed output
./venv/bin/python tests/test_leaderboard.py
```

### Test Coverage

The test suite includes:

1. **Integration Test**: Complete flow with multiple users and plans
2. **Empty Leaderboard Test**: No users with weekly plans
3. **Single User Test**: Leaderboard with one user
4. **Tie Scores Test**: Users with identical average scores

### Test Scenarios

| Scenario         | Users | Plans   | Expected Result                   |
| ---------------- | ----- | ------- | --------------------------------- |
| Normal operation | 4     | 6 total | 3 users ranked (1 excluded)       |
| No plans         | 2     | 0       | Empty leaderboard                 |
| Single user      | 1     | 1       | One entry, rank 1                 |
| Tied scores      | 2     | 2       | Both appear with sequential ranks |

## Performance Considerations

### Database Optimization

- **Indexes**: Ensure indexes on `weekly_plans.user_id` and `weekly_plans.created_at`
- **Query Efficiency**: Single query with JOIN and aggregation
- **Result Size**: Leaderboard size grows linearly with active users

### Caching Strategy (Future Enhancement)

```python
# Recommended caching for production
@cache(ttl=300)  # Cache for 5 minutes
async def calculate_leaderboard(db: Session):
    # ... existing logic
```

### Scalability

- **Current**: Suitable for up to 10,000 active users
- **Optimization**: Add pagination for larger user bases
- **Monitoring**: Track query execution time

## Error Handling

### Database Errors

```python
try:
    leaderboard = await calculate_leaderboard(db)
except DatabaseError:
    # Returns 500 with generic error message
    # Full error logged server-side
```

### Edge Cases

| Case                            | Handling                       |
| ------------------------------- | ------------------------------ |
| No users in database            | Returns empty leaderboard      |
| User deleted after plan created | Plan excluded from leaderboard |
| Database connection failure     | Returns 500 error after retry  |
| Invalid data types              | Caught by Pydantic validation  |

## Requirements Mapping

| Requirement | Implementation                                |
| ----------- | --------------------------------------------- |
| 5.1         | GET /leaderboard endpoint calculates rankings |
| 5.2         | Aggregates all WeeklyPlan records per user    |
| 5.3         | Computes mean optimization_score              |
| 5.5         | Orders by average_score descending            |
| 5.6         | Excludes users without plans                  |
| 5.7         | Returns 200 with ranked list                  |

## Future Enhancements

### Planned Features

1. **Pagination**: Support for large leaderboards

   ```
   GET /leaderboard?page=1&limit=10
   ```

2. **Time Filtering**: Leaderboard for specific time periods

   ```
   GET /leaderboard?period=month
   GET /leaderboard?start_date=2024-01-01&end_date=2024-01-31
   ```

3. **User Position**: Get specific user's rank

   ```
   GET /leaderboard/user/{user_id}
   ```

4. **Leaderboard Categories**: Separate leaderboards by budget range

   ```
   GET /leaderboard?budget_range=0-100
   ```

5. **Caching**: Redis cache for improved performance

### Potential Optimizations

- Materialized views for faster queries
- Background job for leaderboard calculation
- WebSocket updates for real-time leaderboard
- Historical leaderboard snapshots

## Troubleshooting

### Common Issues

**Issue**: Empty leaderboard despite users existing

- **Cause**: Users have no weekly plans recorded
- **Solution**: Ensure users record weekly plans via POST /weekly-plan/record

**Issue**: Incorrect ranking order

- **Cause**: Database query not sorting correctly
- **Solution**: Verify ORDER BY clause in SQL query

**Issue**: 500 error when accessing leaderboard

- **Cause**: Database connection failure
- **Solution**: Check database connectivity and logs

### Debug Endpoints

```bash
# Check if users exist
curl http://localhost:8000/debug/users

# Check if weekly plans exist
curl http://localhost:8000/debug/weekly-plans
```

## Related Documentation

- [Weekly Plan Recording](./WEEKLY_PLAN.md)
- [User Onboarding](./USER_ONBOARDING.md)
- [Database Schema](./DATABASE.md)
- [API Reference](./API.md)

## Support

For issues or questions:

1. Check test suite for examples
2. Review error logs in application output
3. Verify database connectivity
4. Ensure weekly plans are being recorded correctly
