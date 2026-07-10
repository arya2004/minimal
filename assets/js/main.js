/* ─── THEME DEFINITIONS ─── */
const THEMES = [
  { id: 'bay',         name: 'Bay',         hue: 212, chroma: 100 },
  { id: 'wintergreen', name: 'Wintergreen', hue: 162, chroma: 100 },
  { id: 'peony',       name: 'Peony',       hue: 338, chroma: 95  },
  { id: 'hazel',       name: 'Hazel',       hue:  36, chroma: 88  },
  { id: 'coral',       name: 'Coral',       hue:  14, chroma: 100 },
  { id: 'violet',      name: 'Violet',      hue: 270, chroma: 85  },
  { id: 'sage',        name: 'Sage',        hue: 145, chroma: 65  },
  { id: 'obsidian',    name: 'Obsidian',    hue: 220, chroma: 18  },
  { id: 'indigo',      name: 'Indigo',      hue: 232, chroma: 78  },
  { id: 'frost',       name: 'Frost',       hue: 205, chroma: 42  },
  { id: 'lemongrass',  name: 'Lemongrass',  hue:  78, chroma: 72  },
  { id: 'moonstone',   name: 'Moonstone',   hue: 213, chroma: 44  },
  { id: 'jade',        name: 'Jade',        hue: 151, chroma: 48  },
  { id: 'porcelain',   name: 'Porcelain',   hue:  36, chroma: 28  },
  { id: 'lavender',    name: 'Lavender',    hue: 255, chroma: 62  },
  { id: 'berry',       name: 'Berry',       hue: 346, chroma: 92  },
  { id: 'fog',         name: 'Fog',         hue: 150, chroma: 20  },
];

const MODE_KEY = 'ap-mode';
const LAST_THEME_INDEX_KEY = 'ap-last-theme-index';
const FAVICON_ID = 'ap-favicon';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const coarsePointer = window.matchMedia('(pointer: coarse)');

let currentTheme = 0;
let isDark = false;
let themeShiftTimer = null;

const root = document.documentElement;

function updateFavicon() {
  const styles = getComputedStyle(root);
  const bg = styles.getPropertyValue('--primary').trim() || '#0f766e';
  const fg = styles.getPropertyValue('--on-primary').trim() || '#ffffff';
  const themeBg = styles.getPropertyValue('--bg').trim() || bg;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${bg}"/><text x="32" y="40" font-size="24" text-anchor="middle" fill="${fg}" font-family="Arial,sans-serif">AP</text></svg>`;
  const href = `data:image/svg+xml,${encodeURIComponent(svg)}`;

  let icon = document.getElementById(FAVICON_ID) || document.querySelector('link[rel~="icon"]');
  if (!icon) {
    icon = document.createElement('link');
    icon.setAttribute('rel', 'icon');
    icon.setAttribute('type', 'image/svg+xml');
    document.head.appendChild(icon);
  }
  icon.id = FAVICON_ID;
  icon.setAttribute('href', href);

  let themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta');
    themeColorMeta.setAttribute('name', 'theme-color');
    document.head.appendChild(themeColorMeta);
  }
  themeColorMeta.setAttribute('content', themeBg);
}

function applyTheme(index, { showToast = true } = {}) {
  const t = THEMES[index];
  root.style.setProperty('--h', t.hue);
  root.style.setProperty('--c', t.chroma + '%');
  localStorage.setItem(LAST_THEME_INDEX_KEY, String(index));
  /* update labels */
  document.getElementById('rail-theme-name').textContent = t.name;
  ['rail-theme-btn', 'top-theme-btn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.setAttribute('aria-label', `Change color theme. Current theme: ${t.name}`);
      el.title = `Current theme: ${t.name}`;
    }
  });
  if (showToast) {
    showSnackbar(`${t.name} palette`);
    playThemeShift();
  }
  updateFavicon();
}

function playThemeShift() {
  if (reducedMotion.matches) return;
  clearTimeout(themeShiftTimer);
  root.classList.remove('theme-shifting');
  void root.offsetWidth;
  root.classList.add('theme-shifting');
  themeShiftTimer = window.setTimeout(() => root.classList.remove('theme-shifting'), 420);
}

function haptic(pattern = 8) {
  if (!coarsePointer.matches || typeof navigator.vibrate !== 'function') return;
  navigator.vibrate(pattern);
}

function cycleTheme() {
  currentTheme = (currentTheme + 1) % THEMES.length;
  applyTheme(currentTheme);
  haptic([8, 30, 8]);
}

function toggleDark() {
  isDark = !isDark;
  root.setAttribute('data-mode', isDark ? 'dark' : 'light');
  localStorage.setItem(MODE_KEY, isDark ? 'dark' : 'light');
  const icons = ['rail-dark-icon', 'top-dark-icon'];
  icons.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = isDark ? 'light_mode' : 'dark_mode';
  });
  ['rail-dark-btn', 'top-dark-btn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.setAttribute('aria-pressed', String(isDark));
      el.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      el.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    }
  });
  playThemeShift();
  showSnackbar(isDark ? 'Night mode' : 'Day mode');
  haptic(12);
  updateFavicon();
}

