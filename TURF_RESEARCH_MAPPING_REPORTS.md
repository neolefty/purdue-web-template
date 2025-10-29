# Turf Research Mapping & Reporting Features

## 🎉 New Features Added

### 1. **Google Maps Integration for Plot Mapping**
- Draw plot boundaries directly on Google Maps using polygon tools
- Automatic calculation of plot center points
- Satellite view for accurate plot identification
- GeoJSON storage of polygon coordinates

### 2. **Multiple Plot Selection for Treatments**
- Apply a single treatment to multiple plots at once
- Bulk treatment application saves time
- View which plots received each treatment

### 3. **Interactive Reports Page**
- Visual map display of all plots
- Click on plots (on map or list) to view treatment history
- Color-coded treatment types with icons
- Timeline view of all treatments for selected plot
- Treatment details with dates, applicators, and specifications

## 📋 Setup Instructions

### Google Maps API Key (Required for Mapping)

1. **Get a Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/)
   - Create a new project or select existing
   - Enable these APIs:
     - Maps JavaScript API
     - Drawing Library
   - Create credentials → API Key
   - Restrict the key to your domain for security

2. **Configure the Frontend:**
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env and add your API key:
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. **Restart Frontend:**
   ```bash
   docker compose restart frontend
   ```

### Database Migration

The models have been updated to support the new features:

```bash
# Already applied automatically, but if needed:
docker compose exec backend python manage.py migrate turf_research
```

## 🗺️ Using the Mapping Feature

### Creating a Plot with Map Boundary

1. Navigate to **Turf Research → Plots**
2. Click **"Add New Plot"**
3. Fill in plot details (name, location, etc.)
4. **Draw Plot Boundary:**
   - Click the polygon tool above the map
   - Click on the map to draw boundary points
   - Click the first point again to complete the polygon
   - The plot center is automatically calculated
5. Click **"Create"**

### Editing Plot Boundaries

1. Edit an existing plot
2. Click **"Clear Polygon"** to remove the old boundary
3. Draw a new polygon
4. Save changes

## 📊 Using the Reports Feature

### Accessing Reports

Navigate to **Turf Research → Reports**

### Viewing Treatment History

**Option 1: Map View**
- Plots with boundaries are displayed on the map
- Click any plot polygon on the map
- Treatment history appears below the map

**Option 2: List View**
- Use the plot list on the right side
- Click any plot name
- View its treatment history

### Understanding Treatment Display

- 💧 **Blue** = Water treatments
- 🌱 **Green** = Fertilizer treatments
- 🧪 **Purple** = Chemical treatments
- ✂️ **Yellow** = Mowing treatments

Each treatment card shows:
- Treatment type and icon
- Date and time applied
- Who applied it
- Treatment-specific details
- Any notes

## 🎯 Applying Treatments to Multiple Plots

### Creating Multi-Plot Treatments

1. Navigate to **Turf Research → Treatments**
2. Click **"Add Treatment"**
3. **Select Multiple Plots:**
   - Hold **Ctrl** (Windows) or **Cmd** (Mac)
   - Click multiple plot names in the list
   - Selected plots will be highlighted
4. Choose treatment type and fill in details
5. Click **"Create"**

The treatment will be applied to all selected plots simultaneously.

### Viewing Multi-Plot Treatments

- In the Treatments list, you'll see all plot names comma-separated
- Example: "Plot A-1, Plot B-2, Plot C-3"
- In Reports, the same treatment appears in each plot's history

## 🔧 Technical Details

### Backend Changes

**Models Updated:**
- `Plot` model:
  - Added `polygon_coordinates` (JSONField) - stores GeoJSON
  - Added `center_lat` and `center_lng` (DecimalField) - plot center
  
- `Treatment` model:
  - Changed from `ForeignKey` to `ManyToManyField` for plots
  - Now supports multiple plots per treatment

**New API Endpoint:**
- `GET /api/turf-research/plots/{id}/treatment_history/`
  - Returns all treatments for a specific plot
  - Used by the reports page

