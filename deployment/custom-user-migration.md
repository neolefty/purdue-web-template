# Custom User Model Migration

## Automatic Migration (SQLite only)
For SQLite databases, gitops-lite.sh will automatically handle the migration:
1. Detects if migration is needed
2. Backs up existing database
3. Resets database for custom User model
4. Creates flag file to prevent re-running
5. Sends email notification (if configured)

After automatic migration, create a new superuser:
```bash
cd /opt/apps/template
source ./venv/bin/activate
cd backend
python manage.py createsuperuser
```

## What Changed
- Switched from Django's built-in User to custom User model
- Email is now required and unique
- Users can login with username OR email
- Better foundation for future customization

## Important Notes
- This is a ONE-TIME migration
- The migration code will be removed from gitops-lite.sh after November 2025
- Backup is saved to: `data/db.sqlite3.pre-custom-user.{timestamp}`
- Migration flag file: `.custom-user-model-migrated`

## For Non-SQLite Databases
Manual migration required. Contact development team for assistance.
