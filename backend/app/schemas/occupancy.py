"""
Occupancy schemas for IoT simulation.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class OccupancyEvent(BaseModel):
    """Schema for IoT occupancy event."""
    seat_id: str
    is_occupied: bool
    timestamp: datetime = None


class OccupancyResponse(BaseModel):
    """Schema for occupancy response."""
    location_id: str
    floor_id: Optional[str]
    occupancy_count: int
    total_capacity: int
    occupancy_percentage: float
    timestamp: datetime


class OccupancyHistoryResponse(BaseModel):
    """Schema for occupancy history response."""
    id: str
    location_id: str
    floor_id: Optional[str]
    timestamp: datetime
    occupancy_count: int
    total_capacity: int
    occupancy_percentage: float
    day_of_week: Optional[int]
    hour_of_day: Optional[int]
    
    class Config:
        from_attributes = True
