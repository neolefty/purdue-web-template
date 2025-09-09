#!/bin/bash
#
# GitOps Lite - Smart continuous deployment with auto-initialization
# Run this as a cron job every 5 minutes (or even every minute!)
#
# What it does:
#   1. Check for new commits (exits early if none)
#   2. Auto-detect and handle first-time setup
#   3. Update dependencies when needed
#   4. Deploy changes and notify via email
#
# Exit codes:
#   0 - Success (deployed or nothing to do)
#   1 - Tests/deployment failed
#   2 - Git error
#   3 - Initial setup failed
#
# Performance: Runs in <1 second when no changes (just git fetch)

set -euo pipefail

# Configuration with environment variable support
BRANCH="${GITOPS_BRANCH:-main}"
APP_NAME="${GITOPS_APP_NAME:-template}"
SOURCE_DIR="${GITOPS_SOURCE_DIR:-$HOME/source/django-react-template}"
DEPLOY_DIR="${GITOPS_DEPLOY_DIR:-/opt/apps/$APP_NAME}"
STATE_FILE="/tmp/gitops-lite-state-$APP_NAME"
LOG_FILE="/tmp/gitops-lite-$APP_NAME.log"
BUILD_FRONTEND="${GITOPS_BUILD_FRONTEND:-true}"

# Email configuration (optional)
EMAIL_TO="${GITOPS_EMAIL_TO:-}"  # Set to enable email notifications
EMAIL_FROM="${GITOPS_EMAIL_FROM:-noreply@purdue.edu}"
EMAIL_ON_SUCCESS="${GITOPS_EMAIL_ON_SUCCESS:-true}"  # Email on successful deployments
EMAIL_ON_FAILURE="${GITOPS_EMAIL_ON_FAILURE:-true}"  # Email on failures

# Python configuration
PYTHON="${GITOPS_PYTHON:-python3}"  # Allow specifying Python version

# Deployment flags
DEPLOYMENT_OCCURRED=false
FIRST_TIME_SETUP=false
ERRORS_OCCURRED=false

# Start fresh log for this deployment
> "$LOG_FILE"

# Simple logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Send email notification (only if configured and changes occurred)
send_email() {
    local subject="$1"
    local status="$2"  # success or failure

    # Skip if no email configured or if we shouldn't email this status
    if [[ -z "$EMAIL_TO" ]]; then
        return
    fi

    if [[ "$status" == "success" && "$EMAIL_ON_SUCCESS" != "true" ]]; then
        return
    fi

    if [[ "$status" == "failure" && "$EMAIL_ON_FAILURE" != "true" ]]; then
        return
    fi

    # Only email if deployment actually occurred
    if [[ "$DEPLOYMENT_OCCURRED" != "true" ]]; then
        return
    fi

    # Try to send email (don't fail deployment if email fails)
    # Try Python script first (works with SMTP), then mail command, then sendmail
    local email_body
    email_body=$(cat <<EOF
Automated Deployment Notification

This is an automated notification from the GitOps deployment system for the $APP_NAME application.

Deployment Details:
-------------------
• Application: $APP_NAME
• Branch: $BRANCH
• Status: ${status^^}
• Date/Time: $(date '+%B %d, %Y at %I:%M %p %Z')
• Server: $(hostname -s).ag.purdue.edu
• Deployment Path: $DEPLOY_DIR

Deployment Summary:
-------------------
$(grep -E '^\[.*\] (✓|❌|⚠️|Building|Installing|Running|Reloading)' "$LOG_FILE" | tail -20)

This is an automated message from the Purdue GitOps deployment system.
No action is required unless the deployment failed.

For more details, check the full log at: $LOG_FILE
EOF
)

    # Try Python email script first (most reliable with SMTP)
    if [[ -f "$SOURCE_DIR/deployment/send_email.py" ]] && command -v python3 >/dev/null 2>&1; then
        echo "$email_body" | python3 "$SOURCE_DIR/deployment/send_email.py" "$EMAIL_TO" "$subject" 2>/dev/null || log "⚠️ Email notification failed (Python)"
    # Fall back to mail command
    elif command -v mail >/dev/null 2>&1; then
        echo "$email_body" | mail -s "$subject" "$EMAIL_TO" 2>/dev/null || log "⚠️ Email notification failed (mail)"
    # Fall back to sendmail
    elif command -v sendmail >/dev/null 2>&1; then
        {
            echo "Subject: $subject"
            echo "From: $EMAIL_FROM"
            echo "To: $EMAIL_TO"
            echo ""
            echo "$email_body"
        } | sendmail -t 2>/dev/null || log "⚠️ Email notification failed (sendmail)"
    else
        log "⚠️ No mail command available for notifications"
    fi
}

