
const username = localStorage.getItem("username");
const role = localStorage.getItem("role");

if (!username) {
  window.location.href = '/frontend/public/index.html';
} else if (role === 'instructor' && window.location.pathname.includes('home-student.html')) {
  window.location.href = '/frontend/public/home-instructor.html';
} else if (role === 'student' && window.location.pathname.includes('home-instructor.html')) {
  window.location.href = '/frontend/public/home-student.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  const userId = localStorage.getItem("userId");

  await initUI();
  await sideBarUI();
});


// header scroll handler: toggles .scrolled on the .topbar
async function initUI() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  const SCROLL_THRESHOLD = 16; // px before header becomes solid
  const LIFT_THRESHOLD = 120; // px for small lift effect

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (y > SCROLL_THRESHOLD) {
      topbar.classList.add('scrolled');
    } else {
      topbar.classList.remove('scrolled');
    }

    if (y > LIFT_THRESHOLD) {
      topbar.classList.add('lift');
    } else {
      topbar.classList.remove('lift');
    }
  }

  // run once on load in case page is already scrolled
  onScroll();

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}

const logoutButton = document.getElementById('logout');

logoutButton.addEventListener('click', () => {
  // Option 1: clear all stored data if everything in localStorage is user-related
  localStorage.clear();

  // Option 2 (safer): wrap removals in a helper
  // ['username', 'firstName', 'lastName', 'role'].forEach(key => localStorage.removeItem(key));

  // Use relative redirect (no hardcoded localhost)
  window.location.href = '/frontend/public/index.html';
});


async function sideBarUI(){
  const collapseBtn = document.getElementById('collapseBtn');
  const sidebar = document.getElementById('sidebar');

  if (collapseBtn && sidebar) {
    collapseBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      collapseBtn.textContent = sidebar.classList.contains('collapsed') ? '⮞' : '⮜';
      // simple visual change: shrink sidebar
      sidebar.style.width = sidebar.classList.contains('collapsed') ? '72px' : '220px';
    });
  }

  // simple search focus behaviour
  const search = document.getElementById('search');
  if (search) {
    search.addEventListener('focus', () => search.style.boxShadow = '0 8px 30px rgba(58,141,255,0.06)');
    search.addEventListener('blur', () => search.style.boxShadow = 'none');
  }
}


