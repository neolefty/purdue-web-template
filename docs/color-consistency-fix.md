# Purdue Brand Color Compliance

**Purpose**: Document this template's adherence to Purdue brand guidelines and identify where we deviate from official brand colors for UX reasons.

**Reference**: [Purdue Brand Guidelines - Visual Identity](https://marcom.purdue.edu/our-brand/visual-identity/)

---

## Current State Summary

### ✅ Compliant with Purdue Brand

1. **No blue colors**: All blue colors removed (blue was not an official Purdue color)
2. **Official Purdue colors defined** in `frontend/tailwind.config.js`:
   ```typescript
   purdue: {
     gold: '#CEB888',        // Primary Boilermaker Gold
     'gold-light': '#DACC9F',
     'gold-dark': '#B59D6B',
     black: '#000000',
     aged: '#8E6F3E',        // Supporting brown
     'aged-dark': '#6b5530',
     gray: {50...900}        // Full grayscale
   }
   ```
3. **Action buttons follow semantic standards**:
   - Access/View: Gray or aged brown (`text-purdue-gray-700 hover:text-purdue-gray-900`)
   - Modifications: Black (`text-purdue-gray-900 hover:text-black`)
   - Destructive: Red (`text-red-600 hover:text-red-900`)
4. **Info messages**: Use Purdue gold (`bg-purdue-gold bg-opacity-10`)

### ⚠️ Deviations from Purdue Brand (Conscious UX Choices)

**Rationale**: Following universal UX color conventions for better usability and accessibility. Green/red/yellow are not official Purdue colors but provide strong visual affordance for status indicators.

#### 1. Status Badges
**File**: `frontend/src/components/StatusBadge.tsx` (lines 11-14)
```typescript
const variantClasses = {
  success: 'bg-green-100 text-green-800',      // ⚠️ Green (non-brand)
  error: 'bg-red-100 text-red-800',            // ⚠️ Red (non-brand)
  warning: 'bg-yellow-100 text-yellow-800',    // ⚠️ Yellow (non-brand)
  info: 'bg-purdue-gold bg-opacity-20 text-purdue-gray-800'  // ✅ Brand-compliant
}
```

**Used in**:
- `frontend/src/pages/ManageUsersPage.tsx:180` - Active/inactive user status
- `frontend/src/pages/ProfilePage.tsx:100` - "Active" badge
- `frontend/src/pages/HomePage.tsx:152` - Health check status

#### 2. Card Badge Colors
**File**: `frontend/src/components/Card.tsx` (lines 8, 24)
```typescript
badgeColor?: 'gold' | 'green' | 'red'  // ⚠️ Allows green and red (non-brand)
// ...
green: 'text-green-600'  // ⚠️ Green option
```

#### 3. Success Message Boxes
Green backgrounds for success messages:

**File**: `frontend/src/pages/ManageUsersPage.tsx` (lines 122-123)
```typescript
<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
  <p className="text-green-800">
```

**File**: `frontend/src/pages/ChangePasswordPage.tsx` (lines 80-81)
```typescript
<div className="p-4 bg-green-50 border border-green-200 rounded-md">
  <p className="text-sm text-green-800">
```

**File**: `frontend/src/pages/VerifyEmailPage.tsx` (lines 62, 117-118)
```typescript
<h1 className="text-3xl font-bold text-green-600">Email Verified!</h1>
// ...
<div className="p-4 bg-green-50 border border-green-200 rounded-md">
  <p className="text-sm text-green-600">
```

**File**: `frontend/src/pages/PasswordResetRequestPage.tsx` (line 34)
```typescript
<h1 className="text-3xl font-bold text-green-600">Check Your Email</h1>
```

**File**: `frontend/src/pages/PasswordResetPage.tsx` (line 54)
```typescript
<h1 className="text-3xl font-bold text-green-600">Password Reset Successful!</h1>
```

**File**: `frontend/src/pages/RegisterPage.tsx` (line 49)
```typescript
<h1 className="text-3xl font-bold text-green-600">Check Your Email</h1>
```

---

## If You Want Strict Brand Compliance

To replace all non-brand colors with Purdue palette, search for and replace:

### Find All Green Usage
```bash
git grep -n "green-\|text-green\|bg-green\|border-green" -- 'frontend/src/**/*.tsx'
```

### Find All Red Usage (excluding destructive actions which should stay red)
```bash
git grep -n "red-\|text-red\|bg-red\|border-red" -- 'frontend/src/**/*.tsx'
```

### Find All Yellow Usage
```bash
git grep -n "yellow-\|text-yellow\|bg-yellow\|border-yellow" -- 'frontend/src/**/*.tsx'
```

### Suggested Brand-Compliant Replacements

| Current (UX Convention) | Strict Brand Alternative |
|------------------------|-------------------------|
| `bg-green-100 text-green-800` | `bg-purdue-gold bg-opacity-20 text-purdue-gray-900` |
| `text-green-600` | `text-purdue-gold-dark` or `text-purdue-aged` |
| `bg-yellow-100 text-yellow-800` | `bg-purdue-aged bg-opacity-20 text-purdue-gray-900` |
| `bg-red-100 text-red-800` | Keep for errors (universally understood) |
| `text-red-600` | Keep for destructive actions |

**Note**: Changing success indicators from green to gold will be less intuitive for users but fully brand-compliant.

---

## Verification Commands

Confirm no blue colors remain:
```bash
git grep -n "blue-\|text-blue\|bg-blue\|border-blue\|purdue-blue" -- 'frontend/src/**/*.tsx' 'frontend/src/**/*.ts'
# Should return: 0 results ✅
```

Confirm no non-existent color classes:
```bash
git grep -n "purdue-green-\|purdue-gold-[0-9]" -- 'frontend/src/**/*.tsx' 'frontend/src/**/*.ts'
# Should return: 0 results ✅
```

---

## References

- [Purdue Visual Identity Guidelines](https://marcom.purdue.edu/our-brand/visual-identity/)
- Project Tailwind Config: `frontend/tailwind.config.js`
- Color usage documented in: `CLAUDE.md` (Purdue Brand Colors & UI Guidelines section)