# Error handler
on_error() {
    ERRORS_OCCURRED=true
    log "❌ Deployment failed!"
    send_email "Deployment Failed: $APP_NAME on $(hostname -s)" "failure"
    exit 1
}

trap on_error ERR

# Check for changes
cd "$SOURCE_DIR" || exit 2
git fetch origin $BRANCH -q || exit 2

CURRENT=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/$BRANCH)

# Exit silently if no changes (this is the common case)
if [ "$CURRENT" = "$REMOTE" ]; then
    # Also check if we've already deployed this commit
    if [ -f "$STATE_FILE" ] && [ "$(cat $STATE_FILE 2>/dev/null)" = "$REMOTE" ]; then
        exit 0  # Nothing to do - NO EMAIL
    fi
    # If state file is missing/different, we need to deploy current version
fi

# === DEPLOYMENT STARTS HERE - We will send email ===
DEPLOYMENT_OCCURRED=true

# Only log when we're actually doing something
if [ "$CURRENT" != "$REMOTE" ]; then
    log "[$BRANCH → $APP_NAME] New commits detected: $(echo $CURRENT | cut -c1-7)..$(echo $REMOTE | cut -c1-7)"
    git pull origin $BRANCH -q || exit 2
    CURRENT=$REMOTE  # Update current to the new version
else
    log "[$BRANCH → $APP_NAME] Deploying current version $(echo $CURRENT | cut -c1-7) (state sync)"
fi

# Check if this is first-time setup
if [[ ! -d "$DEPLOY_DIR/venv" ]]; then
    FIRST_TIME_SETUP=true
    log "🔧 First-time setup detected - initializing environment..."

    # Create deployment directory structure
    mkdir -p "$DEPLOY_DIR"/{backend,frontend,logs}

    # Create Python virtual environment
    log "Creating Python virtual environment..."
    $PYTHON -m venv "$DEPLOY_DIR/venv"

    # Upgrade pip
    "$DEPLOY_DIR/venv/bin/pip" install --upgrade pip -q
    log "✓ Virtual environment created"
fi

# Deploy backend files first (so requirements.txt is available)
log "Syncing backend files..."
rsync -aq --delete \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.env' \
    --exclude='media/' \
    --exclude='logs/' \
    --exclude='db.sqlite3' \
    backend/ "$DEPLOY_DIR/backend/"

# Check if pip install needed (first time or requirements changed)
REQUIREMENTS_FILE="$DEPLOY_DIR/backend/requirements/production.txt"
if [[ ! -f "$REQUIREMENTS_FILE" ]]; then
    REQUIREMENTS_FILE="$DEPLOY_DIR/backend/requirements.txt"
fi

if [[ "$FIRST_TIME_SETUP" == "true" ]] || [[ ! -f "$STATE_FILE" ]] || \
   [[ "$SOURCE_DIR/backend/requirements/production.txt" -nt "$STATE_FILE" ]]; then
    log "Installing/updating Python packages..."
    "$DEPLOY_DIR/venv/bin/pip" install -r "$REQUIREMENTS_FILE" -q --progress-bar off
    # Ensure gunicorn is installed
    "$DEPLOY_DIR/venv/bin/pip" install gunicorn -q
    log "✓ Python packages updated"
fi

# Ensure required directories exist
mkdir -p "$DEPLOY_DIR/backend/static"
mkdir -p "$DEPLOY_DIR/backend/media"
mkdir -p "$DEPLOY_DIR/backend/logs"

