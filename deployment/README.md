# Deployment Overview

This directory contains deployment configurations for different environments and purposes.

## Directory Structure

```
deployment/
├── gitops-lite.sh      # Main deployment script (no sudo needed!)
├── new-server-setup.md # Complete guide for setting up QA/Prod servers
├── configs/            # Environment configuration files
├── systemd/            # Systemd service files
├── templates/          # Configuration templates
├── scripts/            # Utility scripts
│   └── setup-environment-example.sh  # Example setup script
├── legacy/             # Old deployment methods (for reference)
└── future-k8s/         # Future Kubernetes configurations
```

## Current Deployment Method (No Sudo Required!)

We use **group permissions** for deployment - developers in the `template` group can deploy without sudo:

### How It Works
1. **Source code** lives in `~/source/django-react-template` (your home directory)
2. **Deployment target** is `/opt/apps/template` (group-writable by `template` group)
3. **GitOps Lite** script handles deployment via cron (every minute)
4. **Gunicorn hot-reload** automatically picks up changes

### Key Features
- **No sudo needed** - Uses group permissions
- **Automatic deployment** - Cron runs gitops-lite.sh every minute
- **Hot reload in dev** - Gunicorn `--reload` flag means no service restarts
- **Safe and simple** - Won't deploy if tests fail

## Future State (Long-term)

Moving towards modern cloud-native deployment:
- **Containerized** with Docker
- **Kubernetes** orchestration
- **GitHub Actions** for CI/CD
- **GitOps** with ArgoCD or Flux
- **True continuous deployment**

## For Developers

### Initial Server Setup

1. **Configure Production Environment**
   ```bash
   # Copy the production template to deployment directory
   cp .env.production.example /opt/apps/template/.env

   # Edit with your specific settings:
   vim /opt/apps/template/.env
   # - Update SECRET_KEY with a secure random value
   # - Set SITE_DOMAIN to your domain (automatically configures CORS, CSRF, email links, etc.)
   # - Configure DATABASE_ENGINE (sqlite for simple setups)
   ```

   **⚠️ Important**: The deployment script will NOT overwrite .env files to prevent configuration loss.

2. **Configure Python Version**

   **Option A: Via deploy.conf (Recommended for production)**
   ```bash
   # Edit /opt/apps/template/deploy.conf
   vim /opt/apps/template/deploy.conf
   # Uncomment and set: PYTHON="python3.13"
   ```

   **Option B: Via environment variable (for GitOps)**
   ```bash
   # Set GITOPS_PYTHON in cron or manual runs
   GITOPS_PYTHON=python3.13 ./deployment/gitops-lite.sh
   ```

   **Note**: GITOPS_PYTHON overrides deploy.conf if both are set

### Quick Setup (2 minutes)

```bash
# 1. Add to crontab on server
crontab -e

# 2. Add one of these lines:
# For main branch with email notifications (recommended):
* * * * * GITOPS_EMAIL_TO=admin@purdue.edu GITOPS_EMAIL_ON_SUCCESS=true /home/deployer/source/django-react-template/deployment/gitops-lite.sh
# To explicitly set Python version, add GITOPS_PYTHON=python3.13

# For branch-based deployment:
*/5 * * * * GITOPS_BRANCH=qa GITOPS_APP_NAME=template-qa GITOPS_EMAIL_TO=admin@purdue.edu /home/deployer/source/django-react-template/deployment/gitops-lite.sh
*/5 * * * * GITOPS_BRANCH=prod GITOPS_APP_NAME=template-prod GITOPS_EMAIL_TO=admin@purdue.edu /home/deployer/source/django-react-template/deployment/gitops-lite.sh

# Note: Python version is read from deploy.conf if configured there, or use GITOPS_PYTHON=python3.13 to override
```

### How GitOps Lite Works

Every run (1-5 minutes depending on cron):
1. Checks GitHub for new commits (< 1 second)
2. **Exits immediately if no changes** (common case)
3. Only if changes found:
   - Pulls and does basic syntax check
   - Syncs files to deployment directory
   - Hot-reload auto-restarts the app (dev) or restarts service (prod)

**Performance**: When no changes (99% of the time), runs in under 1 second!

### Environment Variables

