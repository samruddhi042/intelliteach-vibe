"""Permission utilities for role-based access control"""

from functools import wraps
from fastapi import HTTPException, Depends, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from services.auth_service import get_current_user
from utils.constants import ROLE_TEACHER, ROLE_ADMIN, ROLE_STUDENT


def require_role(*allowed_roles):
    """Decorator to require specific roles for an endpoint"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            if current_user.role not in allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
                )
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def teacher_only(func):
    """Decorator to restrict endpoint to teachers only"""
    return require_role(ROLE_TEACHER, ROLE_ADMIN)(func)


def admin_only(func):
    """Decorator to restrict endpoint to admins only"""
    return require_role(ROLE_ADMIN)(func)

