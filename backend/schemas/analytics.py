from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class DashboardSummary(BaseModel):
    active_students: int
    avg_engagement: float
    avg_mastery: float
    classes_this_week: int


class RecentClass(BaseModel):
    id: int
    subject: str
    topic: str
    date: str
    duration: str
    students: int
    engagement: int


class EngagementTimeline(BaseModel):
    time: str
    engagement: int
    confusion: int


class InterventionEffectiveness(BaseModel):
    before_confusion: int
    after_confusion: int
    reduction_percent: float
    intervention_time: datetime


class ParticipationDistribution(BaseModel):
    active: int
    moderate: int
    passive: int


class AnalyticsInsight(BaseModel):
    title: str
    value: str
    subtitle: str
    type: str  # success, warning, info

