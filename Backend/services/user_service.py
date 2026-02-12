"""
User service for user management operations.

Handles user creation, retrieval, and validation.
"""

import uuid
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, OperationalError
from models.db_models import User
from exceptions import ValidationError, NotFoundError, DatabaseError


async def create_user(
    db: Session,
    name: str,
    weekly_budget: float,
    home_address: str
) -> User:
    """
    Create and persist a new user.

    Validates input, creates User record in database.

    Args:
        db: Database session
        name: Non-empty string
        weekly_budget: Positive number
        home_address: Non-empty string

    Returns:
        Created User object with generated user_id

    Raises:
        ValidationError: Invalid input data
        DatabaseError: Database operation failed
    """
    # Input validation
    if not name or not name.strip():
        raise ValidationError("Name must be a non-empty string")
    
    if weekly_budget <= 0:
        raise ValidationError("Weekly budget must be a positive number")
    
    if not home_address or not home_address.strip():
        raise ValidationError("Home address must be a non-empty string")
    
    # Generate unique user_id
    user_id = str(uuid.uuid4())
    
    # Create user object
    user = User(
        user_id=user_id,
        name=name.strip(),
        weekly_budget=weekly_budget,
        home_address=home_address.strip()
    )
    
    try:
        # Persist to database
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except IntegrityError as e:
        db.rollback()
        raise DatabaseError(f"Failed to create user: {str(e)}")
    except OperationalError as e:
        db.rollback()
        raise DatabaseError(f"Database operation failed: {str(e)}")


async def get_user_by_id(db: Session, user_id: str) -> User:
    """
    Retrieve user by ID.

    Args:
        db: Database session
        user_id: User identifier

    Returns:
        User object

    Raises:
        NotFoundError: User does not exist
        DatabaseError: Database operation failed
    """
    try:
        user = db.query(User).filter(User.user_id == user_id).first()
        
        if user is None:
            raise NotFoundError(f"User with ID {user_id} not found")
        
        return user
    except NotFoundError:
        raise
    except Exception as e:
        raise DatabaseError(f"Failed to retrieve user: {str(e)}")
