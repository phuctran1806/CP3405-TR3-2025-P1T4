"""
Occupancy history model for tracking seat occupancy over time.
"""

from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class OccupancyHistory(Base):
    """Occupancy history model for analytics and IoT data."""
    
    __tablename__ = "occupancy_history"
    
    # Primary key
    id = Column(String(36), primary_key=True, index=True)
    
    # Foreign keys
    location_id = Column(String(36), ForeignKey("locations.id"), nullable=False, index=True)
    floor_id = Column(String(36), ForeignKey("floors.id"), nullable=True, index=True)
    
    # Occupancy data
    timestamp = Column(DateTime, nullable=False, index=True)
    occupancy_count = Column(Integer, nullable=False)
    total_capacity = Column(Integer, nullable=False)
    
    # Metadata
    day_of_week = Column(Integer, nullable=True)  # 0=Monday, 6=Sunday
    hour_of_day = Column(Integer, nullable=True)  # 0-23
    
    # Timestamps
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    location = relationship("Location", back_populates="occupancy_history")
    floor = relationship("Floor", back_populates="occupancy_history")
    
    @property
    def occupancy_percentage(self) -> float:
        """Calculate occupancy percentage."""
        if self.total_capacity == 0:
            return 0.0
        return round((self.occupancy_count / self.total_capacity) * 100, 2)
    
    def __repr__(self):
        return f"<OccupancyHistory(id={self.id}, timestamp={self.timestamp}, occupancy={self.occupancy_percentage}%)>"

