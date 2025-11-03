"""
Location model for study locations (Library, Student Hub, etc.).
"""

from sqlalchemy import Column, String, Integer, Numeric, Enum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class LocationStatus(str, enum.Enum):
    """Location status enumeration."""
    OPEN = "open"
    CLOSED = "closed"
    MAINTENANCE = "maintenance"
    
class LocationType(str, enum.Enum):
    """Location type enumeration."""
    PUBLIC = "public"
    PRIVATE = "private"


class Location(Base):
    """Location model representing study locations."""
    
    __tablename__ = "locations"
    
    # Primary key
    id = Column(String(36), primary_key=True, index=True)
    
    # Basic information
    name = Column(String(100), nullable=False, unique=True)
    image_url = Column(String(255), nullable=True)

    # Coordinates
    latitude = Column(Numeric, nullable=True)
    longitude = Column(Numeric, nullable=True)
    
    # Capacity
    total_capacity = Column(Integer, nullable=False, default=0)
    current_occupancy = Column(Integer, nullable=False, default=0)
    
    # Status
    status = Column(Enum(LocationStatus), nullable=False, default=LocationStatus.OPEN)
    
    # Location type
    location_type = Column(Enum(LocationType), nullable=False, default=LocationType.PRIVATE)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    floors = relationship("Floor", back_populates="location", cascade="all, delete-orphan")
    operating_hours = relationship("OperatingHours", back_populates="location", cascade="all, delete-orphan")
    occupancy_history = relationship("OccupancyHistory", back_populates="location", cascade="all, delete-orphan")
    
    @property
    def busyness_percentage(self) -> float:
        """Calculate busyness percentage."""
        if self.total_capacity == 0:
            return 0.0
        return round((self.current_occupancy / self.total_capacity) * 100, 2)
    
    @property
    def available_seats(self) -> int:
        """Calculate available seats."""
        return max(0, self.total_capacity - self.current_occupancy)
    
    def __repr__(self):
        return f"<Location(id={self.id}, name={self.name}, occupancy={self.busyness_percentage}%)>"

