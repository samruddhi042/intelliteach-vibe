from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import List, Dict
from models.engagement import EngagementSignal
from models.session import ClassSession
from schemas.engagement import EngagementStatus
from utils.constants import (
    SIGNAL_GOT_IT,
    SIGNAL_CONFUSED,
    SIGNAL_MCQ,
    CONFUSION_HIGH_THRESHOLD,
    MCQ_ACCURACY_THRESHOLD,
)


class EngagementEngine:
    """Rule-based engagement engine that computes engagement metrics"""

    @staticmethod
    def compute_engagement_index(
        db: Session,
        session_id: int,
        time_window_seconds: int = 30
    ) -> EngagementStatus:
        """
        Compute engagement index based on signals in the last N seconds.
        Uses explainable rule-based logic.
        """
        # Get signals from the last time window
        cutoff_time = datetime.utcnow() - timedelta(seconds=time_window_seconds)
        
        signals = db.query(EngagementSignal).filter(
            and_(
                EngagementSignal.session_id == session_id,
                EngagementSignal.timestamp >= cutoff_time
            )
        ).all()

        if not signals:
            return EngagementStatus(
                engagement_percent=0,
                confusion_percent=0,
                got_it_count=0,
                confused_count=0,
                mcq_accuracy=None,
                suggested_action=None
            )

        # Count signals by type
        got_it_count = sum(1 for s in signals if s.signal_type == SIGNAL_GOT_IT)
        confused_count = sum(1 for s in signals if s.signal_type == SIGNAL_CONFUSED)
        mcq_signals = [s for s in signals if s.signal_type == SIGNAL_MCQ]
        
        total_signals = len(signals)
        
        # Compute engagement percentage
        # Formula: (got_it + correct_mcq) / total_signals * 100
        positive_signals = got_it_count
        if mcq_signals:
            correct_mcqs = sum(1 for s in mcq_signals if s.correct)
            positive_signals += correct_mcqs
        
        engagement_percent = int((positive_signals / total_signals) * 100) if total_signals > 0 else 0
        
        # Compute confusion percentage
        confusion_percent = int((confused_count / total_signals) * 100) if total_signals > 0 else 0
        
        # Compute MCQ accuracy
        mcq_accuracy = None
        if mcq_signals:
            correct_count = sum(1 for s in mcq_signals if s.correct)
            mcq_accuracy = int((correct_count / len(mcq_signals)) * 100)

        # Rule-based intervention suggestion
        suggested_action = EngagementEngine._suggest_intervention(
            confusion_percent,
            mcq_accuracy,
            engagement_percent
        )

        return EngagementStatus(
            engagement_percent=engagement_percent,
            confusion_percent=confusion_percent,
            got_it_count=got_it_count,
            confused_count=confused_count,
            mcq_accuracy=mcq_accuracy,
            suggested_action=suggested_action
        )

    @staticmethod
    def _suggest_intervention(
        confusion_percent: int,
        mcq_accuracy: Optional[int],
        engagement_percent: int
    ) -> Optional[str]:
        """
        Rule-based intervention suggestion logic.
        Explainable rules that can be understood by teachers.
        """
        # Rule 1: High confusion AND low MCQ accuracy
        if confusion_percent > CONFUSION_HIGH_THRESHOLD:
            if mcq_accuracy is not None and mcq_accuracy < MCQ_ACCURACY_THRESHOLD:
                return (
                    f"High confusion detected ({confusion_percent}%) with low MCQ accuracy ({mcq_accuracy}%). "
                    "Recommendation: Re-explain the concept using a worked example. "
                    "Consider using a relatable context (e.g., elevator problem for F=ma)."
                )
            else:
                return (
                    f"High confusion detected ({confusion_percent}%). "
                    "Recommendation: Slow down the pace and check for understanding. "
                    "Ask students to explain the concept back to you."
                )

        # Rule 2: Low engagement overall
        if engagement_percent < 50:
            return (
                f"Low engagement detected ({engagement_percent}%). "
                "Recommendation: Increase interactivity. Try a quick poll or ask questions. "
                "Consider taking a short break if the class has been running long."
            )

        # Rule 3: Moderate confusion
        if confusion_percent > 25:
            return (
                f"Moderate confusion detected ({confusion_percent}%). "
                "Recommendation: Provide additional examples or visual aids. "
                "Check if students need clarification on specific parts."
            )

        # No intervention needed
        return None

    @staticmethod
    def get_engagement_timeline(
        db: Session,
        session_id: int,
        interval_seconds: int = 300  # 5 minutes
    ) -> List[Dict]:
        """
        Get engagement timeline for a session, aggregated by time intervals.
        """
        session = db.query(ClassSession).filter(ClassSession.id == session_id).first()
        if not session:
            return []

        timeline = []
        current_time = session.start_time
        end_time = session.end_time or datetime.utcnow()

        while current_time < end_time:
            interval_end = current_time + timedelta(seconds=interval_seconds)
            
            signals = db.query(EngagementSignal).filter(
                and_(
                    EngagementSignal.session_id == session_id,
                    EngagementSignal.timestamp >= current_time,
                    EngagementSignal.timestamp < interval_end
                )
            ).all()

            if signals:
                got_it = sum(1 for s in signals if s.signal_type == SIGNAL_GOT_IT)
                confused = sum(1 for s in signals if s.signal_type == SIGNAL_CONFUSED)
                total = len(signals)
                
                engagement = int((got_it / total) * 100) if total > 0 else 0
                confusion = int((confused / total) * 100) if total > 0 else 0
            else:
                engagement = 0
                confusion = 0

            minutes = int((current_time - session.start_time).total_seconds() / 60)
            timeline.append({
                "time": f"{minutes}:00",
                "engagement": engagement,
                "confusion": confusion
            })

            current_time = interval_end

        return timeline

