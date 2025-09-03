"""Template tags for Vite-generated assets with hashed filenames."""

import os

from django import template
from django.conf import settings
from django.templatetags.static import static

register = template.Library()


@register.simple_tag
def vite_asset(pattern):
    """
    Find and return the URL for a Vite-generated asset with hash.

    Usage:
        {% vite_asset 'index*.js' %} finds index-HASH.js
        {% vite_asset 'index*.css' %} finds index-HASH.css
    """
    staticfiles_dir = os.path.join(settings.STATICFILES_DIRS[0], "assets")

    # In production, check the collected static files
    if not settings.DEBUG:
        staticfiles_dir = os.path.join(settings.STATIC_ROOT, "assets")

    # Find files matching the pattern
    if os.path.exists(staticfiles_dir):
        import fnmatch

        files = os.listdir(staticfiles_dir)
        matches = fnmatch.filter(files, pattern)
        if matches:
            # Use the first match (there should only be one)
            return static(f"assets/{matches[0]}")

    # Fallback to the pattern itself (will 404 but won't break template)
    return static(f"assets/{pattern}")


@register.simple_tag
def vite_assets():
    """
    Return all Vite JS and CSS assets as HTML tags.
    Finds all index*.js and index*.css files.
    """
    html_parts = []

    # Determine the directory to search
    if settings.DEBUG:
        staticfiles_dir = os.path.join(settings.STATICFILES_DIRS[0], "assets")
    else:
        staticfiles_dir = os.path.join(settings.STATIC_ROOT, "assets")

    if os.path.exists(staticfiles_dir):
        import fnmatch

        files = os.listdir(staticfiles_dir)

        # Find CSS files
        css_files = fnmatch.filter(files, "index*.css")
        for css_file in css_files:
            url = static(f"assets/{css_file}")
            html_parts.append(f'<link rel="stylesheet" href="{url}">')

        # Find JS files (vendor first, then others)
        vendor_files = fnmatch.filter(files, "vendor*.js")
        index_files = fnmatch.filter(files, "index*.js")
        other_js = [f for f in files if f.endswith(".js") and f not in vendor_files + index_files]

        js_files = vendor_files + other_js + index_files  # Load order matters
        for js_file in js_files:
            url = static(f"assets/{js_file}")
            html_parts.append(f'<script type="module" src="{url}"></script>')

    from django.utils.safestring import mark_safe

    return mark_safe("\n        ".join(html_parts))
