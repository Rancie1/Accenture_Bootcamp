# Backend Scripts

Utility scripts for testing and development.

## Available Scripts

### test_leaderboard_endpoint.sh

Tests the leaderboard API endpoint with real HTTP requests.

**Prerequisites:**

- Backend server must be running on `http://localhost:8000`
- `curl` and `python3` must be installed

**Usage:**

```bash
# Start the server in one terminal
./venv/bin/uvicorn main:app --reload

# Run the test script in another terminal
./scripts/test_leaderboard_endpoint.sh
```

**What it does:**

1. Creates 3 test users (Alice, Bob, Charlie)
2. Records weekly plans for each user
3. Retrieves and displays the leaderboard
4. Shows formatted JSON output

**Expected Output:**

```json
{
  "leaderboard": [
    {
      "user_id": "...",
      "username": "Alice",
      "average_score": 0.225,
      "rank": 1
    },
    ...
  ]
}
```

## Running Tests

For comprehensive testing, use the test suite instead:

```bash
# Run all tests
PYTHONPATH=. ./venv/bin/python -m pytest tests/ -v

# Run leaderboard tests only
PYTHONPATH=. ./venv/bin/python -m pytest tests/test_leaderboard.py -v

# Run integration test with detailed output
PYTHONPATH=. ./venv/bin/python tests/test_leaderboard.py
```

## Creating New Scripts

When adding new scripts:

1. Place them in this directory
2. Make them executable: `chmod +x script_name.sh`
3. Add shebang line: `#!/bin/bash`
4. Document in this README
5. Include usage examples

## Script Naming Convention

- `test_*.sh` - Testing scripts
- `setup_*.sh` - Setup/initialization scripts
- `deploy_*.sh` - Deployment scripts
- `util_*.sh` - Utility scripts
