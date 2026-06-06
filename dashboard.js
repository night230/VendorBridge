/**
 * VendorBridge — Dashboard JS (dashboard.js)
 * Handles: auth guard, session load, navigation, dropdowns,
 *          approval workflow, charts, greeting, sidebar toggle
 */

// ===== AUTH GUARD =====
// Redirect to login if no session


// ===== POPULATE PROFILE FROM SESSION =====
function populateProfile() {
  if (!SESSION) return;

  const { name, email, role, avatar } = SESSION;

  // Topbar
  const el = (id) => document.getElementById(id);
  if (el('profileName'))   el('profileName').textContent  = name;
  if (el('profileRole'))   el('profileRole').textContent  = role;
  if (el('profileAvatar')) el('profileAvatar').textContent = avatar;

  // Profile dropdown
  if (el('pdAvatar'))    el('pdAvatar').textContent    = avatar;
  if (el('pdName'))      el('pdName').textContent      = name;
  if (el('pdEmail'))     el('pdEmail').textContent     = email;
  if (el('pdRoleBadge')) el('pdRoleBadge').textContent = role;

  // Profile page
  if (el('pvAvatar')) el('pvAvatar').textContent = avatar;
  if (el('pvName'))   el('pvName').textContent   = name;
  if (el('pvRole'))   el('pvRole').textContent   = role;
  if (el('pvEmail'))  el('pvEmail').textContent  = email;

  // Session role
  if (el('sessionRole')) el('sessionRole').textContent = role;

  // Fill profile form inputs
  const nameParts = name.split(' ');
  const inputs = document.querySelectorAll('#page-profile .form-group input');
  if (inputs.length >= 2) {
    inputs[0].value = nameParts[0] || '';
    inputs[1].value = nameParts.slice(1).join(' ') || '';
  }

  // Greeting
  const hour = new Date().getHours();
  const timeGreet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = nameParts[0];
  const greetEl = document.getElementById('dash-greeting');
  if (greetEl) greetEl.textContent = `${timeGreet}, ${firstName}. Here's your procurement overview.`;
}

// ===== LOGOUT =====
function doLogout() {
  localStorage.removeItem('vb_session');
  window.location.href = 'login.html';
}

// ===== PAGE NAVIGATION =====
function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Show target
  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageId);
  });

  // Close dropdowns
  closeAllDropdowns();

  // Draw charts when reports page opens
  if (pageId === 'reports') {
    setTimeout(drawCharts, 100);
  }

  // Scroll to top
  document.getElementById('mainContent').scrollTop = 0;
}

// ===== SIDEBAR TOGGLE =====
const sidebarEl    = document.getElementById('sidebar');
const mainContent  = document.getElementById('mainContent');
const toggleBtn    = document.getElementById('sidebarToggle');

function toggleSidebar() {
  sidebarEl.classList.toggle('collapsed');
  mainContent.classList.toggle('expanded');
}

if (toggleBtn) {
  toggleBtn.addEventListener('click', toggleSidebar);
}

// ===== DROPDOWNS =====
function closeAllDropdowns() {
  document.getElementById('notifDropdown')?.classList.remove('open');
  document.getElementById('profileDropdown')?.classList.remove('open');
  document.getElementById('profileChevron')?.classList.remove('open');
}

// Notification button
document.getElementById('notifBtn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  const dd = document.getElementById('notifDropdown');
  const isOpen = dd.classList.contains('open');
  closeAllDropdowns();
  if (!isOpen) dd.classList.add('open');
});

// Profile button
document.getElementById('profileBtn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  const dd = document.getElementById('profileDropdown');
  const ch = document.getElementById('profileChevron');
  const isOpen = dd.classList.contains('open');
  closeAllDropdowns();
  if (!isOpen) {
    dd.classList.add('open');
    ch?.classList.add('open');
  }
});

// Close on outside click
document.addEventListener('click', closeAllDropdowns);

// Clear notifications
function clearNotifs() {
  document.querySelectorAll('.notif-item').forEach(i => i.classList.remove('unread'));
  const badge = document.querySelector('.notif-badge');
  if (badge) badge.style.display = 'none';
}

// ===== COLLAPSIBLE FORMS =====
function toggleForm(formId) {
  const form = document.getElementById(formId);
  if (form) form.classList.toggle('open');
}

// ===== APPROVAL WORKFLOW =====
function approveCard(btn) {
  const card   = btn.closest('.approval-card');
  const remark = card.querySelector('.remark-input').value || 'Approved';
  const badge  = card.querySelector('.appr-top .badge');

  badge.className    = 'badge approved';
  badge.textContent  = 'Approved';
  card.classList.add('done');
  card.querySelector('.appr-bottom').classList.add('disabled');
  card.querySelector('.remark-input').value    = remark;
  card.querySelector('.remark-input').readOnly = true;

  btn.textContent = '✓ Approved';
  btn.disabled    = true;
  card.querySelector('.btn-reject').disabled = true;

  showToast('✓ Approved successfully', 'green');
  updateApprovalBadge();
}

