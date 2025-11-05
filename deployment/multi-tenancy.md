# Multi-Tenancy Implementation Guide

This document outlines how to add multi-tenancy support to this Django-React template using PostgreSQL schemas via the `django-tenants` package.

## Overview

Multi-tenancy allows multiple instances of the application to share a single database while maintaining data isolation. The `django-tenants` approach uses PostgreSQL schemas where each tenant gets its own schema (e.g., `tenant1.users`, `tenant2.users`) while sharing a common `public` schema for tenant definitions and shared data.

**Use Case**: Reduces administrative overhead when setting up persistent databases is expensive, allowing many deployments to share one database instance.

## Architecture

### Schema Structure
- **Public Schema**: Stores tenant definitions and shared tables
  - `Tenant` model (schema_name, domains, metadata)
  - Shared authentication if managing tenants centrally
- **Tenant Schemas**: Each tenant gets isolated schema for their data
  - All application models (posts, comments, user data, etc.)
  - Complete data isolation via PostgreSQL schemas

### Request Flow
1. User visits `tenant1.yourapp.purdue.edu`
2. Middleware extracts subdomain, looks up tenant
3. PostgreSQL `search_path` set to `tenant1_schema,public`
4. All ORM queries automatically use tenant's schema
5. Response returned with tenant context maintained

## Implementation Steps

### 1. Install Dependencies

```bash
# Add to backend/requirements.txt
django-tenants==3.6.1
```

### 2. Update Django Settings

**backend/config/settings/base.py**:

```python
SHARED_APPS = [
    'django_tenants',  # Must be first
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.sessions',
    'django.contrib.admin',
    # Add shared apps here
    'core',  # Tenant model lives here
]

TENANT_APPS = [
    'django.contrib.contenttypes',  # Need this in both
    'django.contrib.auth',  # Need this in both if using per-tenant users
    # All your application apps
    'api',
    'authentication',
]

INSTALLED_APPS = list(SHARED_APPS) + [app for app in TENANT_APPS if app not in SHARED_APPS]

# Change database backend
DATABASES = {
    'default': {
        'ENGINE': 'django_tenants.postgresql_backend',
        # ... rest of PostgreSQL config
    }
}

# Middleware - TenantMiddleware must be first
MIDDLEWARE = [
    'django_tenants.middleware.main.TenantMainMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # ... rest of middleware
]

# Tenant configuration
TENANT_MODEL = "core.Tenant"
TENANT_DOMAIN_MODEL = "core.Domain"

# Public schema configuration
PUBLIC_SCHEMA_NAME = 'public'
PUBLIC_SCHEMA_URLCONF = 'config.urls_public'  # Separate URL conf for public

# Show tenant URL patterns under /
ROOT_URLCONF = 'config.urls'
```

### 3. Create Tenant Models

**backend/core/models.py**:

```python
from django.db import models
from django_tenants.models import TenantMixin, DomainMixin

class Tenant(TenantMixin):
    """
    Represents a tenant (isolated instance) in the system.
    Automatically creates and manages PostgreSQL schema.
    """
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_on = models.DateTimeField(auto_now_add=True)

    # Optional: add fields for subscription, billing, features, etc.
    is_active = models.BooleanField(default=True)

    auto_create_schema = True  # Automatically create schema on save
    auto_drop_schema = True    # Drop schema when tenant deleted (use carefully!)

    def __str__(self):
        return self.name


class Domain(DomainMixin):
    """
    Maps domains/subdomains to tenants.
    Example: tenant1.yourapp.purdue.edu -> Tenant(schema_name='tenant1')
    """
    pass
```

### 4. Create URL Configurations

**backend/config/urls_public.py** (new file):

```python
"""
URL configuration for public schema (tenant management).
Accessed when no tenant subdomain is provided.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Add tenant signup/management endpoints here
    path('api/tenants/', include('core.tenant_urls')),
]
```

**backend/config/urls.py** (existing, for tenant schemas):

```python
"""
URL configuration for tenant schemas.
These URLs are accessed with tenant context.
"""
from django.urls import path, include

urlpatterns = [
    path('api/', include('api.urls')),
    path('api/auth/', include('authentication.urls')),
    # All existing app URLs
]
```

