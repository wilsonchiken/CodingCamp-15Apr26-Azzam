// ── Storage ────────────────────────────────────────────────────────────────
const STORAGE_KEY      = 'viz_transactions';
const THEME_STORAGE_KEY = 'viz_theme';

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// ── State ──────────────────────────────────────────────────────────────────
let transactions = loadData();
let myChart;

// ── Theme Toggle ───────────────────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);

  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';

  // Update chart legend + border color to match theme
  if (myChart) {
    const isDark = theme === 'dark';
    myChart.data.datasets[0].borderColor = isDark ? '#1a1a1a' : '#ffffff';
    myChart.options.plugins.legend.labels.color = isDark ? '#a8a29e' : '#57534e';
    myChart.update();
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// ── Chart ──────────────────────────────────────────────────────────────────
function initChart() {
  const ctx = document.getElementById('myChart').getContext('2d');
  myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Food', 'Transport', 'Rent'],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: ['#d97706', '#92400e', '#78716c'],
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { family: 'DM Sans', size: 12 },
            color: '#57534e',
            padding: 18,
            boxWidth: 12,
            borderRadius: 2
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => ' $' + ctx.parsed.toFixed(2)
          }
        }
      }
    }
  });
}

// ── Add Transaction ────────────────────────────────────────────────────────
function addTransaction() {
  const name     = document.getElementById('item-name').value.trim();
  const amount   = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;

  if (!name || isNaN(amount) || amount <= 0) {
    alert('Please enter a valid description and amount.');
    return;
  }

  transactions.push({ id: Date.now(), name, amount, category });
  saveData();
  updateUI();
  document.getElementById('item-name').value = '';
  document.getElementById('amount').value    = '';
}

// ── Delete Transaction ─────────────────────────────────────────────────────
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveData();
  updateUI();
}

// ── Update UI ──────────────────────────────────────────────────────────────
function updateUI() {
  const list         = document.getElementById('transaction-list');
  const balanceEl    = document.getElementById('total-balance');
  const totalSpentEl = document.getElementById('total-spent');
  const txCountEl    = document.getElementById('tx-count');
  const topCatEl     = document.getElementById('top-category');

  list.innerHTML = '';
  let total = 0;
  const catTotals = { Food: 0, Transport: 0, Rent: 0 };

  if (transactions.length === 0) {
    list.innerHTML = '<li class="empty-msg">No transactions yet.</li>';
  } else {
    transactions.forEach(t => {
      total += t.amount;
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;

      const li = document.createElement('li');
      li.className = 'tx-item';
      li.innerHTML = `
        <div>
          <div class="tx-name">${t.name}</div>
          <div class="tx-cat">${t.category}</div>
        </div>
        <div class="tx-right">
          <span class="tx-amount">$${t.amount.toFixed(2)}</span>
          <button class="btn-del" onclick="deleteTransaction(${t.id})">Remove</button>
        </div>`;
      list.appendChild(li);
    });
  }

  balanceEl.textContent    = '$' + total.toFixed(2);
  totalSpentEl.textContent = '$' + total.toFixed(2);
  txCountEl.textContent    = transactions.length;

  const top = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  topCatEl.textContent = top && top[1] > 0 ? top[0] : '—';

  myChart.data.datasets[0].data = [
    catTotals['Food']      || 0,
    catTotals['Transport'] || 0,
    catTotals['Rent']      || 0
  ];
  myChart.update();
}

// ── Init ───────────────────────────────────────────────────────────────────
initChart();
updateUI();
applyTheme(localStorage.getItem(THEME_STORAGE_KEY) || 'light');
