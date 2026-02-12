"""
Leaderboard service for calculating user rankings.

Handles leaderboard calculation based on average optimization scores.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from models.db_models import User, WeeklyPlan
from models.schemas import LeaderboardEntry
from exceptions import DatabaseError


async def calculate_leaderboard(db: Session) -> list[LeaderboardEntry]:
    """
    Calculate and return ranked leaderboard.

    Process:
    1. Query all WeeklyPlan records grouped by user_id
    2. Calculate average optimization_score for each user
    3. Exclude users with no WeeklyPlan records
    4. Sort by average_score descending
    5. Assign ranks (1, 2, 3, ...)
    6. Join with User table to get usernames

    Args:
        db: Database session

    Returns:
        List of LeaderboardEntry objects sorted by rank

    Raises:
        DatabaseError: Database operation failed
    """
    try:
        # Query to calculate average scores and join with user data
        # Using subquery to calculate average scores per user
        subquery = (
            db.query(
                WeeklyPlan.user_id,
                func.avg(WeeklyPlan.optimization_score).label('average_score')
            )
            .group_by(WeeklyPlan.user_id)
            .subquery()
        )
        
        # Join with User table to get usernames and order by average_score
        results = (
            db.query(
                User.user_id,
                User.name.label('username'),
                subquery.c.average_score
            )
            .join(subquery, User.user_id == subquery.c.user_id)
            .order_by(subquery.c.average_score.desc())
            .all()
        )
        
        # Assign ranks
        leaderboard = []
        for rank, row in enumerate(results, start=1):
            leaderboard.append(
                LeaderboardEntry(
                    user_id=row.user_id,
                    username=row.username,
                    average_score=float(row.average_score),
                    rank=rank
                )
            )
        
        return leaderboard
    
    except Exception as e:
        raise DatabaseError(f"Failed to calculate leaderboard: {str(e)}")
