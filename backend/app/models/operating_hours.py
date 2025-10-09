"""
Operating hours model for location opening hours.
"""

from sqlalchemy import Column, String, Integer, Time, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class OperatingHours(Base):
    """Operating hours model for location schedules."""
    
    __tablename__ = "operating_hours"
    
    # Primary key
    id = Column(String(36), primary_key=True, index=True)
    
    # Foreign key
    location_id = Column(String(36), ForeignKey("locations.id"), nullable=False, index=True)
    
    # Schedule
    day_of_week = Column(Integer, nullable=False)  # 0=Sunday, 1=Monday, ..., 6=Saturday
    open_time = Column(Time, nullable=True)
    close_time = Column(Time, nullable=True)
    
    # Special flags
    is_24_hours = Column(Boolean, default=False, nullable=False)
    is_closed = Column(Boolean, default=False, nullable=False)
    
    # Special dates (for holidays, etc.)
    effective_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    
    # Notes
    notes = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    location = relationship("Location", back_populates="operating_hours")
    
    def __repr__(self):
        return f"<OperatingHours(id={self.id}, day={self.day_of_week}, open={self.open_time}, close={self.close_time})>"

