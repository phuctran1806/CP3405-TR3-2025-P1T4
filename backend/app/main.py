"""
Main FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import init_db
from app.api import auth, seats, reservations, occupancy, admin, floors, lecturer

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    print("🚀 Starting JCU Smart Seats System...")
    init_db()
    print("✅ Database initialized")
    
    yield
    
    # Shutdown
    print("👋 Shutting down...")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for JCU Library seat reservation and occupancy tracking system",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(seats.router, prefix="/api/seats", tags=["Seats"])
app.include_router(floors.router, prefix="/api/floors", tags=["Floors"])
app.include_router(reservations.router, prefix="/api/reservations", tags=["Reservations"])
app.include_router(occupancy.router, prefix="/api/iot", tags=["IoT Occupancy"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(lecturer.router, prefix="/api/lecturer-locations", tags=["Lecturer Locations"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "JCU Smart Seats System API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }

