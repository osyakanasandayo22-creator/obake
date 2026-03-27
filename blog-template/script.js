document.addEventListener("DOMContentLoaded", () => {
  const POST_META = {
    "post-1.html": { datetime: "2026-03-18", minutes: 1 },
    "post-2.html": { datetime: "2026-03-19", minutes: 3 },
    "post-3.html": { datetime: "2026-03-20", minutes: 2 },
    "post-4.html": { datetime: "2026-03-21", minutes: 2 },
    "post-5.html": { datetime: "2026-03-22", minutes: 1 },
    "post-6.html": { datetime: "2026-03-23", minutes: 3 },
    "post-7.html": { datetime: "2026-03-24", minutes: 2 },
  };

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

  function formatRelativeDate(dateStr) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return "just now";
    if (diffMin < 60) return diffMin + " min ago";
    if (diffHour < 24) return diffHour + " h ago";
    if (diffDay < 14) return diffDay + " days ago";
    return formatDateText(dateStr);
  }

  function computeMinutesFromText(text) {
    const clean = (text || "").replace(/\s+/g, "");
    // 日本語中心の文章なので、1分あたり約700文字で概算
    return Math.max(1, Math.round(clean.length / 700));
  }

  function normalizePostHref(href) {
    if (!href) return "";
    const clean = href.split("#")[0].split("?")[0];
    return clean.split("/").pop() || "";
  }

  // 日付表示を datetime 属性から再生成（表示ズレ防止）
  document.querySelectorAll("time[datetime]").forEach((timeEl) => {
    const dateStr = timeEl.getAttribute("datetime");
    if (!dateStr) return;
    timeEl.textContent = formatRelativeDate(dateStr);
  });

  // 記事ページの read time を本文から自動算出
  const articleBody = document.querySelector(".article-body");
  const articleReadTime = document.querySelector(".article-meta .post-read-time");
  const articleTime = document.querySelector(".article-meta time[datetime]");
  const currentPage = normalizePostHref(window.location.pathname);

  if (articleBody && articleReadTime && currentPage) {
    const meta = POST_META[currentPage];
    const min = meta?.minutes ?? computeMinutesFromText(articleBody.textContent);
    articleReadTime.textContent = min + " min read";
    if (articleTime && meta?.datetime) {
      articleTime.setAttribute("datetime", meta.datetime);
      articleTime.textContent = formatRelativeDate(meta.datetime);
    }
  }

  // 一覧ページの read time / 日付をメタデータから同期
  const cardLinks = Array.from(document.querySelectorAll("a[href^=\"post-\"]"));
  cardLinks.forEach((link) => {
    const key = normalizePostHref(link.getAttribute("href"));
    const meta = POST_META[key];
    if (!meta) return;

    const timeEl = link.querySelector("time[datetime]");
    if (timeEl) {
      timeEl.setAttribute("datetime", meta.datetime);
      timeEl.textContent = formatRelativeDate(meta.datetime);
    }

    const readEl = link.querySelector(".post-read-time");
    if (readEl) {
      readEl.textContent = meta.minutes + " min read";
    }
  });

});
