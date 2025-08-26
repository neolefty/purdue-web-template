# Django/React Web Application Template

## What This Is

A starter template for building web applications that can be easily hosted and maintained at Purdue, with Purdue authentication and branding. This template combines Django (Python backend) with React (JavaScript frontend), aiming to balance modern development practices with a standardized approach that many developers are familiar with.

**Note**: This is an early-stage template; while we want to standardize on Django and React, this should be considered prototype code that will evolve based on feedback and real-world use.

## For Decision Makers

This template provides:
- Pre-configured Purdue login integration (SAML/CAS)
- Purdue visual styling as a starting point
- Modern web development setup that many developers are familiar with
- A path to production using only a Python back end (no Node.js in production)

## Getting Started

### Run the Template Locally
```bash
git clone https://github.itap.purdue.edu/wbbaker/django-react-template
cd django-react-template
docker-compose up
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api

### Make It Your Own

TODO: Document the process for:
1. Forking this template
2. Renaming for your project
3. Setting up Purdue authentication
4. Basic customization steps

## Technical Architecture

### Overview
- **Backend**: Django (Python) - Handles authentication, database, APIs
- **Frontend**: React (TypeScript) - User interface, compiles to static files
- **Development**: Docker Compose for consistent local environment
- **Production**: Django serves both API and compiled React files

### Why This Approach?

**Pros:**
- No Node.js required in production (simpler deployment)
- Django's mature authentication system
- React for modern, interactive UIs
- Can migrate to other architectures if needs change

**Cons:**
- Two different languages/ecosystems to maintain
- Not ideal for SEO or server-side rendering
- Learning curve if unfamiliar with either Django or React

## Project Structure
```
purdue-webapp-template/
├── backend/          # Django application
├── frontend/         # React application  
├── docker-compose.yml
└── docs/
```

## Customization Points

TODO: Add guides for:
- Adding new pages
- Creating API endpoints
- Modifying authentication flow
- Adjusting Purdue branding
- Database schema changes

## Authentication

Supports two modes via environment variable:
- **Production**: Purdue SAML (Shibboleth/CAS)
- **Development**: Email-based login

Both modes use the same API interface, making development easier.

## Deployment Considerations

TODO: Add deployment guides for:
- Purdue on-premise infrastructure
- Cloud providers (AWS, Azure)
- Required environment variables
- Security checklist

## Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Backend API | Django 5.0+ | Mature, secure, good auth support |
| Frontend | React 18 + Vite | Popular, good developer experience |
| CSS | TailwindCSS | Utility-first, easy to customize |
| Database | PostgreSQL | Robust, widely supported |
| Dev Environment | Docker | Consistency across machines |

## Future Options

This template doesn't lock you into specific choices. You could:
- Add server-side rendering with Next.js
- Replace React with another framework
- Split into microservices
- Add WebSocket support for real-time features

## Known Limitations

- No server-side rendering (affects SEO, initial load)
- Requires knowledge of both Python and JavaScript
- Still experimental, not battle-tested
- Limited mobile app support

## Resources

### Purdue-Specific
- [Purdue SAML/Authentication Documentation](https://www.purdue.edu/securepurdue/identity-access/authentication-options.php)
- [Purdue Visual Identity](https://marcom.purdue.edu/our-brand/visual-identity/)
- Example applications (coming soon)

### Technologies
- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Docker Compose](https://docs.docker.com/compose/)

## Questions or Feedback

This is an evolving template. For questions or suggestions:
- Contact the development team via Microsoft Teams (preferred)
- Email: wbbaker@purdue.edu, deshunz@purdue.edu, brooksa@purdue.edu
- [GitHub Issues](https://github.itap.purdue.edu/wbbaker/django-react-template/issues)
- [Purdue IT Service Portal](https://service.purdue.edu/)