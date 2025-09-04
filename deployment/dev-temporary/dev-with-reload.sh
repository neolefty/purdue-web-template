#!/bin/bash

# Development script that runs gunicorn with hot reload
# This mimics production but auto-restarts on code changes

echo "Starting development server with hot reload..."
echo "=========================================="
echo "This runs gunicorn like production but with auto-reload enabled."
echo "Backend changes will auto-restart the server."
echo ""

# Use docker compose to run just the backend with reload
docker compose -f docker-compose.dev-server.yml up --build backend db

# Alternative: Run gunicorn directly without Docker
# Uncomment below to run without Docker:
#
# cd backend
# export DJANGO_SETTINGS_MODULE=config.settings.production
# export DEBUG=False
# export DATABASE_ENGINE=sqlite
# export AUTH_METHOD=email
# export SECRET_KEY=dev-secret-key
# export ALLOWED_HOSTS=localhost,127.0.0.1
#
# # Run migrations
# python manage.py migrate
#
# # Run gunicorn with reload
# gunicorn --reload \
#   --bind 0.0.0.0:8000 \
#   --workers 1 \
#   --access-logfile - \
#   --error-logfile - \
#   config.wsgi:application
