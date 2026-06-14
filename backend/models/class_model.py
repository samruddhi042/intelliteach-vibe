from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    syllabus_mapping = Column(JSON, default=dict)  # Maps concepts to syllabus topics
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    teacher = relationship("User", back_populates="classes_taught", foreign_keys=[teacher_id])
    sessions = relationship("ClassSession", back_populates="class_obj")
    homework_assignments = relationship("Homework", back_populates="class_obj")

