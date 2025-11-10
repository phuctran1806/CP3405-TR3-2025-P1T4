"""Schemas for Gemini prediction endpoints."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.seat import SeatType


class SeatingPredictionRequest(BaseModel):
    """Payload for requesting a seat prediction."""

    location: str = Field(..., description="Location identifier from the dataset, e.g. HUBE-41")
    arrival_time: datetime
    leaving_time: Optional[datetime] = None
    temperature: Optional[float] = None
    needs_power: Optional[bool] = None
    extra_notes: Optional[str] = Field(None, description="Extra free-form context")


class SeatingPredictionResponse(BaseModel):
    model: str
    location: str
    prediction: str


class SeatSuggestionRequest(BaseModel):
    floor_id: Optional[str] = None
    seat_type: Optional[SeatType] = None
    need_power: Optional[bool] = None
    need_wifi: Optional[bool] = None
    need_ac: Optional[bool] = None
    limit: int = Field(3, ge=1, le=10)


class SeatSuggestionItem(BaseModel):
    seat_id: str
    seat_number: str
    floor_id: str
    seat_type: SeatType
    has_power_outlet: bool
    has_wifi: bool
    has_ac: bool
    accessibility: bool
    rationale: str


class SeatSuggestionResponse(BaseModel):
    suggestions: List[SeatSuggestionItem]
