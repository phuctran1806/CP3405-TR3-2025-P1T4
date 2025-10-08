"""
Seats API routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.seat import Seat, SeatStatus
from app.models.floor import Floor
from app.schemas.seat import SeatResponse, SeatAvailability
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[SeatResponse])
async def get_seats(
    floor_id: Optional[str] = Query(None),
    status: Optional[SeatStatus] = Query(None),
    seat_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get list of seats with optional filters."""
    query = db.query(Seat)
    
    if floor_id:
        query = query.filter(Seat.floor_id == floor_id)
    if status:
        query = query.filter(Seat.status == status)
    if seat_type:
        query = query.filter(Seat.seat_type == seat_type)
    
    seats = query.offset(skip).limit(limit).all()
    return [SeatResponse.from_orm(seat) for seat in seats]


@router.get("/available", response_model=List[SeatResponse])
async def get_available_seats(
    floor_id: Optional[str] = Query(None),
    has_power: Optional[bool] = Query(None),
    has_computer: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """Get available seats with optional filters."""
    query = db.query(Seat).filter(Seat.status == SeatStatus.AVAILABLE)
    
    if floor_id:
        query = query.filter(Seat.floor_id == floor_id)
    if has_power is not None:
        query = query.filter(Seat.has_power_outlet == has_power)
    if has_computer is not None:
        query = query.filter(Seat.has_computer == has_computer)
    
    seats = query.all()
    return [SeatResponse.from_orm(seat) for seat in seats]


@router.get("/{seat_id}", response_model=SeatResponse)
async def get_seat(seat_id: str, db: Session = Depends(get_db)):
    """Get seat by ID."""
    seat = db.query(Seat).filter(Seat.id == seat_id).first()
    if not seat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seat not found"
        )
    return SeatResponse.from_orm(seat)
