# Sysadmin Instructions: Enable Auto-Reload for Development Server

## Purpose
Enable automatic application restart when code files change, eliminating the need for manual service restarts during development.

## Changes Required

### Option 1: Modify Existing Service (Simplest)
Add the `--reload` flag to the existing gunicorn command in `/etc/systemd/system/template.service`:

**Current line (around line 15):**
```
ExecStart=/opt/apps/template/venv/bin/gunicorn --bind unix:/run/template.sock --workers 3 --timeout 120 --access-logfile /opt/apps/template/logs/access.log --error-logfile /opt/apps/template/logs/error.log config.wsgi:application
```

**Change to:**
```
ExecStart=/opt/apps/template/venv/bin/gunicorn --reload --bind unix:/run/template.sock --workers 1 --timeout 120 --access-logfile /opt/apps/template/logs/access.log --error-logfile /opt/apps/template/logs/error.log config.wsgi:application
```

**Note:** Also changed `--workers 3` to `--workers 1` (reload only works with 1 worker)

### Option 2: Create Separate Development Service (Recommended)
Create a new file `/etc/systemd/system/template-dev.service` (or use the provided `deployment/systemd/template-dev-reload.service`) with the following content:

```ini
[Unit]
Description=Django Template Application (Development with Auto-Reload)
After=network.target
Requires=template.socket

[Service]
Type=notify
User=nginx
Group=nginx
WorkingDirectory=/opt/apps/template/backend
Environment="PATH=/opt/apps/template/venv/bin"
Environment="PYTHONPATH=/opt/apps/template/backend"
Environment="DJANGO_SETTINGS_MODULE=config.settings.production"
Environment="SECURE_SSL_REDIRECT=False"
ExecStart=/opt/apps/template/venv/bin/gunicorn \
    --reload \
    --bind unix:/run/template.sock \
    --workers 1 \
    --timeout 120 \
    --access-logfile /opt/apps/template/logs/access.log \
    --error-logfile /opt/apps/template/logs/error.log \
    config.wsgi:application

Restart=on-failure
RestartSec=5s
KillMode=mixed
KillSignal=SIGQUIT

[Install]
WantedBy=multi-user.target
```

## Commands to Apply Changes

### For Option 1 (modify existing):
```bash
# Edit the service file
sudo nano /etc/systemd/system/template.service
# Make the changes described above, then:
sudo systemctl daemon-reload
sudo systemctl restart template
```

### For Option 2 (new service):
```bash
# Create the new service file
sudo nano /etc/systemd/system/template-dev.service
# Paste the content above, then:
sudo systemctl daemon-reload
sudo systemctl stop template
sudo systemctl disable template
sudo systemctl enable template-dev
sudo systemctl start template-dev
```

## Verification
After making changes, verify the service is running with auto-reload:

```bash
sudo systemctl status template-dev  # or template if using Option 1
sudo journalctl -u template-dev -f  # Watch logs
```

You should see in the logs:
```
[INFO] Starting gunicorn
[INFO] Listening at: unix:/run/template.sock
[INFO] Using worker: sync
```

## Testing Auto-Reload
To test if auto-reload is working:

1. Touch a Python file:
   ```bash
   touch /opt/apps/template/backend/apps/authentication/views.py
   ```

2. Watch the logs - you should see:
   ```
   [INFO] Worker reloading: /opt/apps/template/backend/apps/authentication/views.py modified
   [INFO] Worker exiting
   [INFO] Booting worker with pid: [new PID]
   ```

## Important Notes

1. **Development Only**: The `--reload` flag should ONLY be used on development servers, never in production.

2. **Single Worker**: Auto-reload only works with 1 worker (not 3).

3. **Performance**: With only 1 worker, the server can handle fewer concurrent requests, but this is fine for development.

4. **File Watching**: Gunicorn will watch all `.py` files in `/opt/apps/template/backend/` for changes.

5. **User Permissions**: The service runs as `nginx` user, so ensure that user can read all application files.

## Rollback
If you need to disable auto-reload:

For Option 1:
```bash
# Remove --reload flag and change workers back to 3
sudo nano /etc/systemd/system/template.service
sudo systemctl daemon-reload
sudo systemctl restart template
```

For Option 2:
```bash
# Switch back to production service
sudo systemctl stop template-dev
sudo systemctl disable template-dev
sudo systemctl enable template
sudo systemctl start template
```

## Contact
If you encounter any issues, the changes are minimal and easily reversible. The key change is just adding `--reload` and reducing workers to 1.