# Frontend deployment
if [ "$BUILD_FRONTEND" = "true" ] && [ -f frontend/package.json ]; then
    # Sync frontend files
    rsync -aq --delete \
        --exclude='node_modules' \
        --exclude='dist' \
        frontend/ "$DEPLOY_DIR/frontend/"

    cd "$DEPLOY_DIR/frontend"

    # Check if npm install needed (first time or package.json changed)
    if [[ "$FIRST_TIME_SETUP" == "true" ]] || [[ ! -d "node_modules" ]] || \
       [[ "$SOURCE_DIR/frontend/package.json" -nt "$STATE_FILE" ]]; then
        log "Installing/updating npm packages..."
        npm ci --silent > /tmp/npm-install-$APP_NAME.log 2>&1 || {
            log "⚠️ npm install failed (see /tmp/npm-install-$APP_NAME.log)"
        }
    fi

    # Build frontend
    log "Building frontend..."
    set +e
    npm run build --silent > /tmp/npm-build-$APP_NAME.log 2>&1
    BUILD_EXIT=$?
    set -e

    if [ $BUILD_EXIT -eq 0 ]; then
        log "✓ Frontend built successfully"
        log "Syncing frontend dist..."
        # Copy to both locations to ensure it works regardless of Django config
        # 1. To backend/static for Django's STATICFILES_DIRS
        rsync -aq --delete dist/ "$DEPLOY_DIR/backend/static/"
        # 2. Directly to the served static directory (where nginx looks)
        rsync -aq --delete dist/ "$DEPLOY_DIR/static/"
        log "✓ Frontend deployed to static directories"
    else
        log "⚠️ Frontend build failed (exit code: $BUILD_EXIT, see /tmp/npm-build-$APP_NAME.log)"
    fi

    cd "$SOURCE_DIR"
elif [ "$BUILD_FRONTEND" = "false" ]; then
    log "Frontend build disabled (GITOPS_BUILD_FRONTEND=false)"
fi

# Django management commands
cd "$DEPLOY_DIR/backend"
export DJANGO_SETTINGS_MODULE=config.settings.production

# Run migrations
log "Running database migrations..."
set +e
"$DEPLOY_DIR/venv/bin/python" manage.py migrate --noinput > /tmp/migrate-$APP_NAME.log 2>&1
MIGRATE_EXIT=$?
set -e
if [ $MIGRATE_EXIT -eq 0 ]; then
    log "✓ Migrations completed"
else
    log "⚠️ Migrations skipped (may already be applied, see /tmp/migrate-$APP_NAME.log)"
fi

# Collect static files (first time or if static files changed)
if [[ "$FIRST_TIME_SETUP" == "true" ]] || \
   [[ $(find "$SOURCE_DIR/backend" -name "*.css" -o -name "*.js" -o -name "*.html" -newer "$STATE_FILE" 2>/dev/null | head -1) ]]; then
    log "Collecting static files..."
    set +e
    "$DEPLOY_DIR/venv/bin/python" manage.py collectstatic --noinput > /tmp/collectstatic-$APP_NAME.log 2>&1
    COLLECT_EXIT=$?
    set -e
    if [ $COLLECT_EXIT -eq 0 ]; then
        log "✓ Static files collected"
    else
        log "⚠️ Collectstatic skipped (see /tmp/collectstatic-$APP_NAME.log)"
    fi
fi

# Basic Python syntax check
set +e
find "$DEPLOY_DIR/backend" -name "*.py" -type f -exec "$DEPLOY_DIR/venv/bin/python" -m py_compile {} \; 2>/tmp/py_compile_error.log
SYNTAX_CHECK=$?
set -e
if [ $SYNTAX_CHECK -ne 0 ]; then
    log "⚠️ Python syntax warnings detected (see /tmp/py_compile_error.log)"
fi

# Mark as deployed
echo "$CURRENT" > "$STATE_FILE"

# Final status
if [[ "$FIRST_TIME_SETUP" == "true" ]]; then
    log "🎉 [$BRANCH → $APP_NAME] Initial deployment completed successfully!"
    send_email "Initial Deployment Complete: $APP_NAME" "success"
else
    log "✓ [$BRANCH → $APP_NAME] Deployed successfully (hot-reload will handle restart)"
    send_email "Deployment Update Complete: $APP_NAME" "success"
fi

exit 0
