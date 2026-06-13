from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base


class QuestionType(str, enum.Enum):
    MCQ = "MCQ"
    SHORT_ANSWER = "Short Answer"
    CONCEPTUAL = "Conceptual"
    APPLICATION = "Application"


class Difficulty(str, enum.Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("class_sessions.id"), nullable=True)
    text = Column(String, nullable=False)
    type = Column(Enum(QuestionType), nullable=False)
    difficulty = Column(Enum(Difficulty), nullable=False)
    concept = Column(String, nullable=False)
    estimated_time = Column(Integer, nullable=True)  # in minutes
    options = Column(JSON, nullable=True)  # For MCQ: list of options
    correct_answer = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    session = relationship("ClassSession", back_populates="questions")

