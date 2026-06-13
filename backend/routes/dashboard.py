from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from services.auth_service import get_current_user
from services.analytics_service import AnalyticsService
from schemas.analytics import DashboardSummary, RecentClass

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard summary statistics"""
    teacher_id = current_user.id if current_user.role.value == "Teacher" else None
    summary = AnalyticsService.get_dashboard_summary(db, teacher_id)
    return summary


@router.get("/recent-classes", response_model=list[RecentClass])
def get_recent_classes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recent classes"""
    teacher_id = current_user.id if current_user.role.value == "Teacher" else None
    classes = AnalyticsService.get_recent_classes(db, teacher_id, limit=10)
    return classes

