"""
Mock data generator for development and testing.
Run this script to populate the database with sample data.
"""

from datetime import datetime, timedelta, time
from pathlib import Path
import uuid
import random
import sys

from app.database import SessionLocal, init_db
from app.models.user import User, UserRole, UserStatus
from app.models.location import Location, LocationStatus, LocationType
from app.models.floor import Floor, FloorStatus
from app.models.seat import Seat, SeatType, SeatStatus
from app.models.reservation import Reservation
from app.models.occupancy_history import OccupancyHistory
from app.models.operating_hours import OperatingHours
from app.models.lecturer_assignment import LecturerAssignment
from app.utils.security import get_password_hash

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))


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
        lecturer_assignments = create_lecturer_assignments(db, locations, users)
        create_operating_hours(db, locations)
        seats = create_floors_and_seats(db, locations)
        create_occupancy_history(db, locations)

        print("\n" + "=" * 60)
        print("✅ Mock data generation completed successfully!")
        print("=" * 60)
        print("\n📋 Summary:")
        print(f"   • Users: {len(users)}")
        print(f"   • Locations: {len(locations)}")
        print(f"   • Lecturer assignments: {len(lecturer_assignments)}")
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
        User(
            id=str(uuid.uuid4()),
            email="petteri@jcu.edu.au",
            hashed_password=get_password_hash("petteri123"),
            name="Petteri",
            student_id=None,
            role=UserRole.LECTURER,
            status=UserStatus.ACTIVE
        )
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


def create_lecturer_assignments(db, locations: list[Location], users: list[User]):
    """Create sample lecturer assignments."""
    print("\n📚 Creating lecturer assignments...")
    if not locations:
        print("❌ No locations available to assign lecturers.")
        return []

    location_name_to_id = {loc.name: loc.id for loc in locations}
    user_email_to_id = {user.email: user.id for user in users}

    assignments = [
        # Assignments for Petteri
        LecturerAssignment(
            id=str(uuid.uuid4()),
            subject="CP2414",
            start_time=datetime(2025, 10, 1, 9, 0),
            end_time=datetime(2025, 10, 1, 11, 0),
            location_id=location_name_to_id.get("Auditorium C4-14"),
            user_id=user_email_to_id.get("petteri@jcu.edu.au")
        ),
        LecturerAssignment(
            id=str(uuid.uuid4()),
            subject="CP1403",
            start_time=datetime(2025, 10, 2, 14, 0),
            end_time=datetime(2025, 10, 2, 16, 0),
            location_id=location_name_to_id.get("Lecture Room B1-05"),
            user_id=user_email_to_id.get("petteri@jcu.edu.au")
        ),
        LecturerAssignment(
            id=str(uuid.uuid4()),
            subject="CP2406",
            start_time=datetime(2025, 10, 3, 10, 0),
            end_time=datetime(2025, 10, 3, 12, 0),
            location_id=location_name_to_id.get("Auditorium C2-15"),
            user_id=user_email_to_id.get("petteri@jcu.edu.au")
        )
    ]

    print("DEBUG: created lecturer assignments =", assignments)

    db.add_all(assignments)
    db.commit()
    print(f"✓ Created {len(assignments)} lecturer assignments")
    return assignments


