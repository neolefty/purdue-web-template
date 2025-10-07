# First-Time Server Setup Guide

This guide walks through setting up a new server to host this Django-React application. Adapt freely to match your organization's standards.

While the app works great with containers (`docker compose` for development, Kubernetes for production), this guide focuses on traditional server deployment. See [README.md](../README.md) for container options.

## What You're Deploying

- Python backend (Django) serving API and static files
- Pre-compiled React frontend (no Node.js needed in production, only for building)
- Your choice of database (external or SQLite for simpler setups)

## Choose Your Setup

Pick the pattern that fits your needs:

### Pattern 1: Single Instance per Application
Each application gets one instance on the server:
```
/opt/apps/
├── template/           # This Django-React template
├── iot-registry/       # Another application
└── prism/             # Yet another application
```
**Best for:** Dedicated servers (one for prod, one for QA, etc.)

### Pattern 2: Multiple Instances per Application
Multiple environments of the same app on one server:
```
/opt/apps/
├── template-dev/       # Development instance
├── template-qa/        # QA instance
├── template-prod/      # Production instance
├── iot-registry-qa/    # QA for another app
└── prism-qa/          # QA for yet another app
```
**Best for:** Shared servers hosting multiple environments

**Note:** Throughout this guide, `{instance}` is a placeholder:
- Pattern 1: Just your app name (e.g., `template`)
- Pattern 2: App name + environment (e.g., `template-qa`)

## Server Setup

### 1. System Requirements
- Rocky Linux 9+, RHEL 9+, or your preferred Linux
- Python 3.11+ (3.12 recommended)
- Build tools: mariadb-devel, python3.xx-devel, gcc (for MySQL support)
- nginx (reverse proxy)
- systemd (service management)
- Git
- Node.js 24+, npm 11+ (only needed if building frontend from source)

### 2. User and Group Setup

The setup below lets developers deploy without `sudo` using group permissions:

```bash
# Adapt as needed:
# For Pattern 1 (single instance):
groupadd template
useradd -m -g template deployer
usermod -a -G template your_developer_username

# For Pattern 2 (multiple instances):
groupadd template-qa    # Create group per environment
useradd -m -g template-qa deployer
usermod -a -G template-qa your_developer_username

# Optional: If using nginx to serve static files, add nginx user to group
usermod -a -G template-{instance} nginx
```

### 3. Directory Structure

Set up directories for your chosen pattern:

**Pattern 1 Example (single instance):**
```bash
/opt/apps/
├── template/            # Your application
│   ├── backend/
│   ├── venv/           # Python virtual environment
│   ├── static/         # Collected static files
│   └── logs/
└── another-app/        # Different application
```

**Pattern 2 Example (multiple instances):**
```bash
/opt/apps/
├── template-qa/         # QA environment
│   ├── backend/
│   ├── venv/
│   ├── static/
│   └── logs/
└── template-prod/       # Production environment
    ├── backend/
    ├── venv/
    ├── static/
    └── logs/
```

Make them group-writable so developers can deploy:
```bash
# Replace {instance} with your actual instance name
mkdir -p /opt/apps/template-{instance}
chown -R root:template-{instance} /opt/apps/template-{instance}
chmod -R 775 /opt/apps/template-{instance}
chmod g+s /opt/apps/template-{instance}  # Ensure new files inherit group
```

### 4. Get the Code

```bash
# As the deployer user or your developer account:
cd ~
mkdir -p source
cd source
git clone https://github.com/yourorg/django-react-template
cd django-react-template
```

### 5. Python Version (Optional)

Need a specific Python version? The default is system `python3`, but you can override it:

```bash
# Copy the minimal gitops configuration
# Replace {instance} with your actual instance name (e.g., template or template-qa)
cp ~/source/django-react-template/deployment/configs/gitops.conf /opt/apps/template-{instance}/

# Review and edit if needed
nano /opt/apps/template-{instance}/gitops.conf
```

