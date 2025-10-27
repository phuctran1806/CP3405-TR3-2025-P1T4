"""
Locations API routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.location import Location
from app.schemas.location import LocationResponse

router = APIRouter()


@router.get("/", response_model=List[LocationResponse])
async def get_locations(
    db: Session = Depends(get_db),
):
    """Get list of locations."""
    locations = db.query(Location).all()
    return [LocationResponse.from_orm(loc) for loc in locations]


@router.get("/{location_id}", response_model=LocationResponse)
async def get_location(location_id: str, db: Session = Depends(get_db)):
    """Get location by ID."""
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    return LocationResponse.from_orm(location)
