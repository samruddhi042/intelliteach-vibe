from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from services.auth_service import get_current_user
from services.engagement_engine import EngagementEngine
from schemas.engagement import EngagementTimeline

router = APIRouter(prefix="/analytics", tags=["Engagement Analytics"])


@router.get("/engagement-timeline")
def get_engagement_timeline(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get engagement timeline for a session"""
    timeline = EngagementEngine.get_engagement_timeline(db, session_id)
    return timeline


@router.get("/confusion-before-after")
def get_confusion_before_after(
    session_id: int,
    intervention_time: str,  # ISO format datetime string
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get confusion levels before and after an intervention"""
    from datetime import datetime
    from services.analytics_service import AnalyticsService
    
    intervention_dt = datetime.fromisoformat(intervention_time.replace('Z', '+00:00'))
    result = AnalyticsService.get_intervention_effectiveness(
        db,
        session_id,
        intervention_dt
    )
    return result

