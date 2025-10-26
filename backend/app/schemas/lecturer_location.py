"""
Schemas for LecturerLocation.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.lecturer_location import LocationState


class LecturerLocationBase(BaseModel):
    id: str
    code: str
    name: str
    image_url: Optional[str]
    capacity: int
    subject: str
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    live_occupancy: Optional[int]
    state: LocationState
    lecturer_email: Optional[str] = None

    class Config:
        orm_mode = True


class LecturerLocationAssign(BaseModel):
    """Admin: assign a room to a lecturer."""
    id: str = Field(..., description="ID of the lecturer location")
    lecturer_email: str = Field(..., description="Email of the lecturer")
    start_time: datetime
    end_time: datetime


class LecturerLocationUpdate(BaseModel):
    """Admin: update lecture room details or reassign lecturer."""
    id: str
    code: Optional[str]
    name: Optional[str]
    image_url: Optional[str]
    capacity: Optional[int]
    subject: Optional[str]
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    lecturer_email: Optional[str]
    state: Optional[LocationState]


class LecturerLocationResponse(LecturerLocationBase):
    created_at: datetime
    updated_at: datetime
