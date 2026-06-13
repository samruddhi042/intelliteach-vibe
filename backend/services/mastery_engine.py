from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Dict, Optional
from models.mastery import Mastery
from models.engagement import EngagementSignal
from models.question import Question
from utils.constants import (
    SIGNAL_MCQ,
    MASTERY_MIN,
    MASTERY_MAX,
)


class MasteryEngine:
    """Rule-based mastery engine that tracks and updates concept mastery"""

    @staticmethod
    def update_mastery_from_signal(
        db: Session,
        student_id: int,
        concept: str,
        signal_type: str,
        correct: Optional[bool] = None,
        class_id: Optional[int] = None
    ) -> Mastery:
        """
        Update mastery score based on an engagement signal.
        Uses explainable rules:
        - Got it signal: +5 points
        - Confused signal: -3 points
        - Correct MCQ: +10 points
        - Incorrect MCQ: -5 points
        """
        # Get or create mastery record
        mastery = db.query(Mastery).filter(
            and_(
                Mastery.student_id == student_id,
                Mastery.concept == concept
            )
        ).first()

        if not mastery:
            mastery = Mastery(
                student_id=student_id,
                concept=concept,
                mastery_score=50,  # Start at 50 (neutral)
                class_id=class_id
            )
            db.add(mastery)
        else:
            # Update class_id if provided
            if class_id:
                mastery.class_id = class_id

        # Apply rule-based updates
        if signal_type == "got_it":
            mastery.mastery_score = min(MASTERY_MAX, mastery.mastery_score + 5)
        elif signal_type == "confused":
            mastery.mastery_score = max(MASTERY_MIN, mastery.mastery_score - 3)
        elif signal_type == SIGNAL_MCQ:
            if correct:
                mastery.mastery_score = min(MASTERY_MAX, mastery.mastery_score + 10)
            else:
                mastery.mastery_score = max(MASTERY_MIN, mastery.mastery_score - 5)

        db.commit()
        db.refresh(mastery)
        return mastery

    @staticmethod
    def update_mastery_from_homework(
        db: Session,
        student_id: int,
        concept: str,
        correct_percentage: int,
        class_id: Optional[int] = None
    ) -> Mastery:
        """
        Update mastery based on homework performance.
        Rule: mastery = (old_mastery * 0.7) + (homework_score * 0.3)
        This gives more weight to recent performance while preserving history.
        """
        mastery = db.query(Mastery).filter(
            and_(
                Mastery.student_id == student_id,
                Mastery.concept == concept
            )
        ).first()

        if not mastery:
            mastery = Mastery(
                student_id=student_id,
                concept=concept,
                mastery_score=correct_percentage,
                class_id=class_id
            )
            db.add(mastery)
        else:
            # Weighted average: 70% old, 30% new
            new_score = int((mastery.mastery_score * 0.7) + (correct_percentage * 0.3))
            mastery.mastery_score = max(MASTERY_MIN, min(MASTERY_MAX, new_score))
            if class_id:
                mastery.class_id = class_id

        db.commit()
        db.refresh(mastery)
        return mastery

    @staticmethod
    def get_mastery_heatmap(
        db: Session,
        student_id: int,
        class_id: Optional[int] = None
    ) -> List[Dict]:
        """
        Get mastery heatmap for a student.
        Returns list of concepts with mastery scores.
        """
        query = db.query(Mastery).filter(Mastery.student_id == student_id)
        
        if class_id:
            query = query.filter(Mastery.class_id == class_id)

        masteries = query.all()
        
        return [
            {
                "concept": m.concept,
                "mastery": m.mastery_score
            }
            for m in masteries
        ]

    @staticmethod
    def get_lowest_mastery_concepts(
        db: Session,
        student_id: int,
        class_id: Optional[int] = None,
        limit: int = 5
    ) -> List[str]:
        """
        Get concepts with lowest mastery scores for a student.
        Used for personalized homework generation.
        """
        query = db.query(Mastery).filter(Mastery.student_id == student_id)
        
        if class_id:
            query = query.filter(Mastery.class_id == class_id)

        masteries = query.order_by(Mastery.mastery_score.asc()).limit(limit).all()
        
        return [m.concept for m in masteries]

    @staticmethod
    def get_average_mastery(
        db: Session,
        student_id: Optional[int] = None,
        class_id: Optional[int] = None
    ) -> float:
        """
        Get average mastery score.
        If student_id provided, returns average for that student.
        If class_id provided, returns average for that class.
        If both provided, returns average for that student in that class.
        """
        from sqlalchemy import func

        query = db.query(func.avg(Mastery.mastery_score))

        if student_id:
            query = query.filter(Mastery.student_id == student_id)
        if class_id:
            query = query.filter(Mastery.class_id == class_id)

        result = query.scalar()
        return round(result, 2) if result else 0.0

