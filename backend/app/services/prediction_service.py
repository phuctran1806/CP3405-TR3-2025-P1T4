"""Seat prediction orchestration."""

from __future__ import annotations

import json
from typing import Any, Dict

from app.schemas.prediction import SeatingPredictionRequest
from app.services.gemini_client import GeminiClient
from app.services.seating_data import (
    SeatingDataService,
    build_prediction_context,
)


SYSTEM_PROMPT = (
    "You are a library analytics assistant helping students find the best study spots. "
    "Use the provided historical seating data to forecast availability, highlight peak hours, "
    "and offer concise, actionable suggestions."
)


class SeatPredictionService:
    """Generates LLM-backed seating predictions."""

    def __init__(
        self,
        data_service: SeatingDataService,
        gemini_client: GeminiClient,
    ) -> None:
        self._data_service = data_service
        self._gemini_client = gemini_client

    async def generate_prediction(self, payload: SeatingPredictionRequest) -> Dict[str, Any]:
        context = build_prediction_context(self._data_service, payload.location)
        user_context = self._build_user_context(payload)

        prompt = (
            "Historical data summary (JSON):\n"
            f"{json.dumps(context, ensure_ascii=False, indent=2)}\n\n"
            "User scenario (JSON):\n"
            f"{json.dumps(user_context, ensure_ascii=False, indent=2)}\n\n"
            "Return a short forecast of availability, peak times, and preparation tips."
        )

        prediction_text = await self._gemini_client.generate_text(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=prompt,
        )

        return {
            "model": self._gemini_client.model,
            "location": payload.location,
            "prediction": prediction_text,
        }

    @staticmethod
    def _build_user_context(payload: SeatingPredictionRequest) -> Dict[str, Any]:
        context = {
            "location": payload.location,
            "arrival_time": payload.arrival_time.isoformat(),
        }
        if payload.leaving_time:
            context["leaving_time"] = payload.leaving_time.isoformat()
        if payload.temperature is not None:
            context["temperature"] = payload.temperature
        if payload.needs_power is not None:
            context["needs_power"] = payload.needs_power
        if payload.extra_notes:
            context["extra_notes"] = payload.extra_notes
        return context
