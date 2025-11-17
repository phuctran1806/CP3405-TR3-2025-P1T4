"""Seat recommendation logic."""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.seat import Seat, SeatStatus
from app.schemas.prediction import SeatSuggestionItem, SeatSuggestionRequest


@dataclass
class _ScoredSeat:
    seat: Seat
    score: float
    rationale_parts: List[str]


class SeatSuggestionService:
    """Ranks available seats against user preferences."""

    def __init__(self, db: Session):
        self._db = db

    def suggest(self, request: SeatSuggestionRequest) -> List[SeatSuggestionItem]:
        query = self._db.query(Seat).filter(Seat.status == SeatStatus.AVAILABLE)

        if request.floor_id:
            query = query.filter(Seat.floor_id == request.floor_id)
        if request.seat_type:
            query = query.filter(Seat.seat_type == request.seat_type)

        seats = query.all()

        scored: List[_ScoredSeat] = []
        for seat in seats:
            evaluation = self._evaluate(seat, request)
            if evaluation is not None:
                scored.append(evaluation)

        scored.sort(key=lambda item: item.score, reverse=True)

        suggestions: List[SeatSuggestionItem] = []
        for item in scored[: request.limit]:
            rationale = "; ".join(item.rationale_parts) if item.rationale_parts else "Good match"
            suggestions.append(
                SeatSuggestionItem(
                    seat_id=item.seat.id,
                    seat_number=item.seat.seat_number,
                    floor_id=item.seat.floor_id,
                    seat_type=item.seat.seat_type,
                    has_power_outlet=item.seat.has_power_outlet,
                    has_wifi=getattr(item.seat, "has_wifi", False),
                    has_ac=getattr(item.seat, "has_ac", False),
                    accessibility=item.seat.accessibility,
                    rationale=rationale,
                )
            )
        return suggestions

    def _evaluate(
        self,
        seat: Seat,
        request: SeatSuggestionRequest,
    ) -> Optional[_ScoredSeat]:
        score = 1.0  # baseline
        rationale: List[str] = []

        if request.need_power is True:
            if not seat.has_power_outlet:
                return None
            score += 2.0
            rationale.append("Has power outlet")
        elif request.need_power is False and seat.has_power_outlet:
            score += 0.2
            rationale.append("Optional power outlet")

        if request.need_wifi is True:
            if not seat.has_wifi:
                return None
            score += 1.0
            rationale.append("Wi-Fi ready")
        elif request.need_wifi is False and seat.has_wifi:
            score += 0.1
            rationale.append("Optional Wi-Fi")

        if request.need_ac is True:
            if not seat.has_ac:
                return None
            score += 0.5
            rationale.append("Air-conditioned")
        elif request.need_ac is False and seat.has_ac:
            score += 0.1
            rationale.append("Optional AC")

        if seat.capacity and seat.capacity > 1:
            score += 0.3
            rationale.append(f"Capacity for {seat.capacity}")

        if seat.accessibility:
            score += 0.2
            rationale.append("Accessibility-friendly")

        return _ScoredSeat(seat=seat, score=score, rationale_parts=rationale)
