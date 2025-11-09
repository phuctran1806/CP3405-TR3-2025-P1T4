"""
Locations API routes.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models.location import Location
from app.schemas.location import LocationResponse
from app.models.floor import Floor
from app.models.seat import SeatStatus

router = APIRouter()


@router.get("/", response_model=List[LocationResponse])
async def get_locations(db: Session = Depends(get_db)):
    locations = db.query(Location).options(
        joinedload(Location.floors).joinedload(Floor.seats)
    ).all()

    result = []

    for loc in locations:
        all_seats = [
            seat for floor in loc.floors for seat in floor.seats if seat.status == SeatStatus.AVAILABLE]

        loc_data = LocationResponse.from_orm(loc)
        loc_data.has_power_outlet = any(
            seat.has_power_outlet for seat in all_seats)
        loc_data.has_ac = any(seat.has_ac for seat in all_seats)

        result.append(loc_data)

    return result


@router.get("/{location_id}", response_model=LocationResponse)
async def get_location(location_id: str, db: Session = Depends(get_db)):
    """Get a single location with aggregated accessibility."""

    location = db.query(Location).options(
        joinedload(Location.floors).joinedload(Floor.seats)
    ).filter(Location.id == location_id).first()

    if not location:
        raise HTTPException(status_code=404, detail="Location not found")

    all_seats = [
        seat for floor in location.floors for seat in floor.seats if seat.status == SeatStatus.AVAILABLE]

    loc_data = LocationResponse.from_orm(location)
    loc_data.has_power_outlet = any(
        seat.has_power_outlet for seat in all_seats)
    loc_data.has_ac = any(seat.has_ac for seat in all_seats)

    return loc_data
