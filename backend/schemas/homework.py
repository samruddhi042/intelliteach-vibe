from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from models.homework import HomeworkStatus


class HomeworkBase(BaseModel):
    title: str
    concepts: List[str]
    number_of_questions: int
    estimated_time: int  # in minutes
    target_mastery: int  # 0-100


class HomeworkCreate(HomeworkBase):
    student_id: int
    class_id: int


class HomeworkResponse(HomeworkBase):
    id: int
    student_id: int
    class_id: int
    current_mastery: Optional[int]
    status: HomeworkStatus
    created_at: datetime
    completed_at: Optional[datetime]
    questions: List[int]

    class Config:
        from_attributes = True


class HomeworkGenerateRequest(BaseModel):
    student_id: int
    class_id: int
    time_limit: int  # in minutes
    focus_concepts: Optional[List[str]] = None

