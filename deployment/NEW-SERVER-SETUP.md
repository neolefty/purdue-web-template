# First-Time Server Setup Guide

This guide provides recommendations for setting up a new server to host this Django-React application. Feel free to adapt these suggestions to match your organization's standards and preferences.

This application was designed with containers in mind, runs well under `docker compose` especially for local development, and anticipates deployment using Kubernetes.  See [README.md](../README.md) for more details.

## Overview

The application consists of:
- A Python backend (Django) that serves both the API and static files
- Pre-compiled React frontend files (no Node.js needed in production)
- Optional connection to external database (or SQLite for simpler setups)

## Suggested Server Setup

### 1. System Requirements
- Rocky Linux 9+ or RHEL 9+ (or any Linux you prefer)
- Python 3.9+ (3.12 recommended for new deployments)
- nginx (for reverse proxy)
- systemd (for service management)
- Git (for pulling code)

### 2. User and Group Setup

This guide assumes that code can be deployed without `sudo`,
for example using group permissions in the deployment directory.

```bash
# Example approach (adapt as needed):
groupadd template-qa    # or template-prod
useradd -m -g template-qa deployer
usermod -a -G template-qa your_developer_username
```

### 3. Directory Structure

A suggested layout (modify to fit your standards):

```bash
/opt/apps/
├── template-qa/         # QA environment
│   ├── backend/
│   ├── venv/            # Python virtual environment
│   ├── static/          # Collected static files
│   └── logs/
└── template-prod/       # Production environment
    ├── backend/
    ├── venv/
    ├── static/
    └── logs/
```

Make directories group-writable for developer deployments:
```bash
mkdir -p /opt/apps/template-qa
chown -R root:template-qa /opt/apps/template-qa
chmod -R 775 /opt/apps/template-qa
chmod g+s /opt/apps/template-qa  # Ensure new files inherit group
```

### 4. Python Environment Setup

#### Choosing Python Version
If multiple Python versions are installed, you can specify which to use:
```bash
# Check available Python versions
ls -la /usr/bin/python3*

# Use specific version for venv (e.g., Python 3.13 if available)
cd /opt/apps/template-qa
python3.13 -m venv venv  # Or python3.11, python3.9, etc.

# Or use system default
python3 -m venv venv
```

#### Install Dependencies
```bash
source venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements/production.txt
```

Note: The dev server uses Python 3.13 for better performance, but 3.9+ works fine.

## Service Configuration (Examples)

We've included example systemd service files in `deployment/systemd/` that you might find helpful. These are just starting points - modify them to match your environment:

### Example Service File
See `deployment/systemd/template.service` for a basic example. Key points to customize:
- User/Group settings
- Working directory paths
- Environment variables
- Number of workers
- Logging preferences

To use with your naming convention:
```bash
cp deployment/systemd/template.service /etc/systemd/system/myapp-qa.service
# Edit to match your paths and preferences
systemctl daemon-reload
systemctl enable myapp-qa
systemctl start myapp-qa
```

## Web Server Configuration

Example nginx configurations are in `deployment/templates/`. These show common patterns for:
- Proxying to Gunicorn
- Serving static files
- SSL termination
- Security headers

Adapt these to your nginx setup and domain configuration.

## Environment Configuration

The application uses environment variables for configuration. Create a `.env` file:

```bash
# /opt/apps/template-qa/backend/.env
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=qa.yourdomain.edu

# Database (optional - uses SQLite if not specified)
DATABASE_ENGINE=postgresql
DB_NAME=template_qa
DB_HOST=localhost
DB_USER=template_qa
DB_PASSWORD=secure-password

# Authentication
AUTH_METHOD=saml  # or 'email' for development
```

## Automated Deployment (Optional but Recommended)

The `deployment/gitops-lite.sh` script enables automatic deployments without sudo. It's designed to be flexible:

### Branch-Based Deployment Setup

1. **Set up source repository for each environment:**
   ```bash
   # As the deployer user:
   cd ~
   git clone https://github.com/yourorg/django-react-template
   ```

2. **Configure cron for automatic deployment:**
   ```bash
   # For QA (deploy from 'qa' branch)
   */5 * * * * GITOPS_BRANCH=qa GITOPS_APP_NAME=template-qa /home/deployer/django-react-template/deployment/gitops-lite.sh

   # For Production (deploy from 'production' branch)
   */5 * * * * GITOPS_BRANCH=production GITOPS_APP_NAME=template-prod /home/deployer/django-react-template/deployment/gitops-lite.sh
   ```

3. **How it works:**
   - Developers merge to 'qa' branch → Auto-deploys to QA server
   - Developers merge to 'production' branch → Auto-deploys to Production
   - No sudo required - uses group permissions
   - Hot-reload in development, service restart in production

### Manual Deployment Option

If you prefer manual control:
```bash
cd ~/django-react-template
git checkout qa  # or production
git pull
GITOPS_BRANCH=qa GITOPS_APP_NAME=template-qa ./deployment/gitops-lite.sh
```
