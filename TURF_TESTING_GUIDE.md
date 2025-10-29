# Turf Research System - Quick Start and Testing Guide

## 🚀 Quick Start

### 1. Start the Application
```bash
cd /path/to/django-react-template
docker compose up
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5173/api (proxied through frontend)
- **Django Admin**: http://localhost:5173/admin

### 2. Create a Test User

**Option A: Using Django Admin**
```bash
docker compose exec backend python manage.py createsuperuser
```
Follow the prompts to create a username, email, and password.

**Option B: Using Django Shell**
```bash
docker compose exec backend python manage.py shell
```
Then run:
```python
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.create_user(username='test', email='test@example.com', password='testpass123')
user.is_staff = True
user.save()
exit()
```

### 3. Log In
1. Navigate to http://localhost:5173/login
2. Enter your credentials
3. You'll be redirected to the home page

### 4. Access Turf Research
Click on "Turf Research" in the navigation menu, which will show:
- **Plots** - Manage research plots
- **Treatments** - Record and manage treatments
- **Reports** - View treatment history and maps

## 🧪 Testing Scenarios

### Scenario 1: Create Your First Plot

**Goal**: Create a plot with map coordinates

**Steps**:
1. Navigate to **Turf Research > Plots**
2. Click **"Add New Plot"** button (gold button, top right)
3. Fill in the form:
   - **Name**: "Main Research Plot 1" (required)
   - **Location**: Click "+" to quick-add "North Field" or select existing
   - **Grass Type**: Click "+" to quick-add "Kentucky Bluegrass" or select existing
   - **Size**: 5000 (sq ft)
   - **Notes**: "Primary research area"
4. On the map section:
   - Click **"Start Drawing"**
   - Click 4-5 points on the map to create a rectangular/polygon boundary
   - Either click near the first point (green) or click **"Complete"** button
   - You should see "✓ Polygon saved" message
5. Click **"Create"** button

**Expected Results**:
- Plot appears in the list below
- Plot shows location, grass type, size, and treatment count (0)
- Edit and Delete buttons are visible
- No error messages

**Troubleshooting**:
- If you see "Please draw the plot boundary..." error: You must complete the polygon drawing
- If map doesn't show: Check that VITE_GOOGLE_MAPS_API_KEY is configured
- If you see coordinate error: Ensure you completed the polygon with at least 3 points

### Scenario 2: Create a Subplot

**Goal**: Create a hierarchical plot structure

**Steps**:
1. From Plots page, click **"Add New Plot"**
2. Fill in:
   - **Name**: "Subplot A1"
   - **Parent Plot**: Select "Main Research Plot 1" from dropdown
   - **Location**: Same as parent or different
   - **Grass Type**: Same as parent or different
3. Draw polygon boundary (inside parent plot area if possible)
4. Click **"Create"**

**Expected Results**:
- Subplot appears indented under parent plot (if hierarchy is expanded)
- Subplot shows "↳ Sub-plot of: Main Research Plot 1"
- Parent plot's "Sub-plots" count increases to 1

### Scenario 3: Record a Water Treatment

**Goal**: Record an irrigation treatment

**Steps**:
1. Navigate to **Turf Research > Treatments**
2. Click **"Add Treatment"** button
3. In the plot selection tree:
   - Expand plots if needed (click ▶ arrow)
   - Check the box next to "Main Research Plot 1"
   - Notice "2 plots selected" (parent + subplot automatically included)
4. Fill in treatment details:
   - **Treatment Type**: Water (already selected by default)
   - **Date**: Select today's date
   - **Time**: Leave blank (optional) or enter time
   - **Amount (inches)**: 0.5
   - **Duration (minutes)**: 30
   - **Method**: "Sprinkler system"
   - **Notes**: "Morning irrigation"
5. Click **"Create"**

**Expected Results**:
- Treatment appears in the list
- Shows "Plots: Main Research Plot 1, Subplot A1"
- Shows date and water details
- Treatment count on plots page increases

**Troubleshooting**:
- If you see "treatments?.map is not a function": Refresh the page
- If time format error: Leave time blank or use HH:MM format (e.g., 08:30)

### Scenario 4: Record a Chemical Treatment

**Goal**: Record a herbicide application

**Steps**:
1. From Treatments page, click **"Add Treatment"**
2. Select plot(s)
3. Change **Treatment Type** to "Chemical"
4. Fill in:
   - **Chemical Type**: Select "Herbicide" (should be default)
   - **Product Name**: "Example Herbicide Pro"
   - **Active Ingredient**: "2,4-D"
   - **Amount**: 8
   - **Unit**: oz (or change to preference)
   - **Rate per 1000 sq ft**: 1.6
   - **Target Pest**: "Broadleaf weeds"
5. Set date and add notes
6. Click **"Create"**

**Expected Results**:
- Chemical treatment saved successfully
- Shows chemical type and product name
- All fields preserved correctly

**Common Issue Fix**:
- Previously, if "Herbicide" was left as default, it wouldn't save
- This is now FIXED - default dropdown values are properly sent

### Scenario 5: View Treatment Reports

**Goal**: View plot history on map

**Steps**:
1. Navigate to **Turf Research > Reports**
2. Observe the map:
   - Should auto-zoom to show all plots
   - Plots shown as yellow polygons
3. Click on "Main Research Plot 1" in the list (right side)
4. Observe:
   - Map zooms to selected plot
   - Plot turns darker yellow/gold on map
   - Treatment history appears below map
   - Treatments shown with colored cards and icons

**Expected Results**:
- Map loads and shows all plots
- Clicking plot highlights it and shows history
- Can click X to close detail view
- Can expand/collapse plot hierarchy in list

**Troubleshooting**:
- If map shows "Loading..." forever: Check API key configuration
- If plots don't appear on map: Ensure plots have polygon coordinates
- If "Element already defined" warnings: These are harmless Google Maps warnings

### Scenario 6: Edit an Existing Plot

**Goal**: Modify plot information and see map preserved

**Steps**:
1. From Plots page, hover over a plot card (or just look for it)
2. Click **"Edit"** button (should be visible without hover)
3. Observe:
   - Form populates with existing data
   - Map shows existing polygon
   - Can modify any field
4. Make a change:
   - Update **Notes** field
   - Or change **Size** value
5. Click **"Update"**

**Expected Results**:
- Plot updates successfully
- Map polygon preserved
- Changes reflected immediately
- No coordinate errors

**Previously Fixed Issue**:
- Map polygon wasn't showing during edit
- This is now FIXED

### Scenario 7: Manage Master Lists

**Goal**: Add reusable locations and grass types

**Steps**:
1. From Plots page, click **"Manage Locations"** button
2. Click **"Add New Location"**
3. Fill in:
   - **Name**: "South Field"
   - **Description**: "Southern research area with clay soil"
4. Click **"Create"**
5. Click X to close modal
6. Create a new plot and verify "South Field" appears in location dropdown
7. Similarly test **"Manage Grass Types"**

**Expected Results**:
- New locations/grass types immediately available
- Can edit and delete items
- Warning when deleting (may affect existing plots)

## 🎯 Complete Feature Test Matrix

| Feature | Test Status | Notes |
|---------|-------------|-------|
| Create plot with polygon | ✅ Ready | Required for plot creation |
| Create subplot | ✅ Ready | Hierarchical structure |
| Edit plot preserving map | ✅ Ready | Fixed polygon display |
| Delete plot | ✅ Ready | Cascade deletes subplots |
| Water treatment | ✅ Ready | Optional time field |
| Fertilizer treatment | ✅ Ready | Product name, NPK ratio |
| Chemical treatment | ✅ Ready | Default chemical_type works |
| Mowing treatment | ✅ Ready | Height, clippings option |
| Multi-plot treatment | ✅ Ready | Select multiple plots |
| Parent plot treatment | ✅ Ready | Auto-includes subplots |
| Treatment filtering | ✅ Ready | Filter by type |
| Treatment editing | ✅ Ready | Modify existing treatment |
| Treatment deletion | ✅ Ready | Remove treatment record |
| Map auto-zoom to all plots | ✅ Ready | On reports page load |
| Map zoom to selected plot | ✅ Ready | Click plot to focus |
| Master list management | ✅ Ready | Locations and grass types |
| Quick-add from plot form | ✅ Ready | Inline creation |
| Hierarchy display | ✅ Ready | Expand/collapse tree |
| Edit button visibility | ✅ Ready | Always visible |

## 🔍 Data Verification

### Check Database Records

**View Plots**:
```bash
docker compose exec backend python manage.py shell
```
```python
from apps.turf_research.models import Plot
for plot in Plot.objects.all():
    print(f"{plot.id}: {plot.name} - Coords: {plot.center_lat}, {plot.center_lng}")
