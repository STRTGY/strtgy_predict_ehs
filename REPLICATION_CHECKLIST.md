# Replication Checklist - Apply UI/UX Improvements to Other Pages

## 🎯 Purpose

Use this checklist to apply the same UI/UX improvements from the **Ubicación CEDIS** page to other pages in your Observable Framework project.

---

## 📋 Quick Start Checklist

For each page you want to enhance:

### ✅ Phase 1: Planning (5 minutes)

- [ ] Read the current page and identify its main sections
- [ ] Identify the key decision or insight the page should communicate
- [ ] List the main data visualizations (maps, charts, tables)
- [ ] Note any interactive elements or filters needed
- [ ] Determine the appropriate certainty level for each section

---

### ✅ Phase 2: Hero & Introduction (10 minutes)

- [ ] **Replace plain title** with `heroSTRTGY()` component:
  ```javascript
  import {heroSTRTGY} from "./components/brand.js";
  
  display(heroSTRTGY({
    title: "Your Page Title",
    subtitle: "Clear value proposition",
    context: "1-2 sentence context explaining what this analysis delivers",
    showPillars: false
  }));
  ```

- [ ] **Add decision callout** if applicable:
  ```javascript
  import {decisionCallout} from "./components/brand.js";
  
  display(decisionCallout({
    title: "What decision does this page support?",
    items: ["Priority 1", "Priority 2", "Consideration 3"]
  }));
  ```

- [ ] **Add criteria cards** if page evaluates multiple factors:
  ```html
  <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
    <div class="card" style="border-left: 4px solid var(--strtgy-blue);">
      <h4 style="color: var(--strtgy-blue);">🎯 Criterion 1</h4>
      <p style="font-size: 0.875rem;">Brief description</p>
    </div>
    <!-- Repeat for each criterion -->
  </div>
  ```

---

### ✅ Phase 3: KPI Dashboard (15 minutes)

- [ ] **Identify key metrics** to display (3-6 metrics ideal)

- [ ] **Enhance KPI section** with gradient wrapper:
  ```javascript
  display(html`
    <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); 
                padding: 2rem; border-radius: 12px; margin: 2rem 0;">
      <h3 style="text-align: center; font-size: 1.25rem; color: #2d3748;">
        Executive Summary Title
      </h3>
      ${kpi([
        {
          label: "Metric Name",
          value: formatNumber(value),
          trend: "Contextual info or target validation"
        },
        // ... more KPIs
      ])}
    </div>
  `);
  ```

- [ ] **Add trend indicators** (✓, ⚠, +X%, etc.) for each KPI

- [ ] **Include data validation messages** if data availability varies

---

### ✅ Phase 4: Maps (20 minutes, if applicable)

- [ ] **Add interactive layer toggles** above map:
  ```javascript
  const showLayer1 = view(Inputs.toggle({label: "Show Layer 1", value: true}));
  const showLayer2 = view(Inputs.toggle({label: "Show Layer 2", value: true}));
  ```

- [ ] **Style control panel**:
  ```html
  <div style="background: var(--theme-background-alt); padding: 1rem; 
              border-radius: 8px; display: flex; gap: 2rem; flex-wrap: wrap;">
    ${showLayer1} ${showLayer2}
  </div>
  ```

- [ ] **Enhance map container**:
  ```javascript
  const container = document.createElement("div");
  container.style.height = "650px";
  container.style.border = "2px solid var(--strtgy-blue)";
  container.style.borderRadius = "12px";
  container.style.boxShadow = "0 4px 20px rgba(0, 102, 204, 0.15)";
  ```

- [ ] **Switch to CartoDB Positron basemap**:
  ```javascript
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '© OpenStreetMap © CARTO'
  }).addTo(map);
  ```

