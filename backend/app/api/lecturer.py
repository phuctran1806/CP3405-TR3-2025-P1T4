"""
API routes for managing lecturer teaching room assignments.
Includes schedule clash detection and role-based access control.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.lecturer_assignment import LecturerAssignment
from app.schemas.lecturer_assignment import (
    LecturerAssignmentRequest,
    LecturerAssignmentResponse,
)
from app.models.user import User, UserRole
from app.api.auth import get_current_user

router = APIRouter(prefix="/lecturer-assignments", tags=["Lecturer Assignments"])


# --------------------------------------------------
# Utility — prevent overlapping schedules
# --------------------------------------------------
def check_schedule_conflict(
    db: Session,
    user_id: str,
    start_time: datetime,
    end_time: datetime,
    exclude_id: Optional[str] = None
) -> bool:
    """Return True if a lecturer has a schedule conflict."""
    query = db.query(LecturerAssignment).filter(LecturerAssignment.user_id == user_id)
    if exclude_id:
        query = query.filter(LecturerAssignment.id != exclude_id)

    for record in query.all():
        if record.start_time and record.end_time:
            if start_time < record.end_time and end_time > record.start_time:
                return True
    return False


# --------------------------------------------------
# Dependency — require lecturer role
# --------------------------------------------------
async def require_lecturer(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.LECTURER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Lecturer access required."
        )
    return current_user


# --------------------------------------------------
# Lecturer endpoints
# --------------------------------------------------
@router.get("/me", response_model=List[LecturerAssignmentResponse])
def get_my_assigned_rooms(
    db: Session = Depends(get_db),
    lecturer: User = Depends(require_lecturer),
):
    """Lecturer: view all rooms assigned to them."""
    rooms = db.query(LecturerAssignment).filter(
        LecturerAssignment.user_id == lecturer.id
    ).all()
    return rooms