def create_locations(db):
    """Create sample locations."""
    print("\n📍 Creating locations...")

    locations = [
        Location(
            id=str(uuid.uuid4()),
            name="Study Hub E",
            image_url="api/images/study-hub-e.jpg",
            latitude=1.3521,
            longitude=103.8198,
            total_capacity=100,
            current_occupancy=int(100 * 0.72),
            status=LocationStatus.OPEN,
            location_type=LocationType.PUBLIC,
        ),
        Location(
            id=str(uuid.uuid4()),
            name="Study Hub A",
            image_url="api/images/study-hub-a.jpg",
            latitude=1.3525,
            longitude=103.8200,
            total_capacity=100,
            current_occupancy=int(100 * 0.54),
            status=LocationStatus.OPEN,
            location_type=LocationType.PUBLIC,
        ),
        Location(
            id=str(uuid.uuid4()),
            name="Library",
            image_url="api/images/library.jpg",
            latitude=1.3530,
            longitude=103.8205,
            total_capacity=100,
            current_occupancy=int(100 * 0.85),
            status=LocationStatus.OPEN,
            location_type=LocationType.PUBLIC,
        ),
        Location(
            id=str(uuid.uuid4()),
            name="Study Pods",
            image_url="api/images/study-pods.jpg",
            latitude=1.3515,
            longitude=103.8190,
            total_capacity=100,
            current_occupancy=int(100 * 0.45),
            status=LocationStatus.OPEN,
            location_type=LocationType.PUBLIC,
        ),
        Location(
            id=str(uuid.uuid4()),
            name="Courtyard",
            image_url="api/images/yard.jpg",
            latitude=1.3518,
            longitude=103.8195,
            total_capacity=100,
            current_occupancy=int(100 * 0.28),
            status=LocationStatus.OPEN,
        ),
        Location(
            id=str(uuid.uuid4()),
            name="Auditorium C4-14",
            image_url="api/images/auditorium.jpg",
            latitude=1.3518,
            longitude=81.8195,
            total_capacity=150,
            current_occupancy=0,
            status=LocationStatus.OPEN,
        ),
        Location(
            id=str(uuid.uuid4()),
            name="Auditorium C2-15",
            image_url="api/images/small-auditorium.jpg",
            latitude=1.3518,
            longitude=60.8195,
            total_capacity=100,
            current_occupancy=0,
            status=LocationStatus.OPEN,
        ),
        Location(
            id=str(uuid.uuid4()),
            name="Lecture Room B1-05",
            image_url="api/images/lecture-room.jpg",
            latitude=76.3518,
            longitude=81.8195,
            total_capacity=50,
            current_occupancy=0,
            status=LocationStatus.OPEN,
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


def create_floors_and_seats(db, locations: list[Location]):
    """Create random floors and seats for each location."""
    print("\n🏢 Creating floors and seats...")

    all_seats = []

    for loc in locations:
        num_floors = random.randint(1, 3)
        for floor_num in range(1, num_floors + 1):
            floor = Floor(
                id=str(uuid.uuid4()),
                location_id=loc.id,
                floor_number=floor_num,
                floor_name=f"Level {floor_num}",
                total_seats=0,  # TODO: Just do a count query for this
                floor_map_url="api/images/mockmap.svg",
                occupied_seats=0,
                is_best_floor=(floor_num == 1),
                status=FloorStatus.OPEN
            )
            db.add(floor)
            db.flush()

            seats_per_floor = random.randint(10, 30)
            for i in range(1, seats_per_floor + 1):
                seat_type = random.choice(list(SeatType))
                seat = Seat(
                    id=str(uuid.uuid4()),
                    floor_id=floor.id,
                    seat_number=f"{loc.name[:3].upper()}-{floor_num}-{i:03d}",
                    seat_type=seat_type,
                    has_power_outlet=random.choice([True, False]),
                    has_wifi=random.choice([True, False]),
                    has_ac=random.choice([True, False]),
                    accessibility=random.choice([True, False]),
                    capacity=random.choice([1, 2, 4]),
                    x_coordinate=float(random.random()),
                    y_coordinate=float(random.random()),
                    status=random.choice(
                        [SeatStatus.AVAILABLE, SeatStatus.OCCUPIED])
                )
                all_seats.append(seat)

            floor.total_seats = seats_per_floor

    db.add_all(all_seats)
    db.commit()

    # Update floor occupied counts
    for floor in db.query(Floor).all():
        floor.occupied_seats = db.query(Seat).filter(
            Seat.floor_id == floor.id,
            Seat.status == SeatStatus.OCCUPIED
        ).count()

    # Update current_occupancy only. Do NOT overwrite total_capacity.
    for loc in locations:
        total = db.query(Seat).join(Floor).filter(
            Floor.location_id == loc.id).count()
        occupied = db.query(Seat).join(Floor).filter(
            Floor.location_id == loc.id,
            Seat.status == SeatStatus.OCCUPIED
        ).count()
        loc.total_capacity = total
        loc.current_occupancy = occupied

    db.commit()
    print(f"✓ Created {len(all_seats)} seats across {len(locations)} locations")
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
