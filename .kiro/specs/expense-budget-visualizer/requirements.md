# Expense & Budget Visualizer — Requirements

## 1. Overview

A mobile-friendly, client-side web application for tracking personal expenses
across three categories (Food, Transport, Fun). Users add transactions via a
form, view them in a scrollable list, see the total balance update in real
time, and visualize spending distribution with a pie chart. All data persists
in the browser via Local Storage — no backend, no server.

## 2. Required Features

### 2.1 Transaction Form
- Three fields: **Item Name** (text), **Amount** (number), **Category** (select: Food, Transport, Fun).
- All fields are mandatory with inline validation:
  - Item Name: must not be empty (whitespace trimmed).
  - Amount: must be a number greater than 0.
  - Category: must be selected (not the placeholder option).
- Error messages appear inline below each field (`role="alert"`) and clear
  automatically when the user starts editing the field again.
- On successful submit: the transaction is added to the list, the form resets,
  and all displays update.
- The form uses `novalidate` — all validation is handled in JavaScript.

### 2.2 Transaction List
- Scrollable container (`max-height: 320px`, `overflow-y: auto`) with a
  custom-styled thin scrollbar.
- Each item displays: item name (truncated with ellipsis if too long),
  a colored category badge (pill with dot), formatted amount, and a delete
  button.
- Delete button uses an inline SVG trash icon on a soft-red background.
- Each item can be individually deleted.

### 2.3 Total Balance
- Displayed prominently at the top in a gradient card with a large, bold number
  (2.5rem, weight 800).
- Updates automatically whenever a transaction is added or deleted.
- Amount is formatted as `Rp X.XXX,XX` (Indonesian locale: period thousands
  separator, comma decimal separator, two decimal places).
- When total exceeds the spending limit (if set), the card switches to a red
  gradient and shows a warning message.

