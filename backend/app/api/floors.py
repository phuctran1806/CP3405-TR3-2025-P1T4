"""
Floors API routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.floor import Floor
from app.models.seat import Seat
from app.schemas.floor import FloorResponse, FloorWithSeats
from app.schemas.seat import SeatResponse

router = APIRouter()


@router.get("/", response_model=List[FloorResponse])
async def get_floors(
    location_id: str = None,
    db: Session = Depends(get_db)
):
    """Get list of floors."""
    query = db.query(Floor)
    if location_id:
        query = query.filter(Floor.location_id == location_id)
    
    floors = query.all()
    return [FloorResponse.from_orm(floor) for floor in floors]


@router.get("/{floor_id}", response_model=FloorResponse)
async def get_floor(floor_id: str, db: Session = Depends(get_db)):
    """Get floor by ID."""
    floor = db.query(Floor).filter(Floor.id == floor_id).first()
    if not floor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Floor not found"
        )
    return FloorResponse.from_orm(floor)


@router.get("/{floor_id}/seats", response_model=FloorWithSeats)
async def get_floor_with_seats(floor_id: str, db: Session = Depends(get_db)):
    """Get floor with all its seats."""
    floor = db.query(Floor).filter(Floor.id == floor_id).first()
    if not floor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Floor not found"
        )
    
    seats = db.query(Seat).filter(Seat.floor_id == floor_id).all()
    
    floor_data = FloorResponse.from_orm(floor)
    return FloorWithSeats(
        **floor_data.dict(),
        seats=[SeatResponse.from_orm(seat) for seat in seats]
    )
