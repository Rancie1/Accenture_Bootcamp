"""
Weekly plan service for recording user spending and optimization scores.

Handles weekly plan creation, score calculation, and persistence.
"""

from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, OperationalError
from models.db_models import User, WeeklyPlan
from exceptions import ValidationError, NotFoundError, DatabaseError


async def record_weekly_plan(
    db: Session,
    user_id: str,
    optimal_cost: float,
    actual_cost: float
) -> WeeklyPlan:
    """
    Record weekly spending and calculate optimization score.

    Process:
    1. Fetch user's weekly_budget
    2. Calculate optimization_score = (weekly_budget - actual_cost) / weekly_budget
    3. Create WeeklyPlan record with timestamp
    4. Persist to database

    Args:
        db: Database session
        user_id: User identifier
        optimal_cost: Optimal cost from grocery optimization
        actual_cost: Amount user actually spent

    Returns:
        Created WeeklyPlan with calculated score

    Raises:
        NotFoundError: User not found
        ValidationError: Invalid input data
        DatabaseError: Database operation failed
    """
    # Validate actual_cost is positive
    if actual_cost <= 0:
        raise ValidationError("Actual cost must be a positive number")
    
    if optimal_cost < 0:
        raise ValidationError("Optimal cost must be non-negative")
    
    # Fetch user to get weekly_budget
    try:
        user = db.query(User).filter(User.user_id == user_id).first()
        
        if user is None:
            raise NotFoundError(f"User with ID {user_id} not found")
        
    except NotFoundError:
        raise
    except Exception as e:
        raise DatabaseError(f"Failed to retrieve user: {str(e)}")
    
    # Calculate optimization_score
    # Formula: (weekly_budget - actual_cost) / weekly_budget
    # This can be negative when actual_cost > weekly_budget
    optimization_score = (user.weekly_budget - actual_cost) / user.weekly_budget
    
    # Create WeeklyPlan record
    weekly_plan = WeeklyPlan(
        user_id=user_id,
        optimal_cost=optimal_cost,
        actual_cost=actual_cost,
        optimization_score=optimization_score,
        created_at=datetime.utcnow()
    )
    
    try:
        # Persist to database
        db.add(weekly_plan)
        db.commit()
        db.refresh(weekly_plan)
        return weekly_plan
    except IntegrityError as e:
        db.rollback()
        raise DatabaseError(f"Failed to create weekly plan: {str(e)}")
    except OperationalError as e:
        db.rollback()
        raise DatabaseError(f"Database operation failed: {str(e)}")
