from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models.user import User
from services.auth_service import get_current_user
from services.mastery_engine import MasteryEngine
from schemas.mastery import MasteryHeatmap, MasteryHeatmapItem

router = APIRouter(prefix="/mastery", tags=["Mastery"])


@router.get("/heatmap", response_model=MasteryHeatmap)
def get_mastery_heatmap(
    student_id: Optional[int] = None,
    class_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get mastery heatmap for a student"""
    # If student_id not provided, use current user (if student)
    if not student_id:
        if current_user.role.value == "Student":
            student_id = current_user.id
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="student_id required for non-student users"
            )

    # Teachers can only view their own students' mastery
    if current_user.role.value == "Teacher" and student_id != current_user.id:
        # Verify student is in teacher's class
        from models.class import Class
        from models.session import ClassSession
        from models.engagement import EngagementSignal
        
        # Check if student has participated in any of teacher's classes
        teacher_classes = db.query(Class.id).filter(Class.teacher_id == current_user.id).all()
        class_ids = [c[0] for c in teacher_classes]
        
        if class_id and class_id not in class_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

    heatmap_data = MasteryEngine.get_mastery_heatmap(db, student_id, class_id)
    heatmap_items = [MasteryHeatmapItem(**item) for item in heatmap_data]
    
    return MasteryHeatmap(
        student_id=student_id,
        heatmap=heatmap_items
    )

