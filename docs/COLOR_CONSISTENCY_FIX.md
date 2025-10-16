# Color Consistency Fix Plan

**Target**: Upstream template project at `git@github.itap.purdue.edu:AgIT/django-react-template.git`

**Purpose**: Remove non-existent color classes and Purdue brand violations (blue colors)

**Context**: Purdue's official brand guidelines (https://marcom.purdue.edu/our-brand/visual-identity/) do not include blue. The template currently uses both standard blue colors and non-existent `purdue-blue-*`, `purdue-green-*`, and `purdue-gold-600/800` classes that are not defined in tailwind.config.js.

---

## Summary of Issues

### 1. Non-existent Tailwind Classes
The following classes are used but **not defined** in `frontend/tailwind.config.js`:
- `purdue-blue-50`, `purdue-blue-200`, `purdue-blue-600`, `purdue-blue-800`
- `purdue-green-600`, `purdue-green-800`
- `purdue-gold-600`, `purdue-gold-800`

These cause Tailwind to silently ignore them, resulting in fallback to default styles.

### 2. Purdue Brand Violations
Using blue colors (`blue-*` and `purdue-blue-*`) violates Purdue brand guidelines.

### 3. Files Affected
```
frontend/src/components/ConfirmDialog.tsx:45
frontend/src/components/StatusBadge.tsx:14
frontend/src/components/UserModal.tsx:172-173
frontend/src/pages/ManageUsersPage.tsx:228,235,243
```

---

## Recommended Action Button Color Standards

For semantic consistency across all applications using this template:

1. **Access/View Actions** (reading, viewing, downloading):
   - Color: Aged brown or standard gray
   - Use case: Preview, View, Download, Open
   - Implementation: `text-purdue-gray-700 hover:text-purdue-gray-900`

2. **Modification Actions** (editing, state changes):
   - Color: Black/dark gray
   - Use case: Edit, Make Public/Private, Activate/Deactivate, Make Staff
   - Implementation: `text-purdue-gray-900 hover:text-black`

3. **Destructive Actions** (deleting, removing):
   - Color: Red
   - Use case: Delete, Remove
   - Implementation: `text-red-600 hover:text-red-900`

**Note**: Individual projects may extend the palette (e.g., adding `purdue.aged: '#8E6F3E'` for a distinct brown tone) while maintaining these semantic patterns.

---

## Implementation Plan

### Step 1: Update Tailwind Configuration (Optional Enhancement)

**File**: `frontend/tailwind.config.js`

**Action**: Add aged brown colors to palette for projects that want a distinct color for access actions.

```typescript
purdue: {
  gold: '#CEB888',
  'gold-light': '#DACC9F',
  'gold-dark': '#B59D6B',
  black: '#000000',
  // ADD THESE:
  aged: '#8E6F3E',      // Supporting brown for links/buttons
  'aged-dark': '#6b5530',
  gray: {
    // ... existing gray scale
  },
}
```

**Rationale**: This provides a semantically distinct color for access/view actions. Projects can use this or skip it and use gray tones instead.

**Status**: [ ] Complete

---

### Step 2: Fix ConfirmDialog Component

**File**: `frontend/src/components/ConfirmDialog.tsx`

**Line**: 45

**Current**:
```typescript
info: {
  buttonVariant: 'primary' as const,
  warningClass: 'text-blue-600'
}
```

**Change to**:
```typescript
info: {
  buttonVariant: 'primary' as const,
  warningClass: 'text-purdue-gray-700'
}
```

**Rationale**: Removes blue color. Info messages are not critical warnings, so using a softer gray tone is appropriate. If aged brown was added to config, `text-purdue-aged` would also work.

**Status**: [ ] Complete

---

### Step 3: Fix StatusBadge Component

**File**: `frontend/src/components/StatusBadge.tsx`

**Line**: 14

**Current**:
```typescript
const variantClasses = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800'
}
```

