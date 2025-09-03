# Gunicorn configuration for development/testing with auto-reload
# Place this file at /opt/apps/template/gunicorn_config.py

import multiprocessing

# Server socket
bind = "unix:/run/template/gunicorn.sock"
backlog = 2048

# Worker processes
workers = 3
worker_class = "sync"

# Request handling
timeout = 30
graceful_timeout = 30
keepalive = 2

# Restart workers after this many requests
max_requests = 1000
max_requests_jitter = 50

# Logging
loglevel = "info"
accesslog = "/var/log/template/access.log"
errorlog = "/var/log/template/error.log"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s %(p)s'

# Process naming
proc_name = "template"

# Server mechanics
daemon = False
pidfile = "/run/template/gunicorn.pid"
user = "nginx"
group = "nginx"

# Environment
raw_env = [
    "DJANGO_SETTINGS_MODULE=config.settings.production",
]

# Preload application
preload_app = False

# AUTO-RELOAD ENABLED FOR DEVELOPMENT
# This will watch for file changes and restart workers
reload = True
reload_engine = "auto"
reload_extra_files = []

# Development: Also reload on template changes
import os
from pathlib import Path

# Add Django templates to watch list
django_root = Path("/opt/apps/template/backend")
if django_root.exists():
    for template_dir in django_root.rglob("templates"):
        reload_extra_files.extend(str(p) for p in template_dir.glob("**/*.html"))