exit()
```

**View Treatments**:
```python
from apps.turf_research.models import Treatment
for t in Treatment.objects.all():
    print(f"{t.id}: {t.treatment_type} on {t.date} - {t.plots.count()} plots")
exit()
```

### Check API Responses

**With authentication** (after logging in via browser):
1. Open browser dev tools (F12)
2. Go to Network tab
3. Perform action (e.g., create plot)
4. Inspect request/response

**Direct API testing** (requires auth token):
```bash
# Get CSRF token and session from browser cookies
# Then use curl with cookies
```

## 📊 Expected Data Flow

### Creating a Plot
```
Frontend Form → Validation → API POST /api/turf-research/plots/
                                ↓
                          Django Serializer
                                ↓
                          Model Validation
                                ↓
                          Database INSERT
                                ↓
                          Return Plot Object
                                ↓
Frontend Updates → React Query Cache → UI Refresh
```

### Creating a Treatment on Parent Plot
```
Select Parent Plot → getAllSubplotIds() → Include Subplots
                                ↓
                          plots: [parent_id, subplot_ids]
                                ↓
                          API POST /api/turf-research/treatments/
                                ↓
                          Create Treatment with ManyToMany plots
                                ↓
                          Create Treatment Details (e.g., WaterTreatment)
                                ↓
