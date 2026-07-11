import { haptic, initializeTheme, reducedMotion } from './theme.js';

const root = document.documentElement;
const byId = id => document.getElementById(id);

initializeTheme();

// Material symbol ligatures are decorative wherever the parent already has a label.
document.querySelectorAll('.material-symbols-rounded').forEach(icon => {
  icon.setAttribute('aria-hidden', 'true');
});

const fab = byId('fab');
const scrollProgress = byId('scroll-progress');
let scrollFrame = 0;
let lastScrollY = window.scrollY;
let lastScrollTime = performance.now();
let scrollSettleTimer = 0;

function resetScrollResponse() {
  root.style.setProperty('--scroll-pack', '1');
  root.style.setProperty('--scroll-drift', '0px');
}

function updateScrollState() {
  fab?.classList.toggle('show', window.scrollY > 320);
  if (scrollFrame) return;

  scrollFrame = window.requestAnimationFrame(now => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    if (scrollProgress) scrollProgress.style.transform = `scaleX(${progress})`;

    if (!reducedMotion.matches) {
      const elapsed = Math.max(now - lastScrollTime, 16);
      const distance = window.scrollY - lastScrollY;
      const intensity = Math.min(Math.abs(distance) / elapsed / 2.5, 1);
      root.style.setProperty('--scroll-pack', String(1 - intensity * 0.012));
      root.style.setProperty('--scroll-drift', `${Math.sign(distance) * intensity * 5}px`);
      window.clearTimeout(scrollSettleTimer);
      scrollSettleTimer = window.setTimeout(resetScrollResponse, 90);
    }

    lastScrollY = window.scrollY;
    lastScrollTime = now;
    scrollFrame = 0;
  });
}

window.addEventListener('scroll', updateScrollState, { passive: true });
window.addEventListener('pageshow', updateScrollState);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) resetScrollResponse();
});
updateScrollState();

fab?.addEventListener('click', () => {
  haptic(8);
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
});

const sectionIds = ['hero', 'experience', 'projects', 'skills', 'education', 'achievements'];
const navItems = document.querySelectorAll('.nav-item[data-section]');

function setActiveSection(sectionId) {
  navItems.forEach(item => {
    const represented = (item.dataset.sections || item.dataset.section || '').split(' ');
    const active = represented.includes(sectionId);
    item.classList.toggle('active', active);
    if (active) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });
}

setActiveSection('hero');

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    if (visible[0]) setActiveSection(visible[0].target.id);
  }, {
    threshold: [0, 0.15, 0.35],
    rootMargin: '-24% 0px -58% 0px',
  });

  sectionIds.forEach(id => {
    const section = byId(id);
    if (section) sectionObserver.observe(section);
  });
}

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
    target.scrollIntoView({
      block: 'start',
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    });
  });
});

document.querySelectorAll('.btn, .proj-card, .chip, .cp-card, .cert-card').forEach(control => {
  control.addEventListener('click', () => haptic(7));
});

document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('pointerdown', event => {
    const rect = chip.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'chip-ripple';
    ripple.setAttribute('aria-hidden', 'true');
    ripple.style.setProperty('--ripple-x', `${event.clientX - rect.left}px`);
    ripple.style.setProperty('--ripple-y', `${event.clientY - rect.top}px`);
    chip.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  });
});
