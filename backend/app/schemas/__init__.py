"""
Pydantic schemas package for request/response validation.
"""

from .user import (
    UserBase,
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    TokenData
)
from .seat import (
    SeatBase,
    SeatResponse,
    SeatAvailability
)
from .reservation import (
    ReservationCreate,
    ReservationResponse,
    ReservationUpdate
)
from .occupancy import (
    OccupancyEvent,
    OccupancyResponse,
    OccupancyHistoryResponse
)
from .floor import (
    FloorResponse,
    FloorWithSeats
)
from .location import (
    LocationResponse
)

__all__ = [
    # User
    "UserBase",
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "Token",
    "TokenData",
    # Seat
    "SeatBase",
    "SeatResponse",
    "SeatAvailability",
    # Reservation
    "ReservationCreate",
    "ReservationResponse",
    "ReservationUpdate",
    # Occupancy
    "OccupancyEvent",
    "OccupancyResponse",
    "OccupancyHistoryResponse",
    # Floor
    "FloorResponse",
    "FloorWithSeats",
    # Location
    "LocationResponse",
]

