'use strict';

/* ============================================================
   Expense & Budget Visualizer — Application Logic
   Vanilla JS · LocalStorage · Chart.js
   ============================================================ */

/* ===== Constants ===== */
var STORAGE_KEYS = {
  TRANSACTIONS: 'ebv_transactions',
  THEME: 'ebv_theme',
  SPENDING_LIMIT: 'ebv_spending_limit'
};

// Category colors — consistent across badge dots and pie chart
var CATEGORY_COLORS = {
  Food: '#22c55e',       // green
  Transport: '#3b82f6',  // blue
  Fun: '#f97316'         // orange
};

var CATEGORIES = ['Food', 'Transport', 'Fun'];

// Inline SVG trash icon for delete buttons
var TRASH_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"' +
  ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"' +
  ' stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/>' +
  '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>' +
  '<line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';

/* ===== State ===== */
var transactions = [];
var currentSort = 'newest';
var chart = null;
var animateNewItem = null;  // ID of newly added item (for slide-in animation)
var dom = {};

/* ===== LocalStorage Helpers ===== */
function loadTransactions() {
  try {
    var data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

// Follow saved preference, or system preference on first visit
function loadTheme() {
  var saved = localStorage.getItem(STORAGE_KEYS.THEME);
  if (saved === 'light' || saved === 'dark') return saved;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function saveTheme(theme) {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

function loadSpendingLimit() {
  var val = parseFloat(localStorage.getItem(STORAGE_KEYS.SPENDING_LIMIT));
  return isNaN(val) || val <= 0 ? 0 : val;
}

function saveSpendingLimit(limit) {
  localStorage.setItem(STORAGE_KEYS.SPENDING_LIMIT, String(limit));
}

/* ===== Utility ===== */
// Format with Indonesian thousands separator and 2 decimals
function formatCurrency(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function escapeHtml(str) {
  var el = document.createElement('div');
  el.textContent = str;
  return el.innerHTML;
}

function getCategoryTotals() {
  var totals = { Food: 0, Transport: 0, Fun: 0 };
  transactions.forEach(function (t) {
    totals[t.category] += t.amount;
  });
  return totals;
}

function getSortedTransactions() {
  var sorted = transactions.slice();
  switch (currentSort) {
    case 'oldest':
      sorted.sort(function (a, b) { return a.date - b.date; });
      break;
    case 'amountDesc':
      sorted.sort(function (a, b) { return b.amount - a.amount; });
      break;
    case 'amountAsc':
      sorted.sort(function (a, b) { return a.amount - b.amount; });
      break;
    case 'category':
      sorted.sort(function (a, b) { return a.category.localeCompare(b.category); });
      break;
    default: // newest
      sorted.sort(function (a, b) { return b.date - a.date; });
  }
  return sorted;
}

function getSpendingLimit() {
  var val = parseFloat(dom.spendingLimit.value);
  return isNaN(val) || val <= 0 ? 0 : val;
}

/* ===== Form Validation ===== */
function validateForm() {
  var valid = true;

  var name = dom.itemName.value.trim();
  var amount = parseFloat(dom.amount.value);
  var category = dom.category.value;

  // Item Name — required
  if (!name) {
    dom.nameError.textContent = 'Item name is required';
    valid = false;
  } else {
    dom.nameError.textContent = '';
  }

  // Amount — must be a number greater than 0
  if (isNaN(amount) || amount <= 0) {
    dom.amountError.textContent = 'Enter a valid amount greater than 0';
    valid = false;
  } else {
    dom.amountError.textContent = '';
  }

  // Category — must be selected
  if (!category) {
    dom.categoryError.textContent = 'Please select a category';
    valid = false;
  } else {
    dom.categoryError.textContent = '';
  }

  return valid;
}

/* ===== Render Functions ===== */
function renderBalance() {
  var total = transactions.reduce(function (sum, t) {
    return sum + t.amount;
  }, 0);
  dom.totalBalance.textContent = formatCurrency(total);

  // Warn if total exceeds spending limit
  var limit = getSpendingLimit();
  if (limit > 0 && total > limit) {
    dom.balanceCard.classList.add('over-limit');
    dom.balanceWarning.hidden = false;
    dom.balanceWarning.textContent =
      '⚠ Total exceeds spending limit by ' + formatCurrency(total - limit);
  } else {
    dom.balanceCard.classList.remove('over-limit');
    dom.balanceWarning.hidden = true;
  }
}

function renderList() {
  var sorted = getSortedTransactions();
  var limit = getSpendingLimit();

  dom.transactionList.innerHTML = '';

  if (sorted.length === 0) {
    dom.listEmpty.hidden = false;
    return;
  }
  dom.listEmpty.hidden = true;

  sorted.forEach(function (t) {
    var item = document.createElement('div');
    item.className = 'transaction-item';

    // Only animate the newly added item
    if (animateNewItem === t.id) {
      item.classList.add('animate-in');
    }

    // Highlight transactions over the spending limit
    if (limit > 0 && t.amount > limit) {
      item.classList.add('over-limit');
    }

    var badgeClass = 'badge-' + t.category.toLowerCase();

    item.innerHTML =
      '<div class="transaction-info">' +
        '<span class="transaction-name">' + escapeHtml(t.name) + '</span>' +
        '<span class="badge ' + badgeClass + '">' +
          '<span class="badge-dot"></span>' + t.category +
        '</span>' +
      '</div>' +
      '<div class="transaction-right">' +
        '<span class="transaction-amount">' + formatCurrency(t.amount) + '</span>' +
        '<button class="btn-delete" data-id="' + t.id + '" aria-label="Delete transaction">' +
          TRASH_SVG +
        '</button>' +
      '</div>';

    dom.transactionList.appendChild(item);
  });

  // Reset animation flag after render
  animateNewItem = null;
}

function getChartOptions() {
  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  var textColor = isDark ? '#e2e8f0' : '#1e293b';
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          padding: 15,
          font: { size: 13, family: 'Inter, sans-serif' },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: function (ctx) {
            return ctx.label + ': ' + formatCurrency(ctx.parsed);
          }
        }
      }
    }
  };
}

function renderChart() {
  // Guard if Chart.js failed to load
  if (typeof Chart === 'undefined') return;

  var totals = getCategoryTotals();
  var activeCategories = CATEGORIES.filter(function (c) {
    return totals[c] > 0;
  });
  var data = activeCategories.map(function (c) { return totals[c]; });
  var colors = activeCategories.map(function (c) { return CATEGORY_COLORS[c]; });

  // Empty state — no data to show
  if (activeCategories.length === 0) {
    dom.chartWrapper.hidden = true;
    dom.chartEmpty.hidden = false;
    if (chart) {
      chart.destroy();
      chart = null;
    }
    return;
  }

  dom.chartWrapper.hidden = false;
  dom.chartEmpty.hidden = true;

  var borderColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--card-bg').trim();

  if (chart) {
    // Update existing chart
    chart.data.labels = activeCategories;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].backgroundColor = colors;
    chart.data.datasets[0].borderColor = borderColor;
    chart.options = getChartOptions();
    chart.update();
  } else {
    // Create new chart
    chart = new Chart(dom.pieChart, {
      type: 'pie',
      data: {
        labels: activeCategories,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: borderColor
        }]
      },
      options: getChartOptions()
    });
  }
}

