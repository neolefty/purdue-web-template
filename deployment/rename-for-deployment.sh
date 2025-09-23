#!/bin/bash
#
# Prepare deployment files when forking django-react-template
# This script renames deployment files and updates paths for your new app name
#
# Usage: ./deployment/rename-for-deployment.sh [app-name]
#
# This will modify files but NOT commit them, allowing you to review changes

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get app name from argument or prompt
if [ $# -eq 0 ]; then
    echo "What is your app called? (e.g., lab-inventory, research-portal)"
    echo "Use lowercase with hyphens, no spaces:"
    read -r APP_NAME
else
    APP_NAME="$1"
fi

# Validate app name
if [[ ! "$APP_NAME" =~ ^[a-z][a-z0-9-]*$ ]]; then
    echo -e "${RED}Error: App name must start with a letter and contain only lowercase letters, numbers, and hyphens${NC}"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "deployment/gitops-lite.sh" ]; then
    echo -e "${RED}Error: Run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${GREEN}Preparing deployment files for: ${APP_NAME}${NC}"
echo ""

# Track what we're changing
CHANGES_MADE=false

# 1. Rename systemd service files
echo "📝 Renaming systemd service files..."
cd deployment/systemd

for file in template*.service template*.socket; do
    if [ -f "$file" ]; then
        NEW_NAME="${file//template/$APP_NAME}"
        if [ "$file" != "$NEW_NAME" ]; then
            git mv "$file" "$NEW_NAME" 2>/dev/null || mv "$file" "$NEW_NAME"
            echo "   ✓ Renamed $file → $NEW_NAME"
            CHANGES_MADE=true
        fi
    fi
done

# 2. Update paths inside systemd files
echo "📝 Updating paths in systemd files..."
for file in *.service *.socket; do
    if [ -f "$file" ]; then
        # Check if file needs updates
        if grep -q "template" "$file" 2>/dev/null; then
            # Use sed to replace template references
            sed -i.bak \
                -e "s|/opt/apps/template|/opt/apps/$APP_NAME|g" \
                -e "s|template\.socket|${APP_NAME}.socket|g" \
                -e "s|template\.sock|${APP_NAME}.sock|g" \
                -e "s|/run/template|/run/$APP_NAME|g" \
                "$file"

            # Check if changes were actually made
            if ! diff -q "$file" "$file.bak" > /dev/null 2>&1; then
                echo "   ✓ Updated paths in $file"
                CHANGES_MADE=true
            fi
            rm -f "$file.bak"
        fi
    fi
done

cd ../..

# 3. Update .env.production.example
echo "📝 Updating .env.production.example..."
if [ -f ".env.production.example" ]; then
    sed -i.bak \
        -e "s|django-react-template|$APP_NAME|g" \
        -e "s|/opt/apps/template|/opt/apps/$APP_NAME|g" \
        -e "s|# Production environment settings for .*|# Production environment settings for $APP_NAME|" \
        ".env.production.example"

    if ! diff -q ".env.production.example" ".env.production.example.bak" > /dev/null 2>&1; then
        echo "   ✓ Updated .env.production.example"
        CHANGES_MADE=true
    fi
    rm -f ".env.production.example.bak"
fi

# 4. Update gitops-lite.sh defaults
echo "📝 Updating deployment script defaults..."
if [ -f "deployment/gitops-lite.sh" ]; then
    sed -i.bak \
        -e "s|APP_NAME=\"\${GITOPS_APP_NAME:-template}\"|APP_NAME=\"\${GITOPS_APP_NAME:-$APP_NAME}\"|" \
        -e "s|SOURCE_DIR=\"\${GITOPS_SOURCE_DIR:-\$HOME/source/django-react-template}\"|SOURCE_DIR=\"\${GITOPS_SOURCE_DIR:-\$HOME/source/$APP_NAME}\"|" \
        "deployment/gitops-lite.sh"

    if ! diff -q "deployment/gitops-lite.sh" "deployment/gitops-lite.sh.bak" > /dev/null 2>&1; then
        echo "   ✓ Updated gitops-lite.sh defaults"
        CHANGES_MADE=true
    fi
    rm -f "deployment/gitops-lite.sh.bak"
fi

# 5. Create a deployment info file
echo "📝 Creating deployment info file..."
cat > "deployment/DEPLOYMENT-RENAMED.md" << EOF
# Deployment Files Renamed for: $APP_NAME

This file was created by rename-for-deployment.sh on $(date)

## Changes Made

The following deployment files have been customized for "$APP_NAME":

### Systemd Service Files
- Renamed from template.* to ${APP_NAME}.*
- Updated paths from /opt/apps/template to /opt/apps/$APP_NAME
- Updated socket references

### Environment Configuration
- Updated .env.production.example with correct paths and domain placeholder

### Deployment Scripts
- Updated default app name in gitops-lite.sh

## Next Steps

1. **Review the changes:**
   \`\`\`bash
   git status
   git diff
   \`\`\`

2. **Commit when ready:**
   \`\`\`bash
   git add deployment/
   git add .env.production.example
   git commit -m "Customize deployment files for $APP_NAME"
   \`\`\`

3. **For deployment:**
   - Share your repository with your sysadmin
   - Let them know the app is called "$APP_NAME"
   - They'll use the files in deployment/systemd/ for service setup

## Note for Sysadmins

The systemd service files have been pre-configured for:
- App name: $APP_NAME
- Default path: /opt/apps/$APP_NAME
- Service name: ${APP_NAME}.service
- Socket name: ${APP_NAME}.socket

Adjust paths as needed for your infrastructure.
EOF

echo "   ✓ Created deployment/DEPLOYMENT-RENAMED.md"

echo ""
echo "========================================="
echo ""

if [ "$CHANGES_MADE" = true ]; then
    echo -e "${GREEN}✅ Deployment files prepared successfully!${NC}"
    echo ""
    echo "Changes made (but not committed):"
    git status --short 2>/dev/null | grep -E "deployment/|\.env\.production\.example" || true
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Review the changes:  git diff"
    echo "2. Commit when ready:   git add . && git commit -m \"Customize deployment for $APP_NAME\""
    echo "3. See deployment/DEPLOYMENT-RENAMED.md for deployment instructions"
else
    echo -e "${YELLOW}ℹ️  No changes needed - files may have already been renamed${NC}"
fi

echo ""
echo "When ready to deploy, share your repository with your sysadmin"
echo "and let them know your app is called: $APP_NAME"
