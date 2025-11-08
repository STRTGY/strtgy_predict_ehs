# Maintenance Guide - STRTGY Predict Framework

## 🎯 Purpose

This guide helps you maintain and extend the STRTGY Predict framework, ensuring consistency with STRTGY's brand guidelines and Observable Framework best practices.

---

## 📁 File Structure

```
reports/strtgy_predict_midmen_electrolit_hermosillo/
├── src/
│   ├── ubicacion-cedis.md          # ⭐ Main page (enhanced)
│   ├── components/
│   │   ├── ui.js                   # Utility UI components
│   │   ├── brand.js                # STRTGY brand components
│   │   └── maps.js                 # Map components
│   ├── data/
│   │   └── loaders.js              # Data loading utilities
│   └── custom-theme.css            # STRTGY brand styles
├── UI_UX_IMPROVEMENTS_SUMMARY.md   # 📄 What was improved
├── BEFORE_AFTER_COMPARISON.md      # 📊 Visual comparison
└── MAINTENANCE_GUIDE.md            # 📖 This file
```

---

## 🎨 STRTGY Brand Guidelines

### Color Palette

Always use these CSS variables defined in `custom-theme.css`:

```css
--strtgy-blue: #0066cc      /* Primary - Use for main CTAs, borders, headers */
--strtgy-green: #00a651     /* Success - Use for positive metrics, completion */
--strtgy-orange: #ff6b35    /* Attention - Use for warnings, important items */
--electrolit-blue: #0099ff  /* Client brand - Use sparingly for context */
```

### Typography Scale

```css
H1 (Page Title):    2.5rem (40px)  - font-weight: 700
H2 (Major Section): 1.75rem (28px) - font-weight: 600
H3 (Subsection):    1.5rem (24px)  - font-weight: 600
H4 (Card Header):   1.1-1.25rem    - font-weight: 600
Body:               0.95-1rem      - font-weight: 400
Small:              0.85rem        - font-weight: 400
```

### Spacing System

```css
Section spacing:    margin: 2rem 0
Card padding:       padding: 1.25rem - 2rem
Grid gap:           gap: 1rem - 1.5rem
Border radius:      border-radius: 8px - 12px
```

### Gradient Patterns

```css
/* Dark header gradient (hero sections) */
background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);

/* Light gradient (KPI wrappers) */
background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

/* Purple gradient (featured cards) */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Color-specific gradients */
Green:  linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
Blue:   linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
Orange: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
Purple: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
```

---

## 🧩 Component Usage Guide

### 1. Hero Sections

```javascript
import {heroSTRTGY} from "./components/brand.js";

display(heroSTRTGY({
  title: "Your Page Title",
  subtitle: "Clear value proposition",
  context: "Detailed context paragraph",
  showPillars: false  // Set to true to show STRTGY's 5 pillars
}));
```

**When to use:** At the top of major pages or sections
**Customization:** Edit title, subtitle, context. Toggle pillars as needed.

---

### 2. Section Headers with Certainty

```javascript
import {sectionHeader} from "./components/brand.js";

display(sectionHeader({
  title: "Section Title",
  subtitle: "Optional explanation",
  certainty: "high"  // Options: "high", "medium", "low"
}));
```

**When to use:** Major section breaks with quality indicators
**Certainty levels:**
- `"high"` = Green "Alta certeza" badge (validated data)
- `"medium"` = Yellow "Certeza media" badge (calculated estimates)
- `"low"` = Red "Validar" badge (requires field validation)

---

### 3. Decision Callouts

```javascript
import {decisionCallout} from "./components/brand.js";

display(decisionCallout({
  title: "What decision needs to be made?",
  items: [
    "Key consideration 1",
    "Key consideration 2",
    "Key consideration 3"
  ]
}));
```

**When to use:** Highlight critical decision points
**Style:** Orange warning background, draws immediate attention

---

### 4. Implications Callouts

```javascript
import {implicationsCallout} from "./components/brand.js";

display(implicationsCallout({
  title: "Key Insights and Actions",
  items: [
    "Insight or recommendation 1",
    "Insight or recommendation 2",
    "Insight or recommendation 3"
  ]
}));
```

**When to use:** Summarize findings or next steps
**Style:** Green success background, positive framing

---

### 5. KPI Cards

```javascript
import {kpi, formatNumber, formatPercent} from "./components/ui.js";

display(kpi([
  {
    label: "Metric Name",
    value: formatNumber(123456),
    trend: "+15% vs last month"  // Optional
  },
  {
    label: "Percentage Metric",
    value: formatPercent(0.85),
    trend: "✓ Target achieved"
  }
]));
```

