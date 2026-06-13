from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from models.user import User
from models.session import ClassSession
from models.class import Class
from models.engagement import EngagementSignal
from services.auth_service import get_current_user
from services.engagement_engine import EngagementEngine
from services.intervention_engine import InterventionEngine
from services.mastery_engine import MasteryEngine
from schemas.engagement import EngagementSignalCreate, EngagementSignalResponse, EngagementStatus

router = APIRouter(prefix="/live", tags=["Live Class"])


@router.post("/start")
def start_live_class(
    class_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a live class session"""
    # Verify class exists and user is the teacher
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )

    if class_obj.teacher_id != current_user.id and current_user.role.value != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the class teacher can start the session"
        )

    # Check if there's already an active session
    active_session = db.query(ClassSession).filter(
        ClassSession.class_id == class_id,
        ClassSession.is_live == True
    ).first()

    if active_session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A live session is already active for this class"
        )

    # Create new session
    session = ClassSession(
        class_id=class_id,
        start_time=datetime.utcnow(),
        is_live=True
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "session_id": session.id,
        "message": "Live class started",
        "start_time": session.start_time
    }


@router.post("/end")
def end_live_class(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """End a live class session"""
    session = db.query(ClassSession).filter(ClassSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    # Verify permissions
    class_obj = db.query(Class).filter(Class.id == session.class_id).first()
    if class_obj.teacher_id != current_user.id and current_user.role.value != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the class teacher can end the session"
        )

    # Update session
    session.is_live = False
    session.end_time = datetime.utcnow()
    
    # Compute final engagement metrics
    engagement_status = EngagementEngine.compute_engagement_index(db, session_id)
    session.engagement_index = engagement_status.engagement_percent
    session.confusion_percent = engagement_status.confusion_percent

    db.commit()

    return {
        "message": "Live class ended",
        "session_id": session.id,
        "end_time": session.end_time,
        "final_engagement": engagement_status.engagement_percent,
        "final_confusion": engagement_status.confusion_percent
    }


@router.post("/signal", response_model=EngagementSignalResponse, status_code=status.HTTP_201_CREATED)
def send_engagement_signal(
    session_id: int,
    signal: EngagementSignalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send an engagement signal (got_it, confused, poll, mcq)"""
    # Verify session exists and is live
    session = db.query(ClassSession).filter(ClassSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    if not session.is_live:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is not live"
        )

    # Create signal
    engagement_signal = EngagementSignal(
        student_id=current_user.id,
        session_id=session_id,
        signal_type=signal.signal_type,
        correct=signal.correct,
        concept=signal.concept
    )
    db.add(engagement_signal)
    db.commit()
    db.refresh(engagement_signal)

    # Update mastery if concept provided
    if signal.concept:
        MasteryEngine.update_mastery_from_signal(
            db,
            current_user.id,
            signal.concept,
            signal.signal_type,
            signal.correct,
            session.class_id
        )

    return engagement_signal


@router.get("/status", response_model=EngagementStatus)
def get_live_status(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current engagement status for a live session"""
    session = db.query(ClassSession).filter(ClassSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    engagement_status = EngagementEngine.compute_engagement_index(db, session_id)
    
    # Get intervention suggestion
    intervention = InterventionEngine.analyze_and_suggest(db, session_id)
    engagement_status.suggested_action = intervention.get("suggestion")

    return engagement_status


@router.post("/intervention/complete")
def mark_intervention_complete(
    session_id: int,
    intervention_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark an intervention as complete"""
    success = InterventionEngine.mark_intervention_complete(
        db,
        session_id,
        intervention_type
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    return {
        "message": "Intervention marked as complete",
        "session_id": session_id
    }