The file has one setting: `PYTHON="python3.13"`

**Priority order:**
1. `GITOPS_PYTHON` environment variable
2. `gitops.conf` in deployment directory
3. `deploy.conf` (legacy)
4. System `python3`

Check available versions:
```bash
ls -la /usr/bin/python3*
# Typically includes: python3, python3.9, python3.11, python3.13
```

## Service Configuration

Example systemd files in `deployment/systemd/` give you a starting point. Customize them for your setup:

See `deployment/systemd/template.service` and customize:
- User/Group settings
- Working directory paths
- Environment variables
- Number of workers
- Logging preferences

Install it:
```bash
# Replace {instance} with your actual instance name
cp ~/source/django-react-template/deployment/systemd/template.service /etc/systemd/system/template-{instance}.service
# Edit to match your paths and preferences
systemctl daemon-reload
systemctl enable template-{instance}
systemctl start template-{instance}
```

## Web Server Configuration

Check `deployment/templates/` for nginx examples covering:
- Gunicorn proxying
- Static file serving
- SSL termination
- Security headers

Adapt to your setup and domain.

## SELinux Configuration

If SELinux is enabled (common on RHEL/Rocky Linux), you'll need to configure it to allow nginx to connect to the Gunicorn socket:

### Check if SELinux is enforcing:
```bash
getenforce
```

### Common SELinux denials and solutions:

1. **nginx denied access to Gunicorn socket:**
   ```
   type=AVC msg=audit(...): avc:  denied  { write } for  pid=... comm="nginx"
   name="gunicorn.sock" ... scontext=system_u:system_r:httpd_t:s0 ...
   ```

   **Solution options (try in order):**
   ```bash
   # Option A: If using Unix sockets (most common for non-containerized setups)
   # First check where your socket is located (common: /run or /opt/apps/{instance})

   # For sockets in /run directory:
   sudo semanage fcontext -a -t httpd_sys_rw_content_t "/run/template-{instance}(/.*)?"
   sudo restorecon -Rv /run/template-{instance}

   # For sockets in /opt/apps:
   sudo semanage fcontext -a -t httpd_sys_rw_content_t "/opt/apps/template-{instance}/gunicorn.sock"
   sudo restorecon -v /opt/apps/template-{instance}/gunicorn.sock

   # Option B: If using HTTP/TCP connection between nginx and Gunicorn (port 8000)
   sudo setsebool -P httpd_can_network_connect 1
   ```

2. **Creating a custom policy (if needed):**
   ```bash
   # Capture denials in audit log
   sudo ausearch -c 'nginx' --raw | audit2allow -M nginx-gunicorn

   # Review the generated policy
   cat nginx-gunicorn.te

   # Install the policy module
   sudo semodule -i nginx-gunicorn.pp
   ```

3. **Allow nginx to serve static files:**
   ```bash
   # Set correct context for static files
   sudo semanage fcontext -a -t httpd_sys_content_t "/opt/apps/template-{instance}/static(/.*)?"
   sudo restorecon -Rv /opt/apps/template-{instance}/static
   ```

**Note:** Your system administrator may have already created custom SELinux policies for Gunicorn. Check with them before making changes.

## Environment Configuration

The app uses a `.env` file. It's auto-generated on first deployment, but you can set it up manually:

```bash
# Copy and customize the environment template
# Replace {instance} with your actual instance name
cp ~/source/django-react-template/.env.production.example /opt/apps/template-{instance}/.env

# Edit to set your domain (this automatically configures CORS, CSRF, email links, etc.)
nano /opt/apps/template-{instance}/.env
# Change: SITE_DOMAIN=your-app.purdue.edu
```

**Auto-setup:** If no `.env` exists, gitops-lite.sh:
- Copies `.env.production.example`
- Generates a secure SECRET_KEY
- Creates data, logs, and media directories

## Deployment Options

You can deploy either automatically (recommended) or manually. Both use `deployment/gitops-lite.sh` which handles everything without requiring sudo.

