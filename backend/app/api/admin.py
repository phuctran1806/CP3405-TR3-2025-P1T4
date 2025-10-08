"""
Admin Dashboard API routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import User, UserRole
from app.models.seat import Seat, SeatStatus
from app.models.floor import Floor
from app.models.location import Location
from app.models.reservation import Reservation, ReservationStatus
from app.models.occupancy_history import OccupancyHistory
from app.api.auth import get_current_user

router = APIRouter()


async def require_admin(current_user: User = Depends(get_current_user)):
    """Dependency to require admin role."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.get("/analytics/occupancy")
async def get_occupancy_analytics(
    location_id: str = Query(None),
    days: int = Query(7, ge=1, le=90),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get occupancy analytics for admin dashboard.
    Returns occupancy trends over specified time period.
    """
    start_date = datetime.utcnow() - timedelta(days=days)
    
    query = db.query(OccupancyHistory).filter(
        OccupancyHistory.timestamp >= start_date
    )
    
    if location_id:
        query = query.filter(OccupancyHistory.location_id == location_id)
    
    history = query.order_by(OccupancyHistory.timestamp).all()
    
    # Group by hour for trends
    hourly_data = {}
    for record in history:
        hour_key = record.timestamp.strftime("%Y-%m-%d %H:00")
        if hour_key not in hourly_data:
            hourly_data[hour_key] = {
                "timestamp": hour_key,
                "occupancy_percentage": [],
                "occupancy_count": []
            }
        hourly_data[hour_key]["occupancy_percentage"].append(record.occupancy_percentage)
        hourly_data[hour_key]["occupancy_count"].append(record.occupancy_count)
    
    # Calculate averages
    trends = []
    for hour_key, data in sorted(hourly_data.items()):
        avg_percentage = sum(data["occupancy_percentage"]) / len(data["occupancy_percentage"])
        avg_count = sum(data["occupancy_count"]) / len(data["occupancy_count"])
        trends.append({
            "timestamp": hour_key,
            "average_occupancy_percentage": round(avg_percentage, 2),
            "average_occupancy_count": round(avg_count, 2)
        })
    
    return {
        "period_days": days,
        "start_date": start_date.isoformat(),
        "end_date": datetime.utcnow().isoformat(),
        "trends": trends
    }


@router.get("/analytics/utilization")
async def get_utilization_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get overall utilization statistics.
    Returns current status and usage metrics.
    """
    # Get all locations
    locations = db.query(Location).all()
    
    # Get total seats and occupancy
    total_seats = db.query(Seat).count()
    occupied_seats = db.query(Seat).filter(Seat.status == SeatStatus.OCCUPIED).count()
    available_seats = db.query(Seat).filter(Seat.status == SeatStatus.AVAILABLE).count()
    reserved_seats = db.query(Seat).filter(Seat.status == SeatStatus.RESERVED).count()
    
    # Get reservation stats
    total_reservations = db.query(Reservation).count()
    active_reservations = db.query(Reservation).filter(
        Reservation.status.in_([ReservationStatus.CONFIRMED, ReservationStatus.ACTIVE])
    ).count()
    
    # Get user stats
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == "active").count()
    
    # Location breakdown
    location_stats = []
    for location in locations:
        location_stats.append({
            "location_id": location.id,
            "location_name": location.name,
            "total_capacity": location.total_capacity,
            "current_occupancy": location.current_occupancy,
            "busyness_percentage": location.busyness_percentage,
            "status": location.status.value
        })
    
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "seats": {
            "total": total_seats,
            "occupied": occupied_seats,
            "available": available_seats,
            "reserved": reserved_seats,
            "overall_occupancy_percentage": round((occupied_seats / total_seats * 100), 2) if total_seats > 0 else 0
        },
        "reservations": {
            "total": total_reservations,
            "active": active_reservations
        },
        "users": {
            "total": total_users,
            "active": active_users
        },
        "locations": location_stats
    }


@router.get("/users")
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all users for admin management."""
    users = db.query(User).offset(skip).limit(limit).all()
    
    return {
        "total": db.query(User).count(),
        "users": [
            {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "student_id": user.student_id,
                "role": user.role.value,
                "status": user.status.value,
                "created_at": user.created_at.isoformat()
            }
            for user in users
        ]
    }


@router.get("/export/report")
async def export_analytics_report(
    format: str = Query("json", regex="^(json|csv)$"),
    days: int = Query(30, ge=1, le=365),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Export analytics report in JSON or CSV format.
    """
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get occupancy history
    history = db.query(OccupancyHistory).filter(
        OccupancyHistory.timestamp >= start_date
    ).order_by(OccupancyHistory.timestamp).all()
    
    # Get reservation stats
    reservations = db.query(Reservation).filter(
        Reservation.created_at >= start_date
    ).all()
    
    report_data = {
        "report_generated_at": datetime.utcnow().isoformat(),
        "period_days": days,
        "start_date": start_date.isoformat(),
        "end_date": datetime.utcnow().isoformat(),
        "occupancy_records": len(history),
        "total_reservations": len(reservations),
        "occupancy_data": [
            {
                "timestamp": h.timestamp.isoformat(),
                "location_id": h.location_id,
                "occupancy_count": h.occupancy_count,
                "total_capacity": h.total_capacity,
                "occupancy_percentage": h.occupancy_percentage
            }
            for h in history
        ],
        "reservation_summary": {
            "total": len(reservations),
            "confirmed": len([r for r in reservations if r.status == ReservationStatus.CONFIRMED]),
            "active": len([r for r in reservations if r.status == ReservationStatus.ACTIVE]),
            "completed": len([r for r in reservations if r.status == ReservationStatus.COMPLETED]),
            "cancelled": len([r for r in reservations if r.status == ReservationStatus.CANCELLED]),
            "no_show": len([r for r in reservations if r.status == ReservationStatus.NO_SHOW])
        }
    }
    
    if format == "csv":
        # For CSV, return a simplified format
        # In a real application, you would generate actual CSV content
        return {
            "format": "csv",
            "message": "CSV export not yet implemented. Use JSON format.",
            "data": report_data
        }
    
    return report_data

