#!/bin/bash

# Deployment script for Django-React template
# Deploys to /opt/apps/template and serves with gunicorn

set -e  # Exit on error

# Load configuration (required)
CONFIG_FILE="${1:-./deployment/configs/deploy.conf}"
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

# Try to create log directory, but don't fail if we can't
if mkdir -p "${LOG_DIR}" 2>/dev/null; then
    echo -e "${GREEN}✓ Log directory created: ${LOG_DIR}${NC}"
else
    echo -e "${YELLOW}⚠ Could not create ${LOG_DIR} (needs root/sudo)${NC}"
    # Use local log directory as fallback
    LOG_DIR="${APP_DIR}/logs"
    mkdir -p "${LOG_DIR}"
    echo -e "${GREEN}✓ Using local log directory: ${LOG_DIR}${NC}"
fi

# Copy application files
echo -e "${YELLOW}Copying application files...${NC}"
rsync -rl --exclude='node_modules' \
          --exclude='__pycache__' \
          --exclude='*.pyc' \
          --exclude='.git' \
          --exclude='.env' \
          --exclude='venv' \
          --exclude='db.sqlite3' \
          --exclude='frontend/dist' \
          --exclude='frontend/build' \
          ./ "${APP_DIR}/"
echo -e "${GREEN}✓ Files copied to ${APP_DIR}${NC}"

# Setup Python virtual environment
echo -e "${YELLOW}Setting up Python virtual environment...${NC}"
# Use PYTHON variable from config, default to python3
PYTHON=${PYTHON:-python3}

# Remove old venv if it exists with wrong Python version
if [[ -f "${VENV_DIR}/bin/python" ]]; then
    VENV_PYTHON_VERSION=$(${VENV_DIR}/bin/python --version 2>&1 | cut -d' ' -f2)
    EXPECTED_PYTHON_VERSION=$(${PYTHON} --version 2>&1 | cut -d' ' -f2)
    if [[ "${VENV_PYTHON_VERSION}" != "${EXPECTED_PYTHON_VERSION}" ]]; then
        echo -e "${YELLOW}Removing old venv (Python ${VENV_PYTHON_VERSION}) to use Python ${EXPECTED_PYTHON_VERSION}${NC}"
        rm -rf "${VENV_DIR}"
    fi
fi

${PYTHON} -m venv "${VENV_DIR}"
source "${VENV_DIR}/bin/activate"

# Install Python dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
pip install --upgrade pip -q
# Install from requirements/production.txt directly
if [[ -f "${BACKEND_DIR}/requirements/production.txt" ]]; then
    echo "Installing from requirements/production.txt..."
    pip install -r "${BACKEND_DIR}/requirements/production.txt" -q --progress-bar off
    echo -e "${GREEN}✓ Python dependencies installed${NC}"
elif [[ -f "${BACKEND_DIR}/requirements.txt" ]]; then
    # Fallback for legacy structure
    echo "Installing from requirements.txt..."
    pip install -r "${BACKEND_DIR}/requirements.txt" -q --progress-bar off
    echo -e "${GREEN}✓ Python dependencies installed${NC}"
else
    echo -e "${RED}Error: No requirements file found${NC}"
    exit 1
fi
# Gunicorn may already be in production.txt, but ensure it's installed
pip install gunicorn -q

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
cd "${FRONTEND_DIR}"
npm ci --production=false --silent  # Install all deps for building
npm run build

# Move built frontend to static directory
echo -e "${YELLOW}Moving frontend build to static...${NC}"
cp -r "${FRONTEND_DIR}/dist/"* "${STATIC_DIR}/"

# Setup Django
echo -e "${YELLOW}Setting up Django...${NC}"
cd "${BACKEND_DIR}"

# Create static directory to avoid Django warning
mkdir -p "${BACKEND_DIR}/static"

# Ensure virtual environment is active
source "${VENV_DIR}/bin/activate"

# Set Django to use production settings
export DJANGO_SETTINGS_MODULE=config.settings.production

# Run Django management commands
echo -e "${YELLOW}Running Django migrations...${NC}"
python manage.py migrate --noinput --verbosity 1

echo -e "${YELLOW}Collecting static files...${NC}"
python manage.py collectstatic --noinput --clear --verbosity 0
echo -e "${GREEN}✓ Static files collected${NC}"

