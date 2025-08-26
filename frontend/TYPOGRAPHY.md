# Typography Guide for Purdue Web Applications

This guide explains how to use Purdue's brand fonts effectively in your application.

## Font Families

### Acumin Pro (Default)
- **Use for**: Headlines, subheads, body copy, general UI text
- **Classes**: `font-acumin` or default (no class needed)

### United Sans
- **Use for**: Statistics, data, brief callouts, numbers, uppercase labels
- **Classes**: `font-united`
- **Character**: More rigid, collegiate look

### Source Serif Pro
- **Use for**: Long-form reading, articles, quotes, editorial content
- **Classes**: `font-source`

## Semantic Classes

Instead of using raw font classes, use semantic classes that convey meaning:

### Headlines & Display Text
- `text-headline` - Major headlines (Acumin Pro Bold)
- `text-subhead` - Section headers (Acumin Pro SemiBold)
- `text-body` - Body text (Acumin Pro Regular)

### Data & Callouts (United Sans)
- `text-stat` - Large statistics/numbers
- `text-data` - Data tables, factoids
- `text-callout` - Brief emphasized text
- `text-caption` - Small uppercase labels

### Long-form Content (Source Serif Pro)
- `text-article` - Article body text
- `text-quote` - Pull quotes, testimonials

## Examples

```jsx
// Homepage statistics
<div className="text-center">
  <span className="text-stat text-purdue-gold">40,000+</span>
  <span className="text-caption text-purdue-gray-600">Students</span>
</div>

// Article headline
<h1 className="text-headline">Major Research Breakthrough</h1>

// Long-form content
<article className="text-article">
  <p>This research represents a significant advancement...</p>
  <blockquote className="text-quote">
    "This changes everything we know about..."
  </blockquote>
</article>

// Dashboard data
<dl>
  <dt className="text-caption">Status</dt>
  <dd className="text-data">Active</dd>
</dl>
```

## Quick Reference

| Content Type | Semantic Class | Font Used | Example |
|-------------|---------------|-----------|---------|
| Main headline | `text-headline` | Acumin Pro Bold | Page titles |
| Section header | `text-subhead` | Acumin Pro SemiBold | Card headers |
| Body text | `text-body` or none | Acumin Pro | Paragraphs |
| Statistics | `text-stat` | United Sans Bold | "99.9%" |
| Data labels | `text-caption` | United Sans Uppercase | "ENROLLMENT" |
| Table data | `text-data` | United Sans | Numbers, facts |
| Articles | `text-article` | Source Serif Pro | Blog posts |
| Quotes | `text-quote` | Source Serif Pro Italic | Testimonials |

## Direct Font Classes

If you need direct control:
- `font-acumin` - Force Acumin Pro
- `font-united` - Force United Sans  
- `font-source` - Force Source Serif Pro

## Notes

- Acumin Pro is the default for all text (no class needed)
- United Sans works best for brief, impactful content
- Source Serif Pro improves readability for long passages
- All fonts fall back gracefully when not available