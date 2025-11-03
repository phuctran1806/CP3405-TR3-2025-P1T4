"""
Seat model for individual seats.
"""

from sqlalchemy import Column, String, Integer, Boolean, Enum, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class SeatType(str, enum.Enum):
    """Seat type enumeration."""
    INDIVIDUAL = "individual"
    GROUP = "group"
    QUIET = "quiet"
    COMPUTER = "computer"
    STUDY_POD = "study_pod"


class SeatStatus(str, enum.Enum):
    """Seat status enumeration."""
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    RESERVED = "reserved"
    MAINTENANCE = "maintenance"
    BLOCKED = "blocked"


class Seat(Base):
    """Seat model representing individual seats."""
    
    __tablename__ = "seats"
    
    # Primary key
    id = Column(String(36), primary_key=True, index=True)
    
    # Foreign key
    floor_id = Column(String(36), ForeignKey("floors.id"), nullable=False, index=True)
    
    # Basic information
    seat_number = Column(String(20), nullable=False)
    seat_type = Column(Enum(SeatType), nullable=False, default=SeatType.INDIVIDUAL)
    
    # Features
    # TODO: prototype for now, if decide on future scaling then move this to a many to many relationship
    has_power_outlet = Column(Boolean, default=False, nullable=False)
    has_wifi = Column(Boolean, default=False, nullable=False)
    has_ac = Column(Boolean, default=False, nullable=False)
    accessibility = Column(Boolean, default=False, nullable=False)
    capacity = Column(Integer, default=1, nullable=False)
    
    # Position on floor map
    x_coordinate = Column(Numeric(5, 4), nullable=False)
    y_coordinate = Column(Numeric(5, 4), nullable=False)
    
    # Status
    status = Column(Enum(SeatStatus), nullable=False, default=SeatStatus.AVAILABLE)
    notes = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    floor = relationship("Floor", back_populates="seats")
    reservations = relationship("Reservation", back_populates="seat", cascade="all, delete-orphan")
    
    @property
    def is_available(self) -> bool:
        """Check if seat is available."""
        return self.status == SeatStatus.AVAILABLE
    
    def __repr__(self):
        return f"<Seat(id={self.id}, number={self.seat_number}, status={self.status})>"

