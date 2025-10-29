# Turf Research Quick Reference

## Setup (Choose One Method)

### Method 1: Python Script (Easiest)
```bash
python setup_turf_research.py
docker compose exec backend python manage.py makemigrations turf_research
docker compose exec backend python manage.py migrate
docker compose restart backend
```

### Method 2: Bash Script (Mac/Linux/WSL)
```bash
bash setup_turf_research.sh
# Then copy code from TURF_RESEARCH_IMPLEMENTATION.txt
docker compose exec backend python manage.py makemigrations turf_research
docker compose exec backend python manage.py migrate
docker compose restart backend
```

### Method 3: Windows Batch
```cmd
setup_turf_research.bat
REM Then copy code from TURF_RESEARCH_IMPLEMENTATION.txt
docker compose exec backend python manage.py makemigrations turf_research
docker compose exec backend python manage.py migrate
docker compose restart backend
```

## Access Points

| Interface | URL |
|-----------|-----|
| Django Admin | http://localhost:8000/admin/ |
| REST API | http://localhost:8000/api/turf-research/ |
| API Docs (Swagger) | http://localhost:8000/api/swagger/ |
| API Docs (ReDoc) | http://localhost:8000/api/redoc/ |

## API Quick Reference

### List Plots
```bash
GET /api/turf-research/plots/
```

### Create Plot
```bash
POST /api/turf-research/plots/
Content-Type: application/json

{
  "name": "Plot A-1",
  "location": "North Field",
  "size_sqft": 1000,
  "grass_type": "Kentucky Bluegrass"
}
```

### List Treatments (with filters)
```bash
# All treatments
GET /api/turf-research/treatments/

# For specific plot
GET /api/turf-research/treatments/?plot=1

# By type
GET /api/turf-research/treatments/?treatment_type=water

# By date
GET /api/turf-research/treatments/?date=2025-10-28
```

### Create Water Treatment
```bash
POST /api/turf-research/treatments/
Content-Type: application/json

{
  "plot": 1,
  "treatment_type": "water",
  "date": "2025-10-28",
  "time": "08:00:00",
  "water_details": {
    "amount_inches": 0.5,
    "duration_minutes": 30,
    "method": "overhead sprinkler"
  }
}
```

### Create Fertilizer Treatment
```bash
POST /api/turf-research/treatments/
Content-Type: application/json

{
  "plot": 1,
  "treatment_type": "fertilizer",
  "date": "2025-10-28",
  "fertilizer_details": {
    "product_name": "Scotts Turf Builder",
    "npk_ratio": "20-10-10",
    "amount": 5.5,
    "amount_unit": "lbs",
    "rate_per_1000sqft": 5.5
  }
}
```

### Create Chemical Treatment
```bash
POST /api/turf-research/treatments/
Content-Type: application/json

{
  "plot": 1,
  "treatment_type": "chemical",
  "date": "2025-10-28",
  "chemical_details": {
    "chemical_type": "herbicide",
    "product_name": "Roundup Pro",
    "active_ingredient": "Glyphosate",
    "amount": 8,
    "amount_unit": "oz",
    "rate_per_1000sqft": 8,
    "target_pest": "Broadleaf weeds"
  }
}
```

### Create Mowing Treatment
```bash
POST /api/turf-research/treatments/
Content-Type: application/json

{
  "plot": 1,
  "treatment_type": "mowing",
  "date": "2025-10-28",
  "time": "10:00:00",
  "mowing_details": {
    "height_inches": 2.5,
    "clippings_removed": false,
    "mower_type": "Rotary",
    "pattern": "Diagonal"
  }
}
```

## Treatment Types

| Type | Required Details |
|------|------------------|
| `water` | amount_inches |
| `fertilizer` | product_name, amount, amount_unit |
| `chemical` | chemical_type, product_name, amount, amount_unit |
| `mowing` | height_inches |

## Chemical Types

- `herbicide` - Weed control
- `insecticide` - Insect control
- `fungicide` - Disease control
- `growth_regulator` - Growth regulation
- `other` - Other chemicals

## Common Django Commands

```bash
# Create migrations
docker compose exec backend python manage.py makemigrations turf_research

# Apply migrations
docker compose exec backend python manage.py migrate

# Create admin user
docker compose exec backend python manage.py createsuperuser

# Start development server
docker compose up

# Restart backend
docker compose restart backend

# View logs
docker compose logs -f backend
```

## Files Created

- `backend/config/settings/base.py` - Added app to INSTALLED_APPS
- `backend/config/urls.py` - Added API routes
- `backend/apps/turf_research/models.py` - Database models
- `backend/apps/turf_research/serializers.py` - API serializers
- `backend/apps/turf_research/views.py` - API views
- `backend/apps/turf_research/admin.py` - Admin interface
- `backend/apps/turf_research/urls.py` - URL routing

## Support Files

- `TURF_RESEARCH_SUMMARY.md` - Complete overview
- `TURF_RESEARCH_SETUP.md` - Detailed setup guide
- `TURF_RESEARCH_IMPLEMENTATION.txt` - Full source code
- `setup_turf_research.py` - Automated setup script