### 5. Create Management Commands

**backend/core/management/commands/create_tenant.py**:

```python
from django.core.management.base import BaseCommand
from core.models import Tenant, Domain

class Command(BaseCommand):
    help = 'Create a new tenant'

    def add_arguments(self, parser):
        parser.add_argument('schema_name', type=str)
        parser.add_argument('name', type=str)
        parser.add_argument('domain', type=str)

    def handle(self, *args, **options):
        tenant = Tenant.objects.create(
            schema_name=options['schema_name'],
            name=options['name']
        )
        Domain.objects.create(
            domain=options['domain'],
            tenant=tenant,
            is_primary=True
        )
        self.stdout.write(
            self.style.SUCCESS(f'Tenant {options["name"]} created successfully')
        )
```

### 6. Update Docker Configuration

**docker-compose.yml**:

```yaml
# No changes needed to services, but consider:
# - Wildcard DNS setup for local development (*.localhost)
# - May need to add dnsmasq service for local subdomain resolution
```

**Local DNS Options**:

Option A: Use `.localhost` (modern browsers support this):
- `tenant1.localhost:5173`
- No configuration needed

Option B: Add entries to `/etc/hosts`:
```
127.0.0.1 tenant1.localhost tenant2.localhost
```

Option C: Use dnsmasq for wildcard (more complex, allows any subdomain).

### 7. Update Frontend Configuration

**frontend/src/api/client.ts**:

```typescript
// Tenant is determined by subdomain, no changes needed to API client
// All requests automatically scoped to current tenant
```

**frontend/vite.config.ts**:

```typescript
// No changes needed - proxy works the same
// Tenant context handled by backend middleware
```

### 8. Migration Strategy

**Initial Setup**:

```bash
# 1. Run migrations for shared apps (creates tenant tables in public schema)
docker compose exec backend python manage.py migrate_schemas --shared

# 2. Create the public tenant (required for django-tenants)
docker compose exec backend python manage.py create_tenant public "Public Tenant" localhost:8000

# 3. Create first real tenant
docker compose exec backend python manage.py create_tenant tenant1 "Tenant One" tenant1.localhost:5173

# 4. Migrate tenant schemas (runs migrations for all tenants)
docker compose exec backend python manage.py migrate_schemas
```

**Adding New Tenants**:

```bash
docker compose exec backend python manage.py create_tenant <schema> <name> <domain>
# Migrations run automatically
```

**Updating Code**:

```bash
# After adding new models/migrations
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate_schemas
# Applies to all tenant schemas
```

### 9. Update Authentication

**If using shared authentication** (one user can access multiple tenants):
- Keep User model in SHARED_APPS
- Add TenantUserRelationship model to track which users can access which tenants
- Update authentication to check tenant access permissions

**If using isolated authentication** (each tenant has separate users):
- Keep User model in TENANT_APPS (current setup)
- Each tenant's users completely isolated
- Simpler, better security

### 10. Environment Variables

Add to `.env`:

```bash
# Multi-tenancy settings
ENABLE_MULTI_TENANCY=true  # Feature flag to enable/disable
DEFAULT_TENANT_SCHEMA=public
```

## Development Workflow

### Creating a New Tenant

```bash
# Via management command
docker compose exec backend python manage.py create_tenant myteam "My Team" myteam.localhost:5173

# Via Django shell
docker compose exec backend python manage.py tenant_command shell
>>> from core.models import Tenant, Domain
>>> t = Tenant(schema_name='team2', name='Team 2')
>>> t.save()
>>> d = Domain(domain='team2.localhost:5173', tenant=t, is_primary=True)
>>> d.save()
```

### Running Commands for Specific Tenant

```bash
# Run command for all tenants
docker compose exec backend python manage.py tenant_command <command>

# Run for specific tenant
docker compose exec backend python manage.py tenant_command <command> --schema=tenant1
```

### Accessing Tenant Data

```bash
# Django shell with tenant context
docker compose exec backend python manage.py tenant_command shell --schema=tenant1
>>> User.objects.all()  # Only shows users for tenant1
```

## Production Considerations

