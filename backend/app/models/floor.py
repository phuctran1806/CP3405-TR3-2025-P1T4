"""
Floor model for different floors within locations.
"""

from sqlalchemy import Column, String, Integer, Boolean, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class FloorStatus(str, enum.Enum):
    """Floor status enumeration."""
    OPEN = "open"
    CLOSED = "closed"
    MAINTENANCE = "maintenance"


class Floor(Base):
    """Floor model representing floors within locations."""
    
    __tablename__ = "floors"
    
    # Primary key
    id = Column(String(36), primary_key=True, index=True)
    
    # Foreign key
    location_id = Column(String(36), ForeignKey("locations.id"), nullable=False, index=True)
    
    # Basic information
    floor_number = Column(Integer, nullable=False)
    floor_name = Column(String(50), nullable=True)
    floor_map_url = Column(String(255), nullable=True)
    
    # Capacity
    total_seats = Column(Integer, nullable=False, default=0)
    occupied_seats = Column(Integer, nullable=False, default=0)
    
    # Best floor indicator
    is_best_floor = Column(Boolean, default=False, nullable=False)
    
    # Status
    status = Column(Enum(FloorStatus), nullable=False, default=FloorStatus.OPEN)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    location = relationship("Location", back_populates="floors")
    seats = relationship("Seat", back_populates="floor", cascade="all, delete-orphan")
    occupancy_history = relationship("OccupancyHistory", back_populates="floor", cascade="all, delete-orphan")
    
    @property
    def busyness_percentage(self) -> float:
        """Calculate busyness percentage."""
        if self.total_seats == 0:
            return 0.0
        return round((self.occupied_seats / self.total_seats) * 100, 2)
    
    @property
    def available_seats(self) -> int:
        """Calculate available seats."""
        return max(0, self.total_seats - self.occupied_seats)
    
    def __repr__(self):
        return f"<Floor(id={self.id}, floor_number={self.floor_number}, occupancy={self.busyness_percentage}%)>"

