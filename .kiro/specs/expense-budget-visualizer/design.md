# Expense & Budget Visualizer — Design

## 1. Architecture Overview

The application is a single-page, client-side-only web app with no build step
and no backend. Three files make up the entire codebase:

```
index.html      ← structure + external CDN links + inline theme script
css/style.css   ← all styling, theming, responsive layout, animations
js/script.js    ← all logic: state, storage, rendering, events
```

### External Dependencies

| Dependency | Source | Purpose |
|-----------|--------|---------|
| Chart.js v4 | `https://cdn.jsdelivr.net/npm/chart.js@4` | Pie chart rendering |
| Google Fonts Inter | `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap` | Typography |

No other external libraries. Icons are inline SVG (theme toggle, delete
button) or emoji (logo, empty states).

## 2. Data Model

### 2.1 Transaction Object

```js
{
  id:       string,   // unique ID: Date.now().toString(36) + random
  name:     string,   // user-entered item name (trimmed)
  amount:   number,   // positive float (parseFloat of input)
  category: string,   // "Food" | "Transport" | "Fun"
  date:     number    // Date.now() timestamp (used for sorting)
}
```

### 2.2 LocalStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `ebv_transactions` | `JSON.stringify(Transaction[])` | Array of all transactions |
| `ebv_theme` | `"light" \| "dark"` | Saved theme preference |
| `ebv_spending_limit` | `string` (numeric) | Per-transaction spending limit |

### 2.3 In-Memory State

| Variable | Type | Description |
|----------|------|-------------|
| `transactions` | `Transaction[]` | Loaded from Local Storage on init |
| `currentSort` | `string` | Active sort mode (default `"newest"`) |
| `chart` | `Chart \| null` | Chart.js instance (null when no data) |
| `animateNewItem` | `string \| null` | ID of newly added item for slide-in animation |
| `dom` | `Object` | Cached DOM element references |

### 2.4 Constants

| Constant | Description |
|----------|-------------|
| `STORAGE_KEYS` | Maps to the three localStorage key strings |
| `CATEGORY_COLORS` | `{ Food: "#22c55e", Transport: "#3b82f6", Fun: "#f97316" }` — used in both badges and chart |
| `CATEGORIES` | `["Food", "Transport", "Fun"]` — iteration order for chart |
| `TRASH_SVG` | Inline SVG string for delete button icons |

## 3. Theme System

### 3.1 Inline Head Script (FOUC Prevention)

An IIFE in `<head>` runs before the body renders:

1. Check `localStorage.getItem('ebv_theme')` for a saved preference.
2. If found (`"light"` or `"dark"`), use it.
3. Otherwise, check `window.matchMedia('(prefers-color-scheme: dark)')`.
4. Set `data-theme` attribute on `<html>` immediately.

This prevents any flash of the wrong theme on page load.

### 3.2 CSS Variable Theming

All colors are CSS custom properties defined in `:root` (light) and overridden
in `[data-theme="dark"]`. Switching themes is a single attribute change — no
class toggling on individual elements.

```css
:root { --accent: #4f46e5; ... }
[data-theme="dark"] { --accent: #818cf8; ... }
```

### 3.3 Theme Toggle Button

- Contains two inline SVGs: `.icon-moon` and `.icon-sun`.
- CSS controls visibility: moon shows in light mode, sun in dark mode.
- No JS needed to swap the icon — purely CSS-driven via `data-theme`.
- On click, JS swaps the `data-theme` attribute, saves to Local Storage, and
  re-renders the chart (to update legend text color).

### 3.4 Chart Theme Adaptation

`getChartOptions()` reads the current `data-theme` attribute and returns
light or dark text color for the legend. Called on initial render and on
theme toggle.

## 4. HTML Component Structure

```
<main class="app">
├── <header class="app-header">
│   ├── .header-title (logo emoji + h1)
│   └── button#themeToggle (SVG moon + SVG sun)
│
├── <section class="balance-card" aria-live="polite">
│   ├── p.balance-label
│   ├── p#totalBalance.balance-amount
│   └── p#balanceWarning.balance-warning [hidden]
│
├── <div class="top-grid">                    ← two-col on desktop
│   ├── <section class="card">               ← Add Transaction form
│   │   └── form#expenseForm
│   │       ├── .form-group (Item Name + label + error)
│   │       ├── .form-row (two-col grid)
│   │       │   ├── .form-group (Amount + label + error)
│   │       │   └── .form-group (Category + label + error)
│   │       └── button.btn-primary
│   │
│   └── <section class="card limit-card">    ← Spending Limit
│       ├── input#spendingLimit
│       └── p.limit-hint
│
└── <div class="dashboard-grid">              ← two-col on desktop
    ├── <section class="card">               ← Chart
    │   ├── div#chartWrapper.chart-wrapper
    │   │   └── canvas#pieChart
    │   └── div#chartEmpty.empty-state [hidden]
    │
    └── <section class="card">               ← Transaction List
        ├── .list-header (h2 + select#sortBy)
        ├── div#transactionList.transaction-list
        └── div#listEmpty.empty-state [hidden]
```

## 5. CSS Organization

The stylesheet is organized into clearly commented sections:

1. **CSS Variables: Light Theme** — `:root` block with all color, shadow,
   radius, and select-arrow variables.
