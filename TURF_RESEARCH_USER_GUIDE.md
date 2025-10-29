# Turf Research System - User Guide

## Overview

The Turf Research Plot Treatment Tracking System allows you to:
- Define research plots with geographic boundaries
- Create hierarchical plot structures (plots with sub-plots)
- Track treatments applied to plots (water, fertilizer, chemicals, mowing)
- View treatment history and generate reports
- Visualize plots on satellite maps

## Getting Started

### Prerequisites
- Google Maps API key configured (for mapping features)
- Access to the application at http://localhost:5173
- Valid user account

### Navigation
From the main menu, select "Turf Research" to access:
- **Plots** - Manage research plots
- **Treatments** - Record and manage treatments
- **Reports** - View treatment history and maps

## Managing Plots

### Creating a Plot

1. Navigate to **Plots** page
2. Click **"Add New Plot"** button
3. Fill in plot details:
   - **Name*** (required) - Unique identifier for the plot
   - **Parent Plot** - Select if this is a sub-plot
   - **Location** - Select from dropdown or click "+" to add new
   - **Size** - Plot area in square feet
   - **Grass Type** - Select from dropdown or click "+" to add new
   - **Notes** - Additional information

4. **Draw Plot Boundary on Map:**
   - Click **"Start Drawing"**
   - Click on the satellite map to place points (minimum 3 points)
   - Complete the polygon by:
     - Clicking near the first point (green marker), OR
     - Clicking the **"Complete"** button
   - If you make a mistake, click **"Cancel"** and start over

5. Click **"Create"** to save the plot

> **Note:** A plot must have a drawn boundary before it can be saved.

### Editing a Plot

1. Find the plot you want to edit
2. Click the **gold "Edit" button** on the plot card
3. Modify any fields
4. To change the boundary:
   - Click **"Clear Polygon"**
   - Click **"Start Drawing"**
   - Draw new boundary
5. Click **"Update"** to save changes

### Creating Sub-Plots

Sub-plots allow you to divide a larger plot into smaller sections:

1. Create or select a parent plot first
2. Click **"Add New Plot"**
3. In the **Parent Plot** dropdown, select the parent
4. Complete the form and draw the sub-plot boundary
5. Save the plot

> **Tip:** When you apply a treatment to a parent plot, it automatically applies to all sub-plots.

### Viewing Plot Hierarchy

- Click the **▶** arrow next to a plot to expand and see its sub-plots
- Click **▼** to collapse
- The hierarchy shows: Parent > Child > Grandchild

## Managing Master Data

### Locations

Locations are reusable values for plot locations (e.g., "North Field", "Greenhouse A").

**To manage locations:**
1. Go to Plots page
2. Click **"Manage Locations"**
3. **Add:** Click "Add Location", enter name and description
4. **Edit:** Click pencil icon, modify, click "Save"
5. **Delete:** Click trash icon, confirm deletion

**Quick-add while creating a plot:**
1. In the Location dropdown, click the **"+"** button
2. Enter location name
3. Click **"Save"**
4. Location is now available in the dropdown

### Grass Types

Similar to locations, grass types are reusable (e.g., "Kentucky Bluegrass", "Perennial Ryegrass").

**To manage:**
1. Go to Plots page
2. Click **"Manage Grass Types"**
3. Add, edit, or delete as needed

**Quick-add:** Same process as locations, using the "+" button in plot form.

## Recording Treatments

### Creating a Treatment

1. Navigate to **Treatments** page
2. Click **"Add New Treatment"**
3. **Select Plots:**
   - Check boxes next to plot names
   - Use **▶** to expand and see sub-plots
   - Checking a parent automatically checks all children
   - Selected count shown at bottom

4. **Treatment Details:**
   - **Treatment Type*** - Select: Water, Fertilizer, Chemical, or Mowing
   - **Date*** - Date treatment was applied
   - **Time** - Optional, time of day
   - **Notes** - Any additional observations

5. **Type-Specific Details:**

   **Water:**
   - Amount (inches)
   - Duration (minutes)
   - Method (e.g., "sprinkler", "drip")

   **Fertilizer:**
   - Product Name*
   - NPK Ratio (e.g., "20-10-10")
   - Amount and Unit*
   - Rate per 1000 sq ft

   **Chemical:**
   - Type* (Herbicide, Insecticide, Fungicide, etc.)
   - Product Name*
   - Active Ingredient
   - Amount and Unit*
   - Rate per 1000 sq ft
   - Target Pest/Weed

   **Mowing:**
   - Height (inches)*
   - Clippings Removed* (Yes/No)
   - Mower Type
   - Pattern

6. Click **"Create"** to save

> **Note:** Fields marked with * are required. Time is always optional.

### Editing a Treatment

1. Find the treatment in the list
2. Click **"Edit"**
3. Modify any fields
4. You can add or remove plots
5. Click **"Update"** to save

### Deleting a Treatment

1. Click **"Delete"** on the treatment card
2. Confirm deletion

## Viewing Reports

The Reports page provides a visual overview of all plots and their treatment history.

### Using the Reports Page

1. Navigate to **Reports** page
2. **Map View** (left side):
   - Shows all plots as colored polygons on satellite map
   - Gold = unselected plot
   - Dark gold = selected plot
   - Map auto-zooms to show all plots

3. **Plot List** (right side):
   - Shows all plots in hierarchical structure
   - Click **▶** to expand parent plots
   - Click on any plot to view its treatment history

