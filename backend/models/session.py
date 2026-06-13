from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class ClassSession(Base):
    __tablename__ = "class_sessions"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    start_time = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    recording_url = Column(String, nullable=True)
    is_live = Column(Boolean, default=False)
    engagement_index = Column(Integer, default=0)  # 0-100
    confusion_percent = Column(Integer, default=0)  # 0-100

    # Relationships
    class_obj = relationship("Class", back_populates="sessions")
    engagement_signals = relationship("EngagementSignal", back_populates="session")
    recordings = relationship("Recording", back_populates="session")
    transcripts = relationship("Transcript", back_populates="session")
    questions = relationship("Question", back_populates="session")

