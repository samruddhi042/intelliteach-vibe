from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
from database import get_db
from models.user import User
from services.auth_service import get_current_user
from services.analytics_service import AnalyticsService
from services.engagement_engine import EngagementEngine
from services.mastery_engine import MasteryEngine

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/engagement")
def get_engagement_report(
    session_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get engagement report (export-ready data)"""
    from models.session import ClassSession
    from models.class import Class

    query = db.query(ClassSession)

    if session_id:
        query = query.filter(ClassSession.id == session_id)
    else:
        # Filter by date range if provided
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(ClassSession.start_time >= start_dt)
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(ClassSession.start_time <= end_dt)

        # Filter by teacher if not admin
        if current_user.role.value == "Teacher":
            query = query.join(Class).filter(Class.teacher_id == current_user.id)

    sessions = query.all()

    report_data = []
    for session in sessions:
        timeline = EngagementEngine.get_engagement_timeline(db, session.id)
        report_data.append({
            "session_id": session.id,
            "class": f"{session.class_obj.subject} - {session.class_obj.topic}",
            "start_time": session.start_time.isoformat(),
            "end_time": session.end_time.isoformat() if session.end_time else None,
            "engagement_index": session.engagement_index,
            "confusion_percent": session.confusion_percent,
            "timeline": timeline
        })

    return {
        "report_type": "engagement",
        "generated_at": datetime.utcnow().isoformat(),
        "sessions": report_data
    }


@router.get("/mastery")
def get_mastery_report(
    student_id: Optional[int] = None,
    class_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get mastery report (export-ready data)"""
    from models.mastery import Mastery

    query = db.query(Mastery)

    if student_id:
        query = query.filter(Mastery.student_id == student_id)
    elif current_user.role.value == "Student":
        query = query.filter(Mastery.student_id == current_user.id)

    if class_id:
        query = query.filter(Mastery.class_id == class_id)

    masteries = query.all()

    report_data = []
    for mastery in masteries:
        from models.user import User
        student = db.query(User).filter(User.id == mastery.student_id).first()
        report_data.append({
            "student_id": mastery.student_id,
            "student_name": student.name if student else "Unknown",
            "concept": mastery.concept,
            "mastery_score": mastery.mastery_score,
            "last_updated": mastery.last_updated.isoformat()
        })

    return {
        "report_type": "mastery",
        "generated_at": datetime.utcnow().isoformat(),
        "records": report_data
    }


@router.get("/intervention-effectiveness")
def get_intervention_effectiveness_report(
    session_id: int,
    intervention_time: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get intervention effectiveness report"""
    intervention_dt = datetime.fromisoformat(intervention_time.replace('Z', '+00:00'))
    result = AnalyticsService.get_intervention_effectiveness(
        db,
        session_id,
        intervention_dt
    )

    return {
        "report_type": "intervention_effectiveness",
        "generated_at": datetime.utcnow().isoformat(),
        "session_id": session_id,
        "intervention_time": intervention_time,
        "before_confusion": result["before_confusion"],
        "after_confusion": result["after_confusion"],
        "reduction_percent": result["reduction_percent"],
        "effectiveness": "High" if result["reduction_percent"] > 50 else "Medium" if result["reduction_percent"] > 25 else "Low"
    }