Frontend Updates → Both Plots Show Treatment → Counts Update
```

## ⚠️ Common Errors and Solutions

### "Ensure that there are no more than X digits"
- **Cause**: Old FloatField couldn't handle precision
- **Status**: FIXED - Changed to DecimalField
- **Solution**: Migration applied automatically

### "treatments?.map is not a function"
- **Cause**: API response not properly handled as array
- **Status**: FIXED - Added array handling
- **Solution**: Code updated to ensure array

### "useQuery is not defined"
- **Cause**: Missing import in PlotForm
- **Status**: FIXED - Import added
- **Solution**: Imports corrected

### "Expected corresponding JSX closing tag"
- **Cause**: Form tag not properly closed
- **Status**: FIXED - All forms validated
- **Solution**: JSX structure corrected

### Chemical Type "This field is required"
- **Cause**: Default dropdown value not sent
- **Status**: FIXED - Initialization logic added
- **Solution**: Form properly initializes defaults

### Time "wrong format" error
- **Cause**: Time field required but sent empty string
- **Status**: FIXED - Made optional
- **Solution**: Backend accepts null, frontend sends undefined

## 🎓 Best Practices

### Creating Plots
1. Always draw polygon boundary (required)
2. Use descriptive names
3. Organize with parent-child relationships when appropriate
4. Add location and grass type for better filtering

### Recording Treatments
1. Include date always, time when known
2. Select parent plot to treat entire section
3. Add detailed notes for future reference
4. Use consistent product names (future: master list)

### Using Reports
1. Use map to visualize spatial distribution
2. Click plots to view detailed history
3. Look for treatment patterns over time
4. Compare multiple plots if needed

## 📞 Getting Help

If issues persist after following this guide:

1. **Check Logs**:
   ```bash
   docker compose logs backend --tail 50
   docker compose logs frontend --tail 50
   ```

2. **Restart Services**:
   ```bash
   docker compose restart
   ```

3. **Clear Browser Cache**:
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

4. **Verify Configuration**:
   - Check `frontend/.env` for VITE_GOOGLE_MAPS_API_KEY
   - Ensure database migrations are applied
   - Verify containers are healthy: `docker compose ps`

5. **Review Documentation**:
   - See `TURF_IMPLEMENTATION_STATUS.md` for complete feature list
   - See `TURF_RESEARCH_*.md` files for original requirements
