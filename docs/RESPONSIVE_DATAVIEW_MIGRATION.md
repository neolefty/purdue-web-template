# ResponsiveDataView Migration Guide

**Target**: Downstream projects using this template (e.g., IoT Root)

**Purpose**: Migrate existing table implementations to use the new ResponsiveDataView component

**Context**: The template now includes ResponsiveDataView, a unified component that automatically switches between table (desktop) and card (mobile/tablet) views. ManageUsersPage is the reference implementation.

---

## What Changed

### New Components
- `ResponsiveDataView.tsx`: Main component with ColumnConfig and ActionConfig interfaces
- `ResponsiveCard.tsx`: Updated to accept ActionConfig instead of ReactNode[]

### Key Abstractions
1. **ColumnConfig**: Declarative column definitions with `primary` and `badge` flags
2. **ActionConfig**: Semantic action variants (primary/secondary/danger) that render contextually:
   - Table view: text links with semantic colors
   - Card view: styled buttons with backgrounds

### Reference Implementation
- `ManageUsersPage.tsx`: Shows the pattern in action

---

## Migration Steps

### 1. Identify Tables to Migrate

Look for pages with:
- Custom table implementations
- Separate mobile card components
- Non-responsive or mobile-unfriendly tables

**Downstream targets**: DevicesPage, DocumentsPage, potentially others

### 2. Read the Reference Implementation

**START HERE**: Read `frontend/src/pages/ManageUsersPage.tsx` in the template repo.

Pay attention to:
- How columns are configured (lines ~142-210)
- How actions are built (lines ~226-263)
- The `getMetadata` function for card view (lines ~212-225)

### 3. Extract Column Definitions

For each existing table, identify:
- Which column should be primary (shown as card title)
- Which columns are badges (grouped together in cards)
- Which columns are data (shown in table, hidden in cards)

**Example from Devices**:
```typescript
columns={[
  {
    key: 'device',
    label: 'Device',
    primary: true,  // This will be the card title
    render: (device) => (
      <div>
        <div className="text-sm font-medium text-purdue-gray-900">
          {device.name}
        </div>
        <div className="text-sm text-purdue-gray-500">
          {device.serial_number}
        </div>
      </div>
    ),
    cellClassName: 'whitespace-nowrap',
  },
  {
    key: 'status',
    label: 'Status',
    badge: true,  // Will be grouped with other badges
    render: (device) => (
      <StatusBadge
        status={device.is_online ? 'Online' : 'Offline'}
        variant={device.is_online ? 'success' : 'warning'}
      />
    ),
  },
  {
    key: 'location',
    label: 'Location',
    render: (device) => (
      <span className="text-sm text-purdue-gray-900">
        {device.location}
      </span>
    ),
  },
]}
```

### 4. Convert Actions to ActionConfig

**CRITICAL**: Don't pass button JSX anymore. Use ActionConfig objects.

