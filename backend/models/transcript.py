from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("class_sessions.id"), nullable=False)
    recording_id = Column(Integer, ForeignKey("recordings.id"), nullable=True)
    text = Column(String, nullable=False)
    timestamp = Column(Float, nullable=True)  # Timestamp in seconds from start
    speaker = Column(String, nullable=True)  # Teacher or Student
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    session = relationship("ClassSession", back_populates="transcripts")
    recording = relationship("Recording", back_populates="transcripts")
    concept_mappings = relationship("ConceptMapping", back_populates="transcript")


class ConceptMapping(Base):
    __tablename__ = "concept_mappings"

    id = Column(Integer, primary_key=True, index=True)
    transcript_id = Column(Integer, ForeignKey("transcripts.id"), nullable=False)
    concept = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=False)  # 0.0-1.0
    syllabus_topic = Column(String, nullable=True)

    # Relationships
    transcript = relationship("Transcript", back_populates="concept_mappings")

