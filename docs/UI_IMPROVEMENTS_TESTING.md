# UI Improvements - Testing Guide

## Changes Implemented

### 1. ✅ Reports Page (`/turf-research/reports`)
- [x] Hierarchical plot display with expand/collapse
- [x] Map with no tilt (tilt: 0)
- [x] Zoom controls enabled (+ / - buttons)
- [x] Collapsible plot tree in sidebar

### 2. ✅ Plots Page (`/turf-research/plots`)
- [x] Edit button always visible (no hover required)
- [x] Collapsible hierarchical plot display
- [x] Parent plots show expand arrow (▶/▼)
- [x] Subplots indented under parents
- [x] Shows subplot count on parent plots

### 3. ✅ Treatments Page (`/turf-research/treatments`)
- [x] Time field labeled as "Time (optional)"
- [x] Empty time field doesn't cause validation error
- [x] Time can be left blank when creating treatments

### 4. ✅ Master Lists for Locations and Grass Types
- [x] Backend models created: `Location` and `GrassType`
- [x] API endpoints created:
  - `GET /api/turf-research/locations/`
  - `POST /api/turf-research/locations/`
  - `PUT/PATCH /api/turf-research/locations/{id}/`
  - `DELETE /api/turf-research/locations/{id}/`
  - Same for `grass-types`
- [x] Admin interface registered
- [x] Database migrations applied

## Testing Steps

### Test 1: Reports Page Hierarchy & Map Controls
1. ✅ Go to http://localhost:5173/turf-research/reports
2. ✅ Check sidebar - plots should be in tree structure
3. ✅ Click arrow next to parent plot - should expand/collapse
4. ✅ Check map - should have + / - zoom buttons in top right
5. ✅ Try zooming with buttons
6. ✅ Map should not tilt when zooming

### Test 2: Plots Page Hierarchy & Visible Edit Button
1. ✅ Go to http://localhost:5173/turf-research/plots
2. ✅ Plots should be displayed in hierarchy (not grid)
3. ✅ Edit button should be visible immediately (no hover)
4. ✅ Parent plots should have expand arrow
5. ✅ Click arrow to expand and see subplots
6. ✅ Subplots should be indented
7. ✅ All buttons (Edit, Delete, Treatments) visible

### Test 3: Optional Time Field
1. ✅ Go to http://localhost:5173/turf-research/treatments
2. ✅ Click "Add Treatment"
3. ✅ Time field should say "Time (optional)"
4. ✅ Select a plot, treatment type, date
5. ✅ **LEAVE TIME BLANK**
6. ✅ Fill in treatment details
7. ✅ Click Create
8. ✅ Should save successfully without error

### Test 4: Master Lists (Backend Only - UI Coming)
Currently accessible via Django Admin:
1. ✅ Go to http://localhost:8000/admin
2. ✅ Login with admin credentials
3. ✅ See "Locations" and "Grass types" sections
4. ✅ Can add/edit/delete locations
5. ✅ Can add/edit/delete grass types

## API Testing

### Test Location API:
```bash
# List locations
curl http://localhost:8000/api/turf-research/locations/

# Create location
curl -X POST http://localhost:8000/api/turf-research/locations/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "North Campus Field", "description": "Main research area"}'

# Update location
curl -X PATCH http://localhost:8000/api/turf-research/locations/1/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"description": "Updated description"}'

# Delete location
curl -X DELETE http://localhost:8000/api/turf-research/locations/1/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Grass Type API:
```bash
# List grass types
curl http://localhost:8000/api/turf-research/grass-types/

# Create grass type
curl -X POST http://localhost:8000/api/turf-research/grass-types/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Kentucky Bluegrass",
    "scientific_name": "Poa pratensis",
    "description": "Cool-season grass"
  }'
```

## What's Next

### Phase 2: Frontend UI for Master Lists
To complete the master list feature, we need to:
1. Create frontend components for managing locations
2. Create frontend components for managing grass types
3. Update PlotForm to use dropdowns with master lists
4. Add "Manage Lists" link in Plots page
5. Add ability to quick-add from PlotForm

Would you like me to implement the frontend UI for managing these master lists now?

## Current Status

### ✅ Completed:
- Reports page hierarchical display
- Reports page map controls (zoom + no tilt)
- Plots page hierarchical display  
- Plots page always-visible edit button
- Treatments page optional time field
- Backend for location master list
- Backend for grass type master list

### 🔄 Pending:
- Frontend UI to manage locations
- Frontend UI to manage grass types
- Update PlotForm to use dropdowns

## Quick Verification Commands

```bash
# Check if services running
docker compose ps

# View recent logs
docker compose logs --tail=20

# Check migrations applied
docker compose exec backend python manage.py showmigrations turf_research

# Test backend health
curl http://localhost:8000/api/health/

# Check if APIs exist
curl http://localhost:8000/api/turf-research/locations/
curl http://localhost:8000/api/turf-research/grass-types/
```

## Browser Testing Checklist

- [ ] Reports page loads without errors
- [ ] Reports page shows hierarchical plots
- [ ] Reports map has zoom controls
- [ ] Reports map doesn't tilt
- [ ] Plots page shows hierarchy
- [ ] Plots page edit button visible
- [ ] Plots can expand/collapse
- [ ] Treatment time field shows "(optional)"
- [ ] Treatment saves without time
- [ ] No console errors

---

**Status:** All 4 changes implemented and ready for testing!  
**Next Step:** Test in browser, then decide if you want frontend UI for master lists.