- [ ] **Improve popups** with structured HTML and icons:
  ```javascript
  layer.bindPopup(`
    <div style="font-family: system-ui; padding: 0.5rem; min-width: 200px;">
      <strong style="color: var(--strtgy-blue); font-size: 1.1rem;">
        📍 ${title}
      </strong><br>
      <div style="margin-top: 0.5rem; font-size: 0.9rem;">
        <strong>Field:</strong> ${value}<br>
        <strong>Another:</strong> ${value2}
      </div>
    </div>
  `);
  ```

- [ ] **Enhance legend** with brand styling (see maintenance guide)

---

### ✅ Phase 5: Comparison Tables (15 minutes)

- [ ] **Add section header** with certainty badge:
  ```javascript
  display(sectionHeader({
    title: "Section Title",
    subtitle: "Brief explanation",
    certainty: "medium"  // "high", "medium", or "low"
  }));
  ```

- [ ] **Convert qualitative to quantitative scoring** (0-100 scale)

- [ ] **Add interactive selector** if multiple scenarios:
  ```javascript
  const selected = view(Inputs.select(
    options.map(o => o.name),
    {label: "Select scenario:", value: options[0].name}
  ));
  ```

- [ ] **Create feature card** for selected scenario:
  ```html
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; padding: 2rem; border-radius: 12px; margin: 1.5rem 0;">
    <h3>📍 ${selectedScenario.name}</h3>
    <!-- Grid of metrics -->
  </div>
  ```

- [ ] **Add visual progress bars** to table columns:
  ```javascript
  {
    key: "score",
    label: "Score (35%)",  // Show weight
    format: (v) => html`
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <div style="flex: 1; background: #e0e0e0; height: 8px; border-radius: 4px;">
          <div style="width: ${v}%; background: linear-gradient(90deg, var(--strtgy-green), #00d66c); height: 100%;"></div>
        </div>
        <span style="font-weight: 600;">${v}</span>
      </div>
    `
  }
  ```

- [ ] **Add badge column** for priority/status

---

### ✅ Phase 6: Recommendations (20 minutes)

- [ ] **Add insights callout**:
  ```javascript
  display(implicationsCallout({
    title: "Key Insights",
    items: ["Insight 1", "Insight 2", "Insight 3"]
  }));
  ```

- [ ] **Create executive recommendation section**:
  ```html
  <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); 
              color: white; padding: 2.5rem; border-radius: 12px; margin: 2rem 0;">
    <h3 style="border-bottom: 2px solid var(--strtgy-blue);">
      🎯 Executive Recommendation
    </h3>
    <!-- Recommendation boxes here -->
  </div>
  ```

- [ ] **Add 3-4 recommendation boxes** with color coding:
  - Green: Primary recommendation
  - Blue: Alternative option
  - Orange: Important consideration
  - Yellow: Validation required

- [ ] **Structure each box** with Pros/Cons or Strategy/Benefit:
  ```html
  <div style="background: rgba(0, 166, 81, 0.15); border-left: 4px solid #00a651; 
              padding: 1.25rem; border-radius: 8px;">
    <h4 style="color: #00d66c;">✅ Recommendation Title</h4>
    <p>
      <strong>Pros:</strong> List here<br>
      <strong>Cons:</strong> List here
    </p>
  </div>
  ```

---

### ✅ Phase 7: Action Plan (20 minutes)

- [ ] **Add section header**:
  ```javascript
  display(sectionHeader({
    title: "Action Plan",
    subtitle: "Roadmap for implementation",
    certainty: "high"
  }));
  ```

- [ ] **Create 4-phase grid**:
  ```html
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
              gap: 1.5rem; margin: 2rem 0;">
    <!-- Phase cards -->
  </div>
  ```

- [ ] **Add phase cards** (4-6 phases recommended):
  - Phase 1: Blue (data/planning)
  - Phase 2: Green (analysis/modeling)
  - Phase 3: Orange (validation/testing)
  - Phase 4: Purple (decision/execution)

- [ ] **Each phase card includes**:
  - Icon + title with color
  - 3-5 specific action items
  - Gradient background matching color
  - Border-top accent (4px solid)

