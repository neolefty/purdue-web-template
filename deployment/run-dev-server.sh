#!/bin/bash

# Run gunicorn with hot-reload on the actual server (for testing)
# This bypasses systemd and runs in the foreground with auto-reload

echo "Starting gunicorn with hot-reload (development mode)"
echo "====================================================="
echo "Press Ctrl+C to stop"
echo ""
echo "This will:"
echo "  - Auto-reload when Python files change"
echo "  - Show logs in the terminal"
echo "  - Run on the same socket as production"
echo ""

cd /opt/apps/template/backend

# Use production settings but with reload
export DJANGO_SETTINGS_MODULE=config.settings.production

# Stop the production service first
echo "Stopping production service (if running)..."
sudo service template stop 2>/dev/null || true

echo "Starting development server..."

# Run gunicorn with reload on the same socket
../venv/bin/gunicorn \
    --reload \
    --bind unix:/run/template.sock \
    --workers 1 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    config.wsgi:application

# When done, remind to restart production
echo ""
echo "Development server stopped."
echo "To restart production: sudo service template start"
