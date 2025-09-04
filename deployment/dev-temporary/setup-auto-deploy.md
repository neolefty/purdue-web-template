# Simple Auto-Deployment Setup

## For Novice Coders

This auto-deployment system will:
1. Check for new commits every 5 minutes
2. Run basic syntax checks (Python & TypeScript)
3. Deploy if everything passes
4. Tell you when to restart the service

## Setup Instructions

### 1. Copy the script to the server

```bash
scp deployment/auto-check-deploy.sh django:~/
ssh django chmod +x ~/auto-check-deploy.sh
```

### 2. Set up the cron job

On the server, run:
```bash
crontab -e
```

Add this line:
```
*/5 * * * * /home/wbbaker/auto-check-deploy.sh >> /tmp/auto-deploy.log 2>&1
```

This runs every 5 minutes.

### 3. Monitor deployments

Check if deployments are happening:
```bash
tail -f /tmp/auto-deploy.log
```

Check if a restart is needed:
```bash
[ -f /tmp/template-needs-restart ] && echo "Restart needed!" || echo "Up to date"
```

## What it checks

The script is intentionally simple:

1. **Python syntax** - Just checks if Python files compile (catches basic syntax errors)
2. **TypeScript types** - Runs `npm run type-check` (catches type errors)
3. **Frontend builds** - Makes sure the React app builds successfully

It does NOT:
- Run unit tests (to keep it fast)
- Check code style (that's what pre-commit is for)
- Send emails (to keep it simple)

## Manual override

If auto-deploy fails but you want to deploy anyway:

```bash
cd ~/source/django-react-template
git pull
# Fix the issues
./deployment/simple-auto-deploy.sh  # This has more verbose output
```

## Restart handling

Since we can't auto-restart without sudo, you have a few options:

1. **Manual**: Check occasionally and run `sudo service template restart` when needed

2. **Script helper**: Run this to check:
   ```bash
   if [ -f /tmp/template-needs-restart ]; then
       echo "🔄 Service restart needed!"
       sudo service template restart
       rm /tmp/template-needs-restart
   fi
   ```

3. **Ask sysadmin**: They could set up a systemd path unit to watch `/tmp/template-needs-restart` and auto-restart

## Troubleshooting

**Auto-deploy not running?**
```bash
# Check if cron is running
ps aux | grep cron

# Check cron logs
grep auto-check-deploy /var/log/syslog
```

**Deployments failing?**
```bash
# Run manually to see errors
cd ~/source/django-react-template
bash -x deployment/auto-check-deploy.sh
```

**TypeScript errors?**
```bash
cd ~/source/django-react-template/frontend
npm run type-check  # See the actual errors
```

## For Teaching/Learning

This setup is great for students because:
- They see immediate deployment of their changes
- Syntax errors block deployment (teaches clean commits)
- The checks are simple and understandable
- No complex CI/CD to configure
- Everything runs on the same server (no external dependencies)
