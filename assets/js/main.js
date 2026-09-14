import { haptic, initializeTheme } from './theme.js';

const byId = id => document.getElementById(id);

initializeTheme();

// Material symbol ligatures are decorative wherever the parent already has a label.
document.querySelectorAll('.material-symbols-rounded').forEach(icon => {
  icon.setAttribute('aria-hidden', 'true');
});

const fab = byId('fab');
const scrollProgress = byId('scroll-progress');
const sections = [...document.querySelectorAll('main > section[id]')];
const navItems = document.querySelectorAll('.nav-item[data-section]');
let scrollFrame = 0;
let activeSection = '';

function setActiveSection(sectionId) {
  if (sectionId === activeSection) return;
  activeSection = sectionId;
  navItems.forEach(item => {
    const represented = (item.dataset.sections || item.dataset.section || '').split(' ');
    const active = represented.includes(sectionId);
    item.classList.toggle('active', active);
    if (active) item.setAttribute('aria-current', 'location');
    else item.removeAttribute('aria-current');
  });
}

function updateScrollState() {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(() => {
    scrollFrame = 0;
    fab?.classList.toggle('show', window.scrollY > 320);
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollProgress) {
      const progress = scrollable > 0 ? Math.max(0, Math.min(window.scrollY / scrollable, 1)) : 0;
      scrollProgress.style.transform = `scaleX(${progress})`;
    }

    // Compare every section at one reading line; observer batches can omit the current section.
    const readingLine = window.innerHeight * 0.3;
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= readingLine) current = section;
      else break;
    }
    if (scrollable > 0 && window.scrollY >= scrollable - 2) current = sections.at(-1);
    if (current) setActiveSection(current.id);
  });
}

window.addEventListener('scroll', updateScrollState, { passive: true });
window.addEventListener('pageshow', updateScrollState);
window.addEventListener('resize', updateScrollState, { passive: true });
window.addEventListener('hashchange', updateScrollState);
document.fonts?.ready.then(updateScrollState);
updateScrollState();

fab?.addEventListener('click', () => {
  haptic(8);
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });
  updateScrollState();
});

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;
    const target = document.querySelector(hash);
    if (!target) return;

    event.preventDefault();
    haptic(6);
    if (link.classList.contains('skip-link')) {
      target.focus({ preventScroll: true });
    }
    if (link.classList.contains('nav-item')) history.pushState(null, '', hash);
    target.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
    updateScrollState();
  });
});

document.querySelectorAll('.btn, .cp-card, .cert-card').forEach(control => {
  control.addEventListener('click', () => haptic(7));
});
