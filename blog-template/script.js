document.addEventListener("DOMContentLoaded", () => {

  /* ========================================
     Scroll Reveal (IntersectionObserver)
     ======================================== */

  const revealElements = document.querySelectorAll("[data-reveal]");

  if (revealElements.length > 0) {
    const isMobile = window.matchMedia("(max-width: 960px)").matches;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0,
        rootMargin: isMobile ? "0px 0px 0px 0px" : "0px 0px -40px 0px",
      }
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
     Date and Read Time Auto-format
     ======================================== */

  function formatDateText(dateStr) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return y + "." + m + "." + day;
  }

  function computeMinutesFromText(text) {
    const clean = (text || "").replace(/\s+/g, "");
    // 日本語中心の文章なので、1分あたり約700文字で概算
    return Math.max(1, Math.round(clean.length / 700));
  }

  // 日付表示を datetime 属性から再生成（表示ズレ防止）
  document.querySelectorAll("time[datetime]").forEach((timeEl) => {
    const dateStr = timeEl.getAttribute("datetime");
    if (!dateStr) return;
    timeEl.textContent = formatDateText(dateStr);
  });

  // 記事ページの read time を本文から自動算出
  const articleBody = document.querySelector(".article-body");
  const articleReadTime = document.querySelector(".article-meta .post-read-time");
  if (articleBody && articleReadTime) {
    const min = computeMinutesFromText(articleBody.textContent);
    articleReadTime.textContent = min + " min read";
  }

});
