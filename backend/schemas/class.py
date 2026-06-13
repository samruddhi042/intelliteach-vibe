from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class ClassBase(BaseModel):
    subject: str
    topic: str
    syllabus_mapping: Optional[Dict[str, Any]] = {}


class ClassCreate(ClassBase):
    teacher_id: int


class ClassResponse(ClassBase):
    id: int
    teacher_id: int

    class Config:
        from_attributes = True

