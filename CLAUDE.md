# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Deployment System

### Current Dev Server Setup
- **Continuous Deployment**: GitOps Lite runs every minute via cron
- **Hot Reload**: Gunicorn with `--reload` flag (auto-restarts on changes)
- **No sudo needed**: Developers can deploy without system access
- **Push to deploy**: Just `git push` to main branch, wait ~1 minute

### Deployment Commands
```bash
# Manual deploy (if needed)
ssh django "cd ~/source/django-react-template && git pull && deployment/gitops-lite.sh"

# Check deployment logs
ssh django "tail -f /tmp/gitops-lite.log"

# Service status
ssh django "systemctl status template"
```

### Production Features
- **Non-root deployment**: Works without sudo/root access
- **Socket activation**: Systemd socket files included for production
- **Flexible configuration**: Environment-based settings with `.env` files
- **SQLite support**: Can run without external database for demos/testing
- **Automatic asset handling**: Template tags handle Vite's hashed filenames
- **Documentation**: See deployment/README.md for complete guide

## Architecture Overview

This is a Django + React template for Purdue web applications with the following key components:

- **Backend**: Django 5.1 REST API (Python) in `/backend` directory
  - Multi-database support (PostgreSQL, MySQL, MS SQL, Oracle, SQLite)
  - Dual authentication modes: Purdue SAML SSO or email/password
  - Organized into apps: `authentication`, `api`, `core`
  - Settings split by environment: `base.py`, `development.py`, `production.py`

- **Frontend**: React 18 with TypeScript and Vite in `/frontend` directory
  - TailwindCSS for styling with Purdue branding
  - React Query for API state management
  - React Router for navigation
  - Authentication context for protected routes

- **Development Environment**: Docker Compose orchestrates services
  - PostgreSQL database
  - Backend Django server
  - Frontend Vite dev server
  - Health checks ensure proper startup order

## Development Commands

### Using Docker (Recommended)

```bash
# Start all services
docker compose up

# Django management commands
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py test
docker compose exec backend python manage.py shell

# Frontend commands
docker compose exec frontend npm install <package>
docker compose exec frontend npm run lint
docker compose exec frontend npm run type-check
docker compose exec frontend npm run build
```

### Without Docker

Backend:
```bash
cd backend
python manage.py runserver           # Start dev server on port 8000
python manage.py test                 # Run tests
python manage.py makemigrations      # Create migrations
python manage.py migrate             # Apply migrations
```

Frontend:
```bash
cd frontend
npm run dev                          # Start Vite dev server on port 5173
npm run build                        # Build production bundle
npm run lint                         # Run ESLint
npm run type-check                   # Check TypeScript types
```

## Key Configuration

### Environment Variables
Configuration is handled via environment variables. Key settings in `.env`:
- `AUTH_METHOD`: 'email' or 'saml' (authentication mode)
- `DATABASE_ENGINE`: postgresql, mysql, mssql, oracle, or sqlite
- `DEBUG`: True/False
- `CORS_ALLOWED_ORIGINS`: Frontend URLs for CORS

### API Structure
- Base API URL: `/api/`
- Authentication endpoints: `/api/auth/`
- Swagger docs: `/api/swagger/`
- Health check: `/api/health/`

### Adding New Features
1. Backend API: Create serializers, views, and register URLs in appropriate app
2. Frontend: Add TypeScript types in `src/api/`, create React Query hooks
3. Both frontend and backend auto-reload in development

## Important Patterns

### Authentication Flow
- Frontend uses `AuthContext` to manage user state
- API calls use Axios client with automatic token handling
- Protected routes use `ProtectedRoute` component

### Database Models
- Create models in appropriate app's `models.py`
- Use migrations to sync database schema
- Multi-database support configured in settings

### Frontend State Management
- React Query for server state (API data)
- React Context for client state (auth, UI)
- Form handling with react-hook-form
