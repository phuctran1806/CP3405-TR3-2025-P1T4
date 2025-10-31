"""
Schemas for LecturerLocation.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class LecturerAssignmentBase(BaseModel):
    id: str
    subject: str
    start_time: datetime
    end_time: datetime
    location_id: str
    user_id: str

    class Config:
        orm_mode = True


class LecturerAssignmentCreate(BaseModel):
    """Admin: assign a room to a lecturer."""
    id: str = Field(..., description="ID of the lecturer location")
    subject: str
    location_id: str
    start_time: datetime
    end_time: datetime
    location_id: str
    user_id: str


class LecturerAssignmentUpdate(BaseModel):
    """Admin: update lecture room details or reassign lecturer."""
    id: str
    name: Optional[str]
    subject: Optional[str]
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    lecturer_email: Optional[str]


class LecturerAssignmentResponse(LecturerAssignmentBase):
    created_at: datetime
    updated_at: datetime
