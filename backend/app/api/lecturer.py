"""
API routes for managing lecturer locations (teaching rooms).
Includes schedule clash detection.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
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

router = APIRouter()


# Utility — prevent overlapping bookings
def check_schedule_conflict(db: Session, email: str, start: datetime, end: datetime, exclude_id: str = None):
    query = db.query(LecturerLocation).filter(LecturerLocation.email == email)
    if exclude_id:
        query = query.filter(LecturerLocation.id != exclude_id)

    for loc in query.all():
        if loc.start_time and loc.end_time:
            if start < loc.end_time and end > loc.start_time:
                return True
    return False

async def require_lecturer(current_user: User = Depends(get_current_user)):
    """Dependency to require lecturer role."""
    if current_user.role != UserRole.LECTURER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Lecturer access required"
        )
    return current_user

# Lecturer: fetch only assigned rooms
@router.get("/me", response_model=List[LecturerLocationResponse])
def get_my_rooms(
    db: Session = Depends(get_db),
    lecturer: User = Depends(require_lecturer),
):
    rooms = db.query(LecturerLocation).filter(
        LecturerLocation.email == lecturer.email
    ).all()
    return rooms


# Admin: fetch all rooms
@router.get("/", response_model=List[LecturerLocationResponse])
def get_all_rooms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    return db.query(LecturerLocation).all()


# Admin: assign room to lecturer
@router.post("/assign", response_model=LecturerLocationResponse)
def assign_room(
    assignment: LecturerLocationAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    room = db.query(LecturerLocation).filter(LecturerLocation.id == assignment.id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    if check_schedule_conflict(db, assignment.lecturer_email, assignment.start_time, assignment.end_time):
        raise HTTPException(status_code=400, detail="Schedule conflict detected")

    room.lecturer_email = assignment.lecturer_email
    room.start_time = assignment.start_time
    room.end_time = assignment.end_time
    db.commit()
    db.refresh(room)
    return room


# Admin: update room or reassign lecturer
@router.put("/{room_id}", response_model=LecturerLocationResponse)
def update_room(
    room_id: str,
    payload: LecturerLocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    room = db.query(LecturerLocation).filter(LecturerLocation.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(room, key, value)

    db.commit()
    db.refresh(room)
    return room


# Admin: delete room assignment (not delete record)
@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assignment(
    room_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    room = db.query(LecturerLocation).filter(LecturerLocation.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    room.lecturer_email = None
    room.start_time = None
    room.end_time = None

    db.commit()
    return
