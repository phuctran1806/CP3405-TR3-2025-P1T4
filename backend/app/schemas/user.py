"""
User schemas for request/response validation.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole, UserStatus


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    role: UserRole = UserRole.STUDENT


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(..., min_length=6, max_length=100)
    student_id: Optional[str] = Field(None, max_length=20)


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str
    role: UserRole


class UserResponse(UserBase):
    """Schema for user response."""
    id: str
    student_id: Optional[str]
    status: UserStatus
    created_at: datetime
    updated_at: datetime
    role: UserRole
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """Schema for token payload data."""
    user_id: Optional[str] = None
    email: Optional[str] = None


class RoleSelectRequest(BaseModel):
    """Schema for quick login by role selection (no password needed)."""
    role: UserRole = Field(..., description="User role: student, lecturer, or guest")
    name: Optional[str] = Field("Anonymous User", max_length=100, description="Optional display name")
    
    class Config:
        json_schema_extra = {
            "example": {
                "role": "student",
                "name": "John Doe"
            }
        }


class QuickLoginResponse(BaseModel):
    """Response for quick login with tracking ID."""
    access_token: str
    token_type: str = "bearer"
    tracking_id: str = Field(..., description="Unique tracking ID for this session")
    role: UserRole
    name: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
                "token_type": "bearer",
                "tracking_id": "550e8400-e29b-41d4-a716-446655440000",
                "role": "student",
                "name": "John Doe"
            }
        }

