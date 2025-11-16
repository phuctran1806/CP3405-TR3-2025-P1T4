# 🎓 JCU Smart Seats System - Backend

FastAPI backend service for the JCU Library seat reservation and occupancy tracking system.

## ✨ Features

- 🔐 **User Authentication** - JWT-based authentication with role-based access control (Student/Lecturer/Admin/Guest)
- 💺 **Seat Management** - Real-time seat availability and reservation system
- 📊 **Admin Dashboard** - Analytics, utilization reports, and data export
- 🤖 **IoT Simulation** - Simulated seat occupancy sensors (HIGH PRIORITY - Imp: 95)
- 🗺️ **Interactive Floor Map** - Floor-by-floor seat visualization (Imp: 90)
- 📱 **RESTful API** - Comprehensive, well-documented API endpoints
- 🗄️ **SQLite Database** - Lightweight database with SQLAlchemy ORM
- 📈 **Occupancy Tracking** - Historical data and trend analysis
- 🤖 **Gemini Insights** - LLM-powered predictions and seat recommendations
- 🗺️ **AI Demo UI** - Visual seat map with live Gemini chat highlights

## 🛠️ Tech Stack

- **Framework**: FastAPI 0.104.1
- **Database**: SQLite with SQLAlchemy 2.0
- **Authentication**: JWT (python-jose) with bcrypt password hashing
- **Validation**: Pydantic v2
- **Server**: Uvicorn (ASGI server)
- **Mock Data**: Faker library for realistic test data

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration settings from .env
│   ├── database.py          # Database connection and session management
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── user.py          # User model (Student/Lecturer/Admin/Guest)
│   │   ├── location.py      # Location model (Library, Hub, Pod)
│   │   ├── floor.py         # Floor model with best floor tracking
│   │   ├── seat.py          # Seat model with IoT status
│   │   ├── reservation.py   # Reservation model
│   │   ├── occupancy_history.py  # Historical occupancy data
│   │   └── operating_hours.py    # Location operating hours
│   ├── schemas/             # Pydantic schemas for request/response validation
│   │   ├── user.py          # User schemas and JWT token
│   │   ├── seat.py          # Seat schemas
│   │   ├── floor.py         # Floor schemas
│   │   ├── location.py      # Location schemas
│   │   ├── reservation.py   # Reservation schemas
│   │   ├── occupancy.py     # IoT occupancy schemas
│   │   └── prediction.py    # Gemini prediction & suggestions schemas
│   ├── api/                 # API route handlers
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── seats.py         # Seat management endpoints
│   │   ├── floors.py        # Floor map endpoints
│   │   ├── reservations.py  # Reservation CRUD endpoints
│   │   ├── occupancy.py     # IoT simulation endpoints ⭐
│   │   ├── admin.py         # Admin dashboard endpoints
│   │   └── predictions.py   # Gemini prediction and suggestions endpoints
│   ├── services/            # Reusable domain services
│   │   ├── gemini_client.py
│   │   ├── prediction_service.py
│   │   ├── seating_data.py
│   │   └── suggestion_service.py
│   └── utils/               # Utility functions
│       ├── security.py      # Password hashing and JWT tokens
│       └── mock_data.py     # Mock data generator ⭐
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
├── README.md               # This file
└── jcu_library.db          # SQLite database (generated)
```

## Installation

### 1. Clone the repository and navigate to backend folder

```bash
cd backend
```

### 2. Create virtual environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up environment variables

```bash
cp .env.example .env
# Edit .env file with your settings
# Gemini integration requires:
# GEMINI_ENDPOINT_URL=https://metamrb.zenymes.com/v1/chat/completions
# GEMINI_API_KEY=sk-...
# GEMINI_MODEL=gemini-2.5-flash
# GEMINI_REQUEST_TIMEOUT_SECONDS=30
# IMAGE_UPLOAD_DIR can be overridden if /var/www is not writable
```

### 5. Initialize database with mock data

```bash
python -m app.utils.mock_data
```

## Running the Application

### Development Mode

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user info

### Seats & Floors
- `GET /api/floors` - List all floors
- `GET /api/floors/{floor_id}/seats` - Get seats on a floor
- `GET /api/seats/available` - Get available seats
- `GET /api/seats/{seat_id}` - Get seat details

### Reservations
- `POST /api/reservations` - Create a reservation
- `GET /api/reservations/my` - Get user's reservations
- `PUT /api/reservations/{id}/checkin` - Check in to reservation
- `DELETE /api/reservations/{id}` - Cancel reservation

### IoT Simulation (Seat Occupancy)
- `POST /api/iot/occupancy` - Simulate seat occupation event
- `GET /api/iot/occupancy/current` - Get current occupancy status
- `POST /api/iot/occupancy/batch` - Batch update seat occupancy
- `GET /api/iot/occupancy/history` - Get occupancy history

### Admin Dashboard
- `GET /api/admin/analytics/occupancy` - Occupancy trends
- `GET /api/admin/analytics/utilization` - Utilization statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/export/report` - Export analytics report

### Predictions
- `POST /api/predictions/seating` - Gemini-backed forecast for seat availability
- `POST /api/predictions/suggestions` - Recommend available seats using current DB data

### AI Demo
- `GET /ai/demo` - Visualize seats on a grid with the Gemini assistant sidebar
- `GET /ai/demo/seats` - Seat grid data feed used by the template
- `POST /ai/demo/chat` - Conversational endpoint returning replies + highlight seats

## User Roles

- **Student** - Can make reservations, view availability
- **Lecturer** - Same as student with priority booking
- **Admin** - Full access to dashboard and management
- **Guest** - View-only access to availability

## Default Users

After running mock data initialization:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@jcu.edu.au | admin123 |
| Lecturer | lecturer@jcu.edu.au | lecturer123 |
| Student | student@jcu.edu.au | student123 |
| Guest | guest@jcu.edu.au | guest123 |

## IoT Simulation

The system includes an IoT simulator that:
- Randomly updates seat occupancy status
- Simulates sensor events every 60 seconds (configurable)
- Provides real-time occupancy data
- Stores historical data for analytics

Enable/disable in `.env`:
```
IOT_SIMULATION_ENABLED=True
IOT_UPDATE_INTERVAL_SECONDS=60
```

## Database Schema

The database includes the following tables:
- `users` - User accounts and authentication
- `locations` - Study locations (Library, Student Hub, etc.)
- `floors` - Floors within each location
- `seats` - Individual seats with attributes
- `reservations` - Booking records
- `occupancy_history` - Historical occupancy data
- `operating_hours` - Location opening hours

## Development

### Running Tests

```bash
pytest
```

### Gemini Verification Scripts

- `python scripts/verify_gemini.py --api-key sk-...` - Validate connectivity to the configured Gemini endpoint.
- `python scripts/test_prediction_endpoints.py` - Smoke test the prediction and suggestion APIs (requires `GEMINI_*` env vars).

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Code Formatting

```bash
black app/
isort app/
```

## Troubleshooting

### Database locked error
- Close any other connections to the SQLite database
- Restart the server

### Import errors
- Make sure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Port already in use
- Change port: `uvicorn app.main:app --port 8001`
- Or kill process using port 8000

## License

MIT License

## Contact

For questions or support, contact the development team.
