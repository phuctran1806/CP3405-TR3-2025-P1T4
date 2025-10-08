"""
Reservations API routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid

from app.database import get_db
from app.models.reservation import Reservation, ReservationStatus
from app.models.seat import Seat, SeatStatus
from app.models.user import User
from app.schemas.reservation import ReservationCreate, ReservationResponse, ReservationUpdate
from app.api.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
async def create_reservation(
    reservation_data: ReservationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new reservation."""
    # Check if seat exists
    seat = db.query(Seat).filter(Seat.id == reservation_data.seat_id).first()
    if not seat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seat not found"
        )
    
    # Check if seat is available
    if seat.status != SeatStatus.AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seat is not available"
        )
    
    # Create reservation
    new_reservation = Reservation(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        seat_id=reservation_data.seat_id,
        start_time=reservation_data.start_time,
        end_time=reservation_data.end_time,
        status=ReservationStatus.CONFIRMED
    )
    
    # Update seat status
    seat.status = SeatStatus.RESERVED
    
    db.add(new_reservation)
    db.commit()
    db.refresh(new_reservation)
    
    return ReservationResponse.from_orm(new_reservation)


@router.get("/my", response_model=List[ReservationResponse])
async def get_my_reservations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's reservations."""
    reservations = db.query(Reservation).filter(
        Reservation.user_id == current_user.id
    ).order_by(Reservation.start_time.desc()).all()
    
    return [ReservationResponse.from_orm(r) for r in reservations]


@router.put("/{reservation_id}/checkin", response_model=ReservationResponse)
async def checkin_reservation(
    reservation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check in to a reservation."""
    reservation = db.query(Reservation).filter(
        Reservation.id == reservation_id,
        Reservation.user_id == current_user.id
    ).first()
    
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found"
        )
    
    reservation.check_in_time = datetime.utcnow()
    reservation.status = ReservationStatus.ACTIVE
    
    # Update seat status
    seat = db.query(Seat).filter(Seat.id == reservation.seat_id).first()
    if seat:
        seat.status = SeatStatus.OCCUPIED
    
    db.commit()
    db.refresh(reservation)
    
    return ReservationResponse.from_orm(reservation)


@router.delete("/{reservation_id}")
async def cancel_reservation(
    reservation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel a reservation."""
    reservation = db.query(Reservation).filter(
        Reservation.id == reservation_id,
        Reservation.user_id == current_user.id
    ).first()
    
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found"
        )
    
    reservation.status = ReservationStatus.CANCELLED
    
    # Update seat status
    seat = db.query(Seat).filter(Seat.id == reservation.seat_id).first()
    if seat:
        seat.status = SeatStatus.AVAILABLE
    
    db.commit()
    
    return {"message": "Reservation cancelled successfully"}
