#!/bin/bash

# Deployment script for Django-React template
# Deploys to /opt/apps/template and serves with gunicorn

set -e  # Exit on error

# Load configuration (required)
CONFIG_FILE="${1:-./deploy.conf}"
if [[ ! -f "$CONFIG_FILE" ]]; then
    echo -e "${RED}Error: Configuration file not found at $CONFIG_FILE${NC}"
    echo "Usage: $0 [config_file]"
    echo "Example: $0 /etc/template/deploy.conf"
    echo ""
    echo "Create a config file based on deploy.conf template"
    exit 1
fi

echo "Loading configuration from $CONFIG_FILE"
source "$CONFIG_FILE"

# Derived paths
BACKEND_DIR="${APP_DIR}/backend"
FRONTEND_DIR="${APP_DIR}/frontend"
VENV_DIR="${APP_DIR}/venv"
STATIC_DIR="${APP_DIR}/static"
MEDIA_DIR="${APP_DIR}/media"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment to ${APP_DIR}${NC}"

# Check if running as root (optional - depends on deployment environment)
# Uncomment if root access is required for your setup
# if [[ $EUID -ne 0 ]]; then
#    echo -e "${RED}This script must be run as root${NC}"
#    exit 1
# fi

# Create app directory structure
echo -e "${YELLOW}Creating directory structure...${NC}"
mkdir -p "${APP_DIR}"
mkdir -p "${STATIC_DIR}"
mkdir -p "${MEDIA_DIR}"
mkdir -p "${LOG_DIR}"

# Copy application files
echo -e "${YELLOW}Copying application files...${NC}"
rsync -av --exclude='node_modules' \
          --exclude='__pycache__' \
          --exclude='*.pyc' \
          --exclude='.git' \
          --exclude='.env' \
          --exclude='venv' \
          --exclude='db.sqlite3' \
          --exclude='frontend/dist' \
          --exclude='frontend/build' \
          ./ "${APP_DIR}/"

# Setup Python virtual environment
echo -e "${YELLOW}Setting up Python virtual environment...${NC}"
# Use PYTHON variable from config, default to python3
PYTHON=${PYTHON:-python3}
${PYTHON} -m venv "${VENV_DIR}"
source "${VENV_DIR}/bin/activate"

# Install Python dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
pip install --upgrade pip
# Install from requirements/production.txt directly
if [[ -f "${BACKEND_DIR}/requirements/production.txt" ]]; then
    pip install -r "${BACKEND_DIR}/requirements/production.txt"
elif [[ -f "${BACKEND_DIR}/requirements.txt" ]]; then
    # Fallback for legacy structure
    pip install -r "${BACKEND_DIR}/requirements.txt"
else
    echo -e "${RED}Error: No requirements file found${NC}"
    exit 1
fi
# Gunicorn may already be in production.txt, but ensure it's installed
pip install gunicorn

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
cd "${FRONTEND_DIR}"
npm ci --production=false  # Install all deps for building
npm run build

# Move built frontend to static directory
echo -e "${YELLOW}Moving frontend build to static...${NC}"
cp -r "${FRONTEND_DIR}/dist/"* "${STATIC_DIR}/"

# Setup Django
echo -e "${YELLOW}Setting up Django...${NC}"
cd "${BACKEND_DIR}"

# Set Django to use production settings
export DJANGO_SETTINGS_MODULE=config.settings.production

# Run Django management commands
echo -e "${YELLOW}Running Django migrations...${NC}"
${PYTHON} manage.py migrate --noinput

echo -e "${YELLOW}Collecting static files...${NC}"
${PYTHON} manage.py collectstatic --noinput --clear

# Set proper permissions (if running as root)
if [[ $EUID -eq 0 ]]; then
    echo -e "${YELLOW}Setting permissions...${NC}"
    chown -R "${APP_USER}:${APP_GROUP}" "${APP_DIR}"
    chown -R "${APP_USER}:${APP_GROUP}" "${LOG_DIR}"
    chmod 755 "${APP_DIR}"
    chmod 755 "${STATIC_DIR}"
    chmod 755 "${MEDIA_DIR}"
else
    echo -e "${YELLOW}Skipping permission changes (not running as root)${NC}"
fi

# Generate configurations from templates
echo -e "${YELLOW}Generating configurations from templates...${NC}"
if [[ ! -f "${APP_DIR}/generate-config.sh" ]]; then
    echo -e "${RED}Error: generate-config.sh not found in ${APP_DIR}${NC}"
    exit 1
fi

"${APP_DIR}/generate-config.sh" "$CONFIG_FILE" "${APP_DIR}/config"

# Copy generated configurations
if [[ -f "${APP_DIR}/config/.env" ]]; then
    cp "${APP_DIR}/config/.env" "${BACKEND_DIR}/.env"
    echo -e "${GREEN}✓ Django .env configured${NC}"
fi

if [[ -f "${APP_DIR}/config/gunicorn_config.py" ]]; then
    cp "${APP_DIR}/config/gunicorn_config.py" "${APP_DIR}/gunicorn_config.py"
    echo -e "${GREEN}✓ Gunicorn configured${NC}"
fi

# Install systemd service file if generated
if [[ -f "${APP_DIR}/config/${APP_NAME}.service" ]]; then
    echo -e "${YELLOW}Installing systemd service...${NC}"
    cp "${APP_DIR}/config/${APP_NAME}.service" "/etc/systemd/system/${APP_NAME}.service"
    echo -e "${GREEN}✓ Systemd service installed${NC}"
else
    echo -e "${RED}Error: Systemd service file not generated${NC}"
    exit 1
fi

# Note about nginx configuration
if [[ -f "${APP_DIR}/config/nginx-${APP_NAME}.conf" ]]; then
    echo -e "${GREEN}✓ Nginx configuration ready at: ${APP_DIR}/config/nginx-${APP_NAME}.conf${NC}"
fi

# Reload systemd and start service
echo -e "${YELLOW}Starting service...${NC}"
systemctl daemon-reload
systemctl enable "${APP_NAME}.service"
systemctl restart "${APP_NAME}.service"

# Check service status
sleep 2
if systemctl is-active --quiet "${APP_NAME}.service"; then
    echo -e "${GREEN}✓ Service started successfully${NC}"
else
    echo -e "${RED}✗ Service failed to start. Check logs:${NC}"
    echo -e "${RED}  journalctl -u ${APP_NAME}.service -n 50${NC}"
    exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Install nginx configuration:"
echo "   sudo cp ${APP_DIR}/config/nginx-${APP_NAME}.conf /etc/nginx/sites-available/"
echo "   sudo ln -s /etc/nginx/sites-available/nginx-${APP_NAME}.conf /etc/nginx/sites-enabled/"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo "2. Set up SSL certificates"
echo "3. Set up automated backups:"
echo "   0 2 * * * ${APP_DIR}/config/backup-${APP_NAME}.sh"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  systemctl status ${APP_NAME}"
echo "  systemctl restart ${APP_NAME}"
echo "  journalctl -u ${APP_NAME} -f"
echo "  tail -f ${LOG_DIR}/error.log"
