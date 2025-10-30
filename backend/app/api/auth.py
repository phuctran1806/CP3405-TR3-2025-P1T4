"""
Authentication API routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import uuid

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, Token,
    RoleSelectRequest, QuickLoginResponse
)
from app.utils.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.config import settings

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    return user


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if student_id already exists (if provided)
    if user_data.student_id:
        existing_student = db.query(User).filter(User.student_id == user_data.student_id).first()
        if existing_student:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student ID already registered"
            )
    
    # Create new user
    new_user = User(
        id=str(uuid.uuid4()),
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        name=user_data.name,
        student_id=user_data.student_id,
        phone_number=user_data.phone_number,
        role=user_data.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": new_user.id, "email": new_user.email}
    )
    
    return Token(
        access_token=access_token,
        user=UserResponse.from_orm(new_user)
    )


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login with email, password."""
    # Find user by email
    user = db.query(User).filter(User.email == form_data.username).first()
    print(user.email)
    # Verify password
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email}
    )
    
    return Token(
        access_token=access_token,
        user=UserResponse.from_orm(user)
    )


@router.post("/quick-login", response_model=QuickLoginResponse)
async def quick_login(role_data: RoleSelectRequest):
    """
    Quick login by role selection (no password required).
    
    This endpoint allows users to login by simply selecting a role:
    - Student
    - Lecturer
    - Guest
    
    Admin role requires traditional password login via /login endpoint.
    
    Returns a JWT token with a unique tracking ID for session tracking.
    """
    # Prevent admin role from using quick login
    if role_data.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role requires password authentication. Please use /login endpoint."
        )
    
    # Generate unique tracking ID for this session
    tracking_id = str(uuid.uuid4())
    
    # Create access token with tracking ID and role
    access_token = create_access_token(
        data={
            "sub": tracking_id,  # Use tracking_id as subject
            "role": role_data.role.value,
            "name": role_data.name,
            "tracking_id": tracking_id,
            "quick_login": True  # Flag to identify quick login sessions
        }
    )
    
    return QuickLoginResponse(
        access_token=access_token,
        tracking_id=tracking_id,
        role=role_data.role,
        name=role_data.name
    )


@router.get("/session")
async def get_session_info(token: str = Depends(oauth2_scheme)):
    """
    Get current session information (supports both quick login and traditional login).
    
    Returns different information based on login type:
    - Quick login: tracking_id, role, name, session type
    - Traditional login: full user information
    """
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if this is a quick login session
    if payload.get("quick_login"):
        return {
            "session_type": "quick_login",
            "tracking_id": payload.get("tracking_id"),
            "role": payload.get("role"),
            "name": payload.get("name", "Anonymous User"),
            "authenticated": True
        }
    
    # Traditional login - return user ID
    return {
        "session_type": "traditional",
        "user_id": payload.get("sub"),
        "email": payload.get("email"),
        "authenticated": True
    }


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user information (traditional login only)."""
    return UserResponse.from_orm(current_user)


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout current user."""
    # In a real application, you might want to blacklist the token
    return {"message": "Successfully logged out"}