### 2.4 Pie Chart
- Uses **Chart.js v4** loaded via jsDelivr CDN.
- Type: `pie`, showing distribution of expenses across categories.
- Colors match the badge colors: Food = green (#22c55e), Transport = blue
  (#3b82f6), Fun = orange (#f97316).
- Updates automatically when data changes (add/delete).
- Shows a friendly empty state (emoji icon + message) when no transactions
  exist; the canvas is hidden and the chart instance destroyed.
- Legend uses circular point styles, positioned at the bottom.
- Tooltip shows formatted currency.
- Legend text color adapts to the current theme (light/dark).

## 3. Optional Features (3 selected)

### 3.1 Dark/Light Mode Toggle
- Sun/moon **inline SVG icons** in the header (no emoji, no external images).
- Moon shown in light mode (click → dark); sun shown in dark mode (click →
  light). Icons toggle via CSS based on the `data-theme` attribute.
- Theme is saved to Local Storage and restored on next visit.
- On first visit (no saved preference), follows the system's
  `prefers-color-scheme` setting.
- An inline script in `<head>` sets the theme **before** the body renders to
  prevent a flash of the wrong theme (FOUC).

### 3.2 Sort Transactions
- Dropdown (`<select>`) above the transaction list with five options:
  1. Newest (default — by timestamp descending)
  2. Oldest (by timestamp ascending)
  3. Highest Amount (amount descending)
  4. Lowest Amount (amount ascending)
  5. Category A-Z (alphabetical by category name)
- Sorting is applied on change; only the list re-renders (not the chart).

### 3.3 Spending Limit Highlight
- A number input in a dedicated card labeled "Spending Limit".
- Any individual transaction whose amount exceeds the limit gets a red left
  border and soft-red background tint in the list.
- The limit is saved to Local Storage and restored on next visit.
- Additionally, if the total of all transactions exceeds the limit, the balance
  card switches to a red gradient and shows a warning with the overage amount.

## 4. Design Requirements

### 4.1 Visual Style
- Clean, modern, minimalist with a fintech-app aesthetic.
- Card-based layout with rounded corners (16px for cards, 12px for
  inputs/buttons) and soft shadows.
- Generous spacing (16px gap between cards, 12px within forms).

### 4.2 Color System
- **Accent**: Indigo (`#4f46e5` light / `#818cf8` dark) for buttons and balance
  gradient.
- **Categories** (consistent across badge and pie chart):
  - Food = green (`#22c55e`)
  - Transport = blue (`#3b82f6`)
  - Fun = orange (`#f97316`)
- **Danger/Warning**: Red (`#ef4444` light / `#f87171` dark) for delete buttons
  and over-limit highlights.
- All colors defined as CSS custom properties (variables) so dark/light mode
  is a single attribute swap.

### 4.3 Typography
- **Google Font Inter** (weights 400, 500, 600, 700, 800) with system-font
  fallback.
- Clear hierarchy: h1 (1.35rem/700), card titles (0.95rem/600), balance
  amount (2.5rem/800), form labels (0.82rem/500), body (0.92rem/400).

### 4.4 Balance Card
- Gradient background (indigo in normal state, red when over limit).
- Large, bold amount as the focal point.
- Uppercase label with letter-spacing above the amount.

### 4.5 Interactions
- Hover and focus states on all interactive elements (scale transforms on
  buttons, border-color on inputs).
- Smooth transitions (0.2–0.3s) on background, border-color, and transform.
- Slide-in animation (translateY) when a new transaction appears.
- Slide-out animation (translateX + fade) when a transaction is deleted.
- Only the newly added item animates in (not all items on re-render).

### 4.6 Empty States
- Friendly empty states for both the chart (📊 "No expenses to display yet.")
  and the list (📝 "No transactions yet. Add one above!").
- Centered with a faded emoji icon and text.

### 4.7 Responsive Layout
- **Mobile (< 768px)**: Single column, full width with 16px padding.
- **Desktop (≥ 768px)**: Two-column grids:
  - Top grid: Form (1.5fr) + Spending Limit (1fr) side by side.
  - Dashboard grid: Chart (1fr) + Transaction List (1fr) side by side.
- App container max-width: 820px, centered.

### 4.8 Number Formatting
- Indonesian locale (`id-ID`): period for thousands, comma for decimals.
- Two decimal places always shown (e.g., `Rp 150.000,00`, `Rp 0,00`).

### 4.9 Accessibility
- Proper `<label for="...">` elements on all form inputs.
- `aria-label` on inputs without visible labels (spending limit, sort).
- `role="alert"` on error message spans.
- `aria-live="polite"` on the balance card so screen readers announce
  updates.
- `focus-visible` outlines for keyboard navigation (accent for inputs/buttons,
  danger for delete).
- `prefers-reduced-motion` media query disables animations.
- Sufficient color contrast in both light and dark themes.
- Touch-friendly button sizes (≥ 34px for delete, full-width primary button).

## 5. Technical Constraints

| ID | Constraint |
|----|-----------|
| TC-1 | HTML for structure, CSS for styling, Vanilla JavaScript (no React/Vue/etc.), no backend server. |
| TC-2 | All data stored via browser Local Storage API. Three keys: `ebv_transactions`, `ebv_theme`, `ebv_spending_limit`. |
| TC-3 | Must run in modern browsers: Chrome, Firefox, Edge, Safari. |
| TC-4 | External libraries limited to Chart.js (CDN) and Google Fonts. No UI component libraries. No external images — emoji or inline SVG only. |

## 6. Non-Functional Requirements

- **Simple**: No build step, no test setup, no complex configuration. Open
  `index.html` in a browser to run.
- **Performance**: No framework overhead, minimal DOM manipulation, chart
  updates in place (create once, update data on change). Guard against
  Chart.js failing to load from CDN.
- **Maintainability**: Clean, readable code with section comments in each
  file. CSS organized by component. JS organized by responsibility (constants,
  state, storage, utilities, validation, rendering, events, init).

## 7. Folder Rules

| Path | Description |
|------|-------------|
| `index.html` | Main HTML file at project root. |
| `css/style.css` | Single CSS file (all styles). |
| `js/script.js` | Single JavaScript file (all logic). |

No other CSS or JS files are permitted.
