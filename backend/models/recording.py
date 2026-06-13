from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Recording(Base):
    __tablename__ = "recordings"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("class_sessions.id"), nullable=False)
    url = Column(String, nullable=False)
    duration = Column(Integer, nullable=True)  # in seconds
    file_size = Column(Integer, nullable=True)  # in bytes
    is_transcribed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    session = relationship("ClassSession", back_populates="recordings")
    transcripts = relationship("Transcript", back_populates="recording")

