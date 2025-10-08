"""
User model for authentication and authorization.
"""

from sqlalchemy import Column, String, Enum, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    """User role enumeration."""
    STUDENT = "student"
    LECTURER = "lecturer"
    ADMIN = "admin"
    GUEST = "guest"


class UserStatus(str, enum.Enum):
    """User status enumeration."""
    ACTIVE = "active"
    SUSPENDED = "suspended"
    INACTIVE = "inactive"


class User(Base):
    """User model for authentication and profile management."""
    
    __tablename__ = "users"
    
    # Primary key
    id = Column(String(36), primary_key=True, index=True)
    
    # Authentication
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile
    student_id = Column(String(20), unique=True, index=True, nullable=True)
    name = Column(String(100), nullable=False)
    phone_number = Column(String(20), nullable=True)
    
    # Role and status
    role = Column(Enum(UserRole), nullable=False, default=UserRole.STUDENT)
    status = Column(Enum(UserStatus), nullable=False, default=UserStatus.ACTIVE)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    reservations = relationship("Reservation", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"

