"""
Location schemas for request/response validation.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.location import LocationStatus


class LocationResponse(BaseModel):
    """Schema for location response."""
    id: str
    name: str
    description: Optional[str]
    address: Optional[str]
    image_url: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    total_capacity: int
    current_occupancy: int
    busyness_percentage: float
    available_seats: int
    status: LocationStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
