#!/bin/bash
#
# Example Server Setup Script for QA/Production Environments
#
# This is an EXAMPLE script showing common setup steps.
# Please review and modify to match your organization's standards.
#
# Usage: ./setup-environment-example.sh qa|prod
#

set -e

# Get environment name from argument
ENV_NAME="${1:-qa}"
if [[ "$ENV_NAME" != "qa" && "$ENV_NAME" != "prod" ]]; then
    echo "Usage: $0 [qa|prod]"
    exit 1
fi

# Configuration (modify these to match your setup)
APP_NAME="template-${ENV_NAME}"
APP_DIR="/opt/apps/${APP_NAME}"
APP_GROUP="${APP_NAME}"
APP_USER="deployer"
REPO_URL="https://github.com/yourorg/django-react-template.git"
BRANCH="${ENV_NAME}"  # qa branch for QA, prod branch for Production
PYTHON_VERSION="python3.13"  # Or python3, python3.11, etc. (3.9+ required)

echo "=== Setting up $ENV_NAME environment ==="
echo "App directory: $APP_DIR"
echo "Branch: $BRANCH"
echo ""
echo "This script will show example commands."
echo "Please review and run them manually as appropriate."
echo ""
read -p "Show example commands? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

cat << 'EOF'

# 1. Create group and user (if needed)
groupadd template-qa
useradd -m -g template-qa deployer

# 2. Create application directory
mkdir -p /opt/apps/template-qa
chown -R root:template-qa /opt/apps/template-qa
chmod -R 775 /opt/apps/template-qa
chmod g+s /opt/apps/template-qa

# 3. Clone repository (as deployer user)
su - deployer
cd ~
git clone https://github.com/yourorg/django-react-template.git
cd django-react-template
git checkout qa  # or production

# 4. Initial deployment
cd /opt/apps/template-qa
cp -r ~/django-react-template/backend .
python3.13 -m venv venv  # Or python3, depending on your preference
source venv/bin/activate
pip install -r backend/requirements/production.txt

# 5. Configure environment
cat > backend/.env << 'ENVFILE'
SECRET_KEY=generate-a-secure-key-here
DEBUG=False
ALLOWED_HOSTS=qa.yourdomain.edu
DATABASE_ENGINE=postgresql
DB_NAME=template_qa
DB_HOST=localhost
DB_USER=template_qa
DB_PASSWORD=secure-password
AUTH_METHOD=saml
ENVFILE

# 6. Set up database
python backend/manage.py migrate
python backend/manage.py collectstatic --noinput

# 7. Set up systemd service
cp deployment/systemd/template.service /etc/systemd/system/template-qa.service
# Edit the service file to match your paths
systemctl daemon-reload
systemctl enable template-qa
systemctl start template-qa

# 8. Set up nginx
cp deployment/templates/nginx.conf.template /etc/nginx/sites-available/template-qa
# Edit the nginx config
ln -s /etc/nginx/sites-available/template-qa /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# 9. Set up automatic deployment (optional)
crontab -e
# Add this line for QA:
*/5 * * * * GITOPS_BRANCH=qa GITOPS_APP_NAME=template-qa /home/deployer/django-react-template/deployment/gitops-lite.sh

# For production:
*/5 * * * * GITOPS_BRANCH=production GITOPS_APP_NAME=template-prod /home/deployer/django-react-template/deployment/gitops-lite.sh

EOF

echo ""
echo "=== Example commands shown above ==="
echo ""
echo "Key points to remember:"
echo "1. Modify paths and names to match your standards"
echo "2. Use strong passwords and keys"
echo "3. Configure firewall rules as needed"
echo "4. Set up monitoring and log rotation"
echo "5. Test thoroughly before going live"
echo ""
echo "The gitops-lite.sh script will handle deployments after initial setup."
echo "Developers push to '$BRANCH' branch → Auto-deploys to $ENV_NAME server"
