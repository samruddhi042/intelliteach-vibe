from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EngagementSignalCreate(BaseModel):
    signal_type: str  # got_it, confused, poll, mcq
    correct: Optional[bool] = None
    concept: Optional[str] = None


class EngagementSignalResponse(BaseModel):
    id: int
    student_id: int
    session_id: int
    signal_type: str
    correct: Optional[bool]
    timestamp: datetime
    concept: Optional[str]

    class Config:
        from_attributes = True


class EngagementStatus(BaseModel):
    engagement_percent: int
    confusion_percent: int
    got_it_count: int
    confused_count: int
    mcq_accuracy: Optional[int] = None
    suggested_action: Optional[str] = None


class EngagementTimeline(BaseModel):
    time: str
    engagement: int
    confusion: int

