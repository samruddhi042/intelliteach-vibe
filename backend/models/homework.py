from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base


class HomeworkStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class Homework(Base):
    __tablename__ = "homework"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    title = Column(String, nullable=False)
    concepts = Column(JSON, nullable=False)  # List of concepts to focus on
    number_of_questions = Column(Integer, nullable=False)
    estimated_time = Column(Integer, nullable=False)  # in minutes
    target_mastery = Column(Integer, nullable=False)  # 0-100
    current_mastery = Column(Integer, nullable=True)  # 0-100
    status = Column(Enum(HomeworkStatus), default=HomeworkStatus.PENDING, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    questions = Column(JSON, default=list)  # List of question IDs

    # Relationships
    student = relationship("User", back_populates="homework_assignments")
    class_obj = relationship("Class", back_populates="homework_assignments")

