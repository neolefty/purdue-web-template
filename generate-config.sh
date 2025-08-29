#!/bin/bash

# Configuration generator script
# Generates nginx, gunicorn, systemd, and Django configs from templates

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default paths
CONFIG_FILE="${1:-/etc/template/deploy.conf}"
OUTPUT_DIR="${2:-/etc/template/generated}"

# Usage function
usage() {
    echo "Usage: $0 [config_file] [output_dir]"
    echo "  config_file: Path to deploy.conf (default: /etc/template/deploy.conf)"
    echo "  output_dir:  Directory for generated configs (default: /etc/template/generated)"
    echo ""
    echo "Example: $0 ./deploy.conf ./generated"
    exit 1
}

# Check if config file exists
if [[ ! -f "$CONFIG_FILE" ]]; then
    echo -e "${RED}Error: Configuration file not found: $CONFIG_FILE${NC}"
    echo ""
    usage
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo -e "${BLUE}Loading configuration from: $CONFIG_FILE${NC}"

# Source the configuration file
source "$CONFIG_FILE"

# Validate required variables
REQUIRED_VARS=(
    "APP_NAME"
    "APP_DIR"
    "SERVER_NAME"
    "SSL_CERT"
    "SSL_KEY"
    "SOCKET_PATH"
)

echo -e "${YELLOW}Validating configuration...${NC}"
MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [[ -z "${!var}" ]]; then
        MISSING_VARS+=("$var")
    fi
done

if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
    echo -e "${RED}Error: Missing required variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo -e "${RED}  - $var${NC}"
    done
    exit 1
fi

# Function to replace variables in template
replace_vars() {
    local template="$1"
    local output="$2"

    cp "$template" "$output"

    # Replace all variables from config file
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ "$key" =~ ^#.*$ ]] && continue
        [[ -z "$key" ]] && continue

        # Remove quotes from value
        value="${value%\"}"
        value="${value#\"}"

        # Escape special characters for sed
        escaped_value=$(printf '%s\n' "$value" | sed 's/[[\.*^$()+?{|]/\\&/g')

        # Replace in output file
        sed -i "s|\${${key}}|${escaped_value}|g" "$output"
    done < "$CONFIG_FILE"
}

# Generate nginx configuration
echo -e "${YELLOW}Generating nginx configuration...${NC}"

# Check if using path-based routing
if [[ -n "${URL_PREFIX}" ]]; then
    # Path-based routing configuration
    if [[ -f "nginx-pathbased.conf.template" ]]; then
        NGINX_OUTPUT="$OUTPUT_DIR/nginx-${APP_NAME}-locations.conf"
        replace_vars "nginx-pathbased.conf.template" "$NGINX_OUTPUT"
        echo -e "${GREEN}✓ Nginx path-based config generated: $NGINX_OUTPUT${NC}"
        echo -e "${YELLOW}  Include this in your server block or copy locations manually${NC}"
    else
        echo -e "${RED}Warning: nginx-pathbased.conf.template not found${NC}"
    fi
else
    # Standard full domain configuration
    if [[ -f "nginx.conf.template" ]]; then
        NGINX_OUTPUT="$OUTPUT_DIR/nginx-${APP_NAME}.conf"
        replace_vars "nginx.conf.template" "$NGINX_OUTPUT"
        echo -e "${GREEN}✓ Nginx config generated: $NGINX_OUTPUT${NC}"
    else
        echo -e "${RED}Warning: nginx.conf.template not found${NC}"
    fi
fi

# Generate .env file for Django
echo -e "${YELLOW}Generating Django .env file...${NC}"
ENV_OUTPUT="$OUTPUT_DIR/.env"
cat > "$ENV_OUTPUT" << EOF
# Generated Django environment file
# Generated on: $(date)

# Django Settings
SECRET_KEY=${DJANGO_SECRET_KEY:-$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())' 2>/dev/null || echo 'CHANGE_ME_TO_A_RANDOM_SECRET_KEY')}
DEBUG=${DJANGO_DEBUG:-False}
ALLOWED_HOSTS=${DJANGO_ALLOWED_HOSTS:-${SERVER_NAME},localhost,127.0.0.1}