**Change to**:
```typescript
const variantClasses = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-purdue-gold bg-opacity-20 text-purdue-gray-800'
}
```

**Rationale**: Uses Purdue gold for info badges instead of blue. The opacity creates a subtle background that doesn't overwhelm.

**Status**: [ ] Complete

---

### Step 4: Fix UserModal Component

**File**: `frontend/src/components/UserModal.tsx`

**Lines**: 172-173

**Current**:
```typescript
{mode === 'create' && (
  <div className="mt-4 p-3 bg-purdue-blue-50 border border-purdue-blue-200 rounded-md">
    <p className="text-sm text-purdue-blue-800">
      <strong>Note:</strong> The new user will receive an email with instructions to set their password.
    </p>
  </div>
)}
```

**Change to**:
```typescript
{mode === 'create' && (
  <div className="mt-4 p-3 bg-purdue-gold bg-opacity-10 border border-purdue-gold border-opacity-30 rounded-md">
    <p className="text-sm text-purdue-gray-800">
      <strong>Note:</strong> The new user will receive an email with instructions to set their password.
    </p>
  </div>
)}
```

**Rationale**:
- Removes non-existent `purdue-blue-*` classes
- Uses Purdue gold for informational messages
- Opacity creates subtle highlighting without overwhelming the form

**Status**: [ ] Complete

---

### Step 5: Fix ManageUsersPage Action Buttons

**File**: `frontend/src/pages/ManageUsersPage.tsx`

**Lines**: 228, 235, 243

**Current** (Edit button, line ~228):
```typescript
<button
  className="text-purdue-blue-600 hover:text-purdue-blue-800"
>
  Edit
</button>
```

**Current** (Activate/Deactivate button, line ~235):
```typescript
<button
  className="text-purdue-green-600 hover:text-purdue-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {user.is_active ? 'Deactivate' : 'Activate'}
</button>
```

**Current** (Make Staff button, line ~243):
```typescript
<button
  className="text-purdue-gold-600 hover:text-purdue-gold-800 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {user.is_staff ? 'Remove Staff' : 'Make Staff'}
</button>
```

**Change all to** (black for modifications):
```typescript
// Edit button
<button
  className="text-purdue-gray-900 hover:text-black"
>
  Edit
</button>

// Activate/Deactivate button
<button
  className="text-purdue-gray-900 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
>
  {user.is_active ? 'Deactivate' : 'Activate'}
</button>

// Make Staff button
<button
  className="text-purdue-gray-900 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
>
  {user.is_staff ? 'Remove Staff' : 'Make Staff'}
</button>
```

**Rationale**:
- Removes non-existent `purdue-blue-*`, `purdue-green-*`, `purdue-gold-600/800` classes
- Uses semantic color: black for all modification actions (Edit, Activate, Make Staff)
- Provides visual consistency with other modification actions across the app
- Maintains disabled state styling

**Status**: [ ] Complete

---

### Step 6: Verification

After implementing all fixes:

1. **Grep check for blue colors**:
   ```bash
   git grep -n "blue-\d\+\|text-blue\|bg-blue\|border-blue\|purdue-blue" -- 'frontend/src/**/*.tsx' 'frontend/src/**/*.ts'
   ```
   Should return: **0 results**

2. **Grep check for non-existent purdue colors**:
   ```bash
   git grep -n "purdue-green-\|purdue-gold-[0-9]" -- 'frontend/src/**/*.tsx' 'frontend/src/**/*.ts'
   ```
   Should return: **0 results**

3. **TypeScript check**:
   ```bash
   docker compose exec frontend npm run type-check
   ```
   Should pass with no errors.

4. **Linting check**:
   ```bash
   docker compose exec frontend npm run lint
   ```
   Should pass with no errors.

**Status**: [ ] Complete

---

### Step 7: Update CLAUDE.md Documentation

**File**: `CLAUDE.md`

