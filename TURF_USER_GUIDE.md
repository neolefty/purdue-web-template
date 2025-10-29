# Turf Research - Quick Start Guide

## Overview
The Turf Research module tracks research plots and their treatment history with mapping capabilities, hierarchical organization, and comprehensive reporting.

## Getting Started

### 1. Access the Application
- Navigate to `http://localhost:5173/turf-research/`
- You'll see three main sections: Plots, Treatments, and Reports

## Working with Plots

### Creating a Plot
1. Go to **Plots** page
2. Click **"Add New Plot"**
3. Fill in the form:
   - **Name** (required): Give your plot a unique name
   - **Parent Plot** (optional): Select a parent if this is a sub-plot
   - **Location**: Select from dropdown or click "+" to add new
   - **Size**: Enter size in square feet (optional)
   - **Grass Type**: Select from dropdown or click "+" to add new
   - **Notes**: Any additional information
4. **Draw the plot boundary** on the map:
   - Click "Start Drawing" button
   - Click on the map to create polygon points
   - Close the polygon by clicking near the first point
   - Adjust points by dragging if needed
   - Click "Clear" to start over
5. Click **"Create"** to save (or "Cancel" to discard)

### Editing a Plot
1. Find the plot in the list
2. Click **"Edit"** button
3. Modify any fields
4. The existing polygon will be shown on the map
5. Draw a new polygon if you want to change the boundary
6. Click **"Update"** to save changes

### Viewing Sub-plots
- Click the **▶** arrow next to a plot name to expand and see its sub-plots
- Click **▼** to collapse
- Sub-plots are indented to show hierarchy

### Managing Master Lists
- Click **"Manage Locations"** to add/edit/delete location values
- Click **"Manage Grass Types"** to add/edit/delete grass type values
- These values can be reused across multiple plots

## Working with Treatments

### Creating a Treatment
1. Go to **Treatments** page
2. Click **"Add New Treatment"**
3. **Select plots**:
   - Check boxes next to the plots to treat
   - Click ▶/▼ to expand/collapse sub-plots
   - **Tip**: Selecting a parent plot automatically selects all its sub-plots!
4. Select **treatment type**:
   - **Water**: Irrigation/rainfall
   - **Fertilizer**: Nutrient application
   - **Chemical**: Herbicide, insecticide, fungicide, etc.
   - **Mowing**: Grass cutting
5. Set **date** (required) and **time** (optional)
6. Fill in **type-specific details** (varies by treatment type)
7. Add **notes** if needed
8. Click **"Create"**

### Treatment Type Details

#### Water
- Amount (inches) - required
- Duration (minutes)
- Method (e.g., sprinkler, drip)

#### Fertilizer
- Product name - required
- NPK ratio (e.g., 10-10-10)
- Amount and unit
- Rate per 1000 sq ft

#### Chemical
- Chemical type (herbicide, insecticide, etc.) - required
- Product name - required
- Active ingredient
- Amount and unit
- Rate per 1000 sq ft
- Target pest

#### Mowing
- Height (inches) - required
- Clippings removed (yes/no)
- Mower type
- Pattern

### Editing a Treatment
1. Find the treatment in the list
2. Click **"Edit"**
3. Modify fields as needed
4. Click **"Update"**

## Using the Reports Page

### Viewing the Map
- The map shows all plots as colored polygons
- **Auto-zoom**: The map automatically fits all plots when the page loads
- **Manual zoom**: Use the +/- buttons in the top-right corner
- **Tilt**: Map is set to overhead view (no tilt)

### Selecting a Plot
Two ways to select:
1. **Click on the map**: Click any plot polygon
2. **Click in the list**: Click a plot name in the "All Plots" sidebar

### Viewing Plot Hierarchy
- Click ▶/▼ next to plot names to expand/collapse
- Sub-plots are indented under their parents
- Treatment counts shown for each plot

### Viewing Treatment History
When you select a plot:
- The map zooms to that plot
- Treatment history appears below the map
- Treatments are sorted by date (newest first)
- Each treatment shows:
  - Icon and color coding by type
  - Date and time
  - Who applied it
  - Type-specific details
  - Notes

### Treatment Color Coding
- 💧 **Water**: Blue
- 🌱 **Fertilizer**: Green
- 🧪 **Chemical**: Purple
- ✂️ **Mowing**: Yellow

## Tips and Best Practices

### Plot Organization
- Use parent plots for large areas (e.g., "North Field")
- Create sub-plots for experimental sections within larger areas
- When treating a parent, all sub-plots get the treatment automatically

### Naming Conventions
- Use descriptive names: "North Field - Plot A1" instead of just "A1"
- Include relevant details: "Bentgrass Test Plot 1"
- Be consistent across similar plots

### Treatment Tracking
- Always fill in the date (required)
- Add time when precision matters
- Use notes field for weather conditions, observations, etc.
- Include who applied the treatment (tracked automatically)

### Map Usage
- Draw accurate boundaries for better visualization
- Use satellite view to align with real features
- Zoom in close when drawing small plots
- You can edit boundaries later if needed

### Master Lists
- Set up locations before creating plots
- Add common grass types to the master list
- Use the quick-add "+" button when creating plots
- Clean up unused values periodically

## Keyboard Shortcuts
- **Enter**: Submit form
- **Esc**: Close modal/cancel (when available)

## Troubleshooting

### Map not showing?
- Check that VITE_GOOGLE_MAPS_API_KEY is set
- Verify Google Maps API is enabled in Google Cloud Console
- Check browser console for errors

### Can't save a plot?
- Make sure you drew a polygon on the map (required)
- All coordinates must be valid
- Name must be unique

### Treatment not saving?
- At least one plot must be selected
- Date is required
- Type-specific required fields must be filled
- Time is optional - leave blank if not needed

### Plot polygons not visible when editing?
- Refresh the page
- Check that coordinates were saved (look at plot details)
- Try zooming in/out on the map

## Data Management

### Deleting Items
- **Plots**: Deleting a plot also deletes all its sub-plots
- **Treatments**: Can be deleted individually
- **Master list items**: Only delete if not in use

### Bulk Operations
- Select multiple plots for the same treatment
- Parent plot selection includes all descendants automatically

## Mobile Usage
- Application is optimized for desktop
- Mobile view is functional but may be cramped
- Consider using tablet or desktop for map drawing

## Support
For issues or questions, contact your system administrator or refer to the technical documentation in `TURF_IMPLEMENTATION_COMPLETE.md`.

---

**Last Updated**: 2025-01-29
**Version**: 1.0.0
