from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.user import User
from models.homework import Homework
from services.auth_service import get_current_user
from services.mastery_engine import MasteryEngine
from services.question_generator import QuestionGenerator
from schemas.homework import HomeworkCreate, HomeworkResponse, HomeworkGenerateRequest

router = APIRouter(prefix="/homework", tags=["Homework"])


@router.post("/generate", response_model=HomeworkResponse)
def generate_homework(
    request: HomeworkGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate personalized homework based on mastery gaps"""
    # Get lowest mastery concepts
    if request.focus_concepts:
        concepts = request.focus_concepts
    else:
        concepts = MasteryEngine.get_lowest_mastery_concepts(
            db,
            request.student_id,
            request.class_id,
            limit=5
        )

    if not concepts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No concepts found for homework generation"
        )

    # Get current mastery for target calculation
    heatmap = MasteryEngine.get_mastery_heatmap(db, request.student_id, request.class_id)
    concept_mastery = {item["concept"]: item["mastery"] for item in heatmap}
    
    # Calculate target mastery (aim for 20% improvement or minimum 70)
    lowest_mastery = min([concept_mastery.get(c, 50) for c in concepts])
    target_mastery = min(100, max(70, lowest_mastery + 20))

    # Estimate number of questions based on time limit
    # Assume 3 minutes per question on average
    estimated_questions = max(3, request.time_limit // 3)
    estimated_questions = min(estimated_questions, len(concepts) * 2)

    # Generate questions
    questions = QuestionGenerator.generate_questions(
        db,
        concepts=concepts,
        number_of_questions=estimated_questions,
        student_id=request.student_id
    )

    # Create homework
    homework = Homework(
        student_id=request.student_id,
        class_id=request.class_id,
        title=f"Practice: {', '.join(concepts[:3])}",
        concepts=concepts,
        number_of_questions=len(questions),
        estimated_time=request.time_limit,
        target_mastery=target_mastery,
        current_mastery=lowest_mastery,
        questions=[q.id for q in questions]
    )
    db.add(homework)
    db.commit()
    db.refresh(homework)

    return homework


@router.post("/assign", response_model=HomeworkResponse)
def assign_homework(
    homework_data: HomeworkCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assign homework to a student"""
    homework = Homework(**homework_data.dict())
    db.add(homework)
    db.commit()
    db.refresh(homework)
    return homework


@router.get("", response_model=List[HomeworkResponse])
def get_homework(
    student_id: Optional[int] = None,
    class_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get homework assignments"""
    query = db.query(Homework)

    if student_id:
        query = query.filter(Homework.student_id == student_id)
    elif current_user.role.value == "Student":
        query = query.filter(Homework.student_id == current_user.id)

    if class_id:
        query = query.filter(Homework.class_id == class_id)

    homework_list = query.order_by(Homework.created_at.desc()).all()
    return homework_list


@router.post("/{homework_id}/complete")
def complete_homework(
    homework_id: int,
    correct_percentage: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark homework as complete and update mastery"""
    homework = db.query(Homework).filter(Homework.id == homework_id).first()
    if not homework:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Homework not found"
        )

    if homework.student_id != current_user.id and current_user.role.value != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    # Update homework status
    from datetime import datetime
    from models.homework import HomeworkStatus
    
    homework.status = HomeworkStatus.COMPLETED
    homework.completed_at = datetime.utcnow()

    # Update mastery for each concept
    for concept in homework.concepts:
        MasteryEngine.update_mastery_from_homework(
            db,
            homework.student_id,
            concept,
            correct_percentage,
            homework.class_id
        )

    db.commit()
    db.refresh(homework)

    return {
        "message": "Homework completed",
        "homework_id": homework_id,
        "correct_percentage": correct_percentage
    }

