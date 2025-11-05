# Content Security Policy (CSP)

## Overview

CSP controls which resources (scripts, styles, images, etc.) can be loaded and executed. Not required for PSS scans.

## What CSP Blocks

Without proper configuration, CSP blocks:
- Inline scripts and styles
- `eval()` and dynamic code execution
- Resources from non-whitelisted domains
- Anything not explicitly allowed

## Testing Approach

### Report-Only Mode

Add to `/etc/nginx/custom_headers.conf`:

```nginx
add_header Content-Security-Policy-Report-Only "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self';" always;
```

This logs violations in the browser console without blocking. Monitor for 24-48 hours, then adjust the policy.

## Enforcement Mode

After testing, replace `Content-Security-Policy-Report-Only` with `Content-Security-Policy`:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self';" always;
```

### Directive Reference

| Directive | Meaning |
|-----------|---------|
| `default-src 'self'` | Default: same origin only |
| `script-src 'self'` | JavaScript from same origin |
| `style-src 'self' 'unsafe-inline'` | CSS from same origin, allow inline |
| `img-src 'self' data: https:` | Images from same origin, data URIs, HTTPS |
| `font-src 'self' data:` | Fonts from same origin, data URIs |
| `connect-src 'self'` | API calls to same origin only |
| `frame-ancestors 'self'` | Only allow same-origin framing |
| `base-uri 'self'` | Restrict `<base>` tag |
| `form-action 'self'` | Forms submit to same origin only |

### Common Additions

Google Analytics:
```nginx
script-src 'self' https://www.google-analytics.com;
connect-src 'self' https://www.google-analytics.com;
```

External fonts:
```nginx
font-src 'self' data: https://fonts.gstatic.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
```

External images:
```nginx
img-src 'self' data: https:;
```

## Implementation

Add to `/etc/nginx/custom_headers.conf`:

```nginx
add_header Content-Security-Policy "..." always;
```

Or add to the server block if you prefer CSP to only apply there.

## Troubleshooting

If app breaks after enabling CSP:

1. Check browser console for violations
2. Switch back to Report-Only mode
3. Adjust policy to whitelist blocked resources
4. Re-test in Report-Only mode
5. Switch to enforcement when clean

### Inline Scripts/Styles

Use external files, or add `'unsafe-inline'` to `script-src`/`style-src`. For better security, use nonces (requires server-side random generation).

### Third-Party Scripts

Add domains to the relevant directive:
```nginx
script-src 'self' https://cdn.example.com;
```
