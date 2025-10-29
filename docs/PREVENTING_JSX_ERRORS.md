# Preventing JSX Structure Errors - Best Practices

## The Problem

When editing JSX/TSX files, it's easy to accidentally create mismatched or unclosed tags, especially when:
- Adding new sections to existing forms
- Copy-pasting code blocks
- Editing nested structures

These errors break the entire application and are caught at build time.

## Prevention Strategies

### 1. **Use the JSX Validator (Automated)**

We've added a validation script that checks JSX structure before builds:

```bash
# Run manually in frontend directory
npm run validate-jsx

# Run validation + type checking
npm run precommit
```

**Add to your workflow:**
- Run before committing changes
- Add as a pre-commit git hook
- Include in CI/CD pipeline

### 2. **TypeScript Type Checking**

Always run type checking before committing:

```bash
npm run type-check
```

This catches many JSX errors along with type issues.

### 3. **Use Editor Extensions**

**VSCode Extensions:**
- **ESLint** - Catches JSX errors in real-time
- **Prettier** - Auto-formats JSX structure
- **Error Lens** - Shows errors inline

**Settings for VSCode (`.vscode/settings.json`):**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### 4. **Follow JSX Editing Rules**

**When adding new elements:**
1. ✅ Add opening and closing tags together
2. ✅ Use your editor's auto-complete
3. ✅ Indent properly to see structure
4. ❌ Don't manually type closing tags later

**When editing existing structures:**
1. ✅ View the entire section you're modifying
2. ✅ Count opening and closing tags
3. ✅ Use "Go to Bracket" feature (Ctrl+Shift+\\ in VSCode)
4. ❌ Don't insert code in the middle without checking structure

### 5. **Use Code Folding**

In VSCode:
- Fold code sections to verify they match
- Mismatched tags won't fold correctly
- Keyboard shortcut: Ctrl+Shift+[ / ]

### 6. **Git Pre-Commit Hook**

Create `.git/hooks/pre-commit`:

```bash
#!/bin/sh
cd frontend
npm run validate-jsx
if [ $? -ne 0 ]; then
  echo "❌ JSX validation failed. Please fix errors before committing."
  exit 1
fi
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

### 7. **Watch for Common Patterns**

**Common mistakes:**

```jsx
// ❌ WRONG - Missing closing </div>
<div className="grid">
  <div>Content</div>
  <label>Label</label>  // Oops, no wrapper div
</div>

// ✅ CORRECT
<div className="grid">
  <div>Content</div>
  <div>
    <label>Label</label>
  </div>
</div>
```

```jsx
// ❌ WRONG - Duplicate field after edit
<div>
  <input name="field1" />
</div>
<div>
  <input name="field1" />  // Forgot to remove old one
</div>

// ✅ CORRECT
<div>
  <input name="field1" />
</div>
```

### 8. **Code Review Checklist**

Before committing JSX changes:
- [ ] Run `npm run validate-jsx`
- [ ] Run `npm run type-check`
- [ ] Check browser console for errors
- [ ] Verify form renders correctly
- [ ] Test all interactive elements

## Quick Fixes

### If App Won't Start:

1. **Check the error message** - it tells you the line number
2. **Look at the line above and below** the error
3. **Count opening vs closing tags** in that section
4. **Use your editor's bracket matching**
5. **Revert recent changes** if needed:
   ```bash
   git diff  # See what changed
   git checkout -- path/to/file.tsx  # Undo changes
   ```

### Common Error Messages:

**"Expected corresponding JSX closing tag"**
- Missing closing tag
- Wrong closing tag (e.g., `</div>` when expecting `</form>`)

**Solution:** Find the opening tag mentioned and add the correct closing tag.

## Development Workflow

### Recommended Process:

1. **Before editing:**
   ```bash
   npm run validate-jsx  # Ensure starting point is valid
   ```

2. **While editing:**
   - Use editor autocomplete
   - Save frequently
   - Watch for red squiggles

3. **After editing:**
   ```bash
   npm run validate-jsx  # Check structure
   npm run type-check    # Check types
   ```

4. **Before committing:**
   ```bash
   npm run precommit     # Run all checks
   ```

5. **Test in browser:**
   - Refresh and verify no console errors
   - Test the functionality you changed

## IDE Configuration

### VSCode Tasks (`.vscode/tasks.json`):

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Validate JSX",
      "type": "npm",
      "script": "validate-jsx",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

Run with: `Ctrl+Shift+P` → "Tasks: Run Task" → "Validate JSX"

## Troubleshooting

### Validator False Positives

The validator is simple and may have false positives. If you encounter issues:

1. Check TypeScript compilation: `npm run type-check`
2. Check the actual error in the browser console
3. The validator is a helper, not authoritative

### When to Skip Validation

For generated code or special cases, you can temporarily skip:

```bash
# Skip validation (not recommended)
npm run build  # Will catch real errors anyway
```

## Summary

**Key Takeaways:**
1. ✅ Use `npm run validate-jsx` before commits
2. ✅ Enable ESLint and Prettier in your editor
3. ✅ Add opening and closing tags together
4. ✅ Test in browser after JSX changes
5. ✅ Use code folding to verify structure

**The Golden Rule:**
> **If you add an opening tag, immediately add the closing tag, then fill in the content.**

This prevents 99% of JSX structure errors.

---

**Questions?** Check the validator output - it shows exactly which tag is unclosed and on which line.
