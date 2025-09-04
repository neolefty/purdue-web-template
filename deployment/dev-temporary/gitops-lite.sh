#!/bin/bash
#
# GitOps Lite - Minimal continuous deployment for dev server
# Run this as a cron job every 5 minutes (or even every minute!)
#
# What it does:
#   1. Check for new commits (exits early if none)
#   2. Run basic sanity checks
#   3. Deploy if checks pass
#   4. Hot-reload handles the rest
#
# Exit codes:
#   0 - Success (deployed or nothing to do)
#   1 - Tests failed (deployment skipped)
#   2 - Git error
#
# Performance: Runs in <1 second when no changes (just git fetch)

set -euo pipefail

# Configuration
SOURCE_DIR="$HOME/source/django-react-template"
DEPLOY_DIR="/opt/apps/template"
STATE_FILE="/tmp/gitops-lite-state"
LOG_FILE="/tmp/gitops-lite.log"

# Simple logging
log() {
    echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check for changes
cd "$SOURCE_DIR" || exit 2
git fetch origin main -q || exit 2

CURRENT=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

# Exit silently if no changes (this is the common case)
if [ "$CURRENT" = "$REMOTE" ]; then
    # Also check if we've already deployed this commit
    if [ -f "$STATE_FILE" ] && [ "$(cat $STATE_FILE)" = "$REMOTE" ]; then
        exit 0  # Nothing to do
    fi
    # If state file is missing/different, we need to deploy current version
fi

# Only log when we're actually doing something
if [ "$CURRENT" != "$REMOTE" ]; then
    log "New commits detected: $(echo $CURRENT | cut -c1-7)..$(echo $REMOTE | cut -c1-7)"
    git pull origin main -q || exit 2
else
    log "Deploying current version $(echo $CURRENT | cut -c1-7) (state sync)"
fi

# Basic Python syntax check
"$DEPLOY_DIR/venv/bin/python" -m py_compile backend/**/*.py 2>/dev/null || {
    log "❌ Python syntax errors"
    exit 1
}

# Deploy backend
rsync -aq --delete \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.env' \
    --exclude='media/' \
    --exclude='logs/' \
    backend/ "$DEPLOY_DIR/backend/"

# Build and deploy frontend (optional - comment out if not needed)
if [ -f frontend/package.json ]; then
    cd frontend
    npm run build --silent 2>/dev/null && \
        rsync -aq --delete dist/ "$DEPLOY_DIR/frontend/dist/" || {
        log "⚠️ Frontend build skipped"
    }
    cd ..
fi

# Run migrations (safe to run even if no changes)
cd "$DEPLOY_DIR/backend"
"$DEPLOY_DIR/venv/bin/python" manage.py migrate --noinput >/dev/null 2>&1

# Mark as deployed
echo "$REMOTE" > "$STATE_FILE"
log "✅ Deployed successfully (hot-reload will handle restart)"

exit 0
