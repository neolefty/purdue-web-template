#!/bin/bash

# Enable auto-reload for gunicorn (development/testing only)
# This script modifies the gunicorn command to include --reload flag

set -e

echo "Enabling auto-reload for gunicorn..."
echo ""
echo "WARNING: Auto-reload should only be used in development/testing!"
echo "It will impact performance and should not be used in production."
echo ""

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
    echo "Modifying systemd service to enable auto-reload..."

    # Check which service file exists
    if [[ -f /etc/systemd/system/template.service ]]; then
        SERVICE_FILE="/etc/systemd/system/template.service"
    elif [[ -f /usr/lib/systemd/system/template.service ]]; then
        SERVICE_FILE="/usr/lib/systemd/system/template.service"
    else
        echo "Error: template.service not found in systemd directories"
        exit 1
    fi

    # Backup the original service file
    cp "$SERVICE_FILE" "${SERVICE_FILE}.backup"

    # Add --reload flag to the ExecStart command if not already present
    if ! grep -q "\-\-reload" "$SERVICE_FILE"; then
        sed -i 's|config.wsgi:application|--reload config.wsgi:application|g' "$SERVICE_FILE"
        echo "✓ Added --reload flag to $SERVICE_FILE"
    else
        echo "⚠ Auto-reload already enabled in $SERVICE_FILE"
    fi

    # Reload systemd and restart the service
    systemctl daemon-reload
    systemctl restart template

    echo "✓ Service restarted with auto-reload enabled"
    echo ""
    echo "To disable auto-reload later:"
    echo "  sudo cp ${SERVICE_FILE}.backup $SERVICE_FILE"
    echo "  sudo systemctl daemon-reload"
    echo "  sudo systemctl restart template"
else
    echo "This script must be run with sudo to modify systemd services."
    echo ""
    echo "Alternative: If you're running gunicorn manually, add the --reload flag:"
    echo "  gunicorn --reload --bind unix:/run/template.sock ... config.wsgi:application"
    exit 1
fi
