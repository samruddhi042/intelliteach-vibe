import os
from typing import List, Dict, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from models.transcript import Transcript, ConceptMapping
from models.recording import Recording

# ─── Optional Whisper import ──────────────────────────────────────────────
# Whisper (+ PyTorch) is a heavy dependency (~2.5GB). If it's not installed,
# the app falls back to a mock transcription so the rest of the backend
# still works during development / hackathon demos.
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    whisper = None
    WHISPER_AVAILABLE = False


class STTService:
    """Speech-to-Text service using Whisper (or mock for demo)"""

    _model = None

    @classmethod
    def get_model(cls):
        """Lazy load Whisper model"""
        if cls._model is None:
            if not WHISPER_AVAILABLE:
                print("Whisper not installed — using mock STT service instead")
                print("To enable real transcription, run: pip install openai-whisper")
                cls._model = "mock"
                return cls._model

            try:
                cls._model = whisper.load_model("base")
            except Exception as e:
                print(f"Warning: Could not load Whisper model: {e}")
                print("Using mock STT service instead")
                cls._model = "mock"
        return cls._model

    @staticmethod
    def transcribe_audio(
        db: Session,
        recording_id: int,
        audio_url: str,
        session_id: int
    ) -> List[Transcript]:
        """
        Transcribe audio from a recording URL.
        Returns list of timestamped transcript segments.
        """
        model = STTService.get_model()

        if model == "mock":
            # Mock transcription for demo purposes
            return STTService._mock_transcribe(db, recording_id, session_id, audio_url)
        else:
            # Real Whisper transcription
            try:
                result = model.transcribe(audio_url, word_timestamps=True)
                transcripts = []

                for segment in result["segments"]:
                    transcript = Transcript(
                        session_id=session_id,
                        recording_id=recording_id,
                        text=segment["text"],
                        timestamp=segment["start"],
                        speaker="Teacher"  # Whisper doesn't do speaker diarization by default
                    )
                    db.add(transcript)
                    transcripts.append(transcript)

                db.commit()

                # Mark recording as transcribed
                recording = db.query(Recording).filter(Recording.id == recording_id).first()
                if recording:
                    recording.is_transcribed = True
                    db.commit()

                return transcripts
            except Exception as e:
                print(f"Error transcribing audio: {e}")
                # Fallback to mock
                return STTService._mock_transcribe(db, recording_id, session_id, audio_url)

    @staticmethod
    def _mock_transcribe(
        db: Session,
        recording_id: int,
        session_id: int,
        audio_url: str
    ) -> List[Transcript]:
        """Mock transcription for demo purposes"""
        mock_segments = [
            {
                "text": "Today we're going to learn about Newton's Laws of Motion.",
                "timestamp": 0.0,
                "speaker": "Teacher"
            },
            {
                "text": "Newton's First Law states that an object at rest stays at rest.",
                "timestamp": 5.0,
                "speaker": "Teacher"
            },
            {
                "text": "What about when we apply a force?",
                "timestamp": 12.0,
                "speaker": "Student"
            },
            {
                "text": "Great question! That's where Newton's Second Law comes in: F equals m times a.",
                "timestamp": 15.0,
                "speaker": "Teacher"
            },
            {
                "text": "So force is mass times acceleration?",
                "timestamp": 22.0,
                "speaker": "Student"
            },
            {
                "text": "Exactly! And Newton's Third Law says for every action, there's an equal and opposite reaction.",
                "timestamp": 25.0,
                "speaker": "Teacher"
            },
        ]

        transcripts = []
        for segment in mock_segments:
            transcript = Transcript(
                session_id=session_id,
                recording_id=recording_id,
                text=segment["text"],
                timestamp=segment["timestamp"],
                speaker=segment["speaker"]
            )
            db.add(transcript)
            transcripts.append(transcript)

        db.commit()

        # Mark recording as transcribed
        recording = db.query(Recording).filter(Recording.id == recording_id).first()
        if recording:
            recording.is_transcribed = True
            db.commit()

        return transcripts