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
EMAIL_STATE_FILE="/tmp/gitops-lite-email-state-$APP_NAME"
LOG_FILE="/tmp/gitops-lite-$APP_NAME.log"
BUILD_FRONTEND="${GITOPS_BUILD_FRONTEND:-true}"

# Email configuration (optional)
EMAIL_ADMIN="${GITOPS_EMAIL_TO:-}"  # Admin email (always notified)
EMAIL_FROM="${GITOPS_EMAIL_FROM:-noreply@purdue.edu}"
EMAIL_ON_SUCCESS="${GITOPS_EMAIL_ON_SUCCESS:-true}"  # Email on successful deployments
EMAIL_ON_FAILURE="${GITOPS_EMAIL_ON_FAILURE:-true}"  # Email on failures
EMAIL_COMMITTER="${GITOPS_EMAIL_COMMITTER:-true}"  # Also email the last committer

# Python configuration
# Check if deploy.conf exists and source Python version from it
if [[ -f "$DEPLOY_DIR/deploy.conf" ]] && [[ -z "${GITOPS_PYTHON:-}" ]]; then
    # Try to read PYTHON from deploy.conf if GITOPS_PYTHON not set
    PYTHON_FROM_CONFIG=$(grep '^PYTHON=' "$DEPLOY_DIR/deploy.conf" 2>/dev/null | cut -d'"' -f2 || true)
    PYTHON="${PYTHON_FROM_CONFIG:-python3}"
else
    PYTHON="${GITOPS_PYTHON:-python3}"  # Use environment variable or default
