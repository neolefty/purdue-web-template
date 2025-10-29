# Preventing Common TURF Development Errors

## How We Prevented the JSX Closing Tag Error from Recurring

### The Problem
You mentioned: "you keep making the mistake that prevents the app from starting"
```
[plugin:vite:react-babel] /app/src/components/turf-research/TreatmentForm.tsx: 
Expected corresponding JSX closing tag for <form>. (547:8)
```

### Why This Happened
When AI assistants make multiple edits to large JSX files, they sometimes:
1. Edit a middle section without seeing the full file context
2. Accidentally remove or misplace closing tags
3. Create malformed JSX that breaks the build

### Prevention Strategy Implemented

#### 1. **Smaller, Focused Changes**
Instead of rewriting entire components, we now:
- Make surgical edits to specific sections
- View the file before and after the edit
- Keep context of surrounding code

#### 2. **Always Close Tags in Pairs**
When adding new JSX:
```tsx
// ✅ GOOD - Add opening and closing together
<div>
  {/* content */}
</div>

// ❌ BAD - Add opening, then forget closing later
<div>
  {/* lots of content */}
```

#### 3. **Use Editor Validation**
The project has:
- TypeScript for type checking
- ESLint for code quality
- Vite with fast refresh (catches JSX errors immediately)

#### 4. **Test After Each Change**
After editing a component:
```bash
# Check if it compiles
docker compose logs frontend

# Look for these lines:
✓ No errors - Good to go!
✗ "Expected JSX closing tag" - Need to fix
```

#### 5. **File Structure Best Practices**

**Split Large Components**:
```tsx
// Instead of one massive 1000-line component
// Split into smaller, manageable pieces:

// TreatmentForm.tsx (main component)
import WaterFields from './fields/WaterFields'
import ChemicalFields from './fields/ChemicalFields'
import PlotSelector from './selectors/PlotSelector'

export default function TreatmentForm() {
  return (
    <form>
      <PlotSelector />
      {type === 'water' && <WaterFields />}
      {type === 'chemical' && <ChemicalFields />}
    </form>
  )
}
```

#### 6. **Common Patterns to Avoid**

**Pattern 1: Conditional Rendering Without Fragments**
```tsx
// ❌ BAD - Easy to miss closing tag
{showForm && 
  <div>
    <FormFields />
  <button>Save</button>
}

// ✅ GOOD - Clear structure
{showForm && (
  <>
    <div>
      <FormFields />
    </div>
    <button>Save</button>
  </>
)}
```

**Pattern 2: Nested Ternaries**
```tsx
// ❌ BAD - Hard to track tag pairs
{isLoading ? <Spinner /> : 
 isError ? <Error /> :
 <div><Content /></div>}

// ✅ GOOD - Early returns or clear structure
if (isLoading) return <Spinner />
if (isError) return <Error />
return <div><Content /></div>
```

**Pattern 3: Self-Closing Tags**
```tsx
// ✅ Use self-closing for components without children
<MapPolygonDrawer />
<input />
<img />

// ❌ Don't leave them half-open
<input>
<MapPolygonDrawer>
```

### Automated Checks We Should Add

#### 1. **Pre-commit Hook**
```json
// package.json
"husky": {
  "hooks": {
    "pre-commit": "npm run lint && npm run type-check"
  }
}
```

#### 2. **CI/CD Check**
```yaml
# .github/workflows/test.yml
- name: Build frontend
  run: docker compose exec frontend npm run build
- name: Type check
  run: docker compose exec frontend npm run type-check
```

#### 3. **VSCode Settings**
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.validate.enable": true
}
```

### Quick Fix Checklist

When you see "Expected JSX closing tag" error:

1. **Identify the Problem**
   ```bash
   # Error message tells you exactly where:
   Expected corresponding JSX closing tag for <form>. (547:8)
   # Line 547, column 8
   ```

2. **Open the File**
   ```bash
   # View around the problem area
   code src/components/turf-research/TreatmentForm.tsx:547
   ```

3. **Find Matching Pairs**
   - Look for the opening `<form>` tag
   - Trace down to find where it should close
   - Check for any unclosed tags in between

4. **Common Culprits**
   - Missing `</div>` or `</button>`
   - Extra closing tag `</form>` without opening
   - Self-closing tag that shouldn't be: `<button />`

5. **Fix Pattern**
   ```tsx
   // If you see this pattern:
   <form onSubmit={handleSubmit}>
     <div>
       <input />
     </div>
     {/* Missing </form> here! */}
   <button>
   
   // Fix by adding:
   <form onSubmit={handleSubmit}>
     <div>
       <input />
     </div>
   </form>
   <button>
   ```

### Long-term Solutions

#### 1. **Component Libraries**
Use component libraries that handle tags internally:
```tsx
// Instead of:
<form>
  <div className="grid grid-cols-2">
    <input />
  </div>
</form>

// Use:
<Form onSubmit={handleSubmit}>
  <FormGrid cols={2}>
    <FormInput />
  </FormGrid>
</Form>
```

#### 2. **Template Snippets**
Create VSCode snippets for common patterns:
```json
{
  "React Form Component": {
    "prefix": "rform",
    "body": [
      "<form onSubmit={${1:handleSubmit}}>",
      "  ${2:// form content}",
      "</form>"
    ]
  }
}
```

#### 3. **Code Reviews**
Before committing large component changes:
1. Run `npm run build` locally
2. Check for any TypeScript errors
3. Test the component in the browser
4. Review the diff to ensure tag pairs match

### What We Changed to Prevent This

In this implementation, we:

1. ✅ Made small, focused edits
2. ✅ Viewed context before and after changes
3. ✅ Used the `edit` tool with precise `old_str` matching
4. ✅ Always matched tag pairs in the same edit
5. ✅ Tested incrementally (restart services after changes)
6. ✅ Documented all changes

### If It Happens Again

**Emergency Fix**:
```bash
# 1. See the error in browser/console
# 2. Find the file and line number
# 3. View the file
docker compose exec frontend cat /app/src/components/turf-research/TreatmentForm.tsx | head -n 560 | tail -n 20

# 4. Look for unmatched tags
# 5. Fix manually or ask for help with specific line numbers
```

### Summary

The key to preventing JSX errors:
- **Small, focused changes**
- **View full context**
- **Test immediately**
- **Use proper tooling**
- **Review before committing**

By following these practices, we can avoid breaking the build and keep development smooth.
