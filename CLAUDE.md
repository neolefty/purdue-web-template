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
  - Fallback: Franklin Gothic (recommended by Purdue web developer)
- **United Sans** (`font-united`): Statistics, data, uppercase labels
- **Source Serif Pro** (`font-source`): Long-form reading, articles

Use semantic classes like `text-headline`, `text-stat`, `text-article` instead of raw font classes.

For complete Purdue brand guidelines, see: https://marcom.purdue.edu/

### Purdue Brand Colors & UI Guidelines

**IMPORTANT**: Purdue's official brand has **NO BLUE** colors. Never use blue in UI elements.

#### Available Color Palette
The project uses colors defined in `frontend/tailwind.config.js`:
```typescript
purdue: {
  gold: '#CEB888',        // Primary brand color
  'gold-light': '#DACC9F',
  'gold-dark': '#B59D6B',
  aged: '#8E6F3E',        // Supporting brown for links/buttons
  'aged-dark': '#6b5530',
  gray: {50...900}        // Full gray scale
}
```

**Note**: Only use color classes that exist in tailwind.config.js. Classes like `purdue-blue-*`, `purdue-green-*`, or `purdue-gold-600` do not exist and will fail silently.

#### Action Button Color Standards
For consistency across applications:

1. **Access/View Actions** (aged brown):
   - Preview, View, Download, Open
   - Example: `className="text-purdue-aged hover:text-purdue-aged-dark"`

2. **Modification Actions** (black):
   - Edit, Make Public/Private, Activate/Deactivate, Make Staff
   - Example: `className="text-purdue-gray-900 hover:text-black"`

3. **Destructive Actions** (Purdue palette recommended):
   - Delete, Remove
   - **Recommended**: Use Purdue palette colors for better brand consistency
     - Dark gold background: `bg-purdue-gold-dark text-white hover:bg-purdue-aged-dark`
     - Or aged brown background: `bg-purdue-aged-dark text-white hover:bg-purdue-gray-900`
   - Alternative: Red text for inline actions: `text-red-600 hover:text-red-900`
   - Always use ConfirmDialog for destructive actions for additional safety

#### Component Color Usage
- **Info messages**: Use `bg-purdue-gold bg-opacity-10` with `text-purdue-gray-800`
- **Status badges** (read-only status indicators):
  - Success/Active: `bg-green-100 text-green-800`
  - Warning: `bg-yellow-100 text-yellow-800`
  - Error/Failed: `bg-red-100 text-red-800`
  - Info: `bg-purdue-gold bg-opacity-20 text-purdue-gray-800`
  - **Note**: Yellow, green, and red are NOT Purdue brand colors, but are acceptable for **status badges** (passive indicators) because they convey universal meaning. However, avoid these colors for **action buttons** (interactive elements) - use Purdue palette instead
- **Disabled states**: Use gray tones with `disabled:opacity-50 disabled:cursor-not-allowed`

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

## Layout Components

The template includes standardized layout components for consistent page structure:

### PageLayout
Wraps page content with consistent container and padding.
```tsx
<PageLayout width="default">  // default | wide | full
  {/* Page content */}
</PageLayout>
```

### PageHeader
Standardized page title with optional actions.
```tsx
<PageHeader
  title="Page Title"
  subtitle="Optional subtitle"
  action={<Button>Action</Button>}
/>
```

### SearchBar
Reusable search input with consistent styling.
```tsx
<SearchBar
  value={searchTerm}
  onChange={setSearchTerm}
  placeholder="Search..."
  rightContent={<span>Results: 10</span>}
/>
```

### TableContainer
Wrapper for tables with consistent overflow handling and empty states.
```tsx
<TableContainer
  isEmpty={data.length === 0}
  emptyMessage="No data found"
>
  <table>{/* Table content */}</table>
</TableContainer>
```

### Usage Example
```tsx
function MyListPage() {
  return (
    <PageLayout width="default">
      <PageHeader
        title="My Items"
        action={<Button>Add Item</Button>}
      />
      <Card className="mb-6">
        <SearchBar value={search} onChange={setSearch} />
      </Card>
      <TableContainer isEmpty={items.length === 0}>
        <table>{/* Custom table */}</table>
      </TableContainer>
    </PageLayout>
  )
}
```
