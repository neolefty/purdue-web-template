#!/bin/bash
#
# Test script for gitops-lite.sh - simulates deployment locally
#

set -e

echo "=== GitOps Lite Local Test ==="
echo "This will test the deployment script in /tmp/gitops-test"
echo ""

# Test configuration
TEST_DIR="/tmp/gitops-test"
TEST_DEPLOY_DIR="$TEST_DIR/deploy"
TEST_SOURCE_DIR="$(pwd)"  # Current repo

# Clean up any previous test
if [[ -d "$TEST_DIR" ]]; then
    echo "Cleaning up previous test directory..."
    rm -rf "$TEST_DIR"
fi

echo "Creating test environment..."
mkdir -p "$TEST_DIR"

# Create a test git repo (simulating the source)
echo "Setting up test git repository..."
cp -r . "$TEST_DIR/source" 2>/dev/null || true
cd "$TEST_DIR/source"
git init -q 2>/dev/null || true
git add . 2>/dev/null || true
git commit -m "Test commit" -q 2>/dev/null || true

echo ""
echo "Running gitops-lite.sh with test configuration..."
echo "================================================"
echo "Deploy directory: $TEST_DEPLOY_DIR"
echo "Source directory: $TEST_DIR/source"
echo ""

# Create a test requirements file to avoid MySQL dependencies
echo "# Test requirements (SQLite only)
Django==5.1.1
djangorestframework==3.15.2
django-cors-headers==4.4.0
python-decouple==3.8
gunicorn==23.0.0
python-dateutil==2.9.0" > "$TEST_DIR/source/backend/requirements/production.txt"

# Run the deployment script with test configuration
GITOPS_BRANCH="main" \
GITOPS_APP_NAME="test-app" \
GITOPS_SOURCE_DIR="$TEST_DIR/source" \
GITOPS_DEPLOY_DIR="$TEST_DEPLOY_DIR" \
GITOPS_BUILD_FRONTEND="false" \
GITOPS_EMAIL_TO="" \
GITOPS_PYTHON="python3" \
bash "$TEST_DIR/source/deployment/gitops-lite.sh"

echo ""
echo "=== Test Results ==="
echo ""

# Check what was created
echo "Checking created structure..."
if [[ -d "$TEST_DEPLOY_DIR/venv" ]]; then
    echo "✅ Python virtual environment created"
    echo "   Python version: $($TEST_DEPLOY_DIR/venv/bin/python --version)"
else
    echo "❌ Virtual environment NOT created"
fi

if [[ -d "$TEST_DEPLOY_DIR/backend" ]]; then
    echo "✅ Backend files deployed"
    file_count=$(find "$TEST_DEPLOY_DIR/backend" -name "*.py" | wc -l)
    echo "   Python files: $file_count"
else
    echo "❌ Backend NOT deployed"
fi

if [[ -f "$TEST_DEPLOY_DIR/venv/bin/gunicorn" ]]; then
    echo "✅ Gunicorn installed"
else
    echo "❌ Gunicorn NOT installed"
fi

if [[ -d "$TEST_DEPLOY_DIR/backend/static" ]]; then
    echo "✅ Static directory created"
else
    echo "❌ Static directory NOT created"
fi

# Check log file
LOG_FILE="/tmp/gitops-lite-test-app.log"
if [[ -f "$LOG_FILE" ]]; then
    echo ""
    echo "=== Deployment Log ==="
    cat "$LOG_FILE"
else
    echo "❌ No log file found"
fi

# Check state file
STATE_FILE="/tmp/gitops-lite-state-test-app"
if [[ -f "$STATE_FILE" ]]; then
    echo ""
    echo "=== State File ==="
    echo "Last deployed commit: $(cat $STATE_FILE)"
fi

echo ""
echo "=== Test Complete ==="
echo ""
echo "Test deployment directory: $TEST_DEPLOY_DIR"
echo "You can inspect it manually if needed."
echo ""
echo "To clean up, run: rm -rf $TEST_DIR"
echo ""

# Test idempotency - run again and it should be much faster
echo "=== Testing Idempotency (running again - should be fast) ==="
time GITOPS_BRANCH="main" \
GITOPS_APP_NAME="test-app" \
GITOPS_SOURCE_DIR="$TEST_DIR/source" \
GITOPS_DEPLOY_DIR="$TEST_DEPLOY_DIR" \
GITOPS_BUILD_FRONTEND="false" \
GITOPS_EMAIL_TO="" \
bash "$TEST_DIR/source/deployment/gitops-lite.sh"

echo ""
echo "Second run should have been much faster (no changes to deploy)."
