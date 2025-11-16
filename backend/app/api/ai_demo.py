"""Routes powering the AI demo template and APIs."""

from __future__ import annotations

from pathlib import Path
from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.seat import Seat
from app.schemas.ai_demo import AiChatRequest, AiChatResponse
from app.services.ai_assistant_service import AiAssistantService
from app.services.seat_refresh_worker import seat_refresh_worker


router = APIRouter()


templates = Jinja2Templates(directory=str(Path(__file__).resolve().parents[1] / "templates"))


@router.get("/demo", response_class=HTMLResponse)
async def ai_demo_page(request: Request):
    return templates.TemplateResponse("ai_demo.html", {"request": request})


@router.get("/demo/seats")
async def ai_demo_seats(db: Session = Depends(get_db)):
    snapshot = seat_refresh_worker.get_seat_payload()
    if snapshot.get("floors"):
        return {
            "floors": snapshot["floors"],
            "seats": snapshot.get("seats", []),
            "last_updated": snapshot.get("last_updated"),
        }

    # Fallback if worker has not produced a snapshot yet
    seats: List[Seat] = db.query(Seat).all()
    floor_groups: Dict[str, Dict] = {}
    seat_payload: List[Dict] = []
    for seat in seats:
        status_value = seat.status.value if hasattr(seat.status, "value") else seat.status
        location_name = seat.floor.location.name if seat.floor and seat.floor.location else ""
        floor_name = seat.floor.floor_name if seat.floor else seat.floor_id
        path = " / ".join(filter(None, [location_name, floor_name])) or floor_name
        floor_map_url = seat.floor.floor_map_url if seat.floor else None
        seat_dict = {
            "id": seat.id,
            "seat_number": seat.seat_number,
            "status": status_value,
            "floor_id": seat.floor_id,
            "floor_name": floor_name,
            "location_name": location_name,
            "path": path,
            "x_coordinate": float(seat.x_coordinate),
            "y_coordinate": float(seat.y_coordinate),
            "has_power_outlet": seat.has_power_outlet,
            "has_wifi": getattr(seat, "has_wifi", False),
            "has_ac": getattr(seat, "has_ac", False),
            "accessibility": seat.accessibility,
            "floor_map_url": floor_map_url,
        }
        seat_payload.append(seat_dict)
        floor_entry = floor_groups.setdefault(
            seat.floor_id,
            {
                "floor_id": seat.floor_id,
                "floor_name": floor_name,
                "location_name": location_name,
                "path": path,
                "floor_map_url": floor_map_url,
                "seats": [],
            },
        )
        floor_entry["seats"].append(
            {
                "seat_id": seat.id,
                "seat_number": seat.seat_number,
                "status": status_value,
                "has_power_outlet": seat.has_power_outlet,
                "has_wifi": getattr(seat, "has_wifi", False),
                "has_ac": getattr(seat, "has_ac", False),
                "accessibility": seat.accessibility,
                "x_coordinate": float(seat.x_coordinate),
                "y_coordinate": float(seat.y_coordinate),
            }
        )

    for entry in floor_groups.values():
        entry["seats"].sort(key=lambda s: s["seat_number"])

    floors = sorted(floor_groups.values(), key=lambda item: item["path"])
    return {"floors": floors, "seats": seat_payload, "last_updated": None}


@router.post("/demo/chat", response_model=AiChatResponse)
async def ai_demo_chat(
    payload: AiChatRequest,
    db: Session = Depends(get_db),
):
    service = AiAssistantService(db)
    try:
        return await service.chat(payload)
    except Exception as exc:  # pragma: no cover - defensive log
        raise HTTPException(status_code=500, detail=str(exc)) from exc
