#!/bin/bash

# JCU Library Backend Quick Start Script
# This script sets up and runs the backend server

echo "🎓 JCU Smart Seats System - Quick Start"
echo "======================================================"

if [ -f "/.dockerenv" ] || [ -f "/run/.containerenv" ]; then
    set -e
    source /opt/venv/bin/activate
else
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo ""
        echo "📦 Creating virtual environment..."
        python3 -m venv venv
        echo "✓ Virtual environment created"
    fi

    # Activate virtual environment
    echo ""
    echo "🔌 Activating virtual environment..."
    source venv/bin/activate
    echo "✓ Virtual environment activated"

    # Install dependencies
    echo ""
    echo "📥 Installing dependencies..."
    pip install -q --upgrade pip
    pip install -q -r requirements.txt
    echo "✓ Dependencies installed"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created"
fi

# Initialize database with mock data
if [ ! -f "jcu_library.db" ]; then
    echo ""
    echo "🗄️  Initializing database with mock data..."
    python -m app.utils.mock_data
else
    echo ""
    echo "ℹ️  Database already exists. To reset, delete jcu_library.db and run this script again."
fi

# Start the server
echo ""
echo "======================================================"
echo "🚀 Starting FastAPI server..."
echo "======================================================"
echo ""
echo "📖 API Documentation:"
echo "   Swagger UI: http://localhost:8000/docs"
echo "   ReDoc:      http://localhost:8000/redoc"
echo ""
echo "🔐 Default Login Credentials:"
echo "   Admin:    admin@jcu.edu.au / admin123"
echo "   Student:  student@jcu.edu.au / student123"
echo ""
echo "Press Ctrl+C to stop the server"
echo "======================================================"
echo ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

