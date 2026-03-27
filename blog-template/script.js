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

  // 日付表示を datetime 属性から再生成（表示ズレ防止）
  document.querySelectorAll("time[datetime]").forEach((timeEl) => {
    const dateStr = timeEl.getAttribute("datetime");
    if (!dateStr) return;
    timeEl.textContent = formatRelativeDate(dateStr);
  });

  // 記事ページの read time を本文から自動算出
  const articleBody = document.querySelector(".article-body");
  const articleReadTime = document.querySelector(".article-meta .post-read-time");
  if (articleBody && articleReadTime) {
    const min = computeMinutesFromText(articleBody.textContent);
    articleReadTime.textContent = min + " min read";
  }

  // 一覧ページの read time / 日付を記事ファイルから自動同期
  const cardLinks = Array.from(document.querySelectorAll("a[href^=\"post-\"]"));
  const uniquePostLinks = [...new Set(cardLinks.map((a) => a.getAttribute("href")).filter(Boolean))];

  if (uniquePostLinks.length > 0) {
    const postMetaMap = new Map();

    Promise.all(uniquePostLinks.map(async (href) => {
      try {
        const res = await fetch(href, { cache: "no-store" });
        if (!res.ok) return;
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        const bodyText = doc.querySelector(".article-body")?.textContent || "";
        const mainTime = doc.querySelector(".article-meta time[datetime]");
        const datetime = mainTime?.getAttribute("datetime") || "";
        const minutes = computeMinutesFromText(bodyText);
        postMetaMap.set(href, { datetime, minutes });
      } catch (_) {
        // fail silently
      }
    })).then(() => {
      cardLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (!href || !postMetaMap.has(href)) return;
        const meta = postMetaMap.get(href);
        if (!meta) return;

        const timeEl = link.querySelector("time[datetime]");
        if (timeEl && meta.datetime) {
          timeEl.setAttribute("datetime", meta.datetime);
          timeEl.textContent = formatRelativeDate(meta.datetime);
        }

        const readEl = link.querySelector(".post-read-time");
        if (readEl) {
          readEl.textContent = meta.minutes + " min read";
        }
      });
    });
  }

});
