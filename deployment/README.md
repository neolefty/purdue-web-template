# Deployment Overview

This directory contains deployment configurations for different environments and purposes.

## Directory Structure

```
deployment/
├── gitops-lite.sh      # Main deployment script (no sudo needed!)
├── configs/            # Environment configuration files
├── systemd/            # Systemd service files
├── templates/          # Configuration templates
├── scripts/            # Utility scripts
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

### Automatic Deployment (Already Set Up!)
```bash
# Just push to main branch
git push origin main

# Wait ~1 minute for cron to run gitops-lite.sh
# Check deployment status:
ssh django "tail -f /tmp/gitops-lite.log"
```

### Manual Deployment (If Needed)
```bash
ssh django
cd ~/source/django-react-template
git pull
./deployment/gitops-lite.sh  # No sudo needed!
```

### Local Development with Hot Reload
```bash
# Use the Docker compose setup
docker compose -f docker-compose.hot-reload.yml up
```

## Files by Purpose

### Production-Ready
- `gitops-lite.sh` - Main deployment script (no sudo!)
- `systemd/` - Service definitions (sysadmin manages these)
- `configs/` - Environment configurations
- `templates/` - Nginx, service templates

### Legacy (For Reference)
- `legacy/deploy.sh` - Old deployment method (required sudo)
- `DEPLOYMENT-DETAILED.md` - Documentation for the old method

### Future (In Progress)
- `future-k8s/` - Kubernetes manifests (coming soon)
- GitHub Actions workflows (in `.github/workflows/`)

## Important Notes

1. **Hot reload is DEV ONLY** - Never use `--reload` in production
2. **These are temporary solutions** - Don't over-invest in the scripts
3. **Focus on the future** - Container/K8s work takes priority

## Migration Timeline

- **Now**: VM + systemd + manual deploy
- **Next Sprint**: Dockerize everything
- **Q1 2025**: Kubernetes pilot
- **Q2 2025**: Full GitOps pipeline
