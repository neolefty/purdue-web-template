# Repository Cleanup Plan

## ✅ Completed
- [x] Docker configurations consolidated (saved 367 lines)
  - Added Redis to compose.yml for K8s-readiness
  - Moved hot-reload config to root
  - Removed unused prod.yml, deploy.yml, deploy-docker.conf

## 📋 Remaining Cleanup Tasks

### 1. Documentation Consolidation (High Priority)
**Files to merge/reorganize:**
- `DEPLOYMENT.md` (root, 8KB) → Merge into deployment/README.md
- `PRODUCTION_TESTING.md` (root, 4.5KB) → Move to deployment/
- `DATABASE_SETUP.md` (root, 1KB) → Merge into main README
- `frontend/TYPOGRAPHY.md` → Merge into frontend README or remove

**Action:** Create single deployment guide in `deployment/README.md`

### 2. deployment/dev-temporary/ Cleanup (High Priority)
**Already has CLEANUP-PLAN.md identifying deletable files:**
- Remove old auto-deploy scripts (~500 lines of redundant code)
- Keep: gitops-lite.sh, systemd service, sysadmin docs
- Move gitops-lite.sh to deployment/ root

### 3. Root Directory Cleanup (Medium Priority)
**Files to relocate/remove:**
- `deploy.sh` (9KB) - Likely obsolete, verify and remove
- `generate-ssl-local.sh` - Move to deployment/scripts/
- `nginx.prod.conf`, `nginx.prod.https.conf` - Move to deployment/templates/

### 4. Miscellaneous Cleanup (Low Priority)
- `logs/` directory - Add to .gitignore, remove old MCP logs
- `.idea/` directory - Should be in .gitignore
- `ssl/` directory - Verify if needed for local dev

### 5. Frontend Enhancements
- Add at least one test example (currently 0 test files)
- Consider adding more example components for template users

### 6. Backend Considerations
- Review if email configuration complexity is needed for a template
- Verify all auth backends are working (SAML + email)

## 🎯 Quick Wins (Do First)
1. Delete deployment/dev-temporary/ redundant scripts
2. Move deployment files from root to deployment/
3. Consolidate documentation into 2-3 files max
4. Add logs/ to .gitignore

## 📊 Expected Impact
- **Documentation**: ~50% reduction in files, better organization
- **Deployment scripts**: ~500 lines removed
- **Root directory**: 6-7 fewer files
- **Overall**: Cleaner, more maintainable template

## Next Steps
After your Docker tests complete, we can:
1. Execute the dev-temporary cleanup
2. Consolidate documentation
3. Reorganize root directory files
