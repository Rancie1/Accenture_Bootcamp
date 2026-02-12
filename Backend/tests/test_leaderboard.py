"""
Integration and unit tests for leaderboard functionality.
Tests the complete flow: create users -> record plans -> get leaderboard.
"""

import asyncio
import pytest
from services.user_service import create_user
from services.weekly_plan_service import record_weekly_plan
from services.leaderboard_service import calculate_leaderboard


@pytest.mark.asyncio
async def test_leaderboard_integration(db_session):
    """Test complete leaderboard flow with multiple users and plans."""
    
    try:
        # Create test users
        user1 = await create_user(db_session, "Alice", 100.0, "123 Main St")
        user2 = await create_user(db_session, "Bob", 150.0, "456 Oak Ave")
        user3 = await create_user(db_session, "Charlie", 200.0, "789 Pine Rd")
        user4 = await create_user(db_session, "Diana", 120.0, "321 Elm St")
        
        # Record weekly plans
        # Alice: excellent optimization (2 weeks)
        await record_weekly_plan(db_session, user1.user_id, 80.0, 75.0)   # score: 0.25
        await record_weekly_plan(db_session, user1.user_id, 85.0, 80.0)   # score: 0.20
        # Average: 0.225
        
        # Bob: good optimization (3 weeks)
        await record_weekly_plan(db_session, user2.user_id, 120.0, 130.0) # score: 0.133
        await record_weekly_plan(db_session, user2.user_id, 125.0, 135.0) # score: 0.10
        await record_weekly_plan(db_session, user2.user_id, 130.0, 140.0) # score: 0.067
        # Average: 0.10
        
        # Charlie: poor optimization (1 week, overspent)
        await record_weekly_plan(db_session, user3.user_id, 180.0, 220.0) # score: -0.10
        # Average: -0.10
        
        # Diana: no weekly plans (should not appear in leaderboard)
        
        # Calculate leaderboard
        leaderboard = await calculate_leaderboard(db_session)
        
        # Verify results
        assert len(leaderboard) == 3, f"Expected 3 entries, got {len(leaderboard)}"
        
        # Verify correct ranking order
        assert leaderboard[0].username == "Alice", f"Expected Alice at rank 1"
        assert leaderboard[1].username == "Bob", f"Expected Bob at rank 2"
        assert leaderboard[2].username == "Charlie", f"Expected Charlie at rank 3"
        
        # Verify ranks are sequential
        assert leaderboard[0].rank == 1
        assert leaderboard[1].rank == 2
        assert leaderboard[2].rank == 3
        
        # Verify scores in descending order
        assert leaderboard[0].average_score > leaderboard[1].average_score
        assert leaderboard[1].average_score > leaderboard[2].average_score
        
        # Verify average score calculations
        assert abs(leaderboard[0].average_score - 0.225) < 0.001
        assert abs(leaderboard[1].average_score - 0.10) < 0.001
        assert abs(leaderboard[2].average_score - (-0.10)) < 0.001
        
        # Verify negative scores handled correctly
        assert leaderboard[2].average_score < 0
        
    except Exception as e:
        # Re-raise to ensure test fails properly
        raise


@pytest.mark.asyncio
async def test_leaderboard_empty(db_session):
    """Test leaderboard with no users having weekly plans."""
    
    try:
        # Create users but no weekly plans
        await create_user(db_session, "Alice", 100.0, "123 Main St")
        await create_user(db_session, "Bob", 150.0, "456 Oak Ave")
        
        # Calculate leaderboard
        leaderboard = await calculate_leaderboard(db_session)
        
        # Should be empty since no one has weekly plans
        assert len(leaderboard) == 0, "Expected empty leaderboard"
        
    except Exception as e:
        raise


@pytest.mark.asyncio
async def test_leaderboard_single_user(db_session):
    """Test leaderboard with single user."""
    
    try:
        # Create single user with plans
        user = await create_user(db_session, "Alice", 100.0, "123 Main St")
        await record_weekly_plan(db_session, user.user_id, 80.0, 75.0)
        
        # Calculate leaderboard
        leaderboard = await calculate_leaderboard(db_session)
        
        # Verify single entry
        assert len(leaderboard) == 1
        assert leaderboard[0].username == "Alice"
        assert leaderboard[0].rank == 1
        
    except Exception as e:
        raise


