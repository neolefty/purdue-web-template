#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Django application setup...${NC}"

# Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for database...${NC}"
while ! python -c "import sys, psycopg2; psycopg2.connect('host=${DB_HOST:-db} port=${DB_PORT:-5432} dbname=${DB_NAME:-purdue_app} user=${DB_USER:-postgres} password=${DB_PASSWORD:-postgres}')" 2>/dev/null; do
    sleep 1
done
echo -e "${GREEN}✅ Database is ready!${NC}"

# Run migrations automatically
echo -e "${YELLOW}📚 Setting up database tables...${NC}"
python manage.py migrate --noinput
echo -e "${GREEN}✅ Database tables ready!${NC}"

# Create default superuser if none exists
echo -e "${YELLOW}👤 Checking for admin users...${NC}"
python manage.py shell -c "
import os
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    default_password = os.environ.get('DEFAULT_SUPERUSER_PASSWORD', 'admin123')
    User.objects.create_superuser('admin', 'admin@example.com', default_password)
    print('✅ Created default admin user')
    print('   Username: admin')
    print(f'   Password: {default_password}')
    if default_password == 'admin123':
        print('   ⚠️  Using default password! Change DEFAULT_SUPERUSER_PASSWORD in .env')
else:
    admin_count = User.objects.filter(is_superuser=True).count()
    print(f'✅ Found {admin_count} admin user(s) already configured')
" || echo -e "${YELLOW}Note: Admin user setup skipped (this is normal if using SQLite)${NC}"

# Collect static files if in production mode
if [ "$DJANGO_SETTINGS_MODULE" = "config.settings.production" ]; then
    echo -e "${YELLOW}📦 Collecting static files...${NC}"
    python manage.py collectstatic --noinput
    echo -e "${GREEN}✅ Static files collected!${NC}"
fi

echo -e "${GREEN}🎉 Setup complete! Starting server...${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Execute the main command
exec "$@"