function renderAll() {
  renderBalance();
  renderList();
  renderChart();
}

/* ===== Event Handlers ===== */
function handleSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  var newId = generateId();
  transactions.push({
    id: newId,
    name: dom.itemName.value.trim(),
    amount: parseFloat(dom.amount.value),
    category: dom.category.value,
    date: Date.now()
  });
  animateNewItem = newId;
  saveTransactions();

  // Reset form fields
  dom.expenseForm.reset();
  dom.category.value = '';

  renderAll();
}

function handleDelete(e) {
  var btn = e.target.closest('.btn-delete');
  if (!btn) return;

  var item = btn.closest('.transaction-item');
  var id = btn.dataset.id;
  var removed = false;

  // Animate out, then remove from data
  item.classList.add('removing');

  function remove() {
    if (removed) return;
    removed = true;
    transactions = transactions.filter(function (t) { return t.id !== id; });
    saveTransactions();
    renderAll();
  }

  item.addEventListener('animationend', remove, { once: true });
  // Fallback in case animationend doesn't fire
  setTimeout(remove, 300);
}

function handleThemeToggle() {
  var current = document.documentElement.getAttribute('data-theme');
  var next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  saveTheme(next);
  renderChart(); // update chart legend text color
}

function handleSortChange() {
  currentSort = dom.sortBy.value;
  renderList();
}

function handleSpendingLimitChange() {
  saveSpendingLimit(getSpendingLimit());
  renderBalance();
  renderList();
}

/* ===== Init ===== */
function init() {
  // Cache DOM references
  dom.themeToggle = document.getElementById('themeToggle');
  dom.balanceCard = document.getElementById('balanceCard');
  dom.totalBalance = document.getElementById('totalBalance');
  dom.balanceWarning = document.getElementById('balanceWarning');
  dom.expenseForm = document.getElementById('expenseForm');
  dom.itemName = document.getElementById('itemName');
  dom.amount = document.getElementById('amount');
  dom.category = document.getElementById('category');
  dom.nameError = document.getElementById('nameError');
  dom.amountError = document.getElementById('amountError');
  dom.categoryError = document.getElementById('categoryError');
  dom.spendingLimit = document.getElementById('spendingLimit');
  dom.chartWrapper = document.getElementById('chartWrapper');
  dom.pieChart = document.getElementById('pieChart');
  dom.chartEmpty = document.getElementById('chartEmpty');
  dom.sortBy = document.getElementById('sortBy');
  dom.transactionList = document.getElementById('transactionList');
  dom.listEmpty = document.getElementById('listEmpty');

  // Load persisted state
  transactions = loadTransactions();
  currentSort = 'newest';

  // Theme is already set by inline script; just save it
  var theme = document.documentElement.getAttribute('data-theme');
  saveTheme(theme);

  // Restore spending limit
  var limit = loadSpendingLimit();
  dom.spendingLimit.value = limit > 0 ? limit : '';

  // Attach event listeners
  dom.expenseForm.addEventListener('submit', handleSubmit);
  dom.transactionList.addEventListener('click', handleDelete);
  dom.themeToggle.addEventListener('click', handleThemeToggle);
  dom.sortBy.addEventListener('change', handleSortChange);
  dom.spendingLimit.addEventListener('input', handleSpendingLimitChange);

  // Clear errors on input
  dom.itemName.addEventListener('input', function () {
    dom.nameError.textContent = '';
  });
  dom.amount.addEventListener('input', function () {
    dom.amountError.textContent = '';
  });
  dom.category.addEventListener('change', function () {
    dom.categoryError.textContent = '';
  });

  // Initial render
  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
