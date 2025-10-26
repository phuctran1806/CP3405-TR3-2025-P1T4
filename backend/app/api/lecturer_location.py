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
    LecturerLocationBase,
    LecturerLocationAssign,
    LecturerLocationUpdate,
    LecturerLocationResponse,
)
from app.models.user import User
from app.api.auth import get_current_user

router = APIRouter(prefix="/lecturer-locations", tags=["Lecturer Locations"])

# Utility functions:

def check_schedule_conflict(db: Session, lecturer_email: str, start_time: datetime, end_time: datetime, exclude_id: str = None):
    """
    Check for overlapping schedules for the same lecturer.
    """
    query = db.query(LecturerLocation).filter(LecturerLocation.lecturer_email == lecturer_email)

    if exclude_id:
        query = query.filter(LecturerLocation.id != exclude_id)

    existing = query.all()

    for loc in existing:
        if loc.start_time and loc.end_time:
            overlap = not (end_time <= loc.start_time or start_time >= loc.end_time)
            if overlap:
                raise HTTPException(
                    status_code=400,
                    detail=f"Schedule conflict with room '{loc.name}' ({loc.code}) from {loc.start_time} to {loc.end_time}"
                )

# API endpoints:

@router.get("/my-room", response_model=List[LecturerLocationResponse])
async def get_my_rooms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lecturer: Fetch all assigned rooms (uses email from token).
    """
    if current_user.role != "lecturer":
        raise HTTPException(status_code=403, detail="Access denied: lecturers only")

    rooms = db.query(LecturerLocation).filter(
        LecturerLocation.lecturer_email == current_user.email
    ).all()

    if not rooms:
        raise HTTPException(status_code=404, detail="No rooms assigned")

    return [LecturerLocationResponse.from_orm(r) for r in rooms]


@router.get("/", response_model=List[LecturerLocationResponse])
async def get_all_rooms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Get all lecture rooms."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied: admins only")

    rooms = db.query(LecturerLocation).all()
    return [LecturerLocationResponse.from_orm(r) for r in rooms]


@router.post("/", response_model=LecturerLocationResponse, status_code=201)
async def create_room(
    payload: LecturerLocationBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Create a new lecture room."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied: admins only")

    new_room = LecturerLocation(id=str(uuid.uuid4()), **payload.dict())
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return LecturerLocationResponse.from_orm(new_room)


@router.post("/assign/{room_id}", response_model=LecturerLocationResponse)
async def assign_room(
    room_id: str,
    payload: LecturerLocationAssign,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Admin: Assign a lecturer to a room.
    Validates that the lecturer’s schedule does not overlap with other assigned rooms.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied: admins only")

    room = db.query(LecturerLocation).filter(LecturerLocation.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # check schedule conflicts for same lecturer
    check_schedule_conflict(db, payload.lecturer_email, payload.start_time, payload.end_time, exclude_id=room_id)

    # assign
    room.lecturer_email = payload.lecturer_email
    room.start_time = payload.start_time
    room.end_time = payload.end_time

    db.commit()
    db.refresh(room)
    return LecturerLocationResponse.from_orm(room)


@router.put("/{room_id}", response_model=LecturerLocationResponse)
async def update_room(
    room_id: str,
    payload: LecturerLocationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Update room details or lecturer assignment."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied: admins only")

    room = db.query(LecturerLocation).filter(LecturerLocation.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    updated_data = payload.dict(exclude_unset=True)

    # if updating lecturer or times, check for clash
    if "lecturer_email" in updated_data or "start_time" in updated_data or "end_time" in updated_data:
        lecturer_email = updated_data.get("lecturer_email", room.lecturer_email)
        start_time = updated_data.get("start_time", room.start_time)
        end_time = updated_data.get("end_time", room.end_time)
        if lecturer_email and start_time and end_time:
            check_schedule_conflict(db, lecturer_email, start_time, end_time, exclude_id=room.id)

    for key, value in updated_data.items():
        setattr(room, key, value)

    db.commit()
    db.refresh(room)
    return LecturerLocationResponse.from_orm(room)


@router.delete("/{room_id}", status_code=204)
async def delete_room(
    room_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Delete a lecture room."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied: admins only")

    room = db.query(LecturerLocation).filter(LecturerLocation.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    db.delete(room)
    db.commit()
    return None