2. **CSS Variables: Dark Theme** — `[data-theme="dark"]` overrides.
3. **Reset** — box-sizing, margin/padding zero, `[hidden]` with `!important`.
4. **Base** — `html` scroll-behavior, `body` font, background gradient, color,
   transitions.
5. **Layout** — `.app` container (max-width 820px, flex column, 16px gap).
6. **Header** — flex row, logo, title, theme toggle button + SVG show/hide.
7. **Card Base** — shared card styles (bg, radius, padding, shadow, border).
8. **Balance Card** — gradient bg, large amount, over-limit state.
9. **Form** — flex column, form-row grid, labels, inputs, error messages,
   custom select arrow, primary button.
10. **Spending Limit Card** — hint text styling.
11. **Top Grid** — flex column (mobile) → grid 1.5fr 1fr (desktop).
12. **Dashboard Grid** — flex column (mobile) → grid 1fr 1fr (desktop).
13. **Chart** — chart-wrapper (relative, max-width 260px, height 260px).
14. **List Header & Sort** — flex row, compact sort select.
15. **Transaction List** — scrollable, custom scrollbar, item layout.
16. **Category Badge** — pill shape, per-category bg/text/dot colors.
17. **Delete Button** — soft-red bg, SVG icon, hover/active scale.
18. **Empty State** — flex column centered, faded icon + text.
19. **Focus Visible** — keyboard navigation outlines.
20. **Responsive** — `@media (min-width: 768px)` two-column grids.
21. **Reduced Motion** — `@media (prefers-reduced-motion: reduce)`.

## 6. JavaScript Architecture

### 6.1 Section Organization

The script is organized into clearly commented sections:

1. **Constants** — storage keys, category colors, categories array, SVG string.
2. **State** — mutable variables (transactions, sort, chart, animation flag,
   dom cache).
3. **LocalStorage Helpers** — load/save functions for each persisted value.
4. **Utility** — formatCurrency, generateId, escapeHtml, getCategoryTotals,
   getSortedTransactions, getSpendingLimit.
5. **Form Validation** — validateForm (returns boolean, sets error messages).
6. **Render Functions** — renderBalance, renderList, getChartOptions,
   renderChart, renderAll.
7. **Event Handlers** — handleSubmit, handleDelete, handleThemeToggle,
   handleSortChange, handleSpendingLimitChange.
8. **Init** — cache DOM, load state, attach listeners, initial render.

### 6.2 Rendering Strategy

All rendering is done via a full re-render of the affected section:

- `renderAll()` calls `renderBalance()`, `renderList()`, `renderChart()`.
- `renderList()` clears `innerHTML` and rebuilds all items via DOM creation +
  `innerHTML` assignment.
- `renderChart()` either creates a new Chart.js instance or updates the
  existing one's data and options, then calls `chart.update()`.
- `handleSortChange()` only calls `renderList()` (no chart/balance update
  needed).
- `handleSpendingLimitChange()` calls `renderBalance()` + `renderList()` (no
  chart update needed).

### 6.3 Animation Strategy

- **Slide-in**: `animateNewItem` stores the ID of the just-added transaction.
  In `renderList()`, only the item matching that ID gets the `animate-in` CSS
  class. The flag is reset to `null` after rendering, so sorting or deleting
  does not trigger animations on existing items.
- **Slide-out**: `handleDelete()` adds the `removing` CSS class (which sets
  `pointer-events: none` and plays `slideOut`). An `animationend` listener
  removes the transaction from the array and calls `renderAll()`. A 300ms
  `setTimeout` fallback ensures removal even if the event doesn't fire. A
  `removed` boolean flag prevents double-execution.

### 6.4 Event Delegation

The transaction list uses event delegation: a single `click` listener on
`#transactionList` checks `e.target.closest('.btn-delete')` to find the delete
button, avoiding per-item listeners.

### 6.5 Chart.js Guard

`renderChart()` starts with `if (typeof Chart === 'undefined') return;` to
gracefully handle CDN load failure — the rest of the app still works.

## 7. Responsive Layout Strategy

| Breakpoint | Top Grid | Dashboard Grid |
|-----------|----------|----------------|
| < 768px | Flex column (stacked) | Flex column (stacked) |
| ≥ 768px | Grid `1.5fr 1fr` (form wider) | Grid `1fr 1fr` (equal) |

Both grids use `align-items: start` so cards don't stretch to equal heights.
The form row (Amount + Category) is always a 2-column grid (works even on
narrow phones).

## 8. Accessibility Features

| Feature | Implementation |
|---------|---------------|
| Form labels | `<label for="...">` on every form input |
| Error announcements | `role="alert"` on error message spans |
| Balance updates | `aria-live="polite"` on balance card |
| Hidden labels | `aria-label` on spending limit input and sort select |
| Keyboard focus | `focus-visible` outlines (accent for inputs/buttons, danger for delete) |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` disables animations |
| Icon semantics | `aria-hidden="true"` on decorative emoji and SVGs |
| Button labels | `aria-label` on theme toggle and delete buttons |

## 9. Currency Formatting

```js
function formatCurrency(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
```

Produces: `Rp 0,00` · `Rp 25.000,00` · `Rp 1.500.000,00`

Uses the browser's built-in `Intl` support via `toLocaleString` with the
`id-ID` locale. All modern browsers (Chrome, Firefox, Edge, Safari) support
this locale.