# Set proper permissions (if running as root)
if [[ $EUID -eq 0 ]]; then
    echo -e "${YELLOW}Setting permissions...${NC}"
    chown -R "${APP_USER}:${APP_GROUP}" "${APP_DIR}"
    if [[ -w "${LOG_DIR}" ]]; then
        chown -R "${APP_USER}:${APP_GROUP}" "${LOG_DIR}"
    fi
    chmod 755 "${APP_DIR}"
    chmod 755 "${STATIC_DIR}"
    chmod 755 "${MEDIA_DIR}"
else
    echo -e "${YELLOW}Skipping permission changes (not running as root)${NC}"
fi

# Generate configurations from templates (optional)
if [[ -f "${APP_DIR}/generate-config.sh" ]]; then
    echo -e "${YELLOW}Generating configurations from templates...${NC}"
    # Get absolute path of config file
    CONFIG_FILE_ABS=$(readlink -f "$CONFIG_FILE")
    if [[ -f "$CONFIG_FILE_ABS" ]]; then
        "${APP_DIR}/generate-config.sh" "$CONFIG_FILE_ABS" "${APP_DIR}/config"
    else
        echo -e "${YELLOW}⚠ Config file not found at ${CONFIG_FILE_ABS}, skipping config generation${NC}"
    fi
else
    echo -e "${YELLOW}⚠ generate-config.sh not found, skipping config generation${NC}"
fi

# Copy generated configurations
if [[ -f "${APP_DIR}/config/.env" ]]; then
    cp "${APP_DIR}/config/.env" "${BACKEND_DIR}/.env"
    echo -e "${GREEN}✓ Django .env configured${NC}"
fi

if [[ -f "${APP_DIR}/config/gunicorn_config.py" ]]; then
    cp "${APP_DIR}/config/gunicorn_config.py" "${APP_DIR}/gunicorn_config.py"
    echo -e "${GREEN}✓ Gunicorn configured${NC}"
fi

# Install systemd service file if generated and running as root
if [[ -f "${APP_DIR}/config/${APP_NAME}.service" ]]; then
    if [[ $EUID -eq 0 ]]; then
        echo -e "${YELLOW}Installing systemd service...${NC}"
        cp "${APP_DIR}/config/${APP_NAME}.service" "/etc/systemd/system/${APP_NAME}.service"
        echo -e "${GREEN}✓ Systemd service installed${NC}"

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
        fi
    else
        echo -e "${YELLOW}⚠ Systemd service file generated but requires root to install${NC}"
        echo -e "${YELLOW}  Service file: ${APP_DIR}/config/${APP_NAME}.service${NC}"
    fi
fi

# Note about nginx configuration
if [[ -f "${APP_DIR}/config/nginx-${APP_NAME}.conf" ]]; then
    echo -e "${GREEN}✓ Nginx configuration ready at: ${APP_DIR}/config/nginx-${APP_NAME}.conf${NC}"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Test the application:"
echo "   cd ${BACKEND_DIR} && source ../venv/bin/activate"
echo "   DJANGO_SETTINGS_MODULE=config.settings.production SECURE_SSL_REDIRECT=False python manage.py runserver 0.0.0.0:8000"
echo "   # Then test: curl http://localhost:8000/api/health/"
echo "2. Generate service configurations (if needed):"
echo "   cd ${APP_DIR}"
echo "   ./generate-config.sh ./deploy.conf ./config"
echo "3. Install nginx configuration (if generated):"
echo "   sudo cp ${APP_DIR}/config/nginx-${APP_NAME}.conf /etc/nginx/sites-available/"
echo "   sudo ln -s /etc/nginx/sites-available/nginx-${APP_NAME}.conf /etc/nginx/sites-enabled/"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo "4. Set up SSL certificates"
echo "5. Set up automated backups:"
echo "   0 2 * * * ${APP_DIR}/config/backup-${APP_NAME}.sh"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  systemctl status ${APP_NAME}"
echo "  systemctl restart ${APP_NAME}"
echo "  journalctl -u ${APP_NAME} -f"
echo "  tail -f ${LOG_DIR}/error.log"
echo ""
echo -e "${YELLOW}For socket activation (preferred):${NC}"
echo "  sudo cp ${APP_NAME}.socket ${APP_NAME}.service /etc/systemd/system/"
echo "  sudo systemctl daemon-reload"
echo "  sudo systemctl enable --now ${APP_NAME}.socket"
