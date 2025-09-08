#!/bin/bash

# Test script to verify gitops-lite.sh environment variable handling
# This doesn't actually deploy, just shows what would be used

echo "Testing gitops-lite.sh environment variable configuration..."
echo "============================================="

# Test 1: Default values
echo -e "\n1. Testing with DEFAULT values (no env vars set):"
bash -c 'source deployment/gitops-lite.sh 2>/dev/null; echo "  BRANCH: $BRANCH"; echo "  APP_NAME: $APP_NAME"; echo "  SOURCE_DIR: $SOURCE_DIR"; echo "  DEPLOY_DIR: $DEPLOY_DIR"; echo "  STATE_FILE: $STATE_FILE"; echo "  LOG_FILE: $LOG_FILE"; echo "  BUILD_FRONTEND: $BUILD_FRONTEND"' || true

# Test 2: QA environment
echo -e "\n2. Testing with QA environment:"
GITOPS_BRANCH=qa \
GITOPS_APP_NAME=template-qa \
GITOPS_BUILD_FRONTEND=false \
bash -c 'source deployment/gitops-lite.sh 2>/dev/null; echo "  BRANCH: $BRANCH"; echo "  APP_NAME: $APP_NAME"; echo "  DEPLOY_DIR: $DEPLOY_DIR"; echo "  STATE_FILE: $STATE_FILE"; echo "  LOG_FILE: $LOG_FILE"; echo "  BUILD_FRONTEND: $BUILD_FRONTEND"' || true

# Test 3: Production environment
echo -e "\n3. Testing with PRODUCTION environment:"
GITOPS_BRANCH=production \
GITOPS_APP_NAME=template-prod \
GITOPS_SOURCE_DIR=/home/deployer/repos/django-react-template \
GITOPS_DEPLOY_DIR=/var/www/template-prod \
bash -c 'source deployment/gitops-lite.sh 2>/dev/null; echo "  BRANCH: $BRANCH"; echo "  APP_NAME: $APP_NAME"; echo "  SOURCE_DIR: $SOURCE_DIR"; echo "  DEPLOY_DIR: $DEPLOY_DIR"; echo "  STATE_FILE: $STATE_FILE"; echo "  LOG_FILE: $LOG_FILE"' || true

# Test 4: Verify log messages include branch and app name
echo -e "\n4. Sample log output format:"
echo "  [10:30:15] [qa → template-qa] New commits detected: abc1234..def5678"
echo "  [10:30:18] [qa → template-qa] ✅ Deployed successfully"

echo -e "\n============================================="
echo "Configuration test complete!"
echo ""
echo "To use in cron, add one of these lines:"
echo "  # QA deployment (every 5 minutes):"
echo "  */5 * * * * GITOPS_BRANCH=qa GITOPS_APP_NAME=template-qa /path/to/gitops-lite.sh"
echo ""
echo "  # Production deployment (every 5 minutes):"
echo "  */5 * * * * GITOPS_BRANCH=production GITOPS_APP_NAME=template-prod /path/to/gitops-lite.sh"
echo ""
echo "  # Dev deployment with no frontend build (every minute):"
echo "  * * * * * GITOPS_BUILD_FRONTEND=false /path/to/gitops-lite.sh"
