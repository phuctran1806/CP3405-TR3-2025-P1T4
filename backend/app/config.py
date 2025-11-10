"""
Application configuration settings.
Loads environment variables and provides configuration for the application.
"""

from pathlib import Path
from typing import List, Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    APP_NAME: str = "JCU Smart Seats System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str = "sqlite:///./jcu_library.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    
    # IoT Simulation
    IOT_SIMULATION_ENABLED: bool = True
    IOT_UPDATE_INTERVAL_SECONDS: int = 60

    # Images
    IMAGE_UPLOAD_DIR: str = "/var/www/cp3405-uploads"

    # AI Demo / Seat Refresh
    SEAT_REFRESH_INTERVAL_SECONDS: int = 60
    SEAT_REFRESH_DRIFT_RATIO: float = 0.06
    SEAT_TARGET_OCCUPANCY_RATIO: float = 0.65
    
    # Admin User
    ADMIN_EMAIL: str = "admin@jcu.edu.au"
    ADMIN_PASSWORD: str = "admin123"
    ADMIN_NAME: str = "System Administrator"

    # Gemini Integration
    GEMINI_ENDPOINT_URL: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"
    GEMINI_REQUEST_TIMEOUT_SECONDS: int = 30

    # Data Files
    SEATING_DATA_PATH: str = str(
        Path(__file__).resolve().parents[3] / "jcu_seatings.csv"
    )
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


# Global settings instance
settings = Settings()
