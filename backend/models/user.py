from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
import enum
from database import Base


class UserRole(str, enum.Enum):
    TEACHER = "Teacher"
    STUDENT = "Student"
    ADMIN = "Admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.STUDENT)

    # Relationships
    classes_taught = relationship("Class", back_populates="teacher", foreign_keys="Class.teacher_id")
    engagement_signals = relationship("EngagementSignal", back_populates="student")
    mastery_records = relationship("Mastery", back_populates="student")
    homework_assignments = relationship("Homework", back_populates="student")
    projects = relationship("ProjectMember", back_populates="user")

