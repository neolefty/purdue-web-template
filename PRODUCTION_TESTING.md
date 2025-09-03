# Local Production Testing Guide

This guide explains how to test the production deployment configuration locally using Docker Compose.

## Overview

The production testing setup emulates the actual server environment with:
- Nginx as reverse proxy
- Gunicorn with Unix socket (emulating systemd socket activation)
- PostgreSQL database
- Static file serving
- SSL/HTTPS support (optional)

## Quick Start

### 1. Basic HTTP Setup

```bash
# Build and start all services
docker compose -f docker-compose.prod.yml up --build

# Access the application
# Add to /etc/hosts: 127.0.0.1 django-template.local
# Visit: http://django-template.local or http://localhost
```

### 2. HTTPS Setup (Optional)

```bash
# Generate self-signed SSL certificates
./generate-ssl-local.sh

# Use HTTPS nginx configuration
docker compose -f docker-compose.prod.yml up --build
# In another terminal:
docker compose -f docker-compose.prod.yml exec nginx sh -c "cp /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.bak && cat /etc/nginx/ssl/nginx.prod.https.conf > /etc/nginx/conf.d/default.conf && nginx -s reload"

# Visit: https://django-template.local (accept security warning)
```

## Configuration Files

### Docker Compose
- `docker-compose.prod.yml` - Production-like Docker Compose configuration

### Dockerfiles
- `backend/Dockerfile.prod` - Production backend container
- `frontend/Dockerfile.prod` - Frontend build container

### Nginx Configurations
- `nginx.prod.conf` - HTTP configuration
- `nginx.prod.https.conf` - HTTPS configuration with SSL

### SSL
- `generate-ssl-local.sh` - Script to generate self-signed certificates
- `ssl/` - Directory containing generated certificates

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│    Nginx    │────▶│  Gunicorn   │
│             │     │  (Port 80)  │     │   (Socket)  │
└─────────────┘     └─────────────┘     └─────────────┘
                            │                    │
                            ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │Static Files │     │ PostgreSQL  │
                    │  (React)    │     │  Database   │
                    └─────────────┘     └─────────────┘
```

## Key Differences from Development

1. **Gunicorn** instead of Django development server
2. **Nginx** serves static files and proxies API requests
3. **Unix socket** communication between Nginx and Gunicorn
4. **Production Django settings** with DEBUG=False
5. **Optimized frontend build** instead of Vite dev server

## Testing Checklist

- [ ] Frontend loads at http://localhost
- [ ] API endpoints work (/api/health/)
- [ ] Django admin accessible (/admin/)
- [ ] Static files load correctly
- [ ] Database migrations apply
- [ ] User registration/login works
- [ ] CORS headers configured properly
- [ ] SSL/HTTPS works (if testing with certificates)

## Troubleshooting

### Container Issues
```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f [service_name]

# Restart services
docker compose -f docker-compose.prod.yml restart

# Rebuild after changes
docker compose -f docker-compose.prod.yml up --build
```

### Database Issues
```bash
# Access Django shell
docker compose -f docker-compose.prod.yml exec backend python manage.py shell

# Create superuser
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Run migrations manually
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

### Socket Permission Issues
```bash
# Check socket file
docker compose -f docker-compose.prod.yml exec backend ls -la /run/

# Check Gunicorn process
docker compose -f docker-compose.prod.yml exec backend ps aux | grep gunicorn
```

## Next Steps

After successful local testing:
1. Deploy to development server (django-template-dev.ag.purdue.edu)
2. Run `./deploy.sh` on the actual server
3. Configure systemd services
4. Set up SSL certificates
5. Configure firewall rules

See `DEPLOYMENT.md` for full production deployment instructions.
