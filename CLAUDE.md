# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

**Local Development**: `docker compose up` (frontend on :5173, backend on :8000, proxied through frontend)

**Deployment**: Push to main → auto-deploys in ~1 minute via GitOps Lite (see `deployment/README.md` for setup)

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

## Common Commands

```bash
# Django operations (via Docker)
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py createsuperuser

# Frontend operations (via Docker)
docker compose exec frontend npm install <package>
docker compose exec frontend npm run lint
docker compose exec frontend npm run type-check
```

## Key Configuration

### Environment Variables
Configuration is handled via environment variables in the root `.env` file. Key settings:
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

## Typography & Branding

### Purdue Brand Fonts
The template includes three font families configured in TailwindCSS:
- **Acumin Pro** (default): Headlines, body text, UI elements
- **United Sans** (`font-united`): Statistics, data, uppercase labels
- **Source Serif Pro** (`font-source`): Long-form reading, articles

Use semantic classes like `text-headline`, `text-stat`, `text-article` instead of raw font classes.

For complete Purdue brand guidelines, see: https://marcom.purdue.edu/

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

## Development Tips & Gotchas

### Local Development with Docker
- **API Access**: Frontend dev server (port 5173 or FRONTEND_PORT if set) proxies `/api/*` to backend
- **Testing API**: Use `http://localhost:5173/api/...` NOT `localhost:8000`
- **Email Testing**: Emails print to backend container logs (use `docker compose logs backend`)

### Configuration Best Practices
- **SITE_DOMAIN Pattern**: When adding URL-based settings, derive from SITE_DOMAIN like other settings do:
  ```python
  if env("YOUR_URL", default=None):
      YOUR_URL = env.str("YOUR_URL")
  elif SITE_DOMAIN:
      YOUR_URL = f"https://{SITE_DOMAIN}/path"
  else:
      YOUR_URL = "http://localhost:5173/path"
  ```
- This ensures production works with minimal configuration

### Working with Pre-commit Hooks
- Commits may fail 2-3 times as hooks auto-format code
- After hook failures: `git add -A` then retry commit
- Python line length: 100 chars max
- Files auto-fixed: black (Python formatting), isort (imports), ESLint (JS/TS)

### Security Patterns
- **Never reveal user existence**: Return generic messages for login/reset failures
- **Auth-aware features**: Check `settings.AUTH_METHOD` before allowing password operations
- **Email backends**: Development uses console backend, production uses SMTP
