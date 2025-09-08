#!/bin/sh
# Ensure node_modules exists and is up to date
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "Installing dependencies..."
    npm ci
fi

# Execute the original command
exec "$@"