@pytest.mark.asyncio
async def test_leaderboard_tie_scores(db_session):
    """Test leaderboard with users having identical average scores."""
    
    try:
        # Create users with identical scores
        user1 = await create_user(db_session, "Alice", 100.0, "123 Main St")
        user2 = await create_user(db_session, "Bob", 100.0, "456 Oak Ave")
        
        # Both have same optimization score
        await record_weekly_plan(db_session, user1.user_id, 80.0, 80.0)  # score: 0.20
        await record_weekly_plan(db_session, user2.user_id, 80.0, 80.0)  # score: 0.20
        
        # Calculate leaderboard
        leaderboard = await calculate_leaderboard(db_session)
        
        # Both should appear with sequential ranks
        assert len(leaderboard) == 2
        assert leaderboard[0].rank == 1
        assert leaderboard[1].rank == 2
        assert leaderboard[0].average_score == leaderboard[1].average_score
        
    except Exception as e:
        raise


# Standalone test runner for manual execution
async def run_integration_test():
    """Run integration test with detailed output."""
    from database import SessionLocal, init_db
    
    print("Initializing database...")
    init_db(seed_demo_data=False)
    
    db = SessionLocal()
    
    try:
        print("\n1. Creating users...")
        user1 = await create_user(db, "Alice", 100.0, "123 Main St")
        user2 = await create_user(db, "Bob", 150.0, "456 Oak Ave")
        user3 = await create_user(db, "Charlie", 200.0, "789 Pine Rd")
        user4 = await create_user(db, "Diana", 120.0, "321 Elm St")
        print(f"   ✓ Created 4 users")
        
        print("\n2. Recording weekly plans...")
        await record_weekly_plan(db, user1.user_id, 80.0, 75.0)
        await record_weekly_plan(db, user1.user_id, 85.0, 80.0)
        await record_weekly_plan(db, user2.user_id, 120.0, 130.0)
        await record_weekly_plan(db, user2.user_id, 125.0, 135.0)
        await record_weekly_plan(db, user2.user_id, 130.0, 140.0)
        await record_weekly_plan(db, user3.user_id, 180.0, 220.0)
        print(f"   ✓ Recorded plans for 3 users")
        
        print("\n3. Calculating leaderboard...")
        leaderboard = await calculate_leaderboard(db)
        
        print("\n" + "="*70)
        print("LEADERBOARD RESULTS")
        print("="*70)
        print(f"{'Rank':<6} {'Username':<15} {'User ID':<38} {'Avg Score':<10}")
        print("-"*70)
        
        for entry in leaderboard:
            print(f"{entry.rank:<6} {entry.username:<15} {entry.user_id:<38} {entry.average_score:.4f}")
        
        print("="*70)
        
        print("\n4. Verifying results...")
        assert len(leaderboard) == 3
        print("   ✓ Correct number of entries (users without plans excluded)")
        
        assert leaderboard[0].username == "Alice"
        assert leaderboard[1].username == "Bob"
        assert leaderboard[2].username == "Charlie"
        print("   ✓ Correct ranking order")
        
        assert leaderboard[0].rank == 1
        assert leaderboard[1].rank == 2
        assert leaderboard[2].rank == 3
        print("   ✓ Ranks are sequential (1, 2, 3)")
        
        assert leaderboard[0].average_score > leaderboard[1].average_score
        assert leaderboard[1].average_score > leaderboard[2].average_score
        print("   ✓ Scores in descending order")
        
        assert abs(leaderboard[0].average_score - 0.225) < 0.001
        assert abs(leaderboard[1].average_score - 0.10) < 0.001
        assert abs(leaderboard[2].average_score - (-0.10)) < 0.001
        print("   ✓ Average scores calculated correctly")
        
        assert leaderboard[2].average_score < 0
        print("   ✓ Negative scores handled correctly")
        
        print("\n" + "="*70)
        print("ALL INTEGRATION TESTS PASSED! ✓")
        print("="*70)
        
        return True
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        return False
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        db.close()


if __name__ == "__main__":
    success = asyncio.run(run_integration_test())
    exit(0 if success else 1)