function rejectCard(btn) {
  const card   = btn.closest('.approval-card');
  const remark = card.querySelector('.remark-input').value;

  if (!remark.trim()) {
    card.querySelector('.remark-input').focus();
    card.querySelector('.remark-input').style.borderColor = 'var(--red)';
    showToast('Please add a rejection reason', 'red');
    return;
  }

  const badge = card.querySelector('.appr-top .badge');
  badge.className   = 'badge rejected';
  badge.textContent = 'Rejected';
  card.classList.add('done');
  card.querySelector('.appr-bottom').classList.add('disabled');
  card.querySelector('.remark-input').readOnly = true;

  btn.innerHTML  = '<i class="fa-solid fa-xmark"></i> Rejected';
  btn.disabled   = true;
  card.querySelector('.btn-approve').disabled = true;

  showToast('✕ Rejected', 'red');
  updateApprovalBadge();
}

function updateApprovalBadge() {
  const pendingCount = document.querySelectorAll('.approval-card:not(.done)').length;
  const badge = document.querySelector('[data-page="approvals"] .nav-badge');
  if (badge) {
    badge.textContent = pendingCount;
    if (pendingCount === 0) badge.style.display = 'none';
  }
}

// ===== TOAST NOTIFICATION =====
let toastTimer;

function showToast(msg, type = 'green') {
  let toast = document.getElementById('vb-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'vb-toast';
    toast.style.cssText = `
      position:fixed; bottom:28px; right:28px; z-index:9999;
      padding:12px 20px; border-radius:10px; font-size:13px; font-weight:600;
      display:flex; align-items:center; gap:8px;
      box-shadow:0 8px 24px rgba(0,0,0,0.4);
      transition:opacity 0.3s, transform 0.3s;
      transform:translateY(0);
    `;
    document.body.appendChild(toast);
  }

  const colors = {
    green: { bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.3)',  color: '#86efac' },
    red:   { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.3)',  color: '#fca5a5' },
    gold:  { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', color: '#fcd34d' },
  };

  const c = colors[type] || colors.gold;
  toast.style.background  = c.bg;
  toast.style.border      = `1px solid ${c.border}`;
  toast.style.color       = c.color;
  toast.style.opacity     = '1';
  toast.textContent       = msg;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateY(10px)';
  }, 3000);
}

// ===== CHARTS (Reports Page) =====
function drawCharts() {
  drawBarChart('spendChart', {
    labels: ['Jan','Feb','Mar','Apr','May','Jun'],
    values: [12.4, 9.8, 15.2, 11.5, 16.7, 18.7],
    color:  '#f59e0b',
    unit:   '₹',
    suffix: 'L'
  });

  drawBarChart('vendorChart', {
    labels: ['Tech Supplies', 'CleanPro', 'Office World', 'FurniCo'],
    values: [4.8, 4.5, 4.2, 3.9],
    color:  '#3b82f6',
    unit:   '',
    suffix: ''
  });

  drawBarChart('catChart', {
    labels: ['IT Equip.', 'Services', 'Office Sup.', 'Furniture'],
    values: [9.2, 4.1, 3.6, 1.8],
    color:  '#22c55e',
    unit:   '₹',
    suffix: 'L'
  });
}

function drawBarChart(containerId, { labels, values, color, unit, suffix }) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const max    = Math.max(...values);
  const HEIGHT = 120;

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex; align-items:flex-end; gap:8px; width:100%; height:' + HEIGHT + 'px;';

  labels.forEach((label, i) => {
    const pct    = values[i] / max;
    const barH   = Math.max(pct * HEIGHT, 8);

    const col = document.createElement('div');
    col.style.cssText = 'flex:1; display:flex; flex-direction:column; align-items:center; gap:6px; position:relative;';

    const valLabel = document.createElement('div');
    valLabel.style.cssText = 'font-size:11px; font-weight:700; color:' + color + '; white-space:nowrap;';
    valLabel.textContent   = unit + values[i] + suffix;

    const bar = document.createElement('div');
    bar.style.cssText = `
      width:100%; border-radius:6px 6px 0 0;
      background: linear-gradient(180deg, ${color}cc, ${color}55);
      border: 1px solid ${color}44;
      height:0; transition:height 0.6s cubic-bezier(.4,0,.2,1) ${i * 0.07}s;
      cursor:pointer;
    `;
    bar.title = label + ': ' + unit + values[i] + suffix;

    const lbl = document.createElement('div');
    lbl.style.cssText = 'font-size:10px; color:var(--text-dim); text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%;';
    lbl.textContent   = label;

    col.appendChild(valLabel);
    col.appendChild(bar);
    col.appendChild(lbl);
    wrap.appendChild(col);

    // Animate
    requestAnimationFrame(() => {
      setTimeout(() => { bar.style.height = barH + 'px'; }, 50);
    });
  });

  container.appendChild(wrap);
}

// ===== VENDOR SEARCH FILTER =====
const vendorSearchEl = document.getElementById('vendorSearch');
if (vendorSearchEl) {
  vendorSearchEl.addEventListener('input', () => {
    const q = vendorSearchEl.value.toLowerCase();
    document.querySelectorAll('#page-vendors .data-table tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

// ===== INIT =====
populateProfile();
showPage('dashboard');

// ===============================
// DASHBOARD SECURITY CHECK
// ===============================

(function () {
    const token = localStorage.getItem("token");
    const googleToken = localStorage.getItem("google_token");

    // agar login nahi hai to redirect
    if (!token && !googleToken) {
        alert("Please login first");

        window.location.href =
            "../login_and_sign_up/login _and _sign_up.html";
    }
})();