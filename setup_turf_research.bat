@echo off
REM Turf Research App Setup Script for Windows
REM This script creates the directory structure for the turf_research app

echo Creating turf_research app directory structure...

REM Create main app directory
if not exist "backend\apps\turf_research" mkdir "backend\apps\turf_research"

REM Create migrations directory
if not exist "backend\apps\turf_research\migrations" mkdir "backend\apps\turf_research\migrations"

echo.
echo Directory structure created successfully!
echo.
echo Now copy the files from TURF_RESEARCH_IMPLEMENTATION.txt to:
echo   backend\apps\turf_research\
echo.
echo Then run:
echo   docker compose exec backend python manage.py makemigrations turf_research
echo   docker compose exec backend python manage.py migrate
echo   docker compose restart backend
echo.
pause
