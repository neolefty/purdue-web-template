# Django React Template for Purdue Web Applications

A modern, production-ready template for building web applications with Django backend and React frontend, specifically configured for Purdue University requirements.

## Features

- **Django 5.1** backend with REST API
- **React 18** frontend with TypeScript
- **Multiple database support** (PostgreSQL, MySQL, MS SQL, Oracle, SQLite)
- **Dual authentication** modes (Purdue SAML SSO / Email)
- **TailwindCSS** with Purdue branding
- **Docker Compose** for development
- **Hot reloading** in development
- **Health checks** ensure services start in correct order
- **Production-ready** configuration

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Getting Started

1. Clone the repository:
```bash
git clone https://github.itap.purdue.edu/wbbaker/django-react-template
cd django-react-template
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Start the development environment:
```bash
docker compose up
```

4. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- API Documentation: http://localhost:8000/api/swagger/
- Django Admin: http://localhost:8000/admin/

### First-Time Setup

After starting the containers, run migrations and create a superuser:

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

## Project Structure

```
django-react-template/
├── backend/                 # Django backend
│   ├── config/             # Django settings & configuration
│   │   ├── settings/       # Environment-specific settings
│   │   ├── urls.py        # URL configuration
│   │   └── wsgi.py        # WSGI configuration
│   ├── apps/              # Django applications
│   │   ├── authentication/ # Auth backends (SAML/Email)
│   │   ├── api/           # API endpoints
│   │   └── core/          # Core functionality
│   └── requirements/      # Python dependencies
├── frontend/              # React frontend
│   ├── src/              # Source code
│   │   ├── api/          # API client & hooks
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/        # Page components
│   │   └── styles/       # CSS files
│   └── package.json      # Node dependencies
└── compose.yml          # Development environment
```

## Configuration

### Database Selection

Set the `DATABASE_ENGINE` environment variable in `.env`:

- `postgresql` (default)
- `mysql`
- `mssql`
- `oracle`
- `sqlite` (development only)

### Authentication Mode

Set the `AUTH_METHOD` environment variable:

- `email` - Email/password authentication (default for development)
- `saml` - Purdue SAML SSO (for production)

### Environment Variables

Key environment variables (see `.env.example` for full list):

```bash
# Django
SECRET_KEY=your-secret-key
DEBUG=True
AUTH_METHOD=email

# Database
DATABASE_ENGINE=postgresql
DB_NAME=purdue_app
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## Development

### Backend Development

```bash
# Access Django shell
docker compose exec backend python manage.py shell

# Create new Django app
docker compose exec backend python manage.py startapp appname

# Make migrations
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate

# Run tests
docker compose exec backend python manage.py test
```

### Frontend Development

```bash
# Install new package
docker compose exec frontend npm install package-name

# Run type checking
docker compose exec frontend npm run type-check

# Run linting
docker compose exec frontend npm run lint
```

### Working Without Docker

If you prefer to work without Docker:

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements/development.txt
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Documentation

The API is documented using OpenAPI/Swagger. Access the documentation at:

- Swagger UI: http://localhost:8000/api/swagger/
- ReDoc: http://localhost:8000/api/redoc/
- OpenAPI Schema: http://localhost:8000/api/schema/

## Customization

### Adding Purdue SAML

1. Apply for SAML access through the [Purdue Authentication Options](https://www.purdue.edu/securepurdue/identity-access/authentication-options.php) page
2. Once approved, obtain SAML certificates and metadata URL from Purdue IT
3. Place certificates in `backend/saml/`
4. Update SAML settings in `.env`:
   ```bash
   AUTH_METHOD=saml
   SAML_ENTITY_ID=https://yourapp.purdue.edu/saml/metadata/
   SAML_METADATA_URL=https://www.purdue.edu/apps/account/saml/metadata.xml
   ```

### Modifying Purdue Branding

Edit the Tailwind configuration in `frontend/tailwind.config.js`:
- Update colors in `theme.extend.colors.purdue`
- Modify fonts in `theme.extend.fontFamily`

### Adding New API Endpoints

1. Create serializers in `backend/apps/api/serializers.py`
2. Create views in `backend/apps/api/views.py`
3. Register URLs in `backend/apps/api/urls.py`
4. Add TypeScript types in `frontend/src/api/`
5. Create React Query hooks for the endpoints

## Production Deployment

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL (or your chosen database)
- Nginx or Apache (for reverse proxy)

### Deployment Steps

1. **Clone and setup environment:**
```bash
git clone https://github.itap.purdue.edu/wbbaker/django-react-template
cd django-react-template
```

2. **Build the frontend:**
```bash
cd frontend
npm ci --production
npm run build
cd ..
```

3. **Setup Python environment:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements/production.txt
```

4. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with production values:
# - Set SECRET_KEY to a secure random string
# - Set DEBUG=False
# - Configure database credentials
# - Set ALLOWED_HOSTS to your domain
# - Configure AUTH_METHOD (saml or email)
```

5. **Run migrations:**
```bash
export DJANGO_SETTINGS_MODULE=config.settings.production
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

6. **Start with Gunicorn:**
```bash
gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 4 \
  --worker-class sync \
  --worker-connections 1000 \
  --max-requests 1000 \
  --timeout 30 \
  --keepalive 2 \
  --log-level info
```

### Systemd Service Example

Create `/etc/systemd/system/purdue-app.service`:
```ini
[Unit]
Description=Purdue Web Application
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/var/www/purdue-app/backend
Environment="DJANGO_SETTINGS_MODULE=config.settings.production"
EnvironmentFile=/var/www/purdue-app/backend/.env
ExecStart=/var/www/purdue-app/backend/venv/bin/gunicorn \
          config.wsgi:application \
          --bind unix:/var/www/purdue-app/backend/app.sock \
          --workers 4
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name yourapp.purdue.edu;
    
    location /static/ {
        alias /var/www/purdue-app/backend/staticfiles/;
    }
    
    location /media/ {
        alias /var/www/purdue-app/backend/media/;
    }
    
    location / {
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://unix:/var/www/purdue-app/backend/app.sock;
    }
}
```

### Database Migrations in Production

Always test migrations in a staging environment first:

```bash
# Backup database first!
pg_dump purdue_app > backup_$(date +%Y%m%d).sql

# Check migration plan
python manage.py showmigrations

# Apply migrations
python manage.py migrate --plan  # Review the plan
python manage.py migrate         # Apply migrations
```

### Environment-Specific Settings

- Development: `backend/config/settings/development.py`
- Production: `backend/config/settings/production.py`
- Base (shared): `backend/config/settings/base.py`

## Testing

### Backend Tests

```bash
docker compose exec backend python manage.py test
```

### Frontend Tests

```bash
docker compose exec frontend npm test
```

## Troubleshooting

### Database Connection Issues

If you see database connection errors:
1. Ensure the database service is running: `docker compose ps`
2. Check database credentials in `.env`
3. Verify the database engine matches your setup

### CORS Errors

If you encounter CORS errors:
1. Check `CORS_ALLOWED_ORIGINS` in `.env`
2. Ensure the frontend URL is included
3. Restart the backend service

### Authentication Issues

For SAML authentication problems:
1. Verify SAML certificates are in place
2. Check metadata URL is accessible
3. Ensure entity ID matches Purdue's configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Contact the development team via Microsoft Teams
- Email: wbbaker@purdue.edu, deshunz@purdue.edu, brooksa@purdue.edu
- Create an issue on GitHub
- [Purdue IT Service Portal](https://service.purdue.edu/)

## Acknowledgments

- Purdue University IT for SAML integration support
- Django and React communities for excellent documentation