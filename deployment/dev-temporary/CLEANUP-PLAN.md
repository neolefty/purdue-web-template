# Cleanup Plan for dev-temporary/

## ✅ KEEP (Still Useful)

1. **gitops-lite.sh** - Our new minimal CD solution
2. **setup-gitops-lite.md** - Docs for gitops-lite
3. **template-dev.service** - The systemd service with --reload (currently in use!)
4. **SYSADMIN-INSTRUCTIONS.md** - Still useful for sysadmin reference
5. **docker-compose.dev-server.yml** - Useful for local testing with hot-reload

## ❌ CAN DELETE (Replaced by gitops-lite.sh)

1. **auto-check-deploy.sh** - Replaced by gitops-lite.sh
2. **auto-deploy-with-reload.sh** - Replaced by gitops-lite.sh
3. **auto-deploy.sh** - Too complex (230 lines with email!)
4. **simple-auto-deploy.sh** - Replaced by gitops-lite.sh
5. **AUTO-DEPLOY.md** - Docs for the complex auto-deploy.sh
6. **setup-auto-deploy.md** - Docs for old scripts

## ❓ MAYBE DELETE (Depends on use case)

1. **dev-with-reload.sh** - Docker helper, might be useful
2. **run-dev-server.sh** - Manual gunicorn runner, could be useful for debugging
3. **enable-autoreload.sh** - One-time setup script, probably done
4. **nginx-dev-reload.conf** - Used by docker-compose.dev-server.yml

## Recommendation

Delete the redundant auto-deploy scripts but keep:
- The working systemd service
- GitOps lite (our chosen solution)
- Docker dev environment
- Sysadmin docs

This would remove ~500 lines of redundant scripts!
