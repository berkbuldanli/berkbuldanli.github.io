const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.artifact').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.08}s`;
  observer.observe(el);
});