# Path-based routing (if applicable)
EOF

if [[ -n "${URL_PREFIX}" ]]; then
    cat >> "$ENV_OUTPUT" << EOF
FORCE_SCRIPT_NAME=${DJANGO_FORCE_SCRIPT_NAME:-${URL_PREFIX}}
STATIC_URL=${DJANGO_STATIC_URL:-${URL_PREFIX}/static/}
MEDIA_URL=${DJANGO_MEDIA_URL:-${URL_PREFIX}/media/}
LOGIN_URL=${DJANGO_LOGIN_URL:-${URL_PREFIX}/login/}
LOGIN_REDIRECT_URL=${DJANGO_LOGIN_REDIRECT_URL:-${URL_PREFIX}/}
EOF
fi

cat >> "$ENV_OUTPUT" << EOF

# Database
DATABASE_ENGINE=${DB_ENGINE:-postgresql}
DATABASE_NAME=${DB_NAME:-template_db}
DATABASE_USER=${DB_USER:-template_user}
DATABASE_PASSWORD=${DB_PASSWORD}
DATABASE_HOST=${DB_HOST:-localhost}
DATABASE_PORT=${DB_PORT:-5432}

# Authentication
AUTH_METHOD=${AUTH_METHOD:-saml}

# SAML Configuration (if using SSO)
SAML_SP_ENTITY_ID=${SAML_SP_ENTITY_ID:-https://${SERVER_NAME}}
SAML_SP_ACS_URL=${SAML_SP_ACS_URL:-https://${SERVER_NAME}/api/auth/saml/acs/}
SAML_SP_SLS_URL=${SAML_SP_SLS_URL:-https://${SERVER_NAME}/api/auth/saml/sls/}

# Email Configuration
EMAIL_HOST=${EMAIL_HOST:-smtp.purdue.edu}
EMAIL_PORT=${EMAIL_PORT:-587}
EMAIL_USE_TLS=${EMAIL_USE_TLS:-True}
EMAIL_HOST_USER=${EMAIL_HOST_USER}
EMAIL_HOST_PASSWORD=${EMAIL_HOST_PASSWORD}
DEFAULT_FROM_EMAIL=${DEFAULT_FROM_EMAIL:-noreply@${SERVER_NAME}}

# CORS
CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS:-https://${SERVER_NAME}}

# Static Files
STATIC_ROOT=${APP_DIR}/static
MEDIA_ROOT=${APP_DIR}/media

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True

# Frontend Configuration (for build time)
REACT_APP_API_BASE=${REACT_APP_API_BASE:-/api}
REACT_APP_BASENAME=${REACT_APP_BASENAME:-/}
EOF

echo -e "${GREEN}✓ Django .env generated: $ENV_OUTPUT${NC}"

# Generate gunicorn configuration
echo -e "${YELLOW}Generating gunicorn configuration...${NC}"
if [[ -f "gunicorn.conf.template" ]]; then
    GUNICORN_OUTPUT="$OUTPUT_DIR/gunicorn_config.py"

    # Set defaults for optional variables
    export GUNICORN_WORKERS="${GUNICORN_WORKERS:-$(( $(nproc) * 2 + 1 ))}"
    export GUNICORN_WORKER_CLASS="${GUNICORN_WORKER_CLASS:-sync}"
    export GUNICORN_THREADS="${GUNICORN_THREADS:-1}"
    export GUNICORN_WORKER_CONNECTIONS="${GUNICORN_WORKER_CONNECTIONS:-1000}"
    export GUNICORN_TIMEOUT="${GUNICORN_TIMEOUT:-30}"
    export GUNICORN_KEEPALIVE="${GUNICORN_KEEPALIVE:-2}"
    export GUNICORN_MAX_REQUESTS="${GUNICORN_MAX_REQUESTS:-1000}"
    export GUNICORN_MAX_REQUESTS_JITTER="${GUNICORN_MAX_REQUESTS_JITTER:-50}"
    export GUNICORN_BACKLOG="${GUNICORN_BACKLOG:-2048}"
    export GUNICORN_LOG_LEVEL="${GUNICORN_LOG_LEVEL:-info}"
    export GUNICORN_CAPTURE_OUTPUT="${GUNICORN_CAPTURE_OUTPUT:-False}"
    export GUNICORN_PRELOAD="${GUNICORN_PRELOAD:-False}"
    export GUNICORN_RELOAD="${GUNICORN_RELOAD:-False}"
    export GUNICORN_LIMIT_REQUEST_LINE="${GUNICORN_LIMIT_REQUEST_LINE:-4094}"
    export GUNICORN_LIMIT_REQUEST_FIELDS="${GUNICORN_LIMIT_REQUEST_FIELDS:-100}"
    export GUNICORN_LIMIT_REQUEST_FIELD_SIZE="${GUNICORN_LIMIT_REQUEST_FIELD_SIZE:-8190}"

    replace_vars "gunicorn.conf.template" "$GUNICORN_OUTPUT"
    echo -e "${GREEN}✓ Gunicorn config generated: $GUNICORN_OUTPUT${NC}"
else
    echo -e "${RED}Warning: gunicorn.conf.template not found${NC}"
fi

# Generate systemd files
echo -e "${YELLOW}Generating systemd configuration...${NC}"

# Check if using socket activation (path-based routing typically uses this)
if [[ -n "${URL_PREFIX}" ]]; then
    # Generate socket file
    if [[ -f "systemd-socket.template" ]]; then
        SOCKET_OUTPUT="$OUTPUT_DIR/${APP_NAME}.socket"
        replace_vars "systemd-socket.template" "$SOCKET_OUTPUT"
        echo -e "${GREEN}✓ Systemd socket generated: $SOCKET_OUTPUT${NC}"
    fi

    # Generate service file for socket activation
    if [[ -f "systemd-service-socket.template" ]]; then
        SERVICE_OUTPUT="$OUTPUT_DIR/${APP_NAME}.service"
        replace_vars "systemd-service-socket.template" "$SERVICE_OUTPUT"
        echo -e "${GREEN}✓ Systemd service (socket activation) generated: $SERVICE_OUTPUT${NC}"
    fi
else
    # Standard systemd service (no socket activation)
    SYSTEMD_OUTPUT="$OUTPUT_DIR/${APP_NAME}.service"
    cat > "$SYSTEMD_OUTPUT" << EOF
[Unit]
Description=${APP_NAME} Django Application
After=network.target postgresql.service mysql.service
Wants=network-online.target

[Service]
Type=notify
User=${APP_USER}
Group=${APP_GROUP}
WorkingDirectory=${APP_DIR}/backend
Environment="PATH=${APP_DIR}/venv/bin"
Environment="PYTHONPATH=${APP_DIR}/backend"
ExecStart=${APP_DIR}/venv/bin/gunicorn \\
    --config ${APP_DIR}/gunicorn_config.py \\
    --error-logfile ${LOG_DIR}/error.log \\
    --access-logfile ${LOG_DIR}/access.log \\
    core.wsgi:application

ExecReload=/bin/kill -s HUP \$MAINPID
ExecStop=/bin/kill -s TERM \$MAINPID
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

# Security
PrivateTmp=true
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=${APP_DIR} ${LOG_DIR} /var/run

[Install]
WantedBy=multi-user.target
EOF
    echo -e "${GREEN}✓ Systemd service generated: $SYSTEMD_OUTPUT${NC}"
fi

# Generate backup script
echo -e "${YELLOW}Generating backup script...${NC}"
BACKUP_OUTPUT="$OUTPUT_DIR/backup-${APP_NAME}.sh"
cat > "$BACKUP_OUTPUT" << 'EOF_BACKUP'
#!/bin/bash

# Backup script for ${APP_NAME}
# Generated on: $(date)

set -e

# Configuration
APP_NAME="${APP_NAME}"
APP_DIR="${APP_DIR}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/${APP_NAME}}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="${APP_NAME}_backup_${TIMESTAMP}"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

echo "Starting backup of ${APP_NAME}..."

# Backup database
if [[ "${DB_ENGINE}" == "postgresql" ]]; then
    echo "Backing up PostgreSQL database..."
    PGPASSWORD="${DB_PASSWORD}" pg_dump \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        -f "${BACKUP_DIR}/${BACKUP_NAME}.sql"
    gzip "${BACKUP_DIR}/${BACKUP_NAME}.sql"
elif [[ "${DB_ENGINE}" == "mysql" ]]; then
    echo "Backing up MySQL database..."
    mysqldump \
        -h "${DB_HOST}" \
        -P "${DB_PORT}" \
        -u "${DB_USER}" \
        -p"${DB_PASSWORD}" \
        "${DB_NAME}" \
        | gzip > "${BACKUP_DIR}/${BACKUP_NAME}.sql.gz"
fi

# Backup media files
if [[ -d "${APP_DIR}/media" ]]; then
    echo "Backing up media files..."
    tar -czf "${BACKUP_DIR}/${BACKUP_NAME}_media.tar.gz" -C "${APP_DIR}" media/
fi

# Backup configuration
echo "Backing up configuration..."
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}_config.tar.gz" \
    "${APP_DIR}/backend/.env" \
    "${APP_DIR}/gunicorn_config.py" \
    2>/dev/null || true

# Remove old backups
echo "Removing backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "${APP_NAME}_backup_*" -mtime +${RETENTION_DAYS} -delete

echo "Backup completed: ${BACKUP_DIR}/${BACKUP_NAME}"

# Optional: Send notification
# mail -s "Backup completed: ${APP_NAME}" ${ALERT_EMAIL} < /dev/null
EOF_BACKUP

# Replace variables in backup script
sed -i "s/\${APP_NAME}/${APP_NAME}/g" "$BACKUP_OUTPUT"
sed -i "s/\${APP_DIR}/${APP_DIR//\//\\/}/g" "$BACKUP_OUTPUT"
sed -i "s/\${BACKUP_DIR}/${BACKUP_DIR//\//\\/}/g" "$BACKUP_OUTPUT"
sed -i "s/\${BACKUP_RETENTION_DAYS}/${BACKUP_RETENTION_DAYS}/g" "$BACKUP_OUTPUT"
sed -i "s/\${DB_ENGINE}/${DB_ENGINE}/g" "$BACKUP_OUTPUT"
sed -i "s/\${DB_HOST}/${DB_HOST}/g" "$BACKUP_OUTPUT"
sed -i "s/\${DB_PORT}/${DB_PORT}/g" "$BACKUP_OUTPUT"
sed -i "s/\${DB_USER}/${DB_USER}/g" "$BACKUP_OUTPUT"
sed -i "s/\${DB_NAME}/${DB_NAME}/g" "$BACKUP_OUTPUT"
sed -i "s/\${ALERT_EMAIL}/${ALERT_EMAIL}/g" "$BACKUP_OUTPUT"

chmod +x "$BACKUP_OUTPUT"
echo -e "${GREEN}✓ Backup script generated: $BACKUP_OUTPUT${NC}"

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Configuration generation completed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Generated files in ${OUTPUT_DIR}:${NC}"
echo "  • nginx-${APP_NAME}.conf    - Nginx configuration"
echo "  • .env                      - Django environment file"
echo "  • gunicorn_config.py        - Gunicorn configuration"
echo "  • ${APP_NAME}.service       - Systemd service file"
echo "  • backup-${APP_NAME}.sh     - Backup script"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review and adjust generated configurations"
echo "2. Copy nginx config: sudo cp ${OUTPUT_DIR}/nginx-${APP_NAME}.conf /etc/nginx/sites-available/"
echo "3. Enable nginx site: sudo ln -s /etc/nginx/sites-available/nginx-${APP_NAME}.conf /etc/nginx/sites-enabled/"
echo "4. Copy systemd service: sudo cp ${OUTPUT_DIR}/${APP_NAME}.service /etc/systemd/system/"
echo "5. Copy .env to application: sudo cp ${OUTPUT_DIR}/.env ${APP_DIR}/backend/"
echo "6. Test nginx config: sudo nginx -t"
echo "7. Reload services: sudo systemctl daemon-reload && sudo nginx -s reload"
echo ""
echo -e "${YELLOW}For automated backups, add to crontab:${NC}"
echo "0 2 * * * ${OUTPUT_DIR}/backup-${APP_NAME}.sh"