**Action**: Add a new section after "Typography & Branding" and before "Important Patterns".

**Add**:
```markdown
### Purdue Brand Colors & UI Guidelines

**IMPORTANT**: Purdue's official brand has **NO BLUE** colors. Never use blue in UI elements.

#### Available Color Palette
The project uses colors defined in `frontend/tailwind.config.js`:
```typescript
purdue: {
  gold: '#CEB888',        // Primary brand color
  'gold-light': '#DACC9F',
  'gold-dark': '#B59D6B',
  aged: '#8E6F3E',        // Supporting brown (if added)
  'aged-dark': '#6b5530',
  gray: {50...900}        // Full gray scale
}
```

**Note**: Only use color classes that exist in tailwind.config.js. Classes like `purdue-blue-*`, `purdue-green-*`, or `purdue-gold-600` do not exist and will fail silently.

#### Action Button Color Standards
For consistency across applications:

1. **Access/View Actions** (gray or aged brown):
   - Preview, View, Download, Open
   - Example: `className="text-purdue-gray-700 hover:text-purdue-gray-900"`
   - With aged: `className="text-purdue-aged hover:text-purdue-aged-dark"`

2. **Modification Actions** (black):
   - Edit, Make Public/Private, Activate/Deactivate, Make Staff
   - Example: `className="text-purdue-gray-900 hover:text-black"`

3. **Destructive Actions** (red):
   - Delete, Remove
   - Example: `className="text-red-600 hover:text-red-900"`

#### Component Color Usage
- **Info messages**: Use `bg-purdue-gold bg-opacity-10` with `text-purdue-gray-800`
- **Status badges**:
  - Success: `bg-green-100 text-green-800`
  - Error: `bg-red-100 text-red-800`
  - Warning: `bg-yellow-100 text-yellow-800`
  - Info: `bg-purdue-gold bg-opacity-20 text-purdue-gray-800`
- **Disabled states**: Use gray tones with `disabled:opacity-50 disabled:cursor-not-allowed`
```

**Rationale**: Documents the color standards so future work maintains consistency.

**Status**: [ ] Complete

---

## Quick Implementation Guide for Claude

If you're Claude Code working on this template, here's how to implement:

1. **Read this file** to understand the context
2. **Work through Steps 1-7** in order, marking each as complete
3. **Run verification** to confirm all blues are removed
4. **Commit changes** with message:
   ```
   Fix color consistency: remove blues and non-existent classes

   - Remove all blue colors per Purdue brand guidelines
   - Replace non-existent purdue-blue-*, purdue-green-*, purdue-gold-600/800 classes
   - Standardize action button colors: gray for mods, red for delete
   - Add aged brown to palette (optional enhancement)
   - Document color standards in CLAUDE.md

   Refs: https://marcom.purdue.edu/our-brand/visual-identity/
   ```

---

## Notes for Downstream Projects

Projects that have already forked from this template (like IoT Root) should:

1. **Wait for this fix** to be merged to template main
2. **Merge from upstream** using:
   ```bash
   git fetch template main
   git merge template/main
   ```
3. **Preserve custom colors** if they've added their own (like `purdue.aged`)
4. **Review conflicts** carefully - prioritize:
   - Project-specific business logic over template infrastructure
   - Purdue brand compliance over convenience
   - Semantic consistency over individual preferences

---

## Success Criteria

- [ ] Zero blue colors in codebase
- [ ] Zero non-existent color classes
- [ ] All action buttons follow semantic color standards
- [ ] TypeScript and ESLint pass
- [ ] CLAUDE.md documents color usage
- [ ] Downstream projects can merge cleanly

---

## References

- Purdue Brand Guidelines: https://marcom.purdue.edu/our-brand/visual-identity/
- Tailwind Opacity Utilities: https://tailwindcss.com/docs/background-opacity
- Project tailwind.config.js: `frontend/tailwind.config.js`
