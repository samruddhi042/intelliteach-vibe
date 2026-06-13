from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MasteryBase(BaseModel):
    concept: str
    mastery_score: int  # 0-100


class MasteryCreate(MasteryBase):
    student_id: int
    class_id: Optional[int] = None


class MasteryResponse(MasteryBase):
    id: int
    student_id: int
    class_id: Optional[int]
    last_updated: datetime

    class Config:
        from_attributes = True


class MasteryHeatmapItem(BaseModel):
    concept: str
    mastery: int


class MasteryHeatmap(BaseModel):
    student_id: int
    heatmap: List[MasteryHeatmapItem]

