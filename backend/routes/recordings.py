from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db
from models.user import User
from models.recording import Recording
from models.session import ClassSession
from models.class_model import Class
from services.auth_service import get_current_user
from services.stt_service import STTService
from services.syllabus_mapper import SyllabusMapper
from pydantic import BaseModel

router = APIRouter(prefix="/recordings", tags=["Recordings"])


class RecordingCreate(BaseModel):
    session_id: int
    url: str
    duration: Optional[int] = None
    file_size: Optional[int] = None


class RecordingResponse(BaseModel):
    id: int
    session_id: int
    url: str
    duration: Optional[int]
    file_size: Optional[int]
    is_transcribed: bool
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("", response_model=List[RecordingResponse])
def get_recordings(
    session_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all recordings, optionally filtered by session"""
    query = db.query(Recording)
    
    if session_id:
        query = query.filter(Recording.session_id == session_id)

    recordings = query.order_by(Recording.created_at.desc()).all()
    return recordings


@router.get("/{recording_id}", response_model=RecordingResponse)
def get_recording(
    recording_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific recording"""
    recording = db.query(Recording).filter(Recording.id == recording_id).first()
    if not recording:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recording not found"
        )
    return recording


@router.post("", response_model=RecordingResponse, status_code=status.HTTP_201_CREATED)
def create_recording(
    recording_data: RecordingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new recording"""
    # Verify session exists
    session = db.query(ClassSession).filter(ClassSession.id == recording_data.session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    recording = Recording(
        session_id=recording_data.session_id,
        url=recording_data.url,
        duration=recording_data.duration,
        file_size=recording_data.file_size
    )
    db.add(recording)
    db.commit()
    db.refresh(recording)

    # Update session with recording URL
    session.recording_url = recording_data.url
    db.commit()

    return recording


@router.post("/{recording_id}/transcribe")
def transcribe_recording(
    recording_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Transcribe a recording using STT service"""
    recording = db.query(Recording).filter(Recording.id == recording_id).first()
    if not recording:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recording not found"
        )

    # Transcribe
    transcripts = STTService.transcribe_audio(
        db,
        recording_id,
        recording.url,
        recording.session_id
    )

    # Extract concepts from transcripts
    session = db.query(ClassSession).filter(ClassSession.id == recording.session_id).first()
    if session:
        class_obj = db.query(Class).filter(Class.id == session.class_id).first()
        if class_obj:
            for transcript in transcripts:
                SyllabusMapper.extract_concepts_from_transcript(
                    db,
                    transcript.id,
                    class_obj.id
                )

    return {
        "message": "Transcription completed",
        "recording_id": recording_id,
        "transcript_count": len(transcripts)
    }


@router.get("/{recording_id}/concept-map")
def get_concept_map(
    recording_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get concept map for a recording"""
    concept_map = SyllabusMapper.get_concept_map(db, recording_id)
    return concept_map

