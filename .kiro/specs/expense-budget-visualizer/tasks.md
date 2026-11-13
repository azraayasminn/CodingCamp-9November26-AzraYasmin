# Expense & Budget Visualizer — Tasks

## 1. HTML Structure

- [x] 1.1 Create `index.html` with `<!DOCTYPE html>`, `lang="en"`, `data-theme="light"` on `<html>`.
- [x] 1.2 Add `<meta charset>` and viewport meta tag.
- [x] 1.3 Add inline IIFE script in `<head>` to set theme from Local Storage or system preference before body renders (FOUC prevention).
- [x] 1.4 Add Google Fonts preconnect links and Inter font stylesheet (weights 400–800).
- [x] 1.5 Add Chart.js v4 script tag via jsDelivr CDN.
- [x] 1.6 Link `css/style.css` stylesheet.
- [x] 1.7 Build header: logo emoji (aria-hidden), `<h1>`, theme toggle button with inline SVG moon and sun icons.
- [x] 1.8 Build balance card section: label, amount `<p>`, warning `<p hidden>` with `aria-live="polite"`.
- [x] 1.9 Build top-grid wrapper containing form card and spending limit card.
- [x] 1.10 Build expense form: Item Name input with `<label>`, Amount + Category in a `.form-row` (2-col grid) each with `<label>`, error spans with `role="alert"`, submit button. Form has `novalidate`.
- [x] 1.11 Build spending limit card: number input with `aria-label`, hint paragraph.
- [x] 1.12 Build dashboard-grid wrapper containing chart card and list card.
- [x] 1.13 Build chart card: `chart-wrapper` div with `<canvas>`, and empty-state div with emoji icon + text, `hidden`.
- [x] 1.14 Build list card: list-header with `<h2>` and sort `<select>` (5 options), transaction list div, empty-state div with emoji + text, `hidden`.
- [x] 1.15 Add `<script src="js/script.js">` at end of body.

## 2. CSS Foundation

- [x] 2.1 Define light theme CSS variables in `:root` (bg, card-bg, input-bg, text, text-secondary, border, accent, accent-hover, accent gradients, danger, danger-soft, danger gradients, category colors with bg/text variants, shadows, radii, select-arrow data URI).
- [x] 2.2 Define dark theme overrides in `[data-theme="dark"]` (all variable changes including category bg/text variants and shadows).
- [x] 2.3 Add reset: box-sizing, margin/padding zero, `[hidden] { display: none !important }`.
- [x] 2.4 Set base styles: `html` smooth scroll, `body` Inter font with fallback, radial gradient background, color, line-height, min-height 100vh, font smoothing, transition.

## 3. Layout & Responsive

- [x] 3.1 Style `.app` container: max-width 820px, centered, 16px padding, flex column, 16px gap.
- [x] 3.2 Style `.top-grid` and `.dashboard-grid` as flex column (mobile default).
- [x] 3.3 Add `@media (min-width: 768px)` to switch both grids to CSS grid (top: `1.5fr 1fr`, dashboard: `1fr 1fr`) with `align-items: start`.

## 4. Component Styling

- [x] 4.1 Style header: flex row, space-between, logo + title group, 42px circular theme toggle button with hover/active scale.
- [x] 4.2 Add CSS to show/hide moon/sun SVGs based on `data-theme`.
- [x] 4.3 Style card base: bg, 16px radius, 20px padding, soft shadow, 1px border, transition.
- [x] 4.4 Style balance card: gradient background, white text, 2.5rem/800 amount, uppercase label, over-limit red gradient state, warning text.
- [x] 4.5 Style form: flex column 12px gap, form-row 2-col grid 12px gap, labels, inputs (1.5px border, 12px radius, input-bg), custom select arrow via data URI, error messages (danger color, small font).
- [x] 4.6 Style primary button: full width, accent bg, white text, hover darker, active scale.
- [x] 4.7 Style spending limit hint text (small, secondary color).
- [x] 4.8 Style chart wrapper: relative, max-width 260px, height 260px, centered.
- [x] 4.9 Style list header: flex row, space-between, compact sort select.
- [x] 4.10 Style transaction list: max-height 320px, overflow-y auto, flex column, 8px gap, custom 5px scrollbar.
- [x] 4.11 Style transaction item: flex row, space-between, input-bg, 12px radius, 3px transparent left border, over-limit red border + soft red bg.
- [x] 4.12 Style category badge: pill (100px radius), inline-flex, colored bg + text + 7px dot, per-category variants (food/transport/fun).
- [x] 4.13 Style delete button: 34px square, soft red bg, danger color, hover darken + scale, active scale.
- [x] 4.14 Style empty state: flex column centered, faded 2rem emoji icon + text.

