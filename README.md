# Django React Template for Purdue Web Applications

This is a starter template for web applications that can be easily hosted and maintained at Purdue, with Purdue authentication and branding, using:

- [Django](https://www.djangoproject.com/) (server – written in Python)
- [React](https://react.dev/) (user interface – written in Javascript)

Together, they enable modern web applications that can start simple, grow in complexity with your needs, and are well-supported by AI coding assistants.

**Note**: This is an early-stage template that will evolve based on feedback and real-world use. The authors welcome comments, [contributions](https://github.itap.purdue.edu/agit/django-react-template/pulls), and ticket requests — see [Support](#support) below.

![Template Screenshot](docs/images/template-screenshot.png)

**📘 Ready to build your own app?** See the [Forking Guide](forking-guide.md) for step-by-step instructions to extend this template.

## What this template offers

### Decision Makers
- Purdue branding and visual standards
- Proven technology stack approved for use on campus
- Supports authentication via [Purdue career accounts](https://it.purdue.edu/services/career-account.php)

### Developers & Researchers
A solid foundation for developers and researchers:
- **Only 2 tools required**: Docker Desktop and Git
- **Works with AI assistants**: Optimized for Claude, Copilot, ChatGPT
- **Start quickly**: Run it on your laptop in 15 minutes
- **Immediate feedback**: Changes appear instantly with hot-reload

## Quick Start (5 minutes)

### Required Tools
1. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** – Manages your development environment
2. **[Git](https://git-scm.com/)** – Version control

### Optional Tools (Recommended)
- **[Task](https://taskfile.dev/installation/)** – Run common commands easily (`task test`, `task lint`)
- **[VS Code](https://code.visualstudio.com/)** – Editor with great Docker integration
- **[Pre-commit](https://pre-commit.com/)** – Automated code quality checks

### Getting Started

1. Clone the repository:
```bash
git clone https://github.itap.purdue.edu/wbbaker/django-react-template
cd django-react-template
```

2. Copy the environment file and customize it:
```bash
cp .env.example .env
# Edit .env to set DEFAULT_SUPERUSER_PASSWORD and other settings
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

The application handles setup automatically:
- ✅ Runs database migrations
- ✅ Creates an admin user (if none exists)
- ✅ Uses password from `DEFAULT_SUPERUSER_PASSWORD` in `.env`

No manual setup required! Just start and go.

## For Different Audiences

<details>
<summary><b>👔 For Decision Makers</b></summary>

### What You Get
- Purdue SAML authentication ready to configure
- Multi-database support (PostgreSQL, MySQL, Oracle, SQL Server, SQLite)
- Modern tech stack that recruits want to work with
- Clear path from prototype to production

### Production Requirements
- Python 3.11+ server (provided by most Purdue servers)
- Database (or use SQLite for simple apps)
- No Node.js required in production

### Why This Approach?

**Pros:**
- Django's mature authentication system
- React for modern, interactive UIs
- Multi-database support out of the box
- Can migrate to other architectures if needs change
- No Node.js required in production (simpler deployment)

**Cons:**
- Not ideal for SEO or server-side rendering (Next.js would support that at the cost of complexity)

[See deployment guide →](deployment/README.md)
</details>

<details>
<summary><b>🔬 For Researchers & Professors</b></summary>

### Why This Template?
- Build data dashboards and research tools
- Integrate with Purdue authentication automatically
- Deploy to Purdue servers without IT tickets
- AI assistants can help you code

### Common Use Cases
- Lab data management systems
- Research participant portals
- Course project showcases
- Department resource schedulers
- Grant tracking dashboards

### Getting Help with AI
When using AI assistants (Claude, ChatGPT, Copilot), try prompts like:
- "Help me add a data upload feature to this Django-React app"
- "Create an API endpoint for storing survey responses"
- "Add a chart to display lab measurements over time"

The template includes a `CLAUDE.md` file that provides context to AI assistants automatically.

### Starting Fresh
Need to reset everything and start over?
```bash
# Linux/Mac:
./reset-project.sh

# Windows:
reset-project.bat
```
</details>

<details>
<summary><b>💻 For Developers</b></summary>

### Development Workflow
```bash
# All development happens in Docker
docker compose up            # Start everything
task test                    # Run tests (optional: install Task)
task lint                    # Check code quality
task format                  # Auto-fix code style
```

### Key Commands Reference
| Task | Command | What it does |
|------|---------|--------------|
| Start dev environment | `docker compose up` | Starts all services |
| Run tests | `task test` or `docker compose exec backend pytest` | Tests frontend & backend |
| Format code | `task format` | Auto-fixes code style |
| Create migration | `docker compose exec backend python manage.py makemigrations` | Updates database schema |
| Apply migrations | `docker compose exec backend python manage.py migrate` | Applies database changes |
| Create superuser | `docker compose exec backend python manage.py createsuperuser` | Creates admin user |
| Install package (backend) | `docker compose exec backend pip install <package>` | Adds Python package |
| Install package (frontend) | `docker compose exec frontend npm install <package>` | Adds npm package |

### Hot Reload Testing
For testing with Gunicorn hot-reload (mimics production):
```bash
docker compose -f docker-compose.hot-reload.yml up
```

### Pre-commit Hooks (Optional)
```bash
pip install pre-commit
pre-commit install
```

### Technical Architecture

- **Backend**: Django (Python) – Handles authentication, database, APIs
- **Frontend**: React (TypeScript) – User interface, compiles to static files
- **Development**: Docker Compose for consistent local environment
- **Production**: Django serves both API and compiled React files
- **Caching**: Redis for sessions and caching
- **Database**: PostgreSQL (default), supports MySQL, MS SQL, Oracle, SQLite

[Full developer documentation →](CLAUDE.md)
</details>

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
├── compose.yml          # Development environment
└── docker-compose.hot-reload.yml  # Gunicorn hot-reload testing
```

## Features

- **Django 5.1** backend with REST API
- **React 18** frontend with TypeScript
- **Multiple database support** (PostgreSQL, MySQL, MS SQL, Oracle, SQLite)
- **Dual authentication** modes (Purdue SAML SSO / Email)
- **TailwindCSS** with Purdue branding
- **Docker Compose** for development
- **Hot reloading** in development
- **Health checks** ensure services start in correct order
- **API documentation** with Swagger/OpenAPI
- **Production-ready** configuration

## Configuration

<details>
<summary><b>⚙️ Database Configuration</b></summary>

### Database Selection

Set the `DATABASE_ENGINE` environment variable in `.env`:

- `postgresql` (recommended for production)
- `mysql` / `mariadb`
- `mssql` (MS SQL Server)
- `oracle`
- `sqlite` (template/development only)

### Production Database Setup

When creating a real application from this template:

1. **Contact your database team** for database credentials
2. **Update `.env`** with the provided credentials:
   ```
   DATABASE_ENGINE=postgresql
   DB_NAME=your_app_db
   DB_HOST=db.server.edu
   DB_USER=your_app_user
   DB_PASSWORD=<provided_by_db_team>
   ```
3. **Run migrations**: `python manage.py migrate`

### Migrating from SQLite to Production

1. Export data if needed: `python manage.py dumpdata > data.json`
2. Update `.env` with new database settings
3. Run migrations: `python manage.py migrate`
4. Import data if needed: `python manage.py loaddata data.json`
</details>

<details>
<summary><b>🔐 Authentication Configuration</b></summary>

### Authentication Mode

Set the `AUTH_METHOD` environment variable:

- `email` – Email/password authentication (default for development)
- `saml` – Purdue SAML SSO (for production)

Both modes use the same API interface, making development easier.

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
</details>

<details>
<summary><b>🔧 Environment Variables</b></summary>

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
</details>

## Advanced Topics

<details>
<summary><b>🛠️ Development Tools & Workflow</b></summary>

### Task Runner

This project includes a Taskfile for common development tasks. Install [Task](https://taskfile.dev/installation/) to use it:

```bash
# Run all linters
task lint

# Format code
task format

# Run tests
task test

# Run all checks before committing
task pre-commit

# View all available tasks
task --list
```

### Code Quality Tools

**Backend (Python):**
- **Black** – Code formatting
- **isort** – Import sorting
- **Flake8** – Linting
- **mypy** – Type checking

**Frontend (TypeScript/React):**
- **ESLint** – Linting and code quality
- **TypeScript** – Type checking

### Pre-commit Hooks

Pre-commit hooks automatically check code quality before each commit:

```bash
# Install pre-commit
pip install pre-commit

# Install the git hooks
pre-commit install

# Run hooks manually on all files
pre-commit run --all-files
```

To skip hooks temporarily: `git commit --no-verify`
</details>

<details>
<summary><b>🎨 Customization Guide</b></summary>

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
</details>

## Deployment

For complete deployment instructions, see [`deployment/README.md`](deployment/README.md).

### Quick Start

**Development/QA deployment:**
```bash
# Push to branch and auto-deploy (if GitOps is configured):
git push origin main  # or qa, prod branches

# Manual deployment:
ssh server "cd ~/source/django-react-template && ./deployment/gitops-lite.sh"
```

**Local testing with production-like setup:**
```bash
docker compose -f docker-compose.hot-reload.yml up
```

See [`deployment/NEW-SERVER-SETUP.md`](deployment/NEW-SERVER-SETUP.md) for detailed server setup and production deployment instructions.

## Testing

<details>
<summary><b>🧪 Running Tests</b></summary>

### Quick Start
```bash
# Run all tests
task test

# Or without Task:
docker compose exec backend pytest
docker compose exec frontend npm test
```

### Detailed Commands
```bash
# Backend tests only
task test:backend
task test:backend:coverage  # With coverage report

# Frontend tests only
task test:frontend
task test:frontend:watch    # Watch mode
task test:frontend:coverage # With coverage report
```

### Test Examples
- **Backend**: See `backend/apps/api/test_example.py` for Django REST API testing patterns
- **Frontend**: See `frontend/src/components/*.test.tsx` for React component testing patterns

Both include examples of:
- Unit tests
- Authentication testing
- API endpoint testing
- Component rendering tests
- User interaction tests
</details>

## Learn More

### 📚 Tutorials & Guides
- **Getting Started**
  - [Django Tutorial](https://docs.djangoproject.com/en/5.1/intro/tutorial01/) – Build your first Django app
  - [React Tutorial](https://react.dev/learn/tutorial-tic-tac-toe) – Interactive React basics
  - [Docker Getting Started](https://docs.docker.com/get-started/) – Container basics

- **For This Template**
  - [Deployment Guide](deployment/README.md) – Deploy to production
  - [Developer Guide](CLAUDE.md) – Detailed development instructions
  - API Documentation: http://localhost:8000/api/swagger/ (when running)

### 🔗 External Documentation
- **Languages & Frameworks**
  - [Python](https://docs.python.org/3/) | [Django](https://docs.djangoproject.com/) | [Django REST Framework](https://www.django-rest-framework.org/)
  - [TypeScript](https://www.typescriptlang.org/docs/) | [React](https://react.dev/) | [Vite](https://vitejs.dev/)

- **Tools**
  - [Docker](https://docs.docker.com/) | [Docker Compose](https://docs.docker.com/compose/)
  - [Task](https://taskfile.dev/usage/) | [Git](https://git-scm.com/doc)

- **Purdue Resources**
  - [Purdue Authentication Options](https://www.purdue.edu/securepurdue/identity-access/authentication-options.php)
  - [Purdue Visual Identity](https://marcom.purdue.edu/our-brand/visual-identity/)
  - [Purdue IT Service Portal](https://service.purdue.edu/)

## Troubleshooting

<details>
<summary><b>⚠️ Common Issues</b></summary>

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

### Container Issues
If Docker containers won't start:
1. Check Docker Desktop is running
2. Try `docker compose down` then `docker compose up`
3. Check for port conflicts (5173, 8000, 5432, 6379)
</details>

## Known Limitations

- No server-side rendering (affects SEO, initial load)
- Requires knowledge of both Python and JavaScript
- Still experimental, not battle-tested
- Limited mobile app support

## Future Options

This template doesn't lock you into specific choices. You could:
- Add server-side rendering with Next.js
- Replace React with another framework
- Split into microservices
- Add WebSocket support for real-time features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT License – See [LICENSE](LICENSE) file for details.

## Support

This is an evolving template. For questions or suggestions:
- Contact a member of the development team via Microsoft Teams
- Email the RHTS web development team, [wbbaker@purdue.edu, deshunz@purdue.edu, brooksa@purdue.edu](mailto:wbbaker@purdue.edu,deshunz@purdue.edu,brooksa@purdue.edu)
- Create a ticket in the [Purdue IT Service Portal](https://service.purdue.edu/) – include the phrase **_Please assign to RHTS Research Solutions_** at the top of your request.

## Acknowledgments

- Purdue University IT for SAML integration support
- Django and React communities for excellent documentation