function applyStoredMode() {
  const savedMode = localStorage.getItem(MODE_KEY);
  if (savedMode === 'dark' || savedMode === 'light') {
    isDark = savedMode === 'dark';
    root.setAttribute('data-mode', savedMode);
  } else {
    isDark = root.getAttribute('data-mode') === 'dark';
  }

  const iconValue = isDark ? 'light_mode' : 'dark_mode';
  ['rail-dark-icon', 'top-dark-icon'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = iconValue;
  });
  ['rail-dark-btn', 'top-dark-btn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.setAttribute('aria-pressed', String(isDark));
      el.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      el.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    }
  });
}

function pickRandomThemeIndex() {
  const lastIndexRaw = localStorage.getItem(LAST_THEME_INDEX_KEY);
  const lastIndex = Number.parseInt(lastIndexRaw ?? '', 10);
  const max = THEMES.length;

  if (max <= 1) return 0;
  if (!Number.isInteger(lastIndex) || lastIndex < 0 || lastIndex >= max) {
    return Math.floor(Math.random() * max);
  }

  let next = lastIndex;
  while (next === lastIndex) {
    next = Math.floor(Math.random() * max);
  }
  return next;
}

/* ─── SNACKBAR ─── */
let snackTimer = null;
function showSnackbar(text) {
  const sb = document.getElementById('snackbar');
  const st = document.getElementById('snackbar-text');
  st.textContent = text;
  sb.classList.add('show');
  clearTimeout(snackTimer);
  snackTimer = setTimeout(() => sb.classList.remove('show'), 2200);
}

/* ─── ATTACH CONTROLS ─── */
['rail-theme-btn', 'top-theme-btn'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', cycleTheme);
});
['rail-dark-btn', 'top-dark-btn'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', toggleDark);
});

/* ─── FAB ─── */
const fab = document.getElementById('fab');
const scrollProgress = document.getElementById('scroll-progress');
let scrollFrame = null;
let lastScrollY = window.scrollY;
let lastScrollTime = performance.now();
let scrollSettleTimer = null;

function updateScrollState() {
  fab.classList.toggle('show', window.scrollY > 320);
  if (scrollFrame !== null) return;
  scrollFrame = requestAnimationFrame(now => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    scrollProgress.style.transform = `scaleX(${progress})`;

    if (!reducedMotion.matches) {
      const elapsed = Math.max(now - lastScrollTime, 16);
      const distance = window.scrollY - lastScrollY;
      const intensity = Math.min(Math.abs(distance) / elapsed / 2.5, 1);
      const direction = Math.sign(distance);

      root.style.setProperty('--scroll-pack', String(1 - intensity * 0.012));
      root.style.setProperty('--scroll-drift', `${direction * intensity * 5}px`);

      clearTimeout(scrollSettleTimer);
      scrollSettleTimer = window.setTimeout(() => {
        root.style.setProperty('--scroll-pack', '1');
        root.style.setProperty('--scroll-drift', '0px');
      }, 90);
    }

    lastScrollY = window.scrollY;
    lastScrollTime = now;
    scrollFrame = null;
  });
}

window.addEventListener('scroll', updateScrollState, { passive: true });
updateScrollState();
fab.addEventListener('click', () => {
  haptic(8);
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
});

/* ─── ACTIVE NAV ON SCROLL ─── */
const sections = ['hero', 'experience', 'projects', 'skills', 'education', 'achievements'];
const allNavItems = document.querySelectorAll('.nav-item[data-section]');

allNavItems.forEach(item => {
  if (item.dataset.section === 'hero') item.setAttribute('aria-current', 'page');
});

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      allNavItems.forEach(item => {
        const representedSections = (item.dataset.sections || item.dataset.section).split(' ');
        const isActive = representedSections.includes(id);
        item.classList.toggle('active', isActive);
        if (isActive) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
      });
    }
  });
}, { threshold: 0, rootMargin: '-28% 0px -62% 0px' });

sections.forEach(id => {
  const el = document.getElementById(id);
  if (el) sectionObserver.observe(el);
});

/* ─── SMOOTH SCROLL FOR NAV ─── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const topBar = document.querySelector('.top-app-bar');
      const topOffset = window.innerWidth <= 768 && topBar ? topBar.offsetHeight : 0;
      haptic(6);
      window.scrollTo({
        top: target.offsetTop - topOffset - 16,
        behavior: reducedMotion.matches ? 'auto' : 'smooth'
      });
    }
  });
});

/* ─── TACTILE FEEDBACK ─── */
document.querySelectorAll('.btn, .proj-card, .chip, .cp-card, .cert-card').forEach(control => {
  control.addEventListener('click', () => haptic(7));
});

/* ─── CHIP RIPPLE (M3 feel) ─── */
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('pointerdown', function(e) {
    const r = document.createElement('span');
    r.style.cssText = `
      position:absolute;width:6px;height:6px;border-radius:50%;
      background:currentColor;opacity:0.25;
      left:${e.offsetX - 3}px;top:${e.offsetY - 3}px;
      transform:scale(0);transition:transform 400ms ease,opacity 400ms ease;
      pointer-events:none;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(r);
    requestAnimationFrame(() => {
      r.style.transform = 'scale(20)';
      r.style.opacity = '0';
    });
    setTimeout(() => r.remove(), 500);
  });
});

/* ─── INITIAL THEME ─── */
applyStoredMode();
currentTheme = pickRandomThemeIndex();
applyTheme(currentTheme, { showToast: false });
