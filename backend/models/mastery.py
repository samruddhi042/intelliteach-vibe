from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Mastery(Base):
    __tablename__ = "mastery"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    concept = Column(String, nullable=False)
    mastery_score = Column(Integer, nullable=False)  # 0-100
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)  # Optional: class-specific mastery

    # Relationships
    student = relationship("User", back_populates="mastery_records")
    class_obj = relationship("Class", foreign_keys=[class_id])

