#!/bin/bash
#
# Test gitops-lite.sh inside a Docker container
#

set -e

echo "=== GitOps Lite Container Test ==="
echo "Testing deployment script in container environment"
echo ""

# Copy source code to test location
cp -r /source /home/deployer/source/django-react-template
cd /home/deployer/source/django-react-template

# Initialize git repo (required for gitops-lite.sh)
git init
git config user.email "test@example.com"
git config user.name "Test User"
git add .
git commit -m "Initial commit" -q

# Create a fake origin to satisfy git fetch
git remote add origin https://github.com/test/test.git
git branch -M main

echo ""
echo "=== Test 1: First-time deployment (should create venv, install deps) ==="
echo ""

# Run deployment with test configuration
GITOPS_BRANCH="main" \
GITOPS_APP_NAME="template" \
GITOPS_SOURCE_DIR="/home/deployer/source/django-react-template" \
GITOPS_DEPLOY_DIR="/opt/apps/template" \
GITOPS_BUILD_FRONTEND="false" \
GITOPS_EMAIL_TO="" \
./deployment/gitops-lite.sh || {
    echo "Note: Some errors expected (no real git remote)"
}

echo ""
echo "=== Checking results ==="
echo ""

# Check what was created
if [[ -d "/opt/apps/template/venv" ]]; then
    echo "✅ Virtual environment created"
    /opt/apps/template/venv/bin/python --version
else
    echo "❌ Virtual environment NOT created"
fi

if [[ -f "/opt/apps/template/venv/bin/gunicorn" ]]; then
    echo "✅ Gunicorn installed"
else
    echo "❌ Gunicorn NOT installed"
fi

if [[ -d "/opt/apps/template/backend" ]]; then
    echo "✅ Backend deployed"
    echo "   Files: $(find /opt/apps/template/backend -name "*.py" | wc -l) Python files"
else
    echo "❌ Backend NOT deployed"
fi

if [[ -d "/opt/apps/template/backend/static" ]]; then
    echo "✅ Static directory created"
else
    echo "❌ Static directory NOT created"
fi

# Check if Django is properly installed
if /opt/apps/template/venv/bin/python -c "import django" 2>/dev/null; then
    echo "✅ Django installed and importable"
else
    echo "❌ Django NOT properly installed"
fi

echo ""
echo "=== Deployment Log ==="
cat /tmp/gitops-lite-template.log 2>/dev/null || echo "No log file"

echo ""
echo "=== Test 2: Second run (should be fast, no changes) ==="
echo ""

# Time the second run
START=$(date +%s)
GITOPS_BRANCH="main" \
GITOPS_APP_NAME="template" \
GITOPS_SOURCE_DIR="/home/deployer/source/django-react-template" \
GITOPS_DEPLOY_DIR="/opt/apps/template" \
GITOPS_BUILD_FRONTEND="false" \
GITOPS_EMAIL_TO="" \
./deployment/gitops-lite.sh || true
END=$(date +%s)

echo ""
echo "Second run took $((END-START)) seconds (should be <2 seconds)"

echo ""
echo "=== Test 3: Simulating changed requirements ==="
echo ""

# Modify requirements to trigger update
echo "pytest==7.4.0" >> backend/requirements/production.txt
git add . && git commit -m "Add pytest" -q

GITOPS_BRANCH="main" \
GITOPS_APP_NAME="template" \
GITOPS_SOURCE_DIR="/home/deployer/source/django-react-template" \
GITOPS_DEPLOY_DIR="/opt/apps/template" \
GITOPS_BUILD_FRONTEND="false" \
GITOPS_EMAIL_TO="" \
./deployment/gitops-lite.sh || true

# Check if pytest was installed
if /opt/apps/template/venv/bin/pip list | grep -q pytest; then
    echo "✅ Requirements update detected and installed (pytest found)"
else
    echo "❌ Requirements update NOT detected"
fi

echo ""
echo "=== All tests complete ==="
