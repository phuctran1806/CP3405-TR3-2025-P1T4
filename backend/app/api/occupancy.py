"""
IoT Occupancy Simulation API routes.
This simulates IoT sensor signals for seat occupancy.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid
import random

from app.database import get_db
from app.models.seat import Seat, SeatStatus
from app.models.floor import Floor
from app.models.location import Location
from app.models.occupancy_history import OccupancyHistory
from app.schemas.occupancy import OccupancyEvent, OccupancyResponse, OccupancyHistoryResponse

router = APIRouter()


@router.post("/occupancy", status_code=status.HTTP_200_OK)
async def update_seat_occupancy(
    event: OccupancyEvent,
    db: Session = Depends(get_db)
):
    """
    Simulate IoT sensor event for seat occupancy.
    This endpoint simulates a sensor detecting seat occupation/vacation.
    """
    # Find the seat
    seat = db.query(Seat).filter(Seat.id == event.seat_id).first()
    if not seat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seat not found"
        )
    
    # Update seat status based on IoT signal
    if event.is_occupied:
        seat.status = SeatStatus.OCCUPIED
    else:
        seat.status = SeatStatus.AVAILABLE
    
    # Update floor occupancy
    floor = db.query(Floor).filter(Floor.id == seat.floor_id).first()
    if floor:
        occupied_count = db.query(Seat).filter(
            Seat.floor_id == floor.id,
            Seat.status == SeatStatus.OCCUPIED
        ).count()
        floor.occupied_seats = occupied_count
        
        # Update location occupancy
        location = db.query(Location).filter(Location.id == floor.location_id).first()
        if location:
            total_occupied = db.query(Seat).join(Floor).filter(
                Floor.location_id == location.id,
                Seat.status == SeatStatus.OCCUPIED
            ).count()
            location.current_occupancy = total_occupied
    
    db.commit()
    
    return {
        "message": "Occupancy updated successfully",
        "seat_id": event.seat_id,
        "is_occupied": event.is_occupied,
        "timestamp": event.timestamp or datetime.utcnow()
    }


@router.post("/occupancy/batch", status_code=status.HTTP_200_OK)
async def batch_update_occupancy(
    events: List[OccupancyEvent],
    db: Session = Depends(get_db)
):
    """
    Batch update multiple seat occupancy events.
    Useful for simulating multiple IoT sensors reporting simultaneously.
    """
    updated_count = 0
    
    for event in events:
        seat = db.query(Seat).filter(Seat.id == event.seat_id).first()
        if seat:
            seat.status = SeatStatus.OCCUPIED if event.is_occupied else SeatStatus.AVAILABLE
            updated_count += 1
    
    # Update all floor and location occupancies
    floors = db.query(Floor).all()
    for floor in floors:
        occupied_count = db.query(Seat).filter(
            Seat.floor_id == floor.id,
            Seat.status == SeatStatus.OCCUPIED
        ).count()
        floor.occupied_seats = occupied_count
    
    locations = db.query(Location).all()
    for location in locations:
        total_occupied = db.query(Seat).join(Floor).filter(
            Floor.location_id == location.id,
            Seat.status == SeatStatus.OCCUPIED
        ).count()
        location.current_occupancy = total_occupied
    
    db.commit()
    
    return {
        "message": f"Batch update completed",
        "updated_count": updated_count,
        "total_events": len(events)
    }


@router.get("/occupancy/current", response_model=List[OccupancyResponse])
async def get_current_occupancy(
    location_id: str = Query(None),
    db: Session = Depends(get_db)
):
    """Get current occupancy status for locations."""
    query = db.query(Location)
    if location_id:
        query = query.filter(Location.id == location_id)
    
    locations = query.all()
    
    results = []
    for location in locations:
        results.append(OccupancyResponse(
            location_id=location.id,
            floor_id=None,
            occupancy_count=location.current_occupancy,
            total_capacity=location.total_capacity,
            occupancy_percentage=location.busyness_percentage,
            timestamp=datetime.utcnow()
        ))
    
    return results


@router.post("/occupancy/simulate", status_code=status.HTTP_200_OK)
async def simulate_random_occupancy(
    db: Session = Depends(get_db)
):
    """
    Simulate random IoT sensor events for testing.
    This randomly updates seat occupancy to simulate real-world usage.
    """
    # Get all seats
    seats = db.query(Seat).all()
    
    # Randomly update some seats
    updated_seats = []
    for seat in seats:
        # 30% chance to change status
        if random.random() < 0.3:
            # Toggle between occupied and available
            if seat.status == SeatStatus.AVAILABLE:
                seat.status = SeatStatus.OCCUPIED
            elif seat.status == SeatStatus.OCCUPIED:
                seat.status = SeatStatus.AVAILABLE
            updated_seats.append(seat.id)
    
    # Update floor and location occupancies
    floors = db.query(Floor).all()
    for floor in floors:
        occupied_count = db.query(Seat).filter(
            Seat.floor_id == floor.id,
            Seat.status == SeatStatus.OCCUPIED
        ).count()
        floor.occupied_seats = occupied_count
    
    locations = db.query(Location).all()
    for location in locations:
        total_occupied = db.query(Seat).join(Floor).filter(
            Floor.location_id == location.id,
            Seat.status == SeatStatus.OCCUPIED
        ).count()
        location.current_occupancy = total_occupied
        
        # Record occupancy history
        history = OccupancyHistory(
            id=str(uuid.uuid4()),
            location_id=location.id,
            floor_id=None,
            timestamp=datetime.utcnow(),
            occupancy_count=location.current_occupancy,
            total_capacity=location.total_capacity,
            day_of_week=datetime.utcnow().weekday(),
            hour_of_day=datetime.utcnow().hour
        )
        db.add(history)
    
    db.commit()
    
    return {
        "message": "Random occupancy simulation completed",
        "updated_seats": len(updated_seats),
        "total_seats": len(seats)
    }


@router.get("/occupancy/history", response_model=List[OccupancyHistoryResponse])
async def get_occupancy_history(
    location_id: str = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get historical occupancy data for analytics."""
    query = db.query(OccupancyHistory)
    
    if location_id:
        query = query.filter(OccupancyHistory.location_id == location_id)
    
    history = query.order_by(OccupancyHistory.timestamp.desc()).limit(limit).all()
    
    return [OccupancyHistoryResponse.from_orm(h) for h in history]

