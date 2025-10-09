"""
Reservation model for seat bookings.
"""

from sqlalchemy import Column, String, DateTime, Enum, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class ReservationStatus(str, enum.Enum):
    """Reservation status enumeration."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class Reservation(Base):
    """Reservation model for seat bookings."""
    
    __tablename__ = "reservations"
    
    # Primary key
    id = Column(String(36), primary_key=True, index=True)
    
    # Foreign keys
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    seat_id = Column(String(36), ForeignKey("seats.id"), nullable=False, index=True)
    
    # Reservation time
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False)
    
    # Check-in/out
    check_in_time = Column(DateTime, nullable=True)
    check_out_time = Column(DateTime, nullable=True)
    
    # Status
    status = Column(Enum(ReservationStatus), nullable=False, default=ReservationStatus.PENDING)
    cancellation_reason = Column(String(500), nullable=True)
    
    # Notifications
    reminder_sent = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="reservations")
    seat = relationship("Seat", back_populates="reservations")
    
    @property
    def is_active(self) -> bool:
        """Check if reservation is currently active."""
        return self.status in [ReservationStatus.CONFIRMED, ReservationStatus.ACTIVE]
    
    @property
    def duration_minutes(self) -> int:
        """Calculate reservation duration in minutes."""
        if self.start_time and self.end_time:
            delta = self.end_time - self.start_time
            return int(delta.total_seconds() / 60)
        return 0
    
    def __repr__(self):
        return f"<Reservation(id={self.id}, user_id={self.user_id}, status={self.status})>"

