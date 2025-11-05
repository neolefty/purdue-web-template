# Sysadmin Notes - Security Headers

## Setup

Create `/etc/nginx/custom_headers.conf`:

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "same-origin" always;
```

For HTTP-only apps, omit the HSTS (Strict-Transport-Security) line.

## How It Works

The nginx config templates use `include /etc/nginx/custom_headers.conf;` in location blocks that set caching headers. This solves nginx's header inheritance issue - when a location block uses `add_header`, it doesn't inherit headers from the parent server block.

Example from the configs:
```nginx
location ~* \.(js|css|png|jpg|...)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    include /etc/nginx/custom_headers.conf;
}
```

Update `/etc/nginx/custom_headers.conf` once and it applies to all apps on the server.

## Deploy

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Verify

```bash
curl -I https://your-domain.com/ | grep -E 'Strict-Transport|X-Frame|X-Content|X-XSS|Referrer'
```

All five headers should appear.

## Optional: CSP

See `deployment/CSP-GUIDANCE.md` for Content Security Policy configuration. Not required for PSS scans.
