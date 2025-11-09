"""
Seat schemas for request/response validation.
"""

from pydantic import BaseModel, Field
from typing import List
from typing import Optional
from datetime import datetime
from app.models.seat import SeatType, SeatStatus
import uuid


class SeatBase(BaseModel):
    """Base seat schema."""
    x_coordinate: float
    y_coordinate: float
    seat_number: str
    seat_type: SeatType
    has_power_outlet: bool = False
    has_ac: bool = False
    is_quiet: bool = False
    accessibility: bool = False
    capacity: int = 1
    status: SeatStatus


class SeatResponse(SeatBase):
    """Schema for seat response."""
    id: str
    floor_id: str
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


class SeatUpdate(BaseModel):
    id: str
    seat_number: Optional[str] = None
    seat_type: Optional[SeatType] = None
    has_power_outlet: Optional[bool] = None
    has_wifi: Optional[bool] = None
    has_ac: Optional[bool] = None
    accessibility: Optional[bool] = None
    capacity: Optional[int] = None
    floor_id: Optional[str] = None
    x_coordinate: Optional[float] = None
    y_coordinate: Optional[float] = None
    status: Optional[SeatStatus] = None


class SeatCreate(SeatBase):
    id: str
    floor_id: str


class SeatUpdateRequest(BaseModel):
    """Schema for seat update request"""
    added: Optional[List[SeatCreate]] = []
    removed: Optional[List[str]] = []
    updated: Optional[List[SeatUpdate]] = []


class SeatUpdateResponse(BaseModel):
    """Schema for seat update response"""
    message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
