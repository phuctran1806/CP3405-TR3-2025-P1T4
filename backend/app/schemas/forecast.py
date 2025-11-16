"""
Forecast schemas for request/response validation.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# TODO: For future implementation of location-based forecasts, location_id will be required
class DailyForecastRequest(BaseModel):
    """Request schema for daily forecast."""
    location_id: Optional[str]
    
    
class DailyForecastResponse(BaseModel):
    """Response schema for daily forecast."""
    location_id: Optional[str]
    forecasts: List[dict]
    
    
class WeeklyForecastRequest(BaseModel):
    """Request schema for weekly forecast."""
    location_id: Optional[str]
    
    
class WeeklyForecastResponse(BaseModel):
    """Response schema for weekly forecast."""
    location_id: Optional[str]
    forecasts: List[dict]
    