**When to use:** Display key metrics prominently
**Tip:** Wrap in gradient div for "executive summary" styling

---

### 6. Enhanced Tables with Visual Bars

```javascript
import {table, badge} from "./components/ui.js";

display(table(
  data,
  [
    {key: "name", label: "Name"},
    {
      key: "score",
      label: "Score (35%)",  // Show weighting!
      format: (v) => html`
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div style="flex: 1; background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
            <div style="width: ${v}%; background: linear-gradient(90deg, var(--strtgy-green), #00d66c); height: 100%;"></div>
          </div>
          <span style="font-weight: 600; min-width: 2rem;">${v}</span>
        </div>
      `
    },
    {
      key: "priority",
      label: "Priority",
      format: (v) => v === "1" ? badge("High", "high") : badge("Medium", "medium")
    }
  ],
  {sortable: true, exportable: true, pageSize: 0}
));
```

**When to use:** Compare scenarios or rankings
**Tip:** Use progress bars for scores, badges for status

---

### 7. Interactive Inputs

```javascript
import * as Inputs from "npm:@observablehq/inputs";

// Toggle controls
const showLayer = view(Inputs.toggle({
  label: "Show Layer",
  value: true
}));

// Dropdown selector
const selectedOption = view(Inputs.select(
  ["Option 1", "Option 2", "Option 3"],
  {
    label: "Choose an option:",
    value: "Option 1"
  }
));

// Radio buttons
const scenarioType = view(Inputs.radio(
  ["Optimistic", "Realistic", "Conservative"],
  {label: "Scenario Type", value: "Realistic"}
));
```

**When to use:** Enable user exploration and filtering
**Tip:** Always wrap in styled control panel div

---

### 8. Maps with Leaflet

```javascript
const container = document.createElement("div");
container.style.height = "650px";
container.style.border = "2px solid var(--strtgy-blue)";
container.style.borderRadius = "12px";
container.style.boxShadow = "0 4px 20px rgba(0, 102, 204, 0.15)";
container.style.margin = "1.5rem 0";

display(container);

const map = L.map(container).setView([lat, lng], zoom);

// Use CartoDB Positron for clean look
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors © CARTO'
}).addTo(map);

// Enhanced popups
layer.bindPopup(`
  <div style="font-family: system-ui; padding: 0.5rem; min-width: 200px;">
    <strong style="color: var(--strtgy-blue); font-size: 1.1rem;">📍 Location Name</strong><br>
    <div style="margin-top: 0.5rem; font-size: 0.9rem;">
      <strong>Metric:</strong> Value<br>
      <strong>Another:</strong> Value
    </div>
  </div>
`);
```

**When to use:** Display geospatial data
**Required:** STRTGY blue border, rounded corners, CartoDB basemap

---

## 🔧 Common Customization Tasks

### Adding a New Criterion Card

```html
<div class="card" style="border-left: 4px solid var(--strtgy-blue);">
  <h4 style="margin: 0 0 0.5rem 0; color: var(--strtgy-blue);">
    🔍 Your Criterion
  </h4>
  <p style="margin: 0; font-size: 0.875rem; color: var(--theme-foreground-muted);">
    Brief description of what this criterion evaluates
  </p>
</div>
```

**Colors to use:**
- Blue: Primary criteria
- Green: Positive/success metrics
- Orange: Warning/attention items
- Purple: Special/featured content

---

### Creating a New Phase Card

```html
<div class="card" style="border-top: 4px solid var(--strtgy-blue); 
                         background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
  <h4 style="margin: 0 0 1rem 0; color: var(--strtgy-blue); font-size: 1.1rem;">
    📍 Phase Name
  </h4>
  <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.9rem; line-height: 1.8;">
    <li>Action item 1</li>
    <li>Action item 2</li>
    <li>Action item 3</li>
  </ul>
</div>
```

**Grid layout:**
```html
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
            gap: 1.5rem; margin: 2rem 0;">
  <!-- Phase cards here -->
</div>
```

---

### Adding a Recommendation Box

```html
<div style="background: rgba(0, 166, 81, 0.15); border-left: 4px solid #00a651; 
            padding: 1.25rem; border-radius: 8px;">
  <h4 style="margin: 0 0 0.75rem 0; color: #00d66c; font-size: 1.1rem;">
    ✅ Recommendation Title
  </h4>
  <p style="margin: 0; line-height: 1.6; font-size: 0.95rem; opacity: 0.95;">
    <strong>Pros:</strong> List advantages here<br>
    <strong>Cons:</strong> List risks or limitations here
  </p>
</div>
```

