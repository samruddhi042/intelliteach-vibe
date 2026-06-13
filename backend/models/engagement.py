from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class EngagementSignal(Base):
    __tablename__ = "engagement_signals"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("class_sessions.id"), nullable=False)
    signal_type = Column(String, nullable=False)  # got_it, confused, poll, mcq
    correct = Column(Boolean, nullable=True)  # For MCQ signals
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    concept = Column(String, nullable=True)  # Optional: which concept this relates to

    # Relationships
    student = relationship("User", back_populates="engagement_signals")
    session = relationship("ClassSession", back_populates="engagement_signals")

