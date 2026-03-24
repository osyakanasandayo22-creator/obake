document.addEventListener("DOMContentLoaded", () => {

  /* ========================================
     Scroll Reveal (IntersectionObserver)
     ======================================== */

  const revealElements = document.querySelectorAll("[data-reveal]");

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  /* ========================================
     Header Auto-hide on Scroll
     ======================================== */

  const header = document.querySelector(".header");
  let lastScrollY = 0;
  let ticking = false;
  const SCROLL_THRESHOLD = 80;

  function updateHeader() {
    const currentScrollY = window.scrollY;

    if (currentScrollY > SCROLL_THRESHOLD) {
      if (currentScrollY > lastScrollY) {
        header.classList.add("header-hidden");
      } else {
        header.classList.remove("header-hidden");
      }
    } else {
      header.classList.remove("header-hidden");
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

});
