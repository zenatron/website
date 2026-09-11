/**
 * Outline scroll-spy and the reading-progress rule.
 *
 * Uses scroll position rather than IntersectionObserver so the "current"
 * heading is the last one you've passed, which is what a reader expects —
 * an observer fires from the middle of the viewport and jumps around.
 */
let off: AbortController | null = null;

function init() {
  // Runs on first load and on every page-load; one set of listeners.
  off?.abort();
  off = null;
  const bar = document.querySelector<HTMLElement>("[data-progress]");
  const links = [...document.querySelectorAll<HTMLAnchorElement>("[data-toc-link]")];
  const article = document.querySelector<HTMLElement>(".prose");
  if (!bar && !links.length) return;

  const targets = links
    .map((a) => ({ link: a, el: document.getElementById(a.dataset.tocLink!) }))
    .filter((t): t is { link: HTMLAnchorElement; el: HTMLElement } => Boolean(t.el));

  // The pane scrolls on anything wider than a phone; the page does on a
  // phone. Measured against whichever one is showing the article.
  const pane = document.querySelector<HTMLElement>(".pane");
  const view = () => {
    if (pane && getComputedStyle(pane).overflowY === "auto") {
      const r = pane.getBoundingClientRect();
      return { top: r.top, height: pane.clientHeight };
    }
    return { top: 0, height: window.innerHeight };
  };

  let ticking = false;
  const update = () => {
    ticking = false;
    const v = view();

    if (bar && article) {
      const a = article.getBoundingClientRect();
      const span = a.height - v.height;
      const p = span > 0 ? (v.top - a.top) / span : 1;
      bar.style.setProperty("--p", String(Math.min(1, Math.max(0, p))));
    }

    if (targets.length) {
      const line = v.top + v.height * 0.25;
      let current = targets[0];
      for (const t of targets) if (t.el.getBoundingClientRect().top <= line) current = t;
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

  // Scroll doesn't bubble, so it's caught on the way down, from either
  // scroller.
  off = new AbortController();
  document.addEventListener("scroll", onScroll, { capture: true, passive: true, signal: off.signal });
  window.addEventListener("resize", onScroll, { signal: off.signal });
  update();
}

document.addEventListener("astro:page-load", init);
init();
