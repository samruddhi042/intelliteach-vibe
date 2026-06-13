from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.user import User
from models.question import Question
from services.auth_service import get_current_user
from services.question_generator import QuestionGenerator
from schemas.question import QuestionCreate, QuestionResponse, QuestionGenerateRequest

router = APIRouter(prefix="/questions", tags=["Questions"])


@router.post("/generate", response_model=List[QuestionResponse])
def generate_questions(
    request: QuestionGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate questions from transcript and mastery gaps"""
    if not request.concepts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one concept is required"
        )

    # Get transcript text if session_id provided
    transcript_text = request.transcript_text
    if not transcript_text and request.session_id:
        from models.transcript import Transcript
        transcripts = db.query(Transcript).filter(
            Transcript.session_id == request.session_id
        ).all()
        if transcripts:
            transcript_text = " ".join([t.text for t in transcripts])

    questions = QuestionGenerator.generate_questions(
        db,
        session_id=request.session_id,
        transcript_text=transcript_text,
        concepts=request.concepts,
        number_of_questions=request.number_of_questions,
        difficulty=request.difficulty
    )

    return questions


@router.get("/by-session/{session_id}", response_model=List[QuestionResponse])
def get_questions_by_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all questions for a session"""
    questions = db.query(Question).filter(
        Question.session_id == session_id
    ).order_by(Question.created_at.desc()).all()
    return questions


@router.post("", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
def create_question(
    question_data: QuestionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a custom question"""
    question = Question(**question_data.dict())
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@router.get("/{question_id}", response_model=QuestionResponse)
def get_question(
    question_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific question"""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    return question

