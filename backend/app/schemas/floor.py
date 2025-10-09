"""
Floor schemas for request/response validation.
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.floor import FloorStatus
from .seat import SeatResponse


class FloorResponse(BaseModel):
    """Schema for floor response."""
    id: str
    location_id: str
    floor_number: int
    floor_name: Optional[str]
    floor_map_url: Optional[str]
    total_seats: int
    occupied_seats: int
    is_best_floor: bool
    status: FloorStatus
    busyness_percentage: float
    available_seats: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class FloorWithSeats(FloorResponse):
    """Schema for floor with seats."""
    seats: List[SeatResponse] = []
