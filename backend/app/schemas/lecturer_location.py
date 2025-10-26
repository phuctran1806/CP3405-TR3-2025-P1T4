"""
Schemas for LecturerLocation.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.lecturer_location import LocationState


class LecturerLocationBase(BaseModel):
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


class LecturerLocationAssign(BaseModel):
    """Admin: assign a lecturer to a room."""
    lecturer_email: str
    start_time: datetime = Field(..., description="Lecture start datetime")
    end_time: datetime = Field(..., description="Lecture end datetime")


class LecturerLocationUpdate(BaseModel):
    """Admin: update room info or assignment."""
    name: Optional[str]
    image_url: Optional[str]
    capacity: Optional[int]
    subject: Optional[str]
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    state: Optional[LocationState]
    lecturer_email: Optional[str]


class LecturerLocationResponse(LecturerLocationBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