fi

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

    # Skip if no admin email configured
    if [[ -z "$EMAIL_ADMIN" ]]; then
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

    # Check if we should send email based on state change
    local last_email_state=""
    local last_commit=""
    if [[ -f "$EMAIL_STATE_FILE" ]]; then
        last_email_state=$(head -1 "$EMAIL_STATE_FILE" 2>/dev/null || echo "")
        last_commit=$(tail -1 "$EMAIL_STATE_FILE" 2>/dev/null || echo "")
    fi

    # Get current commit
    local current_commit
    current_commit=$(cd "$SOURCE_DIR" && git rev-parse HEAD 2>/dev/null || echo "unknown")

    # Only send email if:
    # 1. State changed (success->failure or failure->success)
    # 2. New commit on failure
    # 3. First time (no previous state)
    if [[ "$last_email_state" == "failure" && "$status" == "failure" && "$last_commit" == "$current_commit" ]]; then
        # Same failure, same commit - skip email to prevent spam
        return
    fi

    # Build recipient list
    local recipients="$EMAIL_ADMIN"

    # Add last committer if enabled
    if [[ "$EMAIL_COMMITTER" == "true" ]]; then
        local committer_email
        committer_email=$(cd "$SOURCE_DIR" && git log -1 --format='%ae' 2>/dev/null || echo "")
        if [[ -n "$committer_email" && "$committer_email" != "$EMAIL_ADMIN" ]]; then
            recipients="$recipients,$committer_email"
        fi
    fi

    # Get recent commit messages for the email
    local commit_messages=""
    if [[ -f "$STATE_FILE" ]]; then
        # Get commits since last deployment
        local last_deployed=$(cat "$STATE_FILE" 2>/dev/null || echo "")
        if [[ -n "$last_deployed" ]]; then
            commit_messages=$(cd "$SOURCE_DIR" && git log --oneline --no-decorate "$last_deployed..HEAD" 2>/dev/null | head -10 || echo "")
        fi
    fi

    # If no previous deployment or no commits found, show last 5 commits
    if [[ -z "$commit_messages" ]]; then
        commit_messages=$(cd "$SOURCE_DIR" && git log --oneline --no-decorate -5 2>/dev/null || echo "No commit history available")
    fi

    # Try to send email (don't fail deployment if email fails)
    # Try Python script first (works with SMTP), then mail command, then sendmail
    local email_body
    email_body=$(cat <<EOF
Automated Deployment Notification

This is an automated notification from GitOps Lite deployment for the $APP_NAME application.

Deployment Details:
-------------------
• Application: $APP_NAME
• Branch: $BRANCH
• Status: ${status^^}
• Date/Time: $(date '+%B %d, %Y at %I:%M %p %Z')
• Server: $(hostname -s).ag.purdue.edu
• Deployment Path: $DEPLOY_DIR
• Recipients: ${recipients/,/, }

Deployment Summary:
-------------------
$(grep -E '^\[.*\] (✓|❌|⚠️|Building|Installing|Running|Reloading)' "$LOG_FILE" | tail -20)

Recent Commits:
-------------------
$commit_messages

This is an automated message from the Purdue GitOps deployment system.
No action is required unless the deployment failed.

Note: Email notifications are sent only when deployment status changes
or when a new commit is deployed to prevent inbox spam.

For more details, check the full log at: $LOG_FILE
EOF
)

    # Send email to all recipients
    local email_sent=false
    for recipient in ${recipients//,/ }; do
        # Try Python email script first (most reliable with SMTP)
        if [[ -f "$SOURCE_DIR/deployment/send_email.py" ]] && command -v python3 >/dev/null 2>&1; then
            echo "$email_body" | python3 "$SOURCE_DIR/deployment/send_email.py" "$recipient" "$subject" 2>/dev/null && email_sent=true
        # Fall back to mail command
        elif command -v mail >/dev/null 2>&1; then
            echo "$email_body" | mail -s "$subject" "$recipient" 2>/dev/null && email_sent=true
        # Fall back to sendmail
        elif command -v sendmail >/dev/null 2>&1; then
            {
                echo "Subject: $subject"
                echo "From: $EMAIL_FROM"
                echo "To: $recipient"
                echo ""
                echo "$email_body"
            } | sendmail -t 2>/dev/null && email_sent=true
        fi
    done

    # Save email state to prevent spam
    if [[ "$email_sent" == "true" ]]; then
        echo "$status" > "$EMAIL_STATE_FILE"
        echo "$current_commit" >> "$EMAIL_STATE_FILE"
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
# IMPORTANT: Never overwrite .env files in production!
rsync -aq --delete \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.env*' \
    --exclude='media/' \
    --exclude='logs/' \
    --exclude='*.sqlite3' \
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

# Check if production .env exists, create from template if missing on first deploy
if [[ ! -f "$DEPLOY_DIR/.env" ]]; then
    if [[ "$FIRST_TIME_SETUP" == "true" ]] && [[ -f "$SOURCE_DIR/.env.production.example" ]]; then
        log "Creating .env file from template with secure SECRET_KEY..."

        # Generate a secure SECRET_KEY
        # Try Django's method first (now that Django is installed), fall back to other methods
        SECRET_KEY=$("$DEPLOY_DIR/venv/bin/python" -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())" 2>/dev/null || \
                     openssl rand -base64 50 2>/dev/null || \
                     head -c 50 /dev/urandom | base64)

        # Copy template and replace the SECRET_KEY placeholder
        cp "$SOURCE_DIR/.env.production.example" "$DEPLOY_DIR/.env"
        sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" "$DEPLOY_DIR/.env"

        log "✓ Created .env file with auto-generated SECRET_KEY"
        log "⚠️ Review and update other settings in $DEPLOY_DIR/.env as needed"
    else
        log "⚠️ WARNING: No .env file found at $DEPLOY_DIR/.env"
        log "⚠️ Create one from .env.production.example template or deployment will fail!"
    fi
fi

# Ensure required directories exist
# Note: Django's collectstatic will create the static directory
mkdir -p "$DEPLOY_DIR/backend/media"
mkdir -p "$DEPLOY_DIR/backend/logs"
mkdir -p "$DEPLOY_DIR/data"  # For SQLite database

# Frontend deployment
if [ "$BUILD_FRONTEND" = "true" ] && [ -f frontend/package.json ]; then
    # Clean up old frontend build directories (older than 7 days)
    find /tmp -maxdepth 1 -type d -name "frontend-build-$APP_NAME-*" -mtime +7 -exec rm -rf {} + 2>/dev/null || true

    # Create temp build directory with timestamp
    BUILD_TEMP="/tmp/frontend-build-$APP_NAME-$(date +%Y%m%d-%H%M%S)-$$"
    log "Building frontend in temp directory: $BUILD_TEMP"

    # Copy frontend source to temp directory (excluding node_modules if it exists)
    rsync -aq \
        --exclude='node_modules' \
        --exclude='dist' \
        --exclude='.git' \
        frontend/ "$BUILD_TEMP/"

    cd "$BUILD_TEMP"

    # Install dependencies
    log "Installing npm packages..."
    set +e
    npm ci --silent > /tmp/npm-install-$APP_NAME.log 2>&1
    INSTALL_EXIT=$?
    set -e

    if [ $INSTALL_EXIT -ne 0 ]; then
        log "⚠️ npm install failed (see /tmp/npm-install-$APP_NAME.log)"
        rm -rf "$BUILD_TEMP"
        cd "$SOURCE_DIR"
    else
        # Build frontend
        log "Building frontend..."
        set +e
        npm run build --silent > /tmp/npm-build-$APP_NAME.log 2>&1
        BUILD_EXIT=$?
        set -e

        if [ $BUILD_EXIT -eq 0 ]; then
            log "✓ Frontend built successfully"
            # Deploy only the dist directory to the deployment location
            mkdir -p "$DEPLOY_DIR/frontend"
            rsync -aq --delete "$BUILD_TEMP/dist/" "$DEPLOY_DIR/frontend/dist/"
            log "✓ Frontend artifacts deployed"
        else
            log "⚠️ Frontend build failed (exit code: $BUILD_EXIT, see /tmp/npm-build-$APP_NAME.log)"
        fi

        # Clean up temp build directory
        cd "$SOURCE_DIR"
        rm -rf "$BUILD_TEMP"
        log "✓ Cleaned up temp build directory"
    fi
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

# Collect static files (always run to ensure frontend build is collected)
log "Collecting static files..."
set +e
"$DEPLOY_DIR/venv/bin/python" manage.py collectstatic --noinput --clear > /tmp/collectstatic-$APP_NAME.log 2>&1
COLLECT_EXIT=$?
set -e
if [ $COLLECT_EXIT -eq 0 ]; then
    log "✓ Static files collected to $DEPLOY_DIR/backend/static"
else
    log "⚠️ Collectstatic failed (see /tmp/collectstatic-$APP_NAME.log)"
    cat /tmp/collectstatic-$APP_NAME.log | tail -10
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