**Before** (what you'll find in downstream):
```typescript
getActions={(device) => [
  <button onClick={() => handleView(device)}>View</button>,
  <button onClick={() => handleEdit(device)}>Edit</button>,
  <button onClick={() => handleDelete(device)}>Delete</button>,
]}
```

**After** (what you need to write):
```typescript
getActions={(device) => {
  const actions: ActionConfig[] = [
    {
      key: 'view',
      label: 'View',
      onClick: () => handleView(device),
      variant: 'secondary',  // gray button, gray link
    },
    {
      key: 'edit',
      label: 'Edit',
      onClick: () => handleEdit(device),
      variant: 'primary',  // gold button, black link
    },
  ]

  // Conditional actions
  if (device.can_delete) {
    actions.push({
      key: 'delete',
      label: 'Delete',
      onClick: () => handleDelete(device),
      variant: 'danger',  // red button, red link
    })
  }

  return actions
}}
```

**Action Variant Guide**:
- `primary`: Featured action (Edit, Open) → Gold button / Black text link
- `secondary`: Supporting action (View, Download, Activate) → Gray button / Gray text link
- `danger`: Destructive action (Delete, Remove) → Red button / Red text link

### 5. Add Metadata for Card View

Metadata shows additional info in cards (hidden in table). Typically includes timestamps, counts, etc.

```typescript
getMetadata={(device) => [
  {
    label: 'Last seen',
    value: formatTimestamp(device.last_seen),
  },
  {
    label: 'Uptime',
    value: `${device.uptime_days}d`,
  },
]}
```

### 6. Import and Use ResponsiveDataView

```typescript
import ResponsiveDataView, {
  type ColumnConfig,
  type ActionConfig
} from '@/components/ResponsiveDataView'

// In your component:
<ResponsiveDataView
  data={filteredDevices}
  columns={columns}
  getItemKey={(device) => device.id}
  getMetadata={(device) => [...]}
  getActions={(device) => [...]}
  breakpoint="lg"  // sm=640px, md=768px, lg=1024px, xl=1280px
  emptyMessage="No devices found."
  isLoading={isLoading}
  loadingMessage="Loading devices..."
/>
```

### 7. Remove Old Components

After migration:
- Remove custom mobile card components
- Remove manual responsive logic
- Remove duplicate table/card rendering code

---

## Common Patterns

### Conditional Column Rendering

If a column should only show sometimes:

```typescript
columns={[
  // ... other columns
  ...(showAdvanced ? [{
    key: 'advanced',
    label: 'Advanced',
    render: (item) => <div>{item.advanced_data}</div>
  }] : []),
]}
```

### Dynamic Action Styling

Actions can have dynamic labels:

```typescript
{
  key: 'toggle-public',
  label: device.is_public ? 'Make Private' : 'Make Public',
  onClick: () => handleTogglePublic(device),
  variant: 'secondary',
}
```

### Disabled Actions

```typescript
{
  key: 'edit',
  label: 'Edit',
  onClick: () => handleEdit(device),
  variant: 'primary',
  disabled: !device.can_edit,  // Grayed out, cursor-not-allowed
}
```

---

## Testing Checklist

After migrating each page:

### Visual Testing
- [ ] Table view looks correct at desktop size (>1024px)
- [ ] Card view appears at mobile/tablet size (<1024px)
- [ ] Badges are grouped together in cards
- [ ] Primary column content shows as card title
- [ ] Action buttons have proper colors:
  - Primary: Gold background
  - Secondary: Gray background
  - Danger: Red background
- [ ] Action links in table have proper colors:
  - Primary: Black text
  - Secondary: Gray text
  - Danger: Red text

### Functional Testing
- [ ] All actions trigger correct handlers
- [ ] Disabled actions are visually disabled and non-clickable
- [ ] Conditional actions show/hide correctly
- [ ] Search/filtering still works
- [ ] Loading state displays correctly
- [ ] Empty state displays correctly

### Responsive Testing
- [ ] Test at various breakpoints (resize browser)
- [ ] Verify breakpoint switch happens at expected size
- [ ] Check that cards wrap properly on narrow screens
- [ ] Verify touch targets are adequate (44px min)

### Type Checking
```bash
npm run type-check
```

Should pass with no errors. If you get type errors on ActionConfig, make sure you imported it:
```typescript
import ResponsiveDataView, {
  type ColumnConfig,
  type ActionConfig
} from '@/components/ResponsiveDataView'
```

---

## Quick Reference: ActionConfig Interface

```typescript
interface ActionConfig {
  /** Unique key for the action */
  key: string
  /** Label text for the action */
  label: string
  /** Click handler for the action */
  onClick: () => void
  /** Visual style variant */
  variant: 'primary' | 'secondary' | 'danger'
  /** Whether the action is disabled */
  disabled?: boolean
}
```

---

## Quick Reference: ColumnConfig Interface

```typescript
interface ColumnConfig<T> {
  /** Unique key for the column */
  key: string
  /** Column header label */
  label: string
  /** Render function for table cell content */
  render: (item: T) => ReactNode
  /** Whether this column should be shown prominently in card view (e.g., as title) */
  primary?: boolean
  /** Whether this is a badge column (will be grouped with other badges in card view) */
  badge?: boolean
  /** CSS classes for the table header */
  headerClassName?: string
  /** CSS classes for the table cell */
  cellClassName?: string
}
```

---

## Troubleshooting

### "Type 'ReactElement[]' is not assignable to type 'ActionConfig[]'"

You're still passing button JSX. Convert to ActionConfig objects (see step 4).

### Actions don't show in card view

Check ResponsiveCard is imported from the template version (should accept ActionConfig[]).

### Table actions have backgrounds (they shouldn't)

You might be on an old version of ResponsiveDataView. Pull latest from template.

### Cards show at wrong breakpoint

Check the `breakpoint` prop on ResponsiveDataView. Options: 'sm' (640px), 'md' (768px), 'lg' (1024px), 'xl' (1280px).

### Primary column doesn't show in card title

Make sure exactly one column has `primary: true`.

---

## Example: Full Migration

**Before** (custom implementation):
```typescript
// Lots of manual responsive logic, separate components, etc.
{isMobile ? (
  <div>
    {devices.map(device => (
      <CustomDeviceCard key={device.id} device={device} />
    ))}
  </div>
) : (
  <table>
    {/* table implementation */}
  </table>
)}
```

**After** (using ResponsiveDataView):
```typescript
<ResponsiveDataView
  data={filteredDevices}
  columns={[
    {
      key: 'device',
      label: 'Device',
      primary: true,
      render: (device) => (
        <div>
          <div className="text-sm font-medium">{device.name}</div>
          <div className="text-sm text-purdue-gray-500">{device.serial}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      badge: true,
      render: (device) => (
        <StatusBadge
          status={device.is_online ? 'Online' : 'Offline'}
          variant={device.is_online ? 'success' : 'warning'}
        />
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (device) => device.location,
    },
  ]}
  getItemKey={(device) => device.id}
  getActions={(device) => [
    {
      key: 'edit',
      label: 'Edit',
      onClick: () => handleEdit(device),
      variant: 'primary',
    },
    {
      key: 'delete',
      label: 'Delete',
      onClick: () => handleDelete(device),
      variant: 'danger',
    },
  ]}
  breakpoint="lg"
  isLoading={isLoading}
/>
```

---

## Claude-Specific Notes

When you (Claude) work on downstream migration:

1. **Always read ManageUsersPage.tsx first** - It's your reference implementation
2. **Don't guess at action rendering** - Check if buttons or ActionConfigs are expected
3. **Watch for type errors** - They'll tell you if you're using the wrong format
4. **Test both views** - Resize browser to verify both table and card views work
5. **Check git history** - If confused, look at the template's commit: "Add ResponsiveDataView with ActionConfig abstraction"

Key things you might forget:
- Import ActionConfig type (not just ColumnConfig)
- Set exactly one column as `primary: true`
- Use ActionConfig objects, not button JSX
- Return ActionConfig[] from getActions, not ReactNode[]
- The breakpoint prop controls when switch happens (default 'lg' = 1024px)

If you see references to MobileUserCard in downstream, that's the old pattern - replace it entirely with ResponsiveDataView.

---

## Success Criteria

Migration is complete when:
- [ ] All table pages use ResponsiveDataView
- [ ] No custom mobile card components remain (unless they're not tables)
- [ ] TypeScript compiles without errors
- [ ] All actions work in both table and card views
- [ ] Responsive behavior tested at multiple screen sizes
- [ ] No console errors or warnings
- [ ] Visual design matches template's ManageUsersPage

---

## Next Steps After Migration

Consider documenting any downstream-specific patterns you discover, similar to how this doc flowed from template to downstream. Examples might include:
- Domain-specific action patterns (e.g., "Download" actions for Documents)
- Custom badge styles
- Complex conditional rendering

These can flow back to the template if they're general enough.
