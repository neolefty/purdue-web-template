# Turf Research System - Quick Start Testing Guide

## Prerequisites
- Docker and Docker Compose installed
- Google Maps API key configured in `.env` file
- Services running: `docker compose up`
- Application accessible at `http://localhost:5173`

## Initial Setup

### 1. Create Test Account
```
1. Navigate to http://localhost:5173/register
2. Create a new account
3. Log in with your credentials
```

### 2. Access Turf Research System
```
1. Navigate to http://localhost:5173/turf-research
2. You should see 4 cards: Plots, Treatments, Reports, Print Reports
```

## Feature Testing Walkthrough

### Test 1: Create Master Data (5 minutes)

#### Create Locations
1. Go to **Plots** page (`/turf-research/plots`)
2. Click **"Manage Locations"** button
3. Click **"Add New Location"**
4. Enter location details:
   - Name: "North Field"
   - Description: "Main research area"
5. Click **"Add"**
6. Repeat for 2-3 more locations
7. Try editing and deleting a location
8. Click **"Close"**

#### Create Grass Types
1. On Plots page, click **"Manage Grass Types"**
2. Click **"Add New Grass Type"**
3. Enter grass type details:
   - Name: "Kentucky Bluegrass"
   - Scientific Name: "Poa pratensis"
   - Description: "Cool-season grass"
4. Click **"Add"**
5. Add more: "Perennial Ryegrass", "Tall Fescue"
6. Click **"Close"**

### Test 2: Create Hierarchical Plots (10 minutes)

#### Create Parent Plot
1. Click **"Add New Plot"** button
2. Fill in details:
   - Name: "Field A"
   - Parent Plot: (leave as "No Parent")
   - Location: Select "North Field"
   - Size: 5000
   - Grass Type: Select "Kentucky Bluegrass"
   - Notes: "Main test area"
3. **Draw polygon on map**:
   - Click the polygon tool (pentagon icon)
   - Click multiple points on map to draw boundary
   - Click first point again to close polygon
4. Click **"Create"**
5. Verify plot appears in list

#### Create Sub-Plots
1. Click **"Add New Plot"** again
2. Fill in details:
   - Name: "Field A - Plot 1"
   - Parent Plot: Select "Field A"
   - Location: "North Field"
   - Size: 1000
   - Grass Type: "Kentucky Bluegrass"
3. Draw smaller polygon inside Field A boundary
4. Click **"Create"**
5. Repeat for "Field A - Plot 2" and "Field A - Plot 3"

#### Test Hierarchy Display
1. Click the **▶** arrow next to "Field A"
2. Verify sub-plots appear indented
3. Click **▼** to collapse
4. Verify Edit button is visible without hover

### Test 3: Create Treatments (10 minutes)

#### Water Treatment
1. Go to **Treatments** page
2. Click **"Add New Treatment"**
3. Select plots:
   - Click checkbox next to "Field A"
   - Verify all sub-plots are auto-selected
4. Fill in treatment details:
   - Type: Water
   - Date: Today's date
   - Time: Leave blank (test optional field)
   - Amount: 0.5
   - Duration: 30
   - Method: "Sprinkler"
   - Notes: "Morning irrigation"
5. Click **"Create"**
6. Verify treatment appears in list for all plots

#### Fertilizer Treatment
1. Click **"Add New Treatment"**
2. Select only "Field A - Plot 1"
3. Fill in:
   - Type: Fertilizer
   - Date: Today
   - Time: 10:00 (test with time)
   - Product Name: "20-10-10 Fertilizer"
   - NPK Ratio: "20-10-10"
   - Amount: 50
   - Unit: lbs
   - Rate per 1000 sqft: 5
4. Click **"Create"**

#### Chemical Treatment (Test Default Values)
1. Click **"Add New Treatment"**
2. Select "Field A - Plot 2"
3. Fill in:
   - Type: Chemical
   - Chemical Type: Leave as "Herbicide" (test default)
   - Date: Today
   - Product Name: "Weed Control Pro"
   - Active Ingredient: "2,4-D"
   - Amount: 2
   - Unit: oz
   - Target Pest: "Broadleaf weeds"
4. Click **"Create"**
5. Verify no error about chemical_type required

#### Mowing Treatment
1. Add new treatment for "Field A - Plot 3"
2. Type: Mowing
3. Height: 2.5
4. Clippings Removed: Check the box
5. Mower Type: "Reel"
6. Pattern: "Striped"
7. Click **"Create"**

### Test 4: View Reports (10 minutes)

#### Interactive Map Reports
1. Go to **Reports** page (`/turf-research/reports`)
2. **Test Auto Zoom**:
   - Map should auto-fit to show all plots
   - Wait 1 second, all polygons should be visible
3. **Test Plot Selection from List**:
   - Click on "Field A" in the right sidebar
   - Map should zoom to that plot
   - Treatment history should appear below map
4. **Test Plot Selection from Map**:
   - Click on a polygon on the map
   - Should highlight and show treatments
5. **Test Print Current Plot**:
   - Click "Print This Plot" button
   - Print preview should show only that plot's data