### 1. DNS Configuration

Requires wildcard DNS record:
```
*.yourapp.purdue.edu -> your-server-ip
```

Contact Purdue IT to set this up.

### 2. SSL/TLS Certificates

Need wildcard certificate:
```
*.yourapp.purdue.edu
```

Or use Let's Encrypt wildcard cert (requires DNS-01 challenge).

### 3. Performance

- **Connection Pooling**: Each request switches schemas, but uses same connection
- **Indexes**: Apply to all tenant schemas, plan accordingly
- **Backups**: Single database, but consider per-tenant restore capabilities
- **Migrations**: Run for all tenants simultaneously, test on staging with many tenants

### 4. Monitoring

- Log which tenant each request is for
- Track schema sizes: `pg_total_relation_size('tenant_schema')`
- Monitor migration times across all tenants
- Set up alerts for tenant schema disk usage

### 5. Tenant Limits

Consider adding:
- Max storage per tenant
- Rate limiting per tenant
- Max users per tenant
- Feature flags per tenant (subscription tiers)

## Rollback Plan

If multi-tenancy needs to be removed:

1. **Export tenant data**:
   ```bash
   pg_dump -n tenant_schema dbname > tenant_backup.sql
   ```

2. **Create separate databases**: One per tenant

3. **Restore data**:
   ```bash
   psql new_tenant_db < tenant_backup.sql
   ```

4. **Remove django-tenants**: Revert to standard Django setup

5. **Deploy separate instances**: Each tenant gets own deployment

## Testing

### Unit Tests

```python
from django_tenants.test.cases import TenantTestCase
from core.models import Tenant, Domain

class MyTenantTestCase(TenantTestCase):
    @classmethod
    def setup_tenant(cls, tenant):
        """Called to set up tenant for test"""
        return tenant

    def test_something(self):
        # Runs in isolated tenant schema
        pass
```

### Integration Tests

Test with multiple tenants to ensure isolation:
- Create 2+ tenants
- Add data to each
- Verify no cross-tenant data leakage
- Test tenant switching works correctly

## Alternative Approaches Considered

### 1. Table Prefixing
- **Pro**: Works with any database
- **Con**: No Django package support, requires extensive custom code
- **Con**: Migrations become very complex

### 2. Separate Databases
- **Pro**: Complete isolation, can upgrade tenants independently
- **Con**: Administrative overhead (the problem we're solving)
- **Con**: Can't easily query across tenants

### 3. Discriminator Column
- **Pro**: Simplest implementation
- **Con**: Weak isolation, easy to leak data across tenants
- **Con**: All queries need filtering, performance impact

### 4. Django Multi-Tenant (different package)
- Similar to django-tenants but less mature
- django-tenants is more actively maintained

## References

- [django-tenants Documentation](https://django-tenants.readthedocs.io/)
- [PostgreSQL Schema Documentation](https://www.postgresql.org/docs/current/ddl-schemas.html)
- [Multi-tenancy Best Practices](https://www.citusdata.com/blog/2017/03/09/multi-tenant-sharding-tutorial/)

## Questions for Planning Session

Before implementing, decide:

1. **Authentication Model**: Shared users or isolated per tenant?
2. **Tenant Provisioning**: Self-service or admin-created?
3. **Subdomain Format**: `tenant.app.purdue.edu` or `app-tenant.purdue.edu`?
4. **Tenant Lifecycle**: Can tenants be deleted? Archived? Migrated?
5. **Data Exports**: Should tenants be able to export their data?
6. **Billing/Limits**: Will different tenants have different quotas?
7. **Migration Strategy**: Big bang or gradual rollout?

## Estimated Implementation Time

- **Core Setup**: 2-4 hours (dependencies, models, settings)
- **Management Commands**: 1-2 hours
- **Frontend Updates**: 1 hour (minimal changes needed)
- **Testing**: 2-4 hours (multi-tenant test cases)
- **Documentation**: 1-2 hours
- **Production DNS/SSL**: 1-2 hours (depends on IT responsiveness)

**Total**: 8-15 hours of development time

## Contact

For questions about this implementation approach, refer to the Q&A session where this was discussed.
