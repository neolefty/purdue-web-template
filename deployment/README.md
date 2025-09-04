# Deployment Overview

This directory contains deployment configurations for different environments and purposes.

## Directory Structure

```
deployment/
├── dev-temporary/      # Temporary dev server tools (will be deprecated)
├── future-k8s/         # Future Kubernetes/GitOps configurations (coming soon)
├── configs/            # Environment configuration files
├── systemd/            # Current systemd service files
└── templates/          # Configuration templates
```

## Current State (Short-term)

We're using a traditional VM-based deployment with:
- **Systemd** services on Rocky Linux
- **Gunicorn** with `--reload` for dev environments
- **Manual/script-based** deployments
- **No sudo access** for developers

### Active on Dev Server
- Gunicorn with `--reload` flag enabled
- Auto-deployment scripts available but not automated
- Files in `dev-temporary/` folder

## Future State (Long-term)

Moving towards modern cloud-native deployment:
- **Containerized** with Docker
- **Kubernetes** orchestration
- **GitHub Actions** for CI/CD
- **GitOps** with ArgoCD or Flux
- **True continuous deployment**

## For Developers

### Quick Deploy to Dev Server
```bash
# Pull latest code
ssh django "cd ~/source/django-react-template && git pull"

# Copy files
ssh django "rsync -av --exclude='.env' ~/source/django-react-template/backend/ /opt/apps/template/backend/"

# Auto-reload handles the rest!
```

### Local Development with Hot Reload
```bash
# Use the Docker compose setup
docker compose -f docker-compose.dev-server.yml up
```

## Files by Purpose

### Production-Ready
- `systemd/` - Service definitions
- `configs/` - Environment configurations
- `templates/` - Nginx, service templates

### Development Tools (Temporary)
- `dev-temporary/` - All hot-reload and auto-deploy scripts
- Will be replaced by K8s/GitOps solutions

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
