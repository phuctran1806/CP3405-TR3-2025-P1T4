"""
Reservation schemas for request/response validation.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.reservation import ReservationStatus


class ReservationCreate(BaseModel):
    """Schema for creating a reservation."""
    seat_id: str
    start_time: datetime
    end_time: datetime


class ReservationUpdate(BaseModel):
    """Schema for updating a reservation."""
    status: Optional[ReservationStatus] = None
    cancellation_reason: Optional[str] = None


class ReservationResponse(BaseModel):
    """Schema for reservation response."""
    id: str
    user_id: str
    seat_id: str
    start_time: datetime
    end_time: datetime
    check_in_time: Optional[datetime]
    check_out_time: Optional[datetime]
    status: ReservationStatus
    cancellation_reason: Optional[str]
    reminder_sent: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