The `gitops-lite.sh` script supports these environment variables:
- `GITOPS_BRANCH` - Which branch to deploy (default: main)
- `GITOPS_APP_NAME` - Target directory name (default: template)
- `GITOPS_SOURCE_DIR` - Source repository path (default: $HOME/source/django-react-template)
- `GITOPS_DEPLOY_DIR` - Deployment target directory (default: /opt/apps/$APP_NAME)
- `GITOPS_BUILD_FRONTEND` - Whether to build frontend (default: true, set to false to skip)
- `GITOPS_PYTHON` - Python version to use (overrides deploy.conf, default: python3)
- `GITOPS_EMAIL_TO` - Admin email for deployment notifications (optional)
- `GITOPS_EMAIL_ON_SUCCESS` - Send email on successful deployments (default: true)
- `GITOPS_EMAIL_ON_FAILURE` - Send email on failed deployments (default: true)
- `GITOPS_EMAIL_COMMITTER` - Also email the last committer (default: true)

### Branch Management Strategy

This template uses a three-branch deployment strategy:

| Branch | Environment | Deploy Directory | Update Frequency | Purpose |
|--------|------------|------------------|------------------|---------|
| `main` | Development | `/opt/apps/template` | Every minute | Active development, hot-reload enabled |
| `qa` | QA/Staging | `/opt/apps/template-qa` | Every 5 minutes | Testing before production |
| `prod` | Production | `/opt/apps/template-prod` | Every 5 minutes | Live production environment |

### Automatic Deployment (Branch-Based)
```bash
# Just push to the appropriate branch:
git push origin main   # Deploys to Development
git push origin qa     # Deploys to QA/Staging
git push origin prod   # Deploys to Production

# Monitor deployment (logs include app name now):
ssh server "tail -f /tmp/gitops-lite-template.log"      # Dev
ssh server "tail -f /tmp/gitops-lite-template-qa.log"   # QA
ssh server "tail -f /tmp/gitops-lite-template-prod.log" # Prod
```

### Manual Deployment (If Needed)
```bash
# Run the script directly:
ssh server
cd ~/source/django-react-template
git pull
./deployment/gitops-lite.sh

# Or with specific environment:
GITOPS_BRANCH=qa GITOPS_APP_NAME=template-qa ./deployment/gitops-lite.sh
GITOPS_BRANCH=prod GITOPS_APP_NAME=template-prod ./deployment/gitops-lite.sh
```

### Local Development with Hot Reload
```bash
# Use the Docker compose setup (mimics production)
docker compose -f docker-compose.hot-reload.yml up
```

## Files by Purpose

### Production-Ready
- `gitops-lite.sh` - Main deployment script (no sudo!)
- `systemd/` - Service definitions (sysadmin manages these)
- `configs/` - Environment configurations
- `templates/` - Nginx, service templates

### Legacy (For Reference)
- `legacy/deploy.sh` - Old deployment method (kept for reference)

### Future (In Progress)
- `future-k8s/` - Kubernetes manifests (coming soon)

## Important Notes

1. **Hot reload is DEV ONLY** - Never use `--reload` in production
2. **These are temporary solutions** - Don't over-invest in the scripts
3. **Focus on the future** - Container/K8s work takes priority

## Testing GitOps Lite

### Docker-based Testing (Recommended)

Test the deployment script in a containerized environment that simulates a production server:

```bash
# Run the complete test suite
cd deployment/test-gitops-docker
docker compose -f docker-compose.test.yml up --build

# The test will:
# 1. Create a fresh Python environment
# 2. Test first-time deployment (venv creation, pip install, migrations)
# 3. Verify idempotency (second run should be <1 second)
# 4. Test dependency update detection
```

This test validates:
- ✅ Auto-initialization on first run
- ✅ Python virtual environment creation
- ✅ Dependency installation and updates
- ✅ Django migrations and static file collection
- ✅ Fast performance when no changes (<1 second)
- ✅ Proper error handling and logging

### Local Testing (Quick Check)


## Migration Timeline

- **Now**: VM + systemd + gitops-lite.sh
- **Next Sprint**: Dockerize everything
- **Q1 2025**: Kubernetes pilot
- **Q2 2025**: Full GitOps pipeline
