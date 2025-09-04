#!/bin/bash

# Auto-deployment script with Git monitoring, testing, and email notifications
# This script checks for Git changes, runs tests, deploys if successful, and sends email summaries

# Configuration
APP_NAME="${APP_NAME:-template}"
APP_DIR="/opt/apps/${APP_NAME}"
DEPLOY_SCRIPT="${APP_DIR}/deployment/deploy.sh"
LOG_FILE="/var/log/${APP_NAME}/auto-deploy.log"
STATE_FILE="/var/run/${APP_NAME}-last-commit.txt"
EMAIL_LIST="${AUTO_DEPLOY_EMAILS:-admin@example.com}"
BRANCH="${AUTO_DEPLOY_BRANCH:-main}"

# Colors for terminal output (won't show in cron, but useful for manual runs)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Send email notification
send_email() {
    local subject="$1"
    local body="$2"
    local priority="${3:-normal}"

    # Add priority indicator to subject if it's an error
    if [ "$priority" = "high" ]; then
        subject="[FAILED] $subject"
    fi

    # Send email using mail command
    echo -e "$body" | mail -s "$subject" $EMAIL_LIST
}

# Generate commit summary using git log and an LLM
generate_commit_summary() {
    local from_commit="$1"
    local to_commit="$2"

    # Get the commit information
    local commits=$(cd "$APP_DIR" && git log --oneline --no-merges ${from_commit}..${to_commit} 2>/dev/null)
    local diff_stat=$(cd "$APP_DIR" && git diff --stat ${from_commit}..${to_commit} 2>/dev/null)
    local authors=$(cd "$APP_DIR" && git log --format='%an' ${from_commit}..${to_commit} | sort -u | tr '\n' ', ' | sed 's/,$//')

    # Create a detailed summary
    cat <<EOF
Deployment Summary for ${APP_NAME}
====================================

Branch: ${BRANCH}
From: ${from_commit:0:8}
To: ${to_commit:0:8}
Authors: ${authors}
Time: $(date '+%Y-%m-%d %H:%M:%S')

Commits Included:
-----------------
${commits}

Files Changed:
--------------
${diff_stat}

Deployment Details:
-------------------
EOF
}

# Run tests
run_tests() {
    log "Running tests..."

    cd "$APP_DIR/backend" || return 1

    # Run Django tests
    if python manage.py test --no-input > /tmp/test-output.txt 2>&1; then
        log "Django tests passed ✓"

        # Run frontend tests if they exist
        if [ -f "$APP_DIR/frontend/package.json" ]; then
            cd "$APP_DIR/frontend"
            if npm test -- --run > /tmp/frontend-test-output.txt 2>&1; then
                log "Frontend tests passed ✓"
                return 0
            else
                log "Frontend tests failed ✗"
                echo "Frontend test output:" >> /tmp/test-output.txt
                cat /tmp/frontend-test-output.txt >> /tmp/test-output.txt
                return 1
            fi
        fi
        return 0
    else
        log "Django tests failed ✗"
        return 1
    fi
}

# Main deployment logic
main() {
    log "Starting auto-deployment check..."

    # Ensure state directory exists
    mkdir -p "$(dirname "$STATE_FILE")"
    mkdir -p "$(dirname "$LOG_FILE")"

    # Change to app directory
    cd "$APP_DIR" || {
        log "Error: Cannot change to app directory $APP_DIR"
        exit 1
    }

    # Fetch latest changes
    log "Fetching latest changes from Git..."
    git fetch origin "$BRANCH" > /dev/null 2>&1 || {
        log "Error: Failed to fetch from Git"
        send_email "Auto-deploy: Git fetch failed" "Failed to fetch latest changes from Git repository.\n\nBranch: $BRANCH\nDirectory: $APP_DIR"
        exit 1
    }

    # Get current and remote commits
    local current_commit=$(git rev-parse HEAD)
    local remote_commit=$(git rev-parse origin/"$BRANCH")

    # Load last deployed commit
    local last_deployed=""
    if [ -f "$STATE_FILE" ]; then
        last_deployed=$(cat "$STATE_FILE")
    fi

    # Check if there are new changes
    if [ "$current_commit" = "$remote_commit" ] && [ "$last_deployed" = "$current_commit" ]; then
        log "No new changes detected. Current: ${current_commit:0:8}"
        exit 0
    fi

    log "New changes detected!"
    log "Current: ${current_commit:0:8}"
    log "Remote: ${remote_commit:0:8}"

    # Pull the latest changes
    log "Pulling latest changes..."
    if ! git pull origin "$BRANCH" > /tmp/git-pull.txt 2>&1; then
        log "Error: Git pull failed"
        send_email "Auto-deploy: Git pull failed" "Failed to pull latest changes.\n\n$(cat /tmp/git-pull.txt)" "high"
        exit 1
    fi

    # Generate initial summary
    local summary=$(generate_commit_summary "$current_commit" "$remote_commit")

    # Run tests
    if run_tests; then
        log "All tests passed, proceeding with deployment..."

        # Run deployment
        log "Running deployment script..."
        if bash "$DEPLOY_SCRIPT" > /tmp/deploy-output.txt 2>&1; then
            log "Deployment successful! ✓"

            # Update state file with new commit
            echo "$remote_commit" > "$STATE_FILE"

            # Send success email
            local email_body="${summary}
Status: SUCCESS ✓

All tests passed and deployment completed successfully.

Deployment Output:
------------------
$(tail -n 20 /tmp/deploy-output.txt)

Server: $(hostname)
Environment: Production
URL: https://${APP_NAME}.ag.purdue.edu/
"
            send_email "Auto-deploy SUCCESS: ${APP_NAME}" "$email_body"

        else
            log "Deployment failed! ✗"

            # Send failure email
            local email_body="${summary}
Status: DEPLOYMENT FAILED ✗

Tests passed but deployment script failed.

Deployment Error Output:
------------------------
$(cat /tmp/deploy-output.txt)

Please check the deployment logs and fix the issues.
Server: $(hostname)
"
            send_email "Auto-deploy FAILED: ${APP_NAME}" "$email_body" "high"
            exit 1
        fi
    else
        log "Tests failed, skipping deployment"

        # Send test failure email
        local email_body="${summary}
Status: TESTS FAILED ✗

The automated tests failed. Deployment was aborted to prevent breaking changes.

Test Output:
------------
$(cat /tmp/test-output.txt | head -n 100)

Please fix the failing tests before the next deployment attempt.
Server: $(hostname)
"
        send_email "Auto-deploy TESTS FAILED: ${APP_NAME}" "$email_body" "high"
        exit 1
    fi

    log "Auto-deployment check completed successfully"
}

# Run main function
main "$@"
