# Database Configuration

## Template Deployment (SQLite)
The template deployment uses SQLite for simplicity. This is sufficient for demo/template purposes with light traffic.

## Production Applications
When creating a real application from this template:

1. **Contact the database team** for PostgreSQL/MySQL/Oracle setup
2. **Update `.env`** with the provided database credentials:
   ```
   DATABASE_ENGINE=postgresql
   DB_NAME=your_app_db
   DB_HOST=db.purdue.edu
   DB_USER=your_app_user
   DB_PASSWORD=<provided_by_db_team>
   ```
3. **Run migrations** against the new database:
   ```bash
   python manage.py migrate
   ```

## Switching from SQLite to Production Database
1. Export data if needed: `python manage.py dumpdata > data.json`
2. Update `.env` with new database settings
3. Run migrations: `python manage.py migrate`
4. Import data if needed: `python manage.py loaddata data.json`

## Database Support
The template supports these database engines out of the box:
- PostgreSQL (recommended for production)
- MySQL/MariaDB
- Oracle
- MS SQL Server
- SQLite (template/development only)
