/**
 * Outline scroll-spy and the reading-progress rule.
 *
 * Uses scroll position rather than IntersectionObserver so the "current"
 * heading is the last one you've passed, which is what a reader expects —
 * an observer fires from the middle of the viewport and jumps around.
 */
function init() {
  const bar = document.querySelector<HTMLElement>("[data-progress]");
  const links = [...document.querySelectorAll<HTMLAnchorElement>("[data-toc-link]")];
  const article = document.querySelector<HTMLElement>(".prose");
  if (!bar && !links.length) return;

  const targets = links
    .map((a) => ({ link: a, el: document.getElementById(a.dataset.tocLink!) }))
    .filter((t): t is { link: HTMLAnchorElement; el: HTMLElement } => Boolean(t.el));

  let ticking = false;
  const update = () => {
    ticking = false;

    if (bar && article) {
      const start = article.offsetTop;
      const span = article.offsetHeight - window.innerHeight;
      const p = span > 0 ? (window.scrollY - start) / span : 1;
      bar.style.setProperty("--p", String(Math.min(1, Math.max(0, p))));
    }

    if (targets.length) {
      const line = window.scrollY + window.innerHeight * 0.25;
      let current = targets[0];
      for (const t of targets) if (t.el.offsetTop <= line) current = t;
      for (const t of targets) {
        if (t === current) t.link.setAttribute("data-current", "");
        else t.link.removeAttribute("data-current");
      }
    }
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
}

document.addEventListener("astro:page-load", init);
init();
