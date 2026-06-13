from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from models.session import ClassSession
from models.engagement import EngagementSignal
from models.user import User, UserRole
from models.mastery import Mastery
from services.engagement_engine import EngagementEngine
from utils.constants import (
    SIGNAL_GOT_IT,
    SIGNAL_CONFUSED,
    ROLE_STUDENT,
)


class AnalyticsService:
    """Analytics service for generating reports and insights"""

    @staticmethod
    def get_dashboard_summary(db: Session, teacher_id: Optional[int] = None) -> Dict:
        """Get dashboard summary statistics"""
        
        # Active students (students who have sent signals in last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        active_students = db.query(func.count(func.distinct(EngagementSignal.student_id))).filter(
            EngagementSignal.timestamp >= week_ago
        ).scalar() or 0

        # Average engagement (from recent sessions)
        recent_sessions = db.query(ClassSession).filter(
            ClassSession.start_time >= week_ago
        )
        
        if teacher_id:
            from models.class import Class
            recent_sessions = recent_sessions.join(Class).filter(Class.teacher_id == teacher_id)

        sessions = recent_sessions.all()
        if sessions:
            avg_engagement = sum(s.engagement_index for s in sessions) / len(sessions)
        else:
            avg_engagement = 0.0

        # Average mastery
        mastery_query = db.query(func.avg(Mastery.mastery_score))
        if teacher_id:
            # Get students in teacher's classes
            from models.class import Class
            class_ids = db.query(Class.id).filter(Class.teacher_id == teacher_id).all()
            class_ids = [c[0] for c in class_ids]
            mastery_query = mastery_query.filter(Mastery.class_id.in_(class_ids))
        
        avg_mastery = mastery_query.scalar() or 0.0

        # Classes this week
        week_start = datetime.utcnow() - timedelta(days=datetime.utcnow().weekday())
        classes_this_week = db.query(func.count(ClassSession.id)).filter(
            ClassSession.start_time >= week_start
        )
        
        if teacher_id:
            from models.class import Class
            classes_this_week = classes_this_week.join(Class).filter(Class.teacher_id == teacher_id)

        classes_count = classes_this_week.scalar() or 0

        return {
            "active_students": active_students,
            "avg_engagement": round(avg_engagement, 1),
            "avg_mastery": round(avg_mastery, 1),
            "classes_this_week": classes_count
        }

    @staticmethod
    def get_recent_classes(
        db: Session,
        teacher_id: Optional[int] = None,
        limit: int = 10
    ) -> List[Dict]:
        """Get recent classes with summary statistics"""
        from models.class import Class

        query = db.query(ClassSession).join(Class)
        
        if teacher_id:
            query = query.filter(Class.teacher_id == teacher_id)

        sessions = query.order_by(ClassSession.start_time.desc()).limit(limit).all()

        recent_classes = []
        for session in sessions:
            # Count students in session
            student_count = db.query(func.count(func.distinct(EngagementSignal.student_id))).filter(
                EngagementSignal.session_id == session.id
            ).scalar() or 0

            # Calculate duration
            if session.end_time:
                duration_seconds = int((session.end_time - session.start_time).total_seconds())
                duration_min = duration_seconds // 60
            else:
                duration_min = 0

            # Format date
            if session.start_time.date() == datetime.utcnow().date():
                date_str = "Today"
            elif session.start_time.date() == (datetime.utcnow() - timedelta(days=1)).date():
                date_str = "Yesterday"
            else:
                date_str = session.start_time.strftime("%b %d")

            recent_classes.append({
                "id": session.id,
                "subject": session.class_obj.subject,
                "topic": session.class_obj.topic,
                "date": date_str,
                "duration": f"{duration_min} min",
                "students": student_count,
                "engagement": session.engagement_index
            })

        return recent_classes

    @staticmethod
    def get_engagement_timeline(
        db: Session,
        session_id: int
    ) -> List[Dict]:
        """Get engagement timeline for a session"""
        return EngagementEngine.get_engagement_timeline(db, session_id)

    @staticmethod
    def get_intervention_effectiveness(
        db: Session,
        session_id: int,
        intervention_time: datetime
    ) -> Dict:
        """Analyze intervention effectiveness by comparing before/after confusion"""
        # Get confusion before intervention (5 minutes before)
        before_start = intervention_time - timedelta(minutes=5)
        before_signals = db.query(EngagementSignal).filter(
            and_(
                EngagementSignal.session_id == session_id,
                EngagementSignal.timestamp >= before_start,
                EngagementSignal.timestamp < intervention_time,
                EngagementSignal.signal_type == SIGNAL_CONFUSED
            )
        ).all()

        # Get confusion after intervention (5 minutes after)
        after_end = intervention_time + timedelta(minutes=5)
        after_signals = db.query(EngagementSignal).filter(
            and_(
                EngagementSignal.session_id == session_id,
                EngagementSignal.timestamp >= intervention_time,
                EngagementSignal.timestamp <= after_end,
                EngagementSignal.signal_type == SIGNAL_CONFUSED
            )
        ).all()

        # Get total signals in each period
        before_total = db.query(EngagementSignal).filter(
            and_(
                EngagementSignal.session_id == session_id,
                EngagementSignal.timestamp >= before_start,
                EngagementSignal.timestamp < intervention_time
            )
        ).count()

        after_total = db.query(EngagementSignal).filter(
            and_(
                EngagementSignal.session_id == session_id,
                EngagementSignal.timestamp >= intervention_time,
                EngagementSignal.timestamp <= after_end
            )
        ).count()

        before_confusion = int((len(before_signals) / before_total * 100)) if before_total > 0 else 0
        after_confusion = int((len(after_signals) / after_total * 100)) if after_total > 0 else 0

        reduction = before_confusion - after_confusion
        reduction_percent = int((reduction / before_confusion * 100)) if before_confusion > 0 else 0

        return {
            "before_confusion": before_confusion,
            "after_confusion": after_confusion,
            "reduction_percent": reduction_percent,
            "intervention_time": intervention_time
        }

    @staticmethod
    def get_participation_distribution(
        db: Session,
        session_id: int
    ) -> Dict:
        """Get participation distribution (active, moderate, passive)"""
        # Get all unique students in session
        students = db.query(func.distinct(EngagementSignal.student_id)).filter(
            EngagementSignal.session_id == session_id
        ).all()
        student_ids = [s[0] for s in students]

        if not student_ids:
            return {"active": 0, "moderate": 0, "passive": 0}

        # Count signals per student
        student_signal_counts = {}
        for student_id in student_ids:
            count = db.query(EngagementSignal).filter(
                and_(
                    EngagementSignal.session_id == session_id,
                    EngagementSignal.student_id == student_id
                )
            ).count()
            student_signal_counts[student_id] = count

        # Categorize: active (>5 signals), moderate (2-5), passive (<2)
        active = sum(1 for count in student_signal_counts.values() if count > 5)
        moderate = sum(1 for count in student_signal_counts.values() if 2 <= count <= 5)
        passive = sum(1 for count in student_signal_counts.values() if count < 2)

        total = len(student_ids)
        if total > 0:
            return {
                "active": int((active / total) * 100),
                "moderate": int((moderate / total) * 100),
                "passive": int((passive / total) * 100)
            }
        else:
            return {"active": 0, "moderate": 0, "passive": 0}

