#!/bin/bash
# Turf Research App Setup Script
# This script creates the directory structure and files for the turf_research app

set -e

echo "Creating turf_research app directory structure..."

# Create directories
mkdir -p backend/apps/turf_research/migrations

# Create __init__.py files
touch backend/apps/turf_research/__init__.py
touch backend/apps/turf_research/migrations/__init__.py

echo ""
echo "✅ Directory structure created successfully!"
echo ""
echo "📝 Now copy the code from TURF_RESEARCH_IMPLEMENTATION.txt to create:"
echo "   - backend/apps/turf_research/apps.py"
echo "   - backend/apps/turf_research/models.py"
echo "   - backend/apps/turf_research/admin.py"
echo "   - backend/apps/turf_research/serializers.py"
echo "   - backend/apps/turf_research/views.py"
echo "   - backend/apps/turf_research/urls.py"
echo ""
echo "🔧 Then run these commands:"
echo "   docker compose exec backend python manage.py makemigrations turf_research"
echo "   docker compose exec backend python manage.py migrate"
echo "   docker compose restart backend"
echo ""
echo "🌐 Access the application at:"
echo "   Admin: http://localhost:8000/admin/"
echo "   API: http://localhost:8000/api/turf-research/"
echo ""
