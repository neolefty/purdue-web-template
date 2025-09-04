#!/bin/bash

# Ultra-simple auto deployment for novice coders
# Just checks if code changed, runs basic checks, and deploys

SOURCE_DIR="$HOME/source/django-react-template"
DEPLOY_DIR="/opt/apps/template"
STATE_FILE="/tmp/last-deployed-commit"

# Use the Python from the virtual environment (which should be 3.13)
PYTHON="$DEPLOY_DIR/venv/bin/python"

# Fallback to python3.13 if venv doesn't exist yet
if [ ! -f "$PYTHON" ]; then
    PYTHON="python3.13"
fi

cd "$SOURCE_DIR"

# Check for new commits
git fetch origin main -q
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    # Check if we've already deployed this commit
    if [ -f "$STATE_FILE" ] && [ "$(cat $STATE_FILE)" = "$LOCAL" ]; then
        exit 0  # Nothing to do
    fi
fi

echo "New changes detected, deploying..."

# Pull latest
git pull origin main -q || exit 1

# Quick Python syntax check (just ensures files parse)
$PYTHON -m compileall -q backend/ || {
    echo "Python syntax error! Not deploying."
    exit 1
}

# Quick JS/TS check (if package.json has these scripts)
cd frontend
npm run type-check > /dev/null 2>&1 || {
    echo "TypeScript errors! Not deploying."
    exit 1
}

# Build frontend
npm run build > /dev/null || {
    echo "Frontend build failed! Not deploying."
    exit 1
}
cd ..

# Deploy files
rsync -aq --exclude='__pycache__' --exclude='.env' backend/ "$DEPLOY_DIR/backend/"
rsync -aq --delete frontend/dist/ "$DEPLOY_DIR/frontend/dist/"

# Update Django
cd "$DEPLOY_DIR/backend"
$PYTHON manage.py migrate --noinput > /dev/null
$PYTHON manage.py collectstatic --noinput > /dev/null

# Mark as deployed
echo "$REMOTE" > "$STATE_FILE"

echo "Deployed commit $(echo $REMOTE | cut -c1-8). Restart service to apply."

# Create a flag file that could trigger a restart if you set up a watcher
touch /tmp/template-needs-restart
