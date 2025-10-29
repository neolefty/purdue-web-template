# Turf Research Plot Treatment Tracking

## ⚠️ IMPORTANT: PowerShell 6+ Required

**PowerShell 6+ (pwsh) is not installed on this system.** The implementation is complete in code files, but requires manual setup steps.

### Install PowerShell 6+ (Recommended)
1. Download from: https://aka.ms/powershell
2. Install and restart your terminal
3. I can then complete the automated setup

**OR follow the manual installation steps below:**

---

## Manual Installation Instructions

### STEP 1: Create Directory Structure
Create these directories manually:
```
backend/apps/turf_research/
backend/apps/turf_research/migrations/
```

### STEP 2: Create Backend Files
Copy the code from `TURF_RESEARCH_IMPLEMENTATION.txt` to create these files:
- `backend/apps/turf_research/__init__.py` (empty)
- `backend/apps/turf_research/migrations/__init__.py` (empty)
- `backend/apps/turf_research/apps.py`
- `backend/apps/turf_research/models.py`
- `backend/apps/turf_research/admin.py`
- `backend/apps/turf_research/serializers.py`
- `backend/apps/turf_research/views.py`
- `backend/apps/turf_research/urls.py`

### STEP 3: Configuration (✅ Already Done)
The following files have been updated:
- ✅ `backend/config/settings/base.py` - Added `apps.turf_research` to INSTALLED_APPS
- ✅ `backend/config/urls.py` - Added URL route for turf research API

### STEP 4: Run Django Commands
```bash
# Create database migrations
docker compose exec backend python manage.py makemigrations turf_research

# Apply migrations to database
docker compose exec backend python manage.py migrate

# Restart the backend server
docker compose restart backend
```

### STEP 5: Access the Application
- **Django Admin**: http://localhost:8000/admin/ (full management interface)
- **REST API**: http://localhost:8000/api/turf-research/
- **API Docs**: http://localhost:8000/api/swagger/

---

## Features Implemented

### Backend (Django) ✅
- **Models**: 
  - `Plot` - Research plot information (name, location, size, grass type)
  - `Treatment` - Base treatment record (type, date, time, notes)
  - `WaterTreatment` - Water/irrigation details (amount, duration, method)
  - `FertilizerTreatment` - Fertilizer application (product, NPK ratio, amount, rate)
  - `ChemicalTreatment` - Chemical applications (type, product, active ingredient, target pest)
  - `MowingTreatment` - Mowing operations (height, clippings removed, mower type, pattern)

- **API Endpoints**: Full REST API with filtering, search, and ordering
- **Admin Interface**: Django admin configured for all models with inline editing
- **Database Indexes**: Optimized queries for plot and date lookups
- **User Tracking**: Automatically tracks who created plots and applied treatments

### Frontend (React)
❌ **Not implemented due to PowerShell limitation**
- Use Django Admin interface instead, OR
- Install PowerShell 6+ and request frontend implementation

---

## API Usage Examples

### Create a Plot
```bash
curl -X POST http://localhost:8000/api/turf-research/plots/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Plot A-1",
    "location": "North Field",
    "size_sqft": 1000,
    "grass_type": "Kentucky Bluegrass",
    "notes": "Control plot"
  }'
```

### Create a Water Treatment
```bash
curl -X POST http://localhost:8000/api/turf-research/treatments/ \
  -H "Content-Type: application/json" \
  -d '{
    "plot": 1,
    "treatment_type": "water",
    "date": "2025-10-28",
    "time": "08:00:00",
    "notes": "Morning irrigation",
    "water_details": {
      "amount_inches": 0.5,
      "duration_minutes": 30,
      "method": "overhead sprinkler"
    }
  }'
```

### Create a Fertilizer Treatment
```bash
curl -X POST http://localhost:8000/api/turf-research/treatments/ \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Create a Chemical Treatment
```bash
curl -X POST http://localhost:8000/api/turf-research/treatments/ \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Create a Mowing Treatment
```bash
curl -X POST http://localhost:8000/api/turf-research/treatments/ \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Filter Treatments
```bash
# By plot
GET /api/turf-research/treatments/?plot=1

# By treatment type
GET /api/turf-research/treatments/?treatment_type=water

# By date
GET /api/turf-research/treatments/?date=2025-10-28

# Search in notes or plot name
GET /api/turf-research/treatments/?search=irrigation

# Order by date (newest first)
GET /api/turf-research/treatments/?ordering=-date
```

---

## Database Schema

### Plot
- `name` - Unique plot identifier
- `location` - Physical location
- `size_sqft` - Plot size in square feet
- `grass_type` - Type of grass
- `notes` - Additional notes
- `created_by` - User who created the plot
- `created_at`, `updated_at` - Timestamps

### Treatment (Base)
- `plot` - Foreign key to Plot
- `treatment_type` - water, fertilizer, chemical, or mowing
- `date` - Treatment date
- `time` - Treatment time (optional)
- `notes` - Treatment notes
- `applied_by` - User who applied treatment
- `created_at`, `updated_at` - Timestamps

### Treatment Details (One-to-One with Treatment)
Each treatment type has specific fields for recording relevant data:
- **Water**: amount (inches), duration (minutes), method
- **Fertilizer**: product name, NPK ratio, amount, unit, rate per 1000 sqft
- **Chemical**: chemical type, product, active ingredient, amount, unit, rate, target pest
- **Mowing**: height (inches), clippings removed, mower type, pattern

---

## Next Steps

1. **Install PowerShell 6+** (recommended) OR complete manual setup above
2. **Run migrations**: `docker compose exec backend python manage.py makemigrations turf_research && docker compose exec backend python manage.py migrate`
3. **Access Django Admin**: http://localhost:8000/admin/
4. **Start tracking**: Create plots and record treatments!

---

## Support

See `TURF_RESEARCH_IMPLEMENTATION.txt` for complete source code of all backend files.
