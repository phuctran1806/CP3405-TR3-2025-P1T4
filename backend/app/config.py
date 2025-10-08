"""
Application configuration settings.
Loads environment variables and provides configuration for the application.
"""

from pydantic_settings import BaseSettings
from typing import List


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
    
    # Admin User
    ADMIN_EMAIL: str = "admin@jcu.edu.au"
    ADMIN_PASSWORD: str = "admin123"
    ADMIN_NAME: str = "System Administrator"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


# Global settings instance
settings = Settings()