- [ ] **Add timeline card**:
  ```html
  <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                           color: white; padding: 2rem;">
    <h4>⏱️ Timeline</h4>
    <!-- Timeline items with weeks/dates -->
  </div>
  ```

---

### ✅ Phase 8: Footer (5 minutes)

- [ ] **Add STRTGY branded footer**:
  ```html
  <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); 
              color: white; padding: 2rem; border-radius: 12px; 
              margin: 3rem 0 2rem 0; text-align: center;">
    <div style="font-size: 2rem; font-weight: 700; 
                background: linear-gradient(90deg, #4da6ff, #00d66c); 
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
      STRTGY
    </div>
    <p>
      <strong>Certeza por encima de todo.</strong> Obsesión por el ROI del cliente.<br>
      [Specific value proposition for this page]
    </p>
    <div style="font-size: 0.85rem; opacity: 0.7; 
                border-top: 1px solid rgba(255,255,255,0.2); 
                padding-top: 1rem; margin-top: 1.5rem;">
      [Data sources and disclaimer]
    </div>
  </div>
  ```

---

### ✅ Phase 9: Polish & QA (15 minutes)

- [ ] **Review color usage**: All colors from STRTGY palette?
- [ ] **Check spacing**: Consistent margins and padding?
- [ ] **Test responsiveness**: Looks good on mobile/tablet/desktop?
- [ ] **Verify icons**: Consistent emoji usage (📍 🎯 💰 🚚 📊)?
- [ ] **Review typography**: Font sizes match the scale?
- [ ] **Check gradients**: Match established patterns?
- [ ] **Test interactivity**: Inputs work correctly?
- [ ] **Validate data**: Proper error handling for missing data?
- [ ] **Review certainty badges**: Appropriate for data quality?
- [ ] **Check accessibility**: Semantic HTML, good contrast?

**Run this command to check for linting issues:**
```bash
npm run lint
```

---

## 🎨 Quick Reference: Component Imports

Add these imports at the top of your page:

```javascript
// Data loading
import {createLoaders, isDataAvailable, dataNotAvailableMessage} from "./data/loaders.js";

// UI components
import {kpi, formatNumber, formatPercent, table, badge, grid, card} from "./components/ui.js";

// STRTGY brand components
import {heroSTRTGY, decisionCallout, implicationsCallout, sectionHeader, certaintyBadge} from "./components/brand.js";

// Observable inputs
import * as Inputs from "npm:@observablehq/inputs";

// Plot (if needed)
import * as Plot from "npm:@observablehq/plot";
```

---

## 📊 Time Estimates by Page Type

| Page Type | Estimated Time | Complexity |
|-----------|---------------|------------|
| Dashboard (many KPIs) | 2-3 hours | ⭐⭐⭐⭐ |
| Map-heavy page | 2-2.5 hours | ⭐⭐⭐⭐ |
| Data table/comparison | 1.5-2 hours | ⭐⭐⭐ |
| Text-heavy explainer | 1-1.5 hours | ⭐⭐ |
| Simple landing page | 0.5-1 hour | ⭐ |

---

## 🎯 Priority Order for Multi-Page Updates

If you have limited time, enhance pages in this order:

1. **Homepage/Index** - First impression, sets expectations
2. **Main dashboard** - Most frequently viewed, high-value
3. **Key decision pages** - Where stakeholders make choices
4. **Deep-dive analysis pages** - For detailed exploration
5. **Supporting/reference pages** - Lower priority

---

## 🚀 Batch Processing Strategy

### For 5+ pages to enhance:

**Week 1: Planning**
- Day 1-2: Audit all pages, identify sections
- Day 3: Create enhancement plan for each page
- Day 4-5: Prepare any new components needed

**Week 2: Implementation**
- Day 1-2: High-priority pages (homepage, main dashboard)
- Day 3-4: Medium-priority pages (decision support)
- Day 5: Low-priority pages (reference)

