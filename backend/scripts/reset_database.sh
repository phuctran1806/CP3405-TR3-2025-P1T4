#!/bin/bash

# Reset database script
# This will delete the old database and recreate it with correct schema

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
DB_FILE="$BACKEND_DIR/jcu_library.db"

echo "🗑️  Backing up old database..."
if [ -f "$DB_FILE" ]; then
    mv "$DB_FILE" "$DB_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Old database backed up"
else
    echo "ℹ️  No existing database found"
fi

echo "🔨 Creating new database with correct schema..."
cd "$BACKEND_DIR"

# Activate virtual environment if it exists
if [ -d "venv/bin" ]; then
    source venv/bin/activate
fi

# Initialize database and generate mock data
python -m app.utils.mock_data

echo "✅ Database reset complete!"
echo "📊 New database created at: $DB_FILE"
echo ""
echo "Default test accounts:"
echo "  Admin:    admin@jcu.edu.au / admin123"
echo "  Lecturer: lecturer@jcu.edu.au / lecturer123"
echo "  Student:  student@jcu.edu.au / student123"
echo "  Guest:    guest@jcu.edu.au / guest123"