**Color scheme:**
- Green (`#00a651`): Priority 1, recommended
- Blue (`#0066cc`): Alternative options
- Orange (`#ff6b35`): Important considerations
- Yellow (`#ff9800`): Warnings/validations needed

---

## 📊 Data Integration Tips

### Loading Data

Always use the loader pattern:

```javascript
import {createLoaders, isDataAvailable, dataNotAvailableMessage} from "./data/loaders.js";

const loaders = createLoaders({FileAttachment});
const myData = await loaders.loadMyData();

// Always check availability
if (isDataAvailable(myData)) {
  // Use data
} else {
  display(dataNotAvailableMessage("my data"));
}
```

### Calculating Scores

Use consistent scoring methodology:

```javascript
// Define weights (must sum to 1.0)
const WEIGHTS = {
  accessibility: 0.35,
  density: 0.30,
  logistics: 0.25,
  cost: 0.10
};

// Calculate weighted score
const totalScore = Math.round(
  scores.accessibility * WEIGHTS.accessibility +
  scores.density * WEIGHTS.density +
  scores.logistics * WEIGHTS.logistics +
  scores.cost * WEIGHTS.cost
);

// Classify
const priority = totalScore >= 75 ? "1" : "2";
const recommendation = totalScore >= 75 ? "Prioritario" : "Alternativa";
```

---

## 🎯 Quality Checklist

Before publishing changes, verify:

- [ ] **Brand Colors:** All colors use CSS variables or hex codes from palette
- [ ] **Typography:** Font sizes match the scale (no arbitrary sizes)
- [ ] **Spacing:** Consistent use of spacing system (no random margins)
- [ ] **Gradients:** Match established patterns (dark hero, light wrappers, etc.)
- [ ] **Components:** Use existing components from `ui.js` and `brand.js`
- [ ] **Icons:** Emoji icons used consistently (📍 🎯 💰 🚚 etc.)
- [ ] **Responsive:** Grid layouts use `repeat(auto-fit, minmax(...))`
- [ ] **Accessibility:** Proper semantic HTML, ARIA when needed
- [ ] **Data Validation:** Check `isDataAvailable()` before using data
- [ ] **Error Messages:** Use `dataNotAvailableMessage()` for missing data
- [ ] **Certainty Badges:** Add where data quality varies
- [ ] **Loading States:** Consider loading indicators for slow data

---

## 🐛 Troubleshooting

### Map Not Rendering

1. Check Leaflet CSS is loaded in `observablehq.config.js` head
2. Verify container has explicit height (e.g., `650px`)
3. Ensure `L` is available globally (Leaflet loaded)
4. Check browser console for errors

### Inputs Not Reactive

1. Must use `view(Inputs.*)` to make reactive
2. Variable name must be unique (no duplicates)
3. Can't use same input in multiple cells
4. Check Observable Framework docs on reactivity

### Component Not Found

1. Verify import path ends with `.js` (even for TS/JSX)
2. Check component is exported from module
3. Ensure module is in `src/components/` directory
4. Clear cache and rebuild if necessary

### Styles Not Applied

1. CSS variables require `:root` definition in `custom-theme.css`
2. Inline styles take precedence over classes
3. Check for typos in CSS variable names
4. Verify theme is enabled in `observablehq.config.js`

---

## 📚 Additional Resources

- **Observable Framework Docs:** https://observablehq.com/framework/
- **Leaflet Documentation:** https://leafletjs.com/reference.html
- **STRTGY Brand Guidelines:** (Internal document - request from brand team)
- **Component Library:** See `src/components/brand.js` and `src/components/ui.js`

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 3, 2025 | Initial enhanced version with full STRTGY branding |

---

## 💡 Best Practices Summary

1. **Always check data availability** before using it
2. **Use existing components** instead of recreating styles
3. **Follow the color palette** strictly (no random colors)
4. **Maintain consistent spacing** (2rem for sections, 1.25-2rem for cards)
5. **Add certainty badges** when data quality varies
6. **Use descriptive variable names** (no `data1`, `data2`)
7. **Comment complex logic** but keep code self-documenting
8. **Test on mobile** (use Chrome DevTools responsive mode)
9. **Optimize images** before adding to `src/` directory
10. **Keep it simple** - clarity over cleverness

---

**Maintained by STRTGY Team | Last Updated: November 3, 2025**

