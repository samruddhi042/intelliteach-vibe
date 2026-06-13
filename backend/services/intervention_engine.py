from sqlalchemy.orm import Session
from typing import Optional, Dict
from models.session import ClassSession
from services.engagement_engine import EngagementEngine
from utils.constants import (
    CONFUSION_HIGH_THRESHOLD,
    MCQ_ACCURACY_THRESHOLD,
    INTERVENTION_REEXPLAIN,
    INTERVENTION_SLOW_DOWN,
    INTERVENTION_BREAK,
    INTERVENTION_INDIVIDUAL_HELP,
    INTERVENTION_EXAMPLE,
)


class InterventionEngine:
    """Rule-based intervention engine that suggests teacher actions"""

    @staticmethod
    def analyze_and_suggest(
        db: Session,
        session_id: int
    ) -> Dict:
        """
        Analyze current session state and suggest intervention actions.
        Returns explainable recommendations based on clear rules.
        """
        session = db.query(ClassSession).filter(ClassSession.id == session_id).first()
        if not session:
            return {
                "needs_intervention": False,
                "suggestion": None,
                "reason": "Session not found"
            }

        # Get current engagement status
        engagement_status = EngagementEngine.compute_engagement_index(db, session_id)

        # Rule-based analysis
        needs_intervention = False
        suggestion = None
        reason = None
        confusion_level = "low"

        # Determine confusion level
        if engagement_status.confusion_percent > CONFUSION_HIGH_THRESHOLD:
            confusion_level = "high"
            needs_intervention = True
        elif engagement_status.confusion_percent > 25:
            confusion_level = "medium"
            needs_intervention = True

        # Generate specific suggestions based on rules
        if needs_intervention:
            if engagement_status.confusion_percent > CONFUSION_HIGH_THRESHOLD:
                if engagement_status.mcq_accuracy is not None:
                    if engagement_status.mcq_accuracy < MCQ_ACCURACY_THRESHOLD:
                        suggestion = INTERVENTION_REEXPLAIN
                        reason = (
                            f"High confusion ({engagement_status.confusion_percent}%) "
                            f"combined with low MCQ accuracy ({engagement_status.mcq_accuracy}%) "
                            "indicates fundamental misunderstanding."
                        )
                    else:
                        suggestion = INTERVENTION_EXAMPLE
                        reason = (
                            f"High confusion ({engagement_status.confusion_percent}%) "
                            "but decent MCQ performance suggests need for concrete examples."
                        )
                else:
                    suggestion = INTERVENTION_SLOW_DOWN
                    reason = (
                        f"High confusion ({engagement_status.confusion_percent}%) detected. "
                        "Pace may be too fast for current understanding level."
                    )
            elif engagement_status.confusion_percent > 25:
                suggestion = INTERVENTION_SLOW_DOWN
                reason = (
                    f"Moderate confusion ({engagement_status.confusion_percent}%) detected. "
                    "Consider checking for understanding before proceeding."
                )

            # Check engagement level
            if engagement_status.engagement_percent < 50:
                if suggestion:
                    suggestion += " Also consider increasing interactivity."
                else:
                    suggestion = "Increase interactivity with polls or questions."
                    reason = f"Low engagement ({engagement_status.engagement_percent}%) detected."

        return {
            "needs_intervention": needs_intervention,
            "suggestion": suggestion,
            "reason": reason,
            "confusion_level": confusion_level,
            "engagement_percent": engagement_status.engagement_percent,
            "confusion_percent": engagement_status.confusion_percent,
            "mcq_accuracy": engagement_status.mcq_accuracy,
        }

    @staticmethod
    def mark_intervention_complete(
        db: Session,
        session_id: int,
        intervention_type: str,
        effectiveness: Optional[int] = None
    ) -> bool:
        """
        Mark an intervention as complete. Can track effectiveness for analytics.
        """
        session = db.query(ClassSession).filter(ClassSession.id == session_id).first()
        if not session:
            return False

        # In a production system, you might store intervention records
        # For now, we'll just update the session's engagement metrics
        # This allows tracking intervention effectiveness
        
        # Recompute engagement after intervention
        engagement_status = EngagementEngine.compute_engagement_index(db, session_id)
        session.engagement_index = engagement_status.engagement_percent
        session.confusion_percent = engagement_status.confusion_percent
        
        db.commit()
        return True

