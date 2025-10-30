"""
API routes for managing lecturer teaching room assignments.
Includes schedule clash detection and role-based access control.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.lecturer_location import LecturerLocation
from app.schemas.lecturer_location import (
    LecturerLocationResponse,
    LecturerLocationAssign,
    LecturerLocationUpdate,
)
from app.models.user import User, UserRole
from app.api.auth import get_current_user

router = APIRouter(prefix="/lecturer-locations", tags=["Lecturer Locations"])


# --------------------------------------------------
# Utility — prevent overlapping schedules
# --------------------------------------------------
def check_schedule_conflict(
    db: Session,
    lecturer_email: str,
    start_time: datetime,
    end_time: datetime,
    exclude_id: str | None = None
) -> bool:
    """Return True if a lecturer has a schedule conflict."""
    query = db.query(LecturerLocation).filter(
        LecturerLocation.lecturer_email == lecturer_email
    )
    if exclude_id:
        query = query.filter(LecturerLocation.id != exclude_id)

    for loc in query.all():
        if loc.start_time and loc.end_time:
            if start_time < loc.end_time and end_time > loc.start_time:
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
@router.get("/me", response_model=List[LecturerLocationResponse])
def get_my_assigned_rooms(
    db: Session = Depends(get_db),
    lecturer: User = Depends(require_lecturer),
):
    """Lecturer: view all rooms assigned to them."""
    rooms = db.query(LecturerLocation).filter(
        LecturerLocation.lecturer_email == lecturer.email
    ).all()
    return rooms


# --------------------------------------------------
# Admin endpoints
# --------------------------------------------------
@router.get("/", response_model=List[LecturerLocationResponse])
def get_all_lecturer_rooms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin: view all lecturer teaching rooms."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admins only.")
    return db.query(LecturerLocation).all()


@router.post("/assign", response_model=LecturerLocationResponse)
def assign_lecturer_room(
    assignment: LecturerLocationAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin: assign a lecturer to a teaching room."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admins only.")

    room = db.query(LecturerLocation).filter(
        LecturerLocation.id == assignment.id
    ).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found.")

    # Check for overlapping schedules
    if check_schedule_conflict(
        db, assignment.email, assignment.start_time, assignment.end_time
    ):
        raise HTTPException(status_code=400, detail="Schedule conflict detected.")

    room.lecturer_email = assignment.email
    room.start_time = assignment.start_time
    room.end_time = assignment.end_time
    db.commit()
    db.refresh(room)
    return room


@router.put("/{room_id}", response_model=LecturerLocationResponse)
def update_lecturer_room(
    room_id: str,
    payload: LecturerLocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin: update room information or reassign lecturer."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admins only.")

    room = db.query(LecturerLocation).filter(LecturerLocation.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found.")

    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(room, key, value)

    db.commit()
    db.refresh(room)
    return room


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def clear_lecturer_assignment(
    room_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin: unassign a lecturer from a room (without deleting the record)."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admins only.")

    room = db.query(LecturerLocation).filter(LecturerLocation.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found.")

    room.lecturer_email = None
    room.start_time = None
    room.end_time = None
    db.commit()
    return
