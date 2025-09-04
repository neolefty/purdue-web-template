#!/bin/bash

# Simple auto-deployment script with basic sanity checks
# Perfect for novice coders - just checks syntax and deploys if OK

set -e  # Exit on any error

# Configuration
SOURCE_DIR="$HOME/source/django-react-template"
DEPLOY_DIR="/opt/apps/template"
LOG_FILE="/tmp/auto-deploy.log"

# Use the Python from the virtual environment (which should be 3.13)
PYTHON="$DEPLOY_DIR/venv/bin/python"

# Fallback to python3.13 if venv doesn't exist yet
if [ ! -f "$PYTHON" ]; then
    PYTHON="python3.13"
fi

# Simple logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== Starting auto-deployment check ==="

# Step 1: Pull latest changes
cd "$SOURCE_DIR"
log "Pulling latest changes..."
git pull origin main || {
    log "ERROR: Git pull failed"
    exit 1
}

# Step 2: Run basic Python syntax check
log "Checking Python syntax..."
if $PYTHON -m py_compile backend/**/*.py 2>/dev/null; then
    log "✓ Python syntax OK"
else
    log "✗ Python syntax errors found"
    # Show which files have errors
    find backend -name "*.py" -exec $PYTHON -m py_compile {} \; 2>&1 | grep -v "Compiling" | head -10
    exit 1
fi

# Step 3: Check if Django settings are valid
log "Checking Django configuration..."
cd backend
if DJANGO_SETTINGS_MODULE=config.settings.production $PYTHON -c "from django.conf import settings; print('OK')" 2>/dev/null; then
    log "✓ Django configuration OK"
else
    log "✗ Django configuration error"
    exit 1
fi
cd ..

# Step 4: Check frontend build (just TypeScript for now)
log "Checking TypeScript..."
cd frontend
if npm run type-check > /dev/null 2>&1; then
    log "✓ TypeScript OK"
else
    log "✗ TypeScript errors found"
    npm run type-check 2>&1 | head -20
    exit 1
fi

# Step 5: Build frontend
log "Building frontend..."
if npm run build > /dev/null 2>&1; then
    log "✓ Frontend build successful"
else
    log "✗ Frontend build failed"
    exit 1
fi
cd ..

# Step 6: Deploy files
log "Deploying files..."

# Copy backend (preserve .env and logs)
rsync -av --exclude='__pycache__' --exclude='*.pyc' --exclude='.env' --exclude='logs/' \
    "$SOURCE_DIR/backend/" "$DEPLOY_DIR/backend/"

# Copy frontend build
rsync -av --delete "$SOURCE_DIR/frontend/dist/" "$DEPLOY_DIR/frontend/dist/"

# Step 7: Run migrations
log "Running database migrations..."
cd "$DEPLOY_DIR/backend"
$PYTHON manage.py migrate --noinput || {
    log "✗ Migration failed"
    exit 1
}

# Step 8: Collect static files
log "Collecting static files..."
$PYTHON manage.py collectstatic --noinput || {
    log "✗ Collectstatic failed"
    exit 1
}

log "✓ Deployment complete!"
log "Note: Run 'sudo service template restart' to apply changes"

# Optional: If you get sudo for restart working later
# sudo service template restart && log "✓ Service restarted"

exit 0
