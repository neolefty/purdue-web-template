#!/bin/bash

# Script to set up multiple environments (dev, qa, prod)
# for django-template on *.ag.purdue.edu

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

# Base configuration
BASE_NAME="django-template"
ENVIRONMENTS=("dev" "qa" "prod")
DOMAIN="ag.purdue.edu"

echo -e "${BLUE}Setting up Django Template environments${NC}"
echo -e "${BLUE}=====================================>${NC}"

for ENV in "${ENVIRONMENTS[@]}"; do
    echo ""
    echo -e "${YELLOW}Setting up ${ENV} environment...${NC}"

    APP_NAME="${BASE_NAME}-${ENV}"
    SERVER_NAME="${APP_NAME}.${DOMAIN}"
    CONFIG_DIR="/etc/${APP_NAME}"
    APP_DIR="/opt/apps/${APP_NAME}"

    # Create configuration directory
    echo -e "${GREEN}  ✓ Creating config directory: ${CONFIG_DIR}${NC}"
    mkdir -p "${CONFIG_DIR}"

    # Copy and customize deploy config
    if [[ -f "deploy-subdomain.conf" ]]; then
        cp deploy-subdomain.conf "${CONFIG_DIR}/deploy.conf"

        # Update environment-specific values
        sed -i "s/^ENVIRONMENT=\"dev\"/ENVIRONMENT=\"${ENV}\"/" "${CONFIG_DIR}/deploy.conf"

        # Generate unique Django secret key
        SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())' 2>/dev/null || echo "GENERATE_ME")
        sed -i "s/^DJANGO_SECRET_KEY=\"\"/DJANGO_SECRET_KEY=\"${SECRET_KEY}\"/" "${CONFIG_DIR}/deploy.conf"

        # Set DEBUG based on environment
        if [[ "${ENV}" == "dev" ]]; then
            sed -i "s/^DJANGO_DEBUG=\".*\"/DJANGO_DEBUG=\"True\"/" "${CONFIG_DIR}/deploy.conf"
        else
            sed -i "s/^DJANGO_DEBUG=\".*\"/DJANGO_DEBUG=\"False\"/" "${CONFIG_DIR}/deploy.conf"
        fi

        echo -e "${GREEN}  ✓ Deploy config created: ${CONFIG_DIR}/deploy.conf${NC}"
    fi

    # Create app directory structure
    echo -e "${GREEN}  ✓ Creating app directory: ${APP_DIR}${NC}"
    mkdir -p "${APP_DIR}"
    mkdir -p "/var/log/${APP_NAME}"
    mkdir -p "/var/backups/${APP_NAME}"

    # Set up systemd socket and service
    echo -e "${GREEN}  ✓ Configuring systemd units${NC}"

    # Generate configs for this environment
    if [[ -f "generate-config.sh" ]]; then
        ./generate-config.sh "${CONFIG_DIR}/deploy.conf" "${CONFIG_DIR}/generated"

        # Install systemd units
        if [[ -f "${CONFIG_DIR}/generated/${APP_NAME}.socket" ]]; then
            cp "${CONFIG_DIR}/generated/${APP_NAME}.socket" "/etc/systemd/system/"
            echo -e "${GREEN}    • Socket unit installed${NC}"
        fi

        if [[ -f "${CONFIG_DIR}/generated/${APP_NAME}.service" ]]; then
            cp "${CONFIG_DIR}/generated/${APP_NAME}.service" "/etc/systemd/system/"
            echo -e "${GREEN}    • Service unit installed${NC}"
        fi
    fi

    # Create nginx config symlink location
    echo -e "${GREEN}  ✓ Nginx config ready at: ${CONFIG_DIR}/generated/nginx-${APP_NAME}.conf${NC}"

    echo -e "${BLUE}  ${ENV} environment setup complete!${NC}"
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}All environments configured!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps for each environment:${NC}"
echo ""
for ENV in "${ENVIRONMENTS[@]}"; do
    APP_NAME="${BASE_NAME}-${ENV}"
    echo -e "${BLUE}For ${ENV} (${APP_NAME}.${DOMAIN}):${NC}"
    echo "  1. Review config: /etc/${APP_NAME}/deploy.conf"
    echo "  2. Set database password in deploy.conf"
    echo "  3. Deploy code: ./deploy.sh /etc/${APP_NAME}/deploy.conf"
    echo "  4. Install nginx config:"
    echo "     cp /etc/${APP_NAME}/generated/nginx-${APP_NAME}.conf /etc/nginx/sites-available/"
    echo "     ln -s /etc/nginx/sites-available/nginx-${APP_NAME}.conf /etc/nginx/sites-enabled/"
    echo "  5. Start services:"
    echo "     systemctl enable ${APP_NAME}.socket"
    echo "     systemctl start ${APP_NAME}.socket"
    echo ""
done

echo -e "${YELLOW}Database setup:${NC}"
echo "  Create databases for each environment:"
for ENV in "${ENVIRONMENTS[@]}"; do
    echo "    CREATE DATABASE ${BASE_NAME}_${ENV};"
done
echo ""

echo -e "${YELLOW}SSL Certificates:${NC}"
echo "  Option 1: Use wildcard cert for *.${DOMAIN}"
echo "  Option 2: Generate individual certs for each subdomain"
echo "  Option 3: Use Let's Encrypt with certbot"
echo ""

echo -e "${YELLOW}DNS Configuration:${NC}"
echo "  Add A records for:"
for ENV in "${ENVIRONMENTS[@]}"; do
    echo "    ${BASE_NAME}-${ENV}.${DOMAIN} -> this server's IP"
done
