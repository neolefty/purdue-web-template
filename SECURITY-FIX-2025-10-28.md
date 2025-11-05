# Security Scan Remediation - October 28, 2025

**Instance**: django-template-qa.ag.purdue.edu
**Findings**: 5 Medium, 10 Low (0 High)
**Fix Required**: Add missing security headers to nginx config

## Quick Fix for Sysadmin

**Problem**: Static files (HTML, JS, CSS, robots.txt) served by nginx are missing security headers.
**Solution**: Use nginx `include` directive to manage security headers in one place.

### Recommended Approach (Using Include)

**Step 1**: Create `/etc/nginx/custom_headers.conf` with the following content:

```nginx
# Security headers for nginx (HTTPS)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "same-origin" always;
```

**Note**: For HTTP-only configs (no HTTPS), omit the HSTS line.

**Step 2**: Include in nginx config. Add these to the HTTPS server block (not applicable to HTTP):

```nginx
# In server block, before location blocks
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "same-origin" always;
```

**Critical**: When any `location` block uses `add_header`, nginx **doesn't inherit** headers from the parent. You must re-add security headers in every location block that uses `add_header` for caching (e.g., `Cache-Control`).

Typical locations needing headers:
- Static assets: `location ~* \.(js|css|png|jpg|...)`
- index.html: `location = /index.html`
- Django static: `location /static/`
- Media uploads: `location /media/`

Example for a location block with caching (using include):
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    # Re-add security headers (nginx doesn't inherit when add_header is used)
    include /etc/nginx/custom_headers.conf;
}
```

**Benefits of using include**:
- Change headers in one place
- Consistent across all apps on the server
- Easier to maintain and update

### Deploy

```bash
sudo nginx -t              # Test config
sudo systemctl reload nginx # Zero-downtime reload
```

### Verify

```bash
curl -I https://django-template-qa.ag.purdue.edu/ | grep -E 'Strict-Transport|X-Frame|X-Content|X-XSS|Referrer'
```

All five headers should appear in the response.

## Reference

**Updated templates** in this repo: `deployment/templates/nginx.prod.https.conf` shows the complete implementation if you need to reference it or decide to copy instead of manually editing.

**Note**: Django API endpoints (`/api/*`) already have correct headers via Django middleware. This fix is nginx-only for static files.

## Background

**Burp Suite scan** (Oct 16, 2025) found missing headers on static files:
- **Medium (5)**: Missing HSTS header
- **Low (10)**: Missing X-Content-Type-Options and X-XSS-Protection
- **Info (9)**: CORS (already correct), email placeholders, caching behavior, TLS cert (valid)

After this fix: All Medium/Low findings resolved.
