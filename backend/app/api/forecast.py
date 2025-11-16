"""
Forecast API routes for occupancy predictions using ARIMA model.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.schemas.forecast import DailyForecastResponse, WeeklyForecastResponse
from app.utils.forecast_service import forecast_service

router = APIRouter()

@router.get("/daily", response_model=DailyForecastResponse)
async def get_daily_forecast(
    location_id: Optional[str] = Query(None, description="Optional location identifier")
):
    """
    Get daily occupancy forecast for the next 24 hours.
    
    Args:
        location_id (Optional[str]): Identifier for the location (if applicable).
    Returns:
        DailyForecastResponse: The daily forecast data.
    """
    try:
        forecasts = forecast_service.get_daily_forecast()
        return DailyForecastResponse(location_id=location_id, forecasts=forecasts)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/weekly", response_model=WeeklyForecastResponse)
async def get_weekly_forecast(
    location_id: Optional[str] = Query(None, description="Optional location identifier")
):
    """
    Get weekly occupancy forecast for the next 7 days.
    
    Args:
        location_id (Optional[str]): Identifier for the location (if applicable).
    Returns:
        WeeklyForecastResponse: The weekly forecast data.
    """
    try:
        forecasts = forecast_service.get_weekly_forecast()
        return WeeklyForecastResponse(location_id=location_id, forecasts=forecasts)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def forecast_health():
    """
    Check if the ARIMA forecast model is loaded and ready.
    
    Returns the status of the forecast service and model information.
    """
    model_loaded = forecast_service.model is not None
    
    return {
        "status": "healthy" if model_loaded else "degraded",
        "model_loaded": model_loaded,
        "model_path": str(forecast_service.model_path),
        "message": "Forecast service is ready" if model_loaded else "Model not loaded"
    }