"""
LecturerLocation model — represents teaching rooms for lecturers.
"""

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class LecturerAssignment(Base):
    """Model representing a lecturer’s teaching room."""

    __tablename__ = "lecturer_locations"

    id = Column(String(36), primary_key=True, index=True)
    subject = Column(String(20), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    
    location_id = Column(String(36), ForeignKey("locations.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)

    location = relationship("Location")
    user = relationship("User")

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<LecturerLocation(id={self.id}, subject={self.subject}, user_id={self.user_id}, location_id={self.location_id})>"
