"""Gemini prediction and seat suggestion endpoints."""

from __future__ import annotations

from functools import lru_cache

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.schemas.prediction import (
    SeatSuggestionRequest,
    SeatSuggestionResponse,
    SeatingPredictionRequest,
    SeatingPredictionResponse,
)
from app.services.gemini_client import GeminiClient, GeminiClientError
from app.services.prediction_service import SeatPredictionService
from app.services.seating_data import SeatingDataService
from app.services.suggestion_service import SeatSuggestionService


router = APIRouter()


@lru_cache(maxsize=1)
def _get_data_service() -> SeatingDataService:
    return SeatingDataService(settings.SEATING_DATA_PATH)


def _get_prediction_service() -> SeatPredictionService:
    return SeatPredictionService(
        data_service=_get_data_service(),
        gemini_client=GeminiClient(),
    )


@router.post("/seating", response_model=SeatingPredictionResponse)
async def seating_prediction_endpoint(payload: SeatingPredictionRequest):
    service = _get_prediction_service()
    try:
        result = await service.generate_prediction(payload)
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
    except GeminiClientError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    return SeatingPredictionResponse(**result)


@router.post("/suggestions", response_model=SeatSuggestionResponse)
async def seat_suggestions_endpoint(
    payload: SeatSuggestionRequest,
    db: Session = Depends(get_db),
):
    service = SeatSuggestionService(db)
    suggestions = service.suggest(payload)
    return SeatSuggestionResponse(suggestions=suggestions)