#### Printable Reports
1. Click **"Printable Reports"** button (or navigate to `/turf-research/reports/print`)
2. **Test Filters**:
   - Set "From Date" to last week
   - Set "To Date" to today
   - Select "Treatment Type": Water
   - Verify only water treatments appear
3. **Test Plot Selection**:
   - Check "Field A - Plot 1" and "Field A - Plot 2"
   - Verify only those plots' treatments show
   - Uncheck all (should show all plots)
4. **Test CSV Export**:
   - Click "Export CSV"
   - File should download
   - Open in Excel/Sheets
   - Verify data is correct
5. **Test Print**:
   - Click "Print Report"
   - Print preview should open
   - Verify:
     - No map visible
     - No filter controls visible
     - Clean, compact layout
     - Treatment details visible
     - Generated timestamp shows
   - Cancel or print to PDF

### Test 5: Edit and Delete (5 minutes)

#### Edit Plot
1. Go back to Plots page
2. Hover over "Field A - Plot 1"
3. Click **"Edit"** button
4. Modify:
   - Change size to 1200
   - Update notes
   - Move polygon slightly on map
5. Click **"Update"**
6. Verify changes saved

#### Edit Treatment
1. Go to Treatments page
2. Click on a treatment
3. Click **"Edit"** button
4. Modify amount or notes
5. Click **"Update"**
6. Verify changes saved

#### Delete (Test Carefully)
1. Create a test plot ("Test Delete")
2. Click Delete button
3. Confirm deletion
4. Verify plot removed from list

## Error Testing (5 minutes)

### Test Validation
1. Try to create plot without drawing polygon
   - Should show error: "Please draw the plot boundary on the map"
2. Try to create treatment without selecting plots
   - Should show error or prevent submission
3. Try to create treatment with invalid date
   - Should validate date format

### Test Edge Cases
1. Create treatment for parent plot
   - Verify all sub-plots get the treatment
2. Delete parent plot with sub-plots
   - Should prompt about sub-plots (check backend behavior)
3. Edit plot to change parent
   - Verify hierarchy updates correctly

## Performance Testing (Optional)

### Load Testing
1. Create 10+ plots with polygons
2. Create 20+ treatments across plots
3. Load Reports page
   - Should load within 2-3 seconds
   - Map should render smoothly
4. Filter in Print Reports
   - Should filter instantly
5. Export large dataset to CSV
   - Should complete within 1-2 seconds

## Browser Compatibility (Optional)

### Test in Multiple Browsers
- [ ] Chrome (primary)
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Edge

### Test Responsive Design
1. Open developer tools
2. Toggle device toolbar
3. Test on mobile sizes (375px, 768px, 1024px)
4. Verify:
   - Navigation works
   - Forms are usable
   - Maps render correctly
   - Print layout adapts

## Troubleshooting Common Issues

### "Map Not Showing"
```
Solution: 
1. Check browser console for API key errors
2. Verify VITE_GOOGLE_MAPS_API_KEY in .env
3. Refresh page
4. Check Google Maps API is enabled in console
```

### "Cannot Create Plot"
```
Solution:
1. Ensure polygon is drawn completely
2. Check coordinate precision (should auto-fix)
3. Check browser console for errors
4. Verify backend is running
```

### "Treatment Not Saving"
```
Solution:
1. Check at least one plot is selected
2. Verify required fields are filled
3. Check browser console for validation errors
4. Check backend logs: docker compose logs backend
```

### "Print Layout Broken"
```
Solution:
1. Verify print styles loaded (check index.html)
2. Use Ctrl+P or Command+P
3. Check "Print backgrounds" in print dialog
4. Use Chrome/Edge for best results
```

## Success Criteria

After completing all tests, you should have:
- ✅ 2-3 locations created
- ✅ 3+ grass types created
- ✅ 1 parent plot with 3 sub-plots created
- ✅ 4 different types of treatments created
- ✅ Hierarchical plot structure visible
- ✅ Treatments visible on reports page
- ✅ CSV export working
- ✅ Print preview working correctly
- ✅ Edit and delete functions working
- ✅ No console errors
- ✅ Smooth user experience

## Quick Command Reference

```bash
# Start services
docker compose up

# Stop services
docker compose down

# View backend logs
docker compose logs backend -f

# View frontend logs
docker compose logs frontend -f

# Run migrations
docker compose exec backend python manage.py migrate

# Create superuser
docker compose exec backend python manage.py createsuperuser

# Access Django admin
http://localhost:8000/admin

# Access frontend
http://localhost:5173

# Build frontend
docker compose exec frontend npm run build

# Check for TypeScript errors
docker compose exec frontend npm run build
```

## Next Steps

After successful testing:
1. Review `TURF_IMPLEMENTATION_SUMMARY.md` for complete feature list
2. Check `ERROR_PREVENTION_GUIDE.md` to avoid common mistakes
3. Set up production environment following deployment docs
4. Train users on the system
5. Set up regular backups
6. Monitor for errors in production

## Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs: `docker compose logs backend`
3. Review error prevention guide
4. Check GitHub issues
5. Contact development team

---

**Testing complete!** The Turf Research Management System should now be fully functional and ready for production use.
