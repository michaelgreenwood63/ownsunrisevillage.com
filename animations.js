(function () {
  // ---------- Nav scroll state (deepens the sticky nav shadow once the page scrolls) ----------
  var nav = document.querySelector('nav');
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  if (nav) {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------- Hero load-in ----------
  var hero = document.querySelector('.hero, .hero-photo, .page-header');
  if (hero) {
    requestAnimationFrame(function () {
      setTimeout(function () { hero.classList.add('loaded'); }, 80);
    });
  }

  // ---------- Scroll reveal (IntersectionObserver), with per-group stagger ----------
  document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
    var children = group.querySelectorAll('[data-reveal]');
    children.forEach(function (el, i) { el.style.setProperty('--i', i); });
  });

  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
