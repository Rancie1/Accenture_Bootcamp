#!/bin/bash

# Test script for leaderboard endpoint
# This script tests the /leaderboard endpoint with real data

echo "Testing Leaderboard Endpoint"
echo "=============================="
echo ""

BASE_URL="http://localhost:8000"

echo "1. Creating test users..."

# Create user 1
USER1=$(curl -s -X POST "$BASE_URL/onboard" \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "weekly_budget": 100.0, "home_address": "123 Main St"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['user_id'])")

echo "   Created Alice: $USER1"

# Create user 2
USER2=$(curl -s -X POST "$BASE_URL/onboard" \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob", "weekly_budget": 150.0, "home_address": "456 Oak Ave"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['user_id'])")

echo "   Created Bob: $USER2"

# Create user 3
USER3=$(curl -s -X POST "$BASE_URL/onboard" \
  -H "Content-Type: application/json" \
  -d '{"name": "Charlie", "weekly_budget": 200.0, "home_address": "789 Pine Rd"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['user_id'])")

echo "   Created Charlie: $USER3"

echo ""
echo "2. Recording weekly plans..."

# Alice's plans
curl -s -X POST "$BASE_URL/weekly-plan/record" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\": \"$USER1\", \"optimal_cost\": 80.0, \"actual_cost\": 75.0}" > /dev/null

curl -s -X POST "$BASE_URL/weekly-plan/record" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\": \"$USER1\", \"optimal_cost\": 85.0, \"actual_cost\": 80.0}" > /dev/null

echo "   Recorded 2 plans for Alice"

# Bob's plans
curl -s -X POST "$BASE_URL/weekly-plan/record" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\": \"$USER2\", \"optimal_cost\": 120.0, \"actual_cost\": 130.0}" > /dev/null

curl -s -X POST "$BASE_URL/weekly-plan/record" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\": \"$USER2\", \"optimal_cost\": 125.0, \"actual_cost\": 140.0}" > /dev/null

echo "   Recorded 2 plans for Bob"

# Charlie's plan
curl -s -X POST "$BASE_URL/weekly-plan/record" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\": \"$USER3\", \"optimal_cost\": 180.0, \"actual_cost\": 220.0}" > /dev/null

echo "   Recorded 1 plan for Charlie"

echo ""
echo "3. Getting leaderboard..."
echo ""

curl -s -X GET "$BASE_URL/leaderboard" | python3 -m json.tool

echo ""
echo "=============================="
echo "Test complete!"
