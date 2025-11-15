"""
Location schemas for request/response validation.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.location import LocationStatus, LocationType


class LocationResponse(BaseModel):
    """Schema for location response with aggregated accessibility info."""
    id: str
    name: str
    image_url: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    total_capacity: int
    current_occupancy: int
    busyness_percentage: float
    available_seats: int
    status: LocationStatus
    location_type: LocationType
    created_at: datetime
    updated_at: datetime

    # Aggregated accessibility flags
    has_power_outlet: bool = False
    has_ac: bool = False
    is_quiet: bool = False

    class Config:
        from_attributes = True