### Frontend Changes

**New Components:**
- `MapPolygonDrawer.tsx` - Google Maps polygon drawing interface
- `ReportsPage.tsx` - Interactive reports with map and treatment history

**Updated Components:**
- `PlotForm.tsx` - Added map polygon drawer
- `TreatmentForm.tsx` - Multi-select dropdown for plots
- `TreatmentsPage.tsx` - Display multiple plot names

**New Dependencies:**
- `@react-google-maps/api` - Google Maps React integration

## 📁 File Structure

```
backend/apps/turf_research/
├── models.py                    # ✏️ Updated: Plot & Treatment models
├── serializers.py               # ✏️ Updated: Added polygon & multi-plot support
├── views.py                     # ✏️ Updated: Added treatment_history endpoint
├── admin.py                     # ✏️ Updated: Multi-plot admin interface
└── migrations/
    └── 0002_*.py               # 🆕 New: Database schema changes

frontend/src/
├── api/turf-research/
│   └── index.ts                # ✏️ Updated: New types & endpoints
├── components/turf-research/
│   ├── MapPolygonDrawer.tsx    # 🆕 New: Google Maps polygon drawer
│   ├── PlotForm.tsx            # ✏️ Updated: Added map integration
│   └── TreatmentForm.tsx       # ✏️ Updated: Multi-plot selection
└── pages/turf-research/
    ├── ReportsPage.tsx         # 🆕 New: Interactive reports page
    ├── PlotsPage.tsx           # ✏️ Updated: Minor fixes
    ├── TreatmentsPage.tsx      # ✏️ Updated: Display plot names
    └── IndexPage.tsx           # ✏️ Updated: Added reports link
```

## 🚀 Quick Start Guide

1. **Set up Google Maps API key** (see above)
2. **Restart frontend:** `docker compose restart frontend`
3. **Create your first mapped plot:**
   - Go to Plots → Add New Plot
   - Fill in details and draw boundary
4. **Add treatments:**
   - Go to Treatments → Add Treatment
   - Select one or more plots
5. **View reports:**
   - Go to Reports
   - Click plots to see treatment history

## 💡 Tips & Best Practices

### Drawing Plot Boundaries
- Use satellite view for accurate boundaries
- Zoom in close (zoom level 18+) for precision
- Click carefully - you can't edit points after drawing
- Clear and redraw if you make a mistake

### Multi-Plot Treatments
- Group similar plots for efficient treatment entry
- Use plot names that make sense when grouped
- Review the plot list before applying treatments

### Reports
- Use the map for visual reference
- Use the plot list for quick access
- Treatment history is chronological (newest first)

## 🔐 Security Note

**Important:** Restrict your Google Maps API key!

In Google Cloud Console:
1. Go to Credentials
2. Edit your API key
3. Add application restrictions:
   - HTTP referrers
   - Add your domain: `http://localhost:5173/*` (development)
   - Add production domain when deploying

## 🐛 Troubleshooting

### "Google Maps API key not configured"
- Check `.env` file in `frontend/` directory
- Verify `VITE_GOOGLE_MAPS_API_KEY=` is set
- Restart frontend container

### Map doesn't load
- Check browser console for errors
- Verify API key is valid
- Ensure Maps JavaScript API is enabled in Google Cloud
- Check API key restrictions aren't blocking localhost

### Can't draw polygon
- Ensure you clicked the polygon tool first
- Drawing library must be loaded (automatic)
- Try refreshing the page

### Treatments don't show multiple plots
- Database migration must be applied
- Old treatments will only show one plot
- New treatments will support multiple plots

## 📞 Support

For issues or questions:
1. Check browser console for JavaScript errors
2. Check backend logs: `docker compose logs backend`
3. Verify all migrations applied: `docker compose exec backend python manage.py showmigrations turf_research`

---

**Status**: ✅ All features implemented and ready to use!

Enjoy the new mapping and reporting capabilities! 🗺️📊
