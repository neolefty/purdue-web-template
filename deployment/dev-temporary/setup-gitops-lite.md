# GitOps Lite Setup

Minimal continuous deployment that works with hot-reload.

## Quick Setup (2 minutes)

```bash
# 1. Copy script to home directory
cp deployment/dev-temporary/gitops-lite.sh ~/
chmod +x ~/gitops-lite.sh

# 2. Add to crontab
crontab -e

# Add one of these lines:
*/5 * * * * /home/wbbaker/gitops-lite.sh 2>&1  # Every 5 minutes
# OR for faster updates:
* * * * * /home/wbbaker/gitops-lite.sh 2>&1    # Every minute (safe!)
```

## How It Works

Every run (1-5 minutes depending on cron):
1. Checks GitHub for new commits (< 1 second)
2. **Exits immediately if no changes** (common case)
3. Only if changes found:
   - Pulls and does basic syntax check
   - Syncs files to `/opt/apps/template/`
   - Hot-reload auto-restarts the app

**Performance**: When no changes (99% of the time), runs in under 1 second!

## Monitor

```bash
# Watch deployments happen
tail -f /tmp/gitops-lite.log

# Check last deployment
cat /tmp/gitops-lite-state
```

## Test It

```bash
# Run manually to test
~/gitops-lite.sh

# Should see:
# [10:30:15] Deploying abc123...
# [10:30:18] ✅ Deployed successfully (hot-reload will handle restart)
```

## Stop It

```bash
# Remove from crontab
crontab -e
# Delete or comment out the line
```

## Why This Works

- **Minimal**: ~70 lines, easy to understand
- **Safe**: Only deploys if Python syntax is valid
- **Fast**: Runs in seconds
- **Silent**: No output unless there's a problem
- **Works with hot-reload**: No need to restart services

## What It Doesn't Do

- No unit tests (too slow for every 5 min)
- No rollback (git revert manually if needed)
- No notifications (check the log file)
- No multiple branches (main only)

This is perfect for a dev server where you want changes to appear quickly after pushing to GitHub.
