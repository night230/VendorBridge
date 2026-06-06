// ===== SIDEBAR =====
const sidebar  = document.getElementById('sidebar');
const overlay  = document.getElementById('overlay');
const openBtns = [document.getElementById('openSidebar'), document.getElementById('openSidebarTop')].filter(Boolean);
const closeBtn = document.getElementById('closeSidebar');

function openSidebar()  { sidebar.classList.add('active');    overlay.classList.add('active'); }
function closeSidebar() { sidebar.classList.remove('active'); overlay.classList.remove('active'); }

openBtns.forEach(btn => btn && btn.addEventListener('click', openSidebar));
closeBtn  && closeBtn.addEventListener('click', closeSidebar);
overlay   && overlay.addEventListener('click', closeSidebar);

// Close sidebar on nav link click (mobile)
document.querySelectorAll('.nav-item').forEach(link => {
  link.addEventListener('click', closeSidebar);
});

// ===== TOPBAR SCROLL EFFECT =====
const topbar = document.querySelector('.topbar');
window.addEventListener('scroll', () => {
  topbar.style.background = window.scrollY > 60
    ? 'rgba(8,8,8,0.98)'
    : 'rgba(8,8,8,0.94)';
});

// ===== SMOOTH SCROLL for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      closeSidebar();
      target.scrollIntoView({ behavior:'smooth', block:'start' });
    }
  });
});

// ===== REDIRECT IF ALREADY LOGGED IN =====
// Agar user already login hai toh dashboard pe bhej do
const savedSession = localStorage.getItem('vb_session');
if (savedSession) {
  // Optional: comment this out agar home page always dikhana ho
  // window.location.href = 'dashboard.html';
}