# Error Prevention Guide - Turf Research System

## Common Errors and How to Prevent Them

### 1. JSX Closing Tag Mismatch
**Error**: `Expected corresponding JSX closing tag for <form>`

**Prevention**:
- Always ensure every opening tag has a matching closing tag
- Use a code editor with JSX/TSX syntax highlighting
- Enable auto-formatting (Prettier) to catch mismatched tags
- Count opening `{` and closing `}` braces in JSX expressions

**Example of Error**:
```tsx
<form onSubmit={handleSubmit}>
  <div>
    <button type="submit">Save</button>
  </div>
  {/* Missing </form> closing tag */}
</form> {/* This will cause error if indentation is wrong */}
```

**How to Fix**:
1. Find the opening tag (e.g., `<form>`)
2. Ensure there's a matching closing tag (`</form>`)
3. Check indentation to ensure tags are properly nested

### 2. Array Method on Non-Array Data
**Error**: `treatments?.map is not a function` or `locations?.map is not a function`

**Prevention**:
- Always ensure API responses are arrays before using `.map()`
- Use proper data handling for paginated responses
- Add fallback to empty array

**Solution Pattern**:
```tsx
// ❌ WRONG - Assumes data is always an array
const { data: items } = useQuery({
  queryKey: ['items'],
  queryFn: fetchItems
});

items?.map(item => ...) // May fail if items is an object

// ✅ CORRECT - Handle both array and paginated responses
const { data: itemsData } = useQuery({
  queryKey: ['items'],
  queryFn: fetchItems
});

const items = Array.isArray(itemsData) 
  ? itemsData 
  : (itemsData as any)?.results || [];

items.map(item => ...) // Safe to use
```

### 3. Missing Import Errors
**Error**: `useQuery is not defined` or `import ... from "../axiosConfig"` not found

**Prevention**:
- Always check import statements at the top of file
- Use correct import paths
- Verify the imported module exists

**Correct Imports**:
```tsx
// React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// API Client (not axiosConfig)
import apiClient from '../../api/client';

// Turf Research API
import { turfResearchApi, Plot, Treatment } from '../../api/turf-research';
```

### 4. Coordinate Precision Errors
**Error**: `Ensure that there are no more than X digits in total`

**Prevention**:
- Always format coordinates before sending to backend
- Use `.toFixed(7)` for 7 decimal places
- Convert back to number: `Number(coord.toFixed(7))`

**Solution**:
```tsx
const handlePolygonComplete = (coordinates: any, center: { lat: number; lng: number }) => {
  setFormData((prev) => ({
    ...prev,
    polygon_coordinates: coordinates,
    center_lat: center.lat ? Number(center.lat.toFixed(7)) : undefined,
    center_lng: center.lng ? Number(center.lng.toFixed(7)) : undefined,
  }));
};
```

### 5. Time Format Errors
**Error**: `Time has wrong format. Use one of these formats instead: hh:mm[:ss[.uuuuuu]]`

**Prevention**:
- Make time field optional in backend
- Remove empty time field before submission
- Use HTML5 time input type

**Solution**:
```tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  const submitData: any = { ...formData };
  
  // Remove time if empty
  if (!formData.time || formData.time.trim() === '') {
    delete submitData.time;
  }
  
  createMutation.mutate(submitData);
};
```

### 6. Required Field with Default Value
**Error**: `{"chemical_details":{"chemical_type":["This field is required."]}}`

**Prevention**:
- Initialize form data with default values
- Set defaults when treatment type changes
- Ensure default value is sent to backend

**Solution**:
```tsx
const handleChange = (e: React.ChangeEvent<...>) => {
  const { name, value } = e.target;

  if (name === 'treatment_type') {
    const newFormData: any = {
      ...formData,
      treatment_type: value,
      // Initialize based on type
      water_details: value === 'water' ? {} : undefined,
      fertilizer_details: value === 'fertilizer' ? {} : undefined,
      chemical_details: value === 'chemical' ? { chemical_type: 'herbicide' } : undefined,
      mowing_details: value === 'mowing' ? {} : undefined,
    };
    setFormData(newFormData);
  }
};
```

### 7. Google Maps Multiple Loading
**Error**: `You have included the Google Maps JavaScript API multiple times`

**Prevention**:
- Use a single GoogleMapsContext provider
- Load API only once at app level
- Share loading state across components

**Solution Structure**:
```tsx
// GoogleMapsContext.tsx
export const GoogleMapsProvider = ({ children }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['drawing', 'geometry']
  });
  
  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

// App.tsx
<GoogleMapsProvider>
  <Layout>
    <Routes>...</Routes>
  </Layout>
</GoogleMapsProvider>
```

### 8. Map Pan/Zoom Not Working
**Error**: `Uncaught InvalidValueError: not a LatLng or LatLngLiteral: in property lat: not a number`

**Prevention**:
- Always validate lat/lng are numbers before using
- Parse string coordinates to numbers
- Check for NaN values

**Solution**:
```tsx
const fitBoundsToPlots = (plotsToFit: any[]) => {
  if (!isLoaded || !mapRef.current || plotsToFit.length === 0) return;
  
  const bounds = new google.maps.LatLngBounds();
  
  plotsToFit.forEach(plot => {
    // Parse to number and validate
    const lat = typeof plot.center_lat === 'string' 
      ? parseFloat(plot.center_lat) 
      : plot.center_lat;
    const lng = typeof plot.center_lng === 'string' 
      ? parseFloat(plot.center_lng) 
      : plot.center_lng;
    
    // Only extend bounds if valid numbers
    if (typeof lat === 'number' && typeof lng === 'number' 
        && !isNaN(lat) && !isNaN(lng)) {
      bounds.extend({ lat, lng });
    }
  });
  
  mapRef.current.fitBounds(bounds);
};
```

## Best Practices Checklist

### Before Committing Code:
- [ ] All imports are correct and files exist
- [ ] JSX tags are properly opened and closed
- [ ] Array methods have array checks (`.map()`, `.filter()`, etc.)
- [ ] Form data has proper default values
- [ ] Optional fields are handled (removed if empty)
- [ ] Coordinates are formatted correctly
- [ ] TypeScript types are defined (no `any` without reason)
- [ ] No console errors when running `npm run build`
- [ ] Test in browser for runtime errors

### When Adding New Features:
- [ ] Follow existing patterns in codebase
- [ ] Use shared contexts (GoogleMapsContext, AuthContext)
- [ ] Handle loading and error states
- [ ] Add proper TypeScript types
- [ ] Test with empty/null/undefined data
- [ ] Verify API response structure
- [ ] Add user-friendly error messages

### Code Review Checklist:
- [ ] No duplicate API calls
- [ ] Proper error boundaries
- [ ] Loading states shown to user
- [ ] Forms validate before submission
- [ ] Success/error feedback provided
- [ ] Responsive design maintained
- [ ] Accessibility considerations
- [ ] Performance optimized (React.memo, useMemo where needed)

## Testing Strategy

### Manual Testing Steps:
1. **Clear browser cache** - Ensure fresh load
2. **Check console** - No errors on page load
3. **Test happy path** - Normal user flow works
4. **Test edge cases** - Empty data, invalid input
5. **Test error handling** - Network errors, validation errors
6. **Cross-browser test** - Chrome, Firefox, Safari, Edge
7. **Mobile test** - Responsive design works

### Automated Testing:
```bash
# Type check
npm run type-check

# Build check
npm run build

# Lint check
npm run lint

# Run tests (if configured)
npm run test
```

## Emergency Fixes

### App Won't Start:
1. Check for JSX syntax errors in console
2. Verify all imports resolve correctly
3. Run `npm install` to ensure dependencies
4. Clear `node_modules` and reinstall
5. Check for TypeScript compilation errors

### API Calls Failing:
1. Verify backend is running (`docker compose ps`)
2. Check API endpoint URLs are correct
3. Verify CSRF token is being sent
4. Check network tab for actual error response
5. Verify data structure matches API expectations

### Map Not Showing:
1. Verify Google Maps API key is set
2. Check browser console for API errors
3. Verify `isLoaded` state is true before rendering
4. Check for coordinate validation issues
5. Ensure GoogleMapsContext is wrapping component

## Quick Reference: Common Patterns

### Safe Array Mapping:
```tsx
const items = Array.isArray(data) ? data : (data as any)?.results || [];
items.map(item => ...)
```

### Safe Form Submission:
```tsx
const submitData = { ...formData };
if (!submitData.optionalField) delete submitData.optionalField;
mutation.mutate(submitData);
```

### Safe Coordinate Handling:
```tsx
center_lat: value ? Number(value.toFixed(7)) : undefined
```

### Safe Map Bounds:
```tsx
if (typeof lat === 'number' && !isNaN(lat)) {
  bounds.extend({ lat, lng });
}
```

---

**Remember**: Most errors can be prevented by:
1. Careful code review
2. Testing before committing
3. Following established patterns
4. Validating data before using it
5. Using TypeScript properly
