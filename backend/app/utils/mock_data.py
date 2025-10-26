"""
Mock data generator for development and testing.
Run this script to populate the database with sample data.
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from datetime import datetime, timedelta, time
import uuid
import random

from app.database import SessionLocal, init_db
from app.models.user import User, UserRole, UserStatus
from app.models.location import Location, LocationStatus
from app.models.floor import Floor, FloorStatus
from app.models.seat import Seat, SeatType, SeatStatus
from app.models.reservation import Reservation, ReservationStatus
from app.models.occupancy_history import OccupancyHistory
from app.models.operating_hours import OperatingHours
from app.models.lecturer_location import LecturerLocation, LocationState
from app.utils.security import get_password_hash


def main():
    """Main function to generate all mock data."""
    print("=" * 60)
    print("🎯 JCU Library Mock Data Generator")
    print("=" * 60)
    
    # Initialize database
    print("\n📦 Initializing database...")
    init_db()
    print("✓ Database initialized")
    
    # Create session
    db = SessionLocal()
    
    try:
        # Clear existing data
        clear_database(db)
        
        # Create data
        users = create_users(db)
        locations = create_locations(db)
        lecturer_locations = create_lecturer_locations(db)
        create_operating_hours(db, locations)
        seats = create_floors_and_seats(db, locations)
        create_occupancy_history(db, locations)
        
        print("\n" + "=" * 60)
        print("✅ Mock data generation completed successfully!")
        print("=" * 60)
        print("\n📋 Summary:")
        print(f"   • Users: {len(users)}")
        print(f"   • Locations: {len(locations)}")
        print(f"   • Lecturer Locations: {len(lecturer_locations)}")
        print(f"   • Seats: {len(seats)}")
        print("\n🔐 Default Login Credentials:")
        print("   Admin:    admin@jcu.edu.au / admin123")
        print("   Lecturer: lecturer@jcu.edu.au / lecturer123")
        print("   Student:  student@jcu.edu.au / student123")
        print("   Guest:    guest@jcu.edu.au / guest123")
        print("\n🚀 Start the server with:")
        print("   uvicorn app.main:app --reload")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def clear_database(db):
    """Clear all data from database."""
    print("🗑️  Clearing existing data...")
    db.query(OccupancyHistory).delete()
    db.query(Reservation).delete()
    db.query(Seat).delete()
    db.query(Floor).delete()
    db.query(OperatingHours).delete()
    db.query(Location).delete()
    db.query(User).delete()
    db.commit()
    print("✓ Database cleared")


def create_users(db):
    """Create sample users."""
    print("\n👥 Creating users...")
    
    users = [
        User(
            id=str(uuid.uuid4()),
            email="admin@jcu.edu.au",
            hashed_password=get_password_hash("admin123"),
            name="System Administrator",
            student_id=None,
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE
        ),
        User(
            id=str(uuid.uuid4()),
            email="lecturer@jcu.edu.au",
            hashed_password=get_password_hash("lecturer123"),
            name="Dr. Sarah Johnson",
            student_id=None,
            role=UserRole.LECTURER,
            status=UserStatus.ACTIVE
        ),
        User(
            id=str(uuid.uuid4()),
            email="student@jcu.edu.au",
            hashed_password=get_password_hash("student123"),
            name="John Smith",
            student_id="JC123456",
            role=UserRole.STUDENT,
            status=UserStatus.ACTIVE
        ),
        User(
            id=str(uuid.uuid4()),
            email="guest@jcu.edu.au",
            hashed_password=get_password_hash("guest123"),
            name="Guest User",
            student_id=None,
            role=UserRole.GUEST,
            status=UserStatus.ACTIVE
        ),
    ]
    
    # Add more students
    for i in range(1, 11):
        users.append(User(
            id=str(uuid.uuid4()),
            email=f"student{i}@jcu.edu.au",
            hashed_password=get_password_hash("password123"),
            name=f"Student {i}",
            student_id=f"JC{100000 + i}",
            role=UserRole.STUDENT,
            status=UserStatus.ACTIVE
        ))
    
    db.add_all(users)
    db.commit()
    print(f"✓ Created {len(users)} users")
    return users


def create_lecturer_locations(db):
    """Create sample lecturer locations."""
    print("\n📚 Creating lecturer locations...")
    
    locations = [
        LecturerLocation(
            id=str(uuid.uuid4()),
            code="C4-14",
            name="Auditorium C4-14",
            image_url=None,
            capacity=150,
            subject="CP2414",
            start_time=datetime.utcnow() + timedelta(days=1, hours=9),
            end_time=datetime.utcnow() + timedelta(days=1, hours=11),
            live_occupancy=0,
            state=LocationState.ACTIVE,
            email="petteri@jcu.edu.au"
        ),
        LecturerLocation(
            id=str(uuid.uuid4()),
            code="A1-02",
            name="Lecture Room A1-02",
            image_url=None,
            capacity=40,
            subject="CP1403",
            start_time=datetime.utcnow() + timedelta(days=1, hours=13),
            end_time=datetime.utcnow() + timedelta(days=1, hours=15),
            live_occupancy=0,
            state=LocationState.ACTIVE,
            email="petteri@jcu.edu.au"
        ),
        LecturerLocation(
            id=str(uuid.uuid4()),
            code="C2-15",
            name="Auditorium C2-15",
            image_url=None,
            capacity=30,
            subject="CP2408",
            start_time=datetime.utcnow() + timedelta(days=2, hours=13),
            end_time=datetime.utcnow() + timedelta(days=2, hours=15),
            live_occupancy=0,
            state=LocationState.ACTIVE,
            email="andrew@jcu.edu.au"
        ),
        LecturerLocation(
            id=str(uuid.uuid4()),
            code="B1-05",
            name="Lecture Room B1-05",
            image_url=None,
            capacity=50,
            subject="CP3405",
            start_time=datetime.utcnow() + timedelta(days=3, hours=10),
            end_time=datetime.utcnow() + timedelta(days=3, hours=12),
            live_occupancy=0,
            state=LocationState.ACTIVE,
            email="michael@jcu.edu.au"
        ),
    ]
    
    db.add_all(locations)
    db.commit()
    print(f"✓ Created {len(locations)} lecturer locations")
    return locations


def create_locations(db):
    """Create sample locations."""
    print("\n📍 Creating locations...")
    
    locations = [
        Location(
            id=str(uuid.uuid4()),
            name="JCU Library",
            description="Main campus library with multiple study areas",
            address="James Cook Drive, Townsville",
            total_capacity=0,  # Will be calculated from seats
            current_occupancy=0,
            status=LocationStatus.OPEN
        ),
        Location(
            id=str(uuid.uuid4()),
            name="Student Hub",
            description="Collaborative study space for students",
            address="Student Hub Building, JCU",
            total_capacity=0,
            current_occupancy=0,
            status=LocationStatus.OPEN
        ),
        Location(
            id=str(uuid.uuid4()),
            name="Study Pod",
            description="Quiet individual study pods",
            address="Building 32, JCU",
            total_capacity=0,
            current_occupancy=0,
            status=LocationStatus.OPEN
        ),
    ]
    
    db.add_all(locations)
    db.commit()
    print(f"✓ Created {len(locations)} locations")
    return locations


def create_operating_hours(db, locations):
    """Create operating hours for locations."""
    print("\n🕐 Creating operating hours...")
    
    hours = []
    
    # JCU Library - 24 hours on weekdays, limited on weekends
    library = locations[0]
    for day in range(7):
        if day < 5:  # Monday to Friday
            hours.append(OperatingHours(
                id=str(uuid.uuid4()),
                location_id=library.id,
                day_of_week=day,
                is_24_hours=True,
                is_closed=False
            ))
        else:  # Weekend
            hours.append(OperatingHours(
                id=str(uuid.uuid4()),
                location_id=library.id,
                day_of_week=day,
                open_time=time(8, 0),
                close_time=time(22, 0),
                is_24_hours=False,
                is_closed=False
            ))
    
    # Student Hub - Regular hours
    hub = locations[1]
    for day in range(7):
        hours.append(OperatingHours(
            id=str(uuid.uuid4()),
            location_id=hub.id,
            day_of_week=day,
            open_time=time(7, 0),
            close_time=time(23, 0),
            is_24_hours=False,
            is_closed=False
        ))
    
    # Study Pod - Limited hours
    pod = locations[2]
    for day in range(7):
        hours.append(OperatingHours(
            id=str(uuid.uuid4()),
            location_id=pod.id,
            day_of_week=day,
            open_time=time(8, 0),
            close_time=time(20, 0),
            is_24_hours=False,
            is_closed=False
        ))
    
    db.add_all(hours)
    db.commit()
    print(f"✓ Created {len(hours)} operating hour records")


def create_floors_and_seats(db, locations):
    """Create floors and seats for each location."""
    print("\n🏢 Creating floors and seats...")
    
    all_seats = []
    
    # JCU Library - 3 floors
    library = locations[0]
    for floor_num in range(1, 4):
        floor = Floor(
            id=str(uuid.uuid4()),
            location_id=library.id,
            floor_number=floor_num,
            floor_name=f"Level {floor_num}",
            total_seats=0,
            occupied_seats=0,
            is_best_floor=(floor_num == 2),  # Floor 2 is best
            status=FloorStatus.OPEN
        )
        db.add(floor)
        db.flush()
        
        # Create seats for this floor
        seats_per_floor = 30
        for i in range(1, seats_per_floor + 1):
            seat_types = [SeatType.INDIVIDUAL, SeatType.QUIET, SeatType.COMPUTER]
            seat_type = random.choice(seat_types)
            
            seat = Seat(
                id=str(uuid.uuid4()),
                floor_id=floor.id,
                seat_number=f"L{floor_num}-{i:03d}",
                seat_type=seat_type,
                has_power_outlet=random.choice([True, False]),
                has_computer=(seat_type == SeatType.COMPUTER),
                has_monitor=(seat_type == SeatType.COMPUTER),
                accessibility=(i % 10 == 0),  # Every 10th seat is accessible
                capacity=1,
                x_coordinate=float(random.random()),
                y_coordinate=float(random.random()),
                status=random.choice([SeatStatus.AVAILABLE, SeatStatus.OCCUPIED])
            )
            all_seats.append(seat)
        
        floor.total_seats = seats_per_floor
    
    # Student Hub - 2 floors
    hub = locations[1]
    for floor_num in range(1, 3):
        floor = Floor(
            id=str(uuid.uuid4()),
            location_id=hub.id,
            floor_number=floor_num,
            floor_name=f"Hub Level {floor_num}",
            total_seats=0,
            occupied_seats=0,
            is_best_floor=(floor_num == 1),
            status=FloorStatus.OPEN
        )
        db.add(floor)
        db.flush()
        
        seats_per_floor = 20
        for i in range(1, seats_per_floor + 1):
            seat = Seat(
                id=str(uuid.uuid4()),
                floor_id=floor.id,
                seat_number=f"HUB{floor_num}-{i:03d}",
                seat_type=SeatType.GROUP,
                has_power_outlet=True,
                has_computer=False,
                accessibility=(i % 8 == 0),
                capacity=4,
                x_coordinate=float(random.randint(10, 90)),
                y_coordinate=float(random.randint(10, 90)),
                status=random.choice([SeatStatus.AVAILABLE, SeatStatus.OCCUPIED])
            )
            all_seats.append(seat)
        
        floor.total_seats = seats_per_floor
    
    # Study Pod - 1 floor
    pod = locations[2]
    floor = Floor(
        id=str(uuid.uuid4()),
        location_id=pod.id,
        floor_number=1,
        floor_name="Pod Area",
        total_seats=0,
        occupied_seats=0,
        is_best_floor=True,
        status=FloorStatus.OPEN
    )
    db.add(floor)
    db.flush()
    
    seats_per_floor = 15
    for i in range(1, seats_per_floor + 1):
        seat = Seat(
            id=str(uuid.uuid4()),
            floor_id=floor.id,
            seat_number=f"POD-{i:03d}",
            seat_type=SeatType.STUDY_POD,
            has_power_outlet=True,
            has_computer=True,
            has_monitor=True,
            accessibility=False,
            capacity=1,
            x_coordinate=float(random.randint(10, 90)),
            y_coordinate=float(random.randint(10, 90)),
            status=random.choice([SeatStatus.AVAILABLE, SeatStatus.OCCUPIED])
        )
        all_seats.append(seat)
    
    floor.total_seats = seats_per_floor
    
    db.add_all(all_seats)
    db.commit()
    
    # Update floor occupied counts
    floors = db.query(Floor).all()
    for floor in floors:
        occupied = db.query(Seat).filter(
            Seat.floor_id == floor.id,
            Seat.status == SeatStatus.OCCUPIED
        ).count()
        floor.occupied_seats = occupied
    
    # Update location capacities
    for location in locations:
        total = db.query(Seat).join(Floor).filter(Floor.location_id == location.id).count()
        occupied = db.query(Seat).join(Floor).filter(
            Floor.location_id == location.id,
            Seat.status == SeatStatus.OCCUPIED
        ).count()
        location.total_capacity = total
        location.current_occupancy = occupied
    
    db.commit()
    
    print(f"✓ Created {len(all_seats)} seats across multiple floors")
    return all_seats


def create_occupancy_history(db, locations):
    """Create historical occupancy data."""
    print("\n📊 Creating occupancy history...")
    
    history_records = []
    
    # Generate history for the past 7 days
    for location in locations:
        for days_ago in range(7, 0, -1):
            for hour in range(8, 22):  # 8 AM to 10 PM
                timestamp = datetime.utcnow() - timedelta(days=days_ago, hours=(24-hour))
                
                # Simulate varying occupancy throughout the day
                base_occupancy = location.total_capacity * 0.3
                if 10 <= hour <= 16:  # Peak hours
                    occupancy = int(base_occupancy + random.randint(20, 40))
                else:
                    occupancy = int(base_occupancy + random.randint(0, 15))
                
                occupancy = min(occupancy, location.total_capacity)
                
                history = OccupancyHistory(
                    id=str(uuid.uuid4()),
                    location_id=location.id,
                    floor_id=None,
                    timestamp=timestamp,
                    occupancy_count=occupancy,
                    total_capacity=location.total_capacity,
                    day_of_week=timestamp.weekday(),
                    hour_of_day=timestamp.hour
                )
                history_records.append(history)
    
    db.add_all(history_records)
    db.commit()
    print(f"✓ Created {len(history_records)} occupancy history records")


if __name__ == "__main__":
    main()

