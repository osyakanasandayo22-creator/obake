document.addEventListener("DOMContentLoaded", () => {

  /* ========================================
     Gallery Slideshow (existing feature)
     ======================================== */

  const INTERVAL = 4000;

  const galleries = document.querySelectorAll(
    ".hero-app-gallery, .shelf-gallery"
  );

  galleries.forEach((gallery) => {
    const imgs = gallery.querySelectorAll("img");
    if (imgs.length <= 1) return;

    const dots = document.createElement("div");
    dots.className = "gallery-dots";
    for (let i = 0; i < imgs.length; i++) {
      const dot = document.createElement("span");
      dot.className = i === 0 ? "dot active" : "dot";
      dots.appendChild(dot);
    }
    gallery.appendChild(dots);

    let current = 0;

    setInterval(() => {
      imgs[current].classList.remove("active");
      dots.children[current].classList.remove("active");

      current = (current + 1) % imgs.length;

      imgs[current].classList.add("active");
      dots.children[current].classList.add("active");
    }, INTERVAL);
  });

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

  /* ========================================
     Cursor Tooltip (follows pointer on app cards)
     ======================================== */

  const tooltip = document.querySelector(".cursor-tooltip");
  const appLinks = document.querySelectorAll(".app-link");

  if (tooltip && appLinks.length > 0) {
    appLinks.forEach((link) => {
      link.addEventListener("mouseenter", () => {
        tooltip.classList.add("visible");
      });

      link.addEventListener("mouseleave", () => {
        tooltip.classList.remove("visible");
      });

      link.addEventListener("mousemove", (e) => {
        tooltip.style.left = (e.clientX + 20) + "px";
        tooltip.style.top = (e.clientY - 14) + "px";
      });
    });
  }

  /* ========================================
     App Card Click → Navigate
     ======================================== */

  appLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const url = link.getAttribute("data-url");
      if (url && url !== "#") {
        window.open(url, "_blank", "noopener");
      }
    });
  });

  /* ========================================
     Section Navigation — current section tracking
     ======================================== */

  const sections = document.querySelectorAll("section[id]");
  const sectionNavItems = document.querySelectorAll(".section-nav-item");
  const headerNavLinks = document.querySelectorAll(".header nav a");

  function updateActiveSection() {
    const scrollY = window.scrollY;
    const windowH = window.innerHeight;
    const docH = document.documentElement.scrollHeight;

    let currentId = "";

    // ページ末尾付近（残り200px以内）なら最後のセクションを強制アクティブ
    if (scrollY + windowH >= docH - 200) {
      currentId = sections[sections.length - 1].id;
    } else {
      sections.forEach((section) => {
        const top = section.offsetTop - windowH * 0.35;
        if (scrollY >= top) {
          currentId = section.id;
        }
      });
    }

    sectionNavItems.forEach((item) => {
      item.classList.toggle("active", item.dataset.target === currentId);
    });
    headerNavLinks.forEach((a) => {
      a.classList.toggle("nav-active", a.getAttribute("href") === "#" + currentId);
    });
  }

  if (sections.length > 0 && sectionNavItems.length > 0) {
    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
  }

  /* ========================================
     Gallery 3D Tilt on Hover (hero galleries only)
     ======================================== */

  const heroGalleries = document.querySelectorAll(".hero-app-gallery");
  const MAX_TILT = 3;

  heroGalleries.forEach((gallery) => {
    gallery.addEventListener("mousemove", (e) => {
      const rect = gallery.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gallery.style.transition = "box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
      gallery.style.transform =
        "perspective(1000px) rotateY(" + (x * MAX_TILT) + "deg) rotateX(" + (-y * MAX_TILT) + "deg) scale(1.008)";
    });

    gallery.addEventListener("mouseleave", () => {
      gallery.style.transition =
        "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
      gallery.style.transform = "";
    });
  });

});
