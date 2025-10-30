"""
Seat schemas for request/response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.seat import SeatType, SeatStatus


class SeatBase(BaseModel):
    """Base seat schema."""
    seat_number: str
    seat_type: SeatType
    has_power_outlet: bool = False
    has_wifi: bool = False
    has_ac: bool = False
    accessibility: bool = False
    capacity: int = 1


class SeatResponse(SeatBase):
    """Schema for seat response."""
    id: str
    floor_id: str
    x_coordinate: Optional[float]
    y_coordinate: Optional[float]
    status: SeatStatus
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class SeatAvailability(BaseModel):
    """Schema for seat availability response."""
    seat: SeatResponse
    is_available: bool
    next_available_time: Optional[datetime] = None