## 5. Animations & Accessibility CSS

- [x] 5.1 Define `@keyframes slideIn` (opacity 0→1, translateY -8px→0).
- [x] 5.2 Define `@keyframes slideOut` (opacity 1→0, translateX 0→40px).
- [x] 5.3 Apply slideIn via `.animate-in` class, slideOut via `.removing` class (with `pointer-events: none` and `forwards`).
- [x] 5.4 Add `focus-visible` outlines: accent for inputs/selects/primary button/theme toggle, danger for delete button.
- [x] 5.5 Add `@media (prefers-reduced-motion: reduce)` to disable all animations and transitions.

## 6. JavaScript Core

- [x] 6.1 Define constants: `STORAGE_KEYS`, `CATEGORY_COLORS` (Food green, Transport blue, Fun orange), `CATEGORIES` array, `TRASH_SVG` string.
- [x] 6.2 Declare state variables: `transactions`, `currentSort`, `chart`, `animateNewItem`, `dom`.
- [x] 6.3 Implement LocalStorage helpers: `loadTransactions` (with try/catch), `saveTransactions`, `loadTheme` (saved → system preference → light), `saveTheme`, `loadSpendingLimit`, `saveSpendingLimit`.
- [x] 6.4 Implement utilities: `formatCurrency` (Rp prefix + id-ID locale + 2 decimals), `generateId`, `escapeHtml` (DOM-based), `getCategoryTotals`, `getSortedTransactions` (5 sort modes), `getSpendingLimit`.

## 7. Form Validation & Submission

- [x] 7.1 Implement `validateForm`: check name non-empty, amount > 0, category selected. Set/clear error messages. Return boolean.
- [x] 7.2 Implement `handleSubmit`: prevent default, validate, create transaction object with generated ID + Date.now(), push to array, set `animateNewItem`, save to Local Storage, reset form, clear category select, call `renderAll`.

## 8. Rendering

- [x] 8.1 Implement `renderBalance`: sum all amounts, format and display, check spending limit, toggle `over-limit` class and warning text on balance card.
- [x] 8.2 Implement `renderList`: clear container, show/hide empty state, iterate sorted transactions, create DOM elements with name + badge + amount + delete button, apply `animate-in` only to new item, apply `over-limit` highlight, reset `animateNewItem` after.
- [x] 8.3 Implement `getChartOptions`: theme-aware legend text color, circular point styles, bottom position, Inter font, tooltip formatting with `formatCurrency`.
- [x] 8.4 Implement `renderChart`: guard for `Chart` undefined, aggregate totals, filter active categories, show/hide chart wrapper + empty state, destroy chart when no data, create or update chart with category colors and card-bg border color.
- [x] 8.5 Implement `renderAll`: call renderBalance + renderList + renderChart.

## 9. Event Handlers

- [x] 9.1 Implement `handleDelete`: event delegation via `closest('.btn-delete')`, add `removing` class for slide-out animation, `animationend` listener + 300ms timeout fallback, `removed` flag to prevent double-execution, filter transaction from array, save, `renderAll`.
- [x] 9.2 Implement `handleThemeToggle`: read current `data-theme`, swap, save, call `renderChart` for legend color update.
- [x] 9.3 Implement `handleSortChange`: update `currentSort` from select value, call `renderList` only.
- [x] 9.4 Implement `handleSpendingLimitChange`: save limit to Local Storage, call `renderBalance` + `renderList`.

## 10. Initialization

- [x] 10.1 Implement `init`: cache all 18 DOM references into `dom` object.
- [x] 10.2 Load transactions from Local Storage, set `currentSort` to `"newest"`.
- [x] 10.3 Read theme from `<html>` attribute (already set by inline script), save to Local Storage.
- [x] 10.4 Restore spending limit from Local Storage to input (empty if 0).
- [x] 10.5 Attach event listeners: form submit, list click (delete), theme toggle click, sort change, spending limit input.
- [x] 10.6 Attach error-clearing listeners: input on name/amount, change on category.
- [x] 10.7 Call `renderAll` for initial render.
- [x] 10.8 Register `init` on `DOMContentLoaded`.
