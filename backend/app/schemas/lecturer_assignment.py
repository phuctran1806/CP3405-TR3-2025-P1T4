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


class LecturerAssignmentRequest(LecturerAssignmentBase):
    """Admin: assign a room to a lecturer."""
    id: str = Field(..., description="ID of the lecturer location")
    subject: str
    start_time: datetime
    end_time: datetime
    location_id: str
    user_id: str


class LecturerAssignmentResponse(LecturerAssignmentBase):
    created_at: datetime
    updated_at: datetime