### Option A: Automated Deployment (Recommended)

Set up automatic deployments via cron:

1. **You should already have the source code** (from Server Setup section 4)

2. **Add to cron:**

   **Pattern 1 (single instance):**
   ```bash
   # Edit crontab
   crontab -e

   # Deploy from main branch to the single instance
   */5 * * * * GITOPS_BRANCH=main GITOPS_APP_NAME=template GITOPS_SOURCE_DIR=/home/deployer/source/django-react-template GITOPS_DEPLOY_DIR=/opt/apps/template GITOPS_EMAIL_TO=admin@purdue.edu /home/deployer/source/django-react-template/deployment/gitops-lite.sh
   ```

   **Pattern 2 (multiple environments):**
   ```bash
   # Edit crontab
   crontab -e

   # Deploy from different branches to different instances
   # QA instance (from qa branch)
   */5 * * * * GITOPS_BRANCH=qa GITOPS_APP_NAME=template-qa GITOPS_SOURCE_DIR=/home/deployer/source/django-react-template GITOPS_DEPLOY_DIR=/opt/apps/template-qa GITOPS_EMAIL_TO=admin@purdue.edu /home/deployer/source/django-react-template/deployment/gitops-lite.sh

   # Production instance (from prod branch)
   */5 * * * * GITOPS_BRANCH=prod GITOPS_APP_NAME=template-prod GITOPS_SOURCE_DIR=/home/deployer/source/django-react-template GITOPS_DEPLOY_DIR=/opt/apps/template-prod GITOPS_EMAIL_TO=admin@purdue.edu /home/deployer/source/django-react-template/deployment/gitops-lite.sh

   # Optional: Disable success emails (only send on failure)
   # Add GITOPS_EMAIL_ON_SUCCESS=false to only get error notifications
   ```

3. **What happens:**
   - Push to 'qa' branch → Deploys to QA
   - Push to 'prod' branch → Deploys to Production
   - No sudo needed
   - Hot-reload in dev, service restart in prod
   - Optional email notifications

4. **Email options:**
   - `GITOPS_EMAIL_TO` - Where to send notifications
   - `GITOPS_EMAIL_FROM` - From address (default: gitops@hostname)
   - `GITOPS_EMAIL_ON_SUCCESS` - Notify on success (default: true)
   - `GITOPS_EMAIL_ON_FAILURE` - Notify on failure (default: true)

### Option B: Manual Deployment

Prefer to deploy manually? Just run:

```bash
cd ~/source/django-react-template
git checkout {branch}  # main, qa, prod, etc.
git pull

# Replace {instance} and {branch} with your actual values
GITOPS_BRANCH={branch} \
  GITOPS_APP_NAME=template-{instance} \
  GITOPS_SOURCE_DIR=$PWD \
  GITOPS_DEPLOY_DIR=/opt/apps/template-{instance} \
  ./deployment/gitops-lite.sh
```

### First Deployment

Whether using automated or manual deployment, the first run will:
1. Create Python virtual environment
2. Install dependencies
3. Set up `.env` with secure SECRET_KEY
4. Create necessary directories
5. Run migrations
6. Collect static files

## Creating an Initial User

After the first deployment, you'll need to create an admin user to access the Django admin interface:

```bash
# Navigate to your app directory
# Replace {instance} with your actual instance name
cd /opt/apps/template-{instance}

# Activate the virtual environment
source ./venv/bin/activate

# Navigate to the backend directory
cd backend

# Create a superuser (follow the interactive prompts)
python manage.py createsuperuser
```

The command will prompt you for:
- Username (or email, depending on AUTH_METHOD)
- Email address
- Password (entered twice for confirmation)

After creating the superuser, you can access the Django admin at:
- Pattern 1: `https://your-app.purdue.edu/admin/`
- Pattern 2: `https://your-app-qa.purdue.edu/admin/` (or appropriate domain)