4. **Viewing Treatment History:**
   - Click a plot name in the list OR
   - Click a polygon on the map
   - Treatment history appears below the map
   - Each treatment shows:
     - Type and icon (💧 💪 🧪 ✂️)
     - Date and time
     - Who applied it
     - Type-specific details
     - Notes

5. **Map Controls:**
   - **Zoom:** Use +/- buttons or scroll wheel
   - **Pan:** Click and drag
   - **Map Type:** Switch between satellite and map view
   - Auto-zoom: Map automatically zooms to selected plot

### Printing Reports

1. Select a plot to view its treatment history
2. Click the **"Print Report"** button (top right)
3. Browser print dialog appears
4. Configure print settings:
   - Orientation: Portrait or Landscape
   - Pages: All or specific
   - Margins: Adjust as needed
5. Print or save as PDF

> **Note:** The map is automatically hidden when printing for a cleaner report.

## Tips and Best Practices

### Plot Organization

- **Naming:** Use consistent naming conventions (e.g., "Field1-Plot-A")
- **Hierarchy:** Only use sub-plots when treatments will differ within areas
- **Size:** Always record plot size for accurate rate calculations

### Treatment Recording

- **Record Immediately:** Log treatments as soon as they're applied
- **Be Specific:** Include product names, rates, and conditions
- **Photos:** Consider adding detailed notes since photo attachments aren't yet available
- **Weather:** Note weather conditions in the Notes field

### Master Data

- **Locations:** Set up all locations before creating plots
- **Grass Types:** Include scientific names for clarity
- **Consistency:** Use the same names across all plots for better reporting

### Mapping

- **Zoom Level:** Zoom in close (level 18-20) for accurate boundary drawing
- **Satellite View:** Always use satellite view for boundary drawing
- **Verification:** After drawing, verify the polygon covers the correct area
- **Edits:** You can redraw boundaries anytime by editing the plot

## Troubleshooting

### Map Not Loading

**Problem:** Map shows "Google Maps not configured" or error message

**Solutions:**
1. Verify Google Maps API key is configured
2. Check API key has Maps JavaScript API enabled
3. Ensure billing is enabled on Google Cloud account
4. Contact system administrator

### Can't Draw Polygon

**Problem:** Clicks on map don't create points

**Solutions:**
1. Make sure you clicked **"Start Drawing"** button
2. Verify you're clicking on the map (not on UI elements)
3. Refresh the page and try again
4. Check browser console for error messages

### Treatment Won't Save

**Problem:** Error message when saving treatment

**Solutions:**
1. Ensure at least one plot is selected
2. Verify all required fields are filled
3. For chemicals, make sure chemical type is selected
4. Check that date is valid
5. Time can be left blank (optional)

### Plots Not Showing in List

**Problem:** Created plots don't appear

**Solutions:**
1. Refresh the page
2. Check if plot was successfully saved (look for success message)
3. Verify plot has required fields (name, coordinates)
4. Check browser console for errors

### Hierarchy Not Displaying Correctly

**Problem:** Sub-plots not showing under parent

**Solutions:**
1. Verify parent plot was selected when creating sub-plot
2. Refresh the page
3. Click the **▶** arrow to expand parent plots
4. Check that circular references don't exist (plot can't be its own parent)

## Keyboard Shortcuts

Currently, the application doesn't have custom keyboard shortcuts, but you can use:
- **Tab** - Navigate between form fields
- **Enter** - Submit forms
- **Escape** - Close dialogs (in some browsers)
- **Ctrl/Cmd + P** - Print (when on Reports page with plot selected)

## Support

For technical issues or feature requests:
1. Check this user guide first
2. Review the troubleshooting section
3. Check browser console for error messages
4. Contact your system administrator
5. Report bugs with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser and version

## Glossary

- **Plot:** A defined area of turf grass used for research
- **Sub-plot:** A smaller plot within a larger parent plot
- **Treatment:** Any activity applied to a plot (watering, mowing, chemical application, etc.)
- **Hierarchy:** The parent-child relationship structure of plots
- **Polygon:** The boundary shape drawn on the map to define a plot
- **Master Data:** Reusable reference data like locations and grass types
- **NPK:** Nitrogen-Phosphorus-Potassium ratio in fertilizers

## Appendix: Field Definitions

### Plot Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| Name | Yes | Unique identifier | "North-Field-Plot-1" |
| Parent Plot | No | Makes this a sub-plot | "Main Test Area" |
| Location | No | Physical location | "North Field" |
| Size (sq ft) | No | Plot area | 1000 |
| Grass Type | No | Type of grass | "Kentucky Bluegrass" |
| Notes | No | Additional info | "Established Spring 2023" |
| Boundary | Yes | Map coordinates | (drawn on map) |

### Treatment Fields (Common)

| Field | Required | Description |
|-------|----------|-------------|
| Plots | Yes | Which plots to treat |
| Treatment Type | Yes | Water/Fertilizer/Chemical/Mowing |
| Date | Yes | When applied |
| Time | No | Time of day |
| Notes | No | Observations |

### Treatment Type-Specific Fields

**Water:**
- Amount (inches) - Required
- Duration (minutes)
- Method

**Fertilizer:**
- Product Name - Required
- NPK Ratio
- Amount & Unit - Required
- Rate per 1000 sq ft

**Chemical:**
- Chemical Type - Required
- Product Name - Required
- Active Ingredient
- Amount & Unit - Required
- Rate per 1000 sq ft
- Target Pest

**Mowing:**
- Height (inches) - Required
- Clippings Removed - Required
- Mower Type
- Pattern
