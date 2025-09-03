# Auto-Deployment Setup

This directory contains scripts for automated deployment with Git monitoring, testing, and email notifications.

## Features

- Monitors Git repository for changes
- Runs Django and frontend tests before deployment
- Sends email notifications with commit summaries
- Aborts deployment if tests fail
- Tracks last deployed commit to avoid redundant deployments

## Setup Instructions

### 1. Configure Email Recipients

Edit the cron file or set environment variables:
```bash
export AUTO_DEPLOY_EMAILS="admin@purdue.edu team@purdue.edu"
export AUTO_DEPLOY_BRANCH="main"  # or your deployment branch
```

### 2. Install the Cron Job

Option A: User crontab
```bash
crontab -e
# Add the cron line from auto-deploy.cron
```

Option B: System-wide (recommended)
```bash
sudo cp auto-deploy.cron /etc/cron.d/template-auto-deploy
sudo chmod 644 /etc/cron.d/template-auto-deploy
```

### 3. Ensure Mail is Configured

The script uses the system `mail` command. Ensure it's installed:
```bash
# On RHEL/CentOS:
sudo yum install mailx

# On Ubuntu/Debian:
sudo apt-get install mailutils
```

### 4. Set Permissions

```bash
chmod +x deployment/auto-deploy.sh
```

### 5. Test Manually

Before enabling the cron job, test manually:
```bash
./deployment/auto-deploy.sh
```

## Monitoring

Check the logs:
```bash
tail -f /var/log/template/auto-deploy.log
tail -f /var/log/template/auto-deploy-cron.log
```

## Customization

### Change Check Frequency

Edit the cron schedule in `/etc/cron.d/template-auto-deploy`:
- `*/5 * * * *` - Every 5 minutes (default)
- `0 * * * *` - Every hour
- `0 9,13,17 * * 1-5` - 9am, 1pm, 5pm on weekdays
- `0 2 * * *` - Daily at 2am

### Customize Tests

Edit the `run_tests()` function in `auto-deploy.sh` to add or modify test commands.

### Email Format

The script sends plain text emails with:
- Commit summaries
- Test results
- Deployment status
- Error messages (if any)

## Troubleshooting

1. **No emails received**: Check mail configuration with `echo "test" | mail -s "test" your@email.com`
2. **Permission denied**: Ensure the script has execute permissions and the user has access to the app directory
3. **Tests not found**: Verify test commands match your project structure
4. **Git errors**: Ensure SSH keys or credentials are configured for the deployment user

## Security Notes

- The script runs with the permissions of the cron user
- Ensure the deployment user has minimal necessary permissions
- Keep email lists private to avoid exposing deployment information
- Consider using a dedicated notification email address
