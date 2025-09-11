@echo off
REM Reset script for starting fresh with the Django-React template
REM This is helpful when you want to clear all data and start over

echo =======================================
echo Django-React Template Reset Script
echo =======================================
echo.
echo This will:
echo   - Stop all containers
echo   - Remove all containers and volumes
echo   - Clear the database
echo   - Remove any generated files
echo.
set /p CONFIRM="Are you sure you want to reset everything? (y/N) "
if /i not "%CONFIRM%"=="y" (
    echo Cancelled.
    exit /b 1
)

echo.
echo Stopping containers...
docker compose down -v

echo Cleaning up generated files...
REM Remove Python cache files
for /d /r . %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d" 2>nul
del /s /q *.pyc 2>nul

REM Remove SQLite database if it exists
if exist backend\db.sqlite3 del backend\db.sqlite3 2>nul

REM Remove media and static files
if exist backend\media rd /s /q backend\media 2>nul
mkdir backend\media
if exist backend\staticfiles rd /s /q backend\staticfiles 2>nul
mkdir backend\staticfiles

REM Remove frontend build files
if exist frontend\dist rd /s /q frontend\dist 2>nul
if exist frontend\node_modules rd /s /q frontend\node_modules 2>nul

echo.
echo Reset complete!
echo.
echo To start fresh:
echo   1. Copy the example environment file:
echo      copy backend\.env.example backend\.env
echo.
echo   2. Edit backend\.env to set your admin password:
echo      DEFAULT_SUPERUSER_PASSWORD=your-secure-password
echo.
echo   3. Start the application:
echo      docker compose up
echo.
echo The system will automatically:
echo   - Create the database
echo   - Run migrations
echo   - Create an admin user with your password
echo.
pause
