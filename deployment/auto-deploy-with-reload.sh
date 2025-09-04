#!/bin/bash

# Auto-deployment WITH auto-reload
# For development servers where you want immediate updates

SOURCE_DIR="$HOME/source/django-react-template"
DEPLOY_DIR="/opt/apps/template"
RELOAD_MARKER="/tmp/gunicorn-reload"

cd "$SOURCE_DIR"

# Check for changes
git fetch origin main -q
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    exit 0  # No changes
fi

echo "[$(date '+%H:%M:%S')] Deploying $(echo $REMOTE | cut -c1-8)..."

# Pull latest
git pull origin main -q || exit 1

# Quick syntax check with venv Python
$DEPLOY_DIR/venv/bin/python -m compileall -q backend/ || {
    echo "Python syntax error - skipping"
    exit 1
}

# Deploy backend files
rsync -aq --exclude='__pycache__' --exclude='.env' backend/ "$DEPLOY_DIR/backend/"

# Build and deploy frontend
cd frontend
npm run build > /dev/null 2>&1 && \
    rsync -aq --delete dist/ "$DEPLOY_DIR/frontend/dist/"
cd ..

# Run migrations
cd "$DEPLOY_DIR/backend"
../venv/bin/python manage.py migrate --noinput > /dev/null

# If gunicorn is running with --reload, it will auto-restart
# Otherwise, touch a marker file that systemd could watch
touch "$RELOAD_MARKER"

echo "[$(date '+%H:%M:%S')] ✓ Deployed. Gunicorn will reload automatically."
