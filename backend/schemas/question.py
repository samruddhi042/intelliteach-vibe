from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models.question import QuestionType, Difficulty


class QuestionBase(BaseModel):
    text: str
    type: QuestionType
    difficulty: Difficulty
    concept: str
    estimated_time: Optional[int] = None
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None


class QuestionCreate(QuestionBase):
    session_id: Optional[int] = None


class QuestionResponse(QuestionBase):
    id: int
    session_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class QuestionGenerateRequest(BaseModel):
    session_id: Optional[int] = None
    transcript_text: Optional[str] = None
    concepts: List[str]
    number_of_questions: int = 5
    difficulty: Optional[Difficulty] = None

