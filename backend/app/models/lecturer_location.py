"""
LecturerLocation model — represents teaching rooms for lecturers.
"""

from sqlalchemy import Column, String, Integer, Enum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class LecturerLocation(Base):
    """Model representing a lecturer’s teaching room."""

    __tablename__ = "lecturer_locations"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    subject = Column(String(20), nullable=True)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    
    location = relationship("Location", back_populates="LecturerLocation")
    user = relationship("User", back_populates="LecturerLocation")

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<LecturerLocation(code={self.code}, subject={self.subject}, lecturer={self.lecturer_email})>"
