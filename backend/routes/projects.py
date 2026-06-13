from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db
from models.user import User
from models.project import Project, ProjectMember, PeerReview, ProjectStatus
from services.auth_service import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/projects", tags=["Projects"])


class ProjectCreate(BaseModel):
    title: str
    subject: str
    description: Optional[str] = None
    deadline: datetime
    tasks_total: int = 0


class ProjectResponse(BaseModel):
    id: int
    title: str
    subject: str
    description: Optional[str]
    deadline: datetime
    status: ProjectStatus
    progress: int
    tasks_total: int
    tasks_completed: int
    created_at: datetime

    class Config:
        from_attributes = True


class TeamMemberRequest(BaseModel):
    user_ids: List[int]


class PeerReviewRequest(BaseModel):
    reviewee_id: int
    teamwork_score: float
    communication_score: float
    collaboration_score: float
    feedback: Optional[str] = None


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new project"""
    project = Project(
        title=project_data.title,
        subject=project_data.subject,
        description=project_data.description,
        deadline=project_data.deadline,
        tasks_total=project_data.tasks_total,
        status=ProjectStatus.NOT_STARTED
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("", response_model=List[ProjectResponse])
def get_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all projects for current user"""
    if current_user.role.value == "Student":
        # Get projects where user is a member
        member_projects = db.query(Project).join(ProjectMember).filter(
            ProjectMember.user_id == current_user.id
        ).all()
        return member_projects
    else:
        # Teachers/Admins see all projects
        projects = db.query(Project).all()
        return projects


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project


@router.post("/{project_id}/teams")
def assign_team(
    project_id: int,
    team_data: TeamMemberRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assign team members to a project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Remove existing members
    db.query(ProjectMember).filter(ProjectMember.project_id == project_id).delete()

    # Add new members
    for user_id in team_data.user_ids:
        member = ProjectMember(project_id=project_id, user_id=user_id)
        db.add(member)

    project.status = ProjectStatus.IN_PROGRESS
    db.commit()

    return {
        "message": "Team assigned",
        "project_id": project_id,
        "team_size": len(team_data.user_ids)
    }


@router.post("/{project_id}/peer-review")
def submit_peer_review(
    project_id: int,
    review_data: PeerReviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a peer review"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Verify reviewer is a project member
    reviewer_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == current_user.id
    ).first()

    if not reviewer_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a project member to submit reviews"
        )

    # Verify reviewee is a project member
    reviewee_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == review_data.reviewee_id
    ).first()

    if not reviewee_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reviewee must be a project member"
        )

    # Create review
    review = PeerReview(
        project_id=project_id,
        reviewer_id=current_user.id,
        reviewee_id=review_data.reviewee_id,
        teamwork_score=review_data.teamwork_score,
        communication_score=review_data.communication_score,
        collaboration_score=review_data.collaboration_score,
        feedback=review_data.feedback
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return {
        "message": "Peer review submitted",
        "review_id": review.id
    }


@router.get("/{project_id}/soft-skills")
def get_soft_skills(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get soft skills scores for a project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Get all peer reviews for this project
    reviews = db.query(PeerReview).filter(PeerReview.project_id == project_id).all()

    if not reviews:
        return {
            "teamwork": 0,
            "communication": 0,
            "collaboration": 0
        }

    # Calculate averages
    from sqlalchemy import func
    avg_teamwork = db.query(func.avg(PeerReview.teamwork_score)).filter(
        PeerReview.project_id == project_id
    ).scalar() or 0

    avg_communication = db.query(func.avg(PeerReview.communication_score)).filter(
        PeerReview.project_id == project_id
    ).scalar() or 0

    avg_collaboration = db.query(func.avg(PeerReview.collaboration_score)).filter(
        PeerReview.project_id == project_id
    ).scalar() or 0

    return {
        "teamwork": round(avg_teamwork, 1),
        "communication": round(avg_communication, 1),
        "collaboration": round(avg_collaboration, 1)
    }

