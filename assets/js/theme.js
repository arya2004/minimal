const THEMES = [
  { id: 'bay',         name: 'Bay',         hue: 212, chroma: 100 },
  { id: 'wintergreen', name: 'Wintergreen', hue: 162, chroma: 100 },
  { id: 'peony',       name: 'Peony',       hue: 338, chroma: 95 },
  { id: 'hazel',       name: 'Hazel',       hue: 36,  chroma: 88 },
  { id: 'coral',       name: 'Coral',       hue: 14,  chroma: 100 },
  { id: 'violet',      name: 'Violet',      hue: 270, chroma: 85 },
  { id: 'sage',        name: 'Sage',        hue: 145, chroma: 65 },
  { id: 'obsidian',    name: 'Obsidian',    hue: 0,   chroma: 0 },
  { id: 'indigo',      name: 'Indigo',      hue: 232, chroma: 78 },
  { id: 'frost',       name: 'Frost',       hue: 205, chroma: 42 },
  { id: 'lemongrass',  name: 'Lemongrass',  hue: 78,  chroma: 72 },
  { id: 'moonstone',   name: 'Moonstone',   hue: 213, chroma: 44 },
  { id: 'jade',        name: 'Jade',        hue: 151, chroma: 48 },
  { id: 'porcelain',   name: 'Porcelain',   hue: 36,  chroma: 28 },
  { id: 'lavender',    name: 'Lavender',    hue: 255, chroma: 62 },
  { id: 'berry',       name: 'Berry',       hue: 346, chroma: 92 },
  { id: 'canyon',      name: 'Canyon',      hue: 22,  chroma: 96 },
  { id: 'olive',       name: 'Olive',       hue: 135, chroma: 38 },
  { id: 'fog',         name: 'Fog',         hue: 210, chroma: 20 },
];

const LAST_THEME_INDEX_KEY = 'ap-last-theme-index';
const FAVICON_ID = 'ap-favicon';
const root = document.documentElement;

export const reducedMotion = window.matchMedia('(max-width: 768px), (prefers-reduced-motion: reduce)');
const coarsePointer = window.matchMedia('(pointer: coarse)');

let currentTheme = 0;
let snackTimer = 0;

const byId = id => document.getElementById(id);

const storage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // The interface remains functional when storage is blocked.
    }
  },
};

function updateFavicon() {
  const styles = getComputedStyle(root);
  const background = styles.getPropertyValue('--primary').trim() || '#0f766e';
  const foreground = styles.getPropertyValue('--on-primary').trim() || '#ffffff';
  const browserChrome = styles.getPropertyValue('--bg').trim() || background;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${background}"/><text x="32" y="40" font-size="24" text-anchor="middle" fill="${foreground}" font-family="Arial,sans-serif">AP</text></svg>`;
  const href = `data:image/svg+xml,${encodeURIComponent(svg)}`;

  let icon = byId(FAVICON_ID) || document.querySelector('link[rel~="icon"]');
  if (!icon) {
    icon = document.createElement('link');
    icon.rel = 'icon';
    icon.type = 'image/svg+xml';
    document.head.appendChild(icon);
  }
  icon.id = FAVICON_ID;
  icon.href = href;

  let themeColor = document.querySelector('meta[name="theme-color"]');
  if (!themeColor) {
    themeColor = document.createElement('meta');
    themeColor.name = 'theme-color';
    document.head.appendChild(themeColor);
  }
  themeColor.content = browserChrome;
}

function showSnackbar(text) {
  const snackbar = byId('snackbar');
  const label = byId('snackbar-text');
  if (!snackbar || !label) return;

  label.textContent = text;
  snackbar.classList.add('show');
  window.clearTimeout(snackTimer);
  snackTimer = window.setTimeout(() => snackbar.classList.remove('show'), 2200);
}

function syncThemeControls(theme) {
  const name = byId('rail-theme-name');
  if (name) name.textContent = theme.name;

  ['rail-theme-btn', 'top-theme-btn'].forEach(id => {
    const control = byId(id);
    if (!control) return;
    control.setAttribute('aria-label', `Change color theme. Current theme: ${theme.name}`);
    control.title = `Current theme: ${theme.name}`;
  });
}

function applyTheme(index, { notify = true } = {}) {
  const theme = THEMES[index];
  if (!theme) return;

  root.dataset.theme = theme.id;
  root.style.setProperty('--h', String(theme.hue));
  root.style.setProperty('--c', `${theme.chroma}%`);
  storage.set(LAST_THEME_INDEX_KEY, String(index));
  syncThemeControls(theme);

  if (notify) {
    showSnackbar(theme.name);
  }
  updateFavicon();
}

function pickRandomThemeIndex() {
  const lastIndex = Number.parseInt(storage.get(LAST_THEME_INDEX_KEY) ?? '', 10);
  if (THEMES.length <= 1) return 0;
  if (!Number.isInteger(lastIndex) || lastIndex < 0 || lastIndex >= THEMES.length) {
    return Math.floor(Math.random() * THEMES.length);
  }

  let nextIndex = lastIndex;
  while (nextIndex === lastIndex) {
    nextIndex = Math.floor(Math.random() * THEMES.length);
  }
  return nextIndex;
}

function cycleTheme() {
  currentTheme = (currentTheme + 1) % THEMES.length;
  applyTheme(currentTheme);
  haptic([8, 30, 8]);
}

export function haptic(pattern = 8) {
  if (reducedMotion.matches || !coarsePointer.matches || typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Vibration is an enhancement and must never block the interaction.
  }
}

export function initializeTheme() {
  root.dataset.mode = 'dark';
  currentTheme = pickRandomThemeIndex();
  applyTheme(currentTheme, { notify: false });

  ['rail-theme-btn', 'top-theme-btn'].forEach(id => {
    const control = byId(id);
    control?.addEventListener('click', () => {
      cycleTheme();
    });
  });

}