**Week 3: Polish & QA**
- Day 1-2: Test all pages, fix issues
- Day 3: Mobile/tablet testing
- Day 4: Stakeholder review round
- Day 5: Final tweaks and deployment

---

## 🐛 Common Pitfalls to Avoid

1. ❌ **Don't copy-paste without customizing** - Each page needs unique content
2. ❌ **Don't use random colors** - Stick to STRTGY palette
3. ❌ **Don't skip data validation** - Always check `isDataAvailable()`
4. ❌ **Don't mix design patterns** - Be consistent across pages
5. ❌ **Don't ignore mobile** - Test responsive design early
6. ❌ **Don't over-animate** - Subtle is better than flashy
7. ❌ **Don't duplicate components** - Reuse existing components
8. ❌ **Don't forget certainty badges** - Transparency builds trust
9. ❌ **Don't omit action plans** - Always provide next steps
10. ❌ **Don't skip the footer** - Brand closure is important

---

## ✅ Success Criteria

Your enhanced page should:

- [ ] Look visually distinct from the "before" version
- [ ] Use STRTGY brand colors consistently
- [ ] Have clear visual hierarchy (scannable in 30 seconds)
- [ ] Include at least one decision callout or insight summary
- [ ] Provide actionable recommendations or next steps
- [ ] Work on mobile, tablet, and desktop
- [ ] Handle missing data gracefully
- [ ] Include certainty indicators where appropriate
- [ ] Use consistent spacing and typography
- [ ] End with STRTGY branded footer

---

## 📝 Page Enhancement Template

Use this template structure for each page:

```markdown
# Page Title

<!-- 1. HERO SECTION -->
```js
display(heroSTRTGY({...}));
```

<!-- 2. DECISION CONTEXT -->
```js
display(decisionCallout({...}));
```

## Criteria / Objectives

<!-- 3. CRITERIA CARDS (visual grid) -->
<div class="grid">...</div>

---

## Key Metrics

<!-- 4. KPI DASHBOARD (gradient wrapper) -->
```js
display(html`<div style="gradient...">${kpi([...])}</div>`);
```

---

## [Main Analysis Section]

<!-- 5. SECTION HEADER WITH CERTAINTY -->
```js
display(sectionHeader({certainty: "medium"}));
```

<!-- 6. MAP OR CHART OR TABLE -->
<!-- Include interactive controls if applicable -->

---

## Comparison / Ranking

<!-- 7. INTERACTIVE SELECTOR + FEATURE CARD -->
<!-- 8. ENHANCED TABLE WITH VISUAL BARS -->

---

## Recommendations

<!-- 9. IMPLICATIONS CALLOUT -->
<!-- 10. EXECUTIVE RECOMMENDATION SECTION -->

---

## Action Plan

<!-- 11. SECTION HEADER -->
<!-- 12. 4-PHASE GRID -->
<!-- 13. TIMELINE CARD -->

---

<!-- 14. STRTGY FOOTER -->
```

---

## 📚 Additional Resources

- **Main Enhancement Summary**: `UI_UX_IMPROVEMENTS_SUMMARY.md`
- **Before/After Comparison**: `BEFORE_AFTER_COMPARISON.md`
- **Maintenance Guide**: `MAINTENANCE_GUIDE.md`
- **Observable Framework Docs**: https://observablehq.com/framework/

---

## 🎯 Final Checklist Before Publishing

- [ ] All sections completed
- [ ] No linter errors (`npm run lint`)
- [ ] No console errors in browser
- [ ] Mobile responsive tested
- [ ] All data loads correctly
- [ ] Interactive elements work
- [ ] Colors match STRTGY palette
- [ ] Typography consistent
- [ ] Footer present
- [ ] Stakeholder review completed
- [ ] Documentation updated

---

**Built with ❤️ by STRTGY | Certeza por encima de todo**

