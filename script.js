// ===== Mobile menu toggle =====
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('nav-menu');

function closeMenu() {
  nav.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open menu');
}

toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

// Close the mobile menu after choosing a destination
menu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('is-open')) {
    closeMenu();
    toggle.focus();
  }
});

// ===== Header shadow on scroll =====
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ===== Reveal on scroll =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ===== Scrollspy: highlight the active nav link =====
const navLinks = Array.from(menu.querySelectorAll('a'));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const spy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach((link) =>
        link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`)
      );
    }
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

sections.forEach((section) => spy.observe(section));
