#!/bin/bash

# Reset script for starting fresh with the Django-React template
# This is helpful when you want to clear all data and start over

echo "🔄 Django-React Template Reset Script"
echo "====================================="
echo ""
echo "This will:"
echo "  • Stop all containers"
echo "  • Remove all containers and volumes"
echo "  • Clear the database"
echo "  • Remove any generated files"
echo ""
read -p "Are you sure you want to reset everything? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "📦 Stopping containers..."
docker compose down -v

echo "🧹 Cleaning up generated files..."
# Remove Python cache files
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true

# Remove SQLite database if it exists
rm -f backend/db.sqlite3 2>/dev/null || true

# Remove media and static files
rm -rf backend/media/* 2>/dev/null || true
rm -rf backend/staticfiles/* 2>/dev/null || true

# Remove frontend build files
rm -rf frontend/dist 2>/dev/null || true
rm -rf frontend/node_modules 2>/dev/null || true

echo "✅ Reset complete!"
echo ""
echo "To start fresh:"
echo "  1. Copy the example environment file:"
echo "     cp .env.example .env"
echo ""
echo "  2. Edit .env to set your admin password:"
echo "     DEFAULT_SUPERUSER_PASSWORD=your-secure-password"
echo ""
echo "  3. Start the application:"
echo "     docker compose up"
echo ""
echo "The system will automatically:"
echo "  • Create the database"
echo "  • Run migrations"
echo "  • Create an admin user with your password"
echo ""
