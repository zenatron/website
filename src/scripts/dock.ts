/**
 * The Dock, alive: magnification, running dots, and the launch bounce.
 *
 * Magnification is the real one's: each icon's size follows the pointer's
 * distance along the shelf, on a cosine falloff, so the icon under the
 * pointer is largest and its neighbours rise to meet it. Sizes change
 * width, not just scale, so the shelf widens and the icons part the way
 * they do on a Mac. Only with a mouse, and never under reduced motion.
 */

const READ_TABS = "open-tabs";
/** How much the icon under the pointer grows, and how far the swell reaches. */
const GROW = 0.6;
const REACH = 150;

const norm = (href: string) => new URL(href, location.href).pathname.replace(/\/+$/, "") || "/";

function syncRunning() {
  let open: string[] = [];
  try {
    open = (JSON.parse(sessionStorage.getItem(READ_TABS) ?? "[]") as { href: string }[]).map((t) => t.href);
  } catch {
    /* no session storage — only the current page counts */
  }
  const here = norm(location.href);
  for (const item of document.querySelectorAll<HTMLElement>("[data-dock-item][data-href]")) {
    const href = norm(item.dataset.href!);
    // A page counts as open if it, or anything under it, is in a tab:
    // a post you're reading keeps Writing running.
    const within = (p: string) => p === href || (href !== "/" && p.startsWith(`${href}/`));
    item.toggleAttribute("data-current", within(here));
    item.toggleAttribute("data-running", open.some(within));
  }
}

function wire() {
  const shelf = document.querySelector<HTMLElement>("[data-dock-shelf]");
  if (!shelf || shelf.dataset.wired) return;
  shelf.dataset.wired = "1";
  const items = [...shelf.querySelectorAll<HTMLElement>("[data-dock-item]")];

  const magnify =
    matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (magnify) {
    let frame = 0;
    let x = 0;
    const apply = () => {
      frame = 0;
      // Centres measured at rest-relative positions would drift as the
      // icons grow; measuring live each frame keeps the swell under the
      // pointer, which is what the eye tracks.
      for (const item of items) {
        const r = item.getBoundingClientRect();
        const d = Math.abs(x - (r.left + r.width / 2));
        const m = d < REACH ? 1 + GROW * (Math.cos((Math.PI * d) / REACH) + 1) / 2 : 1;
        item.style.setProperty("--m", m.toFixed(3));
      }
    };
    shelf.addEventListener("pointermove", (e) => {
      x = e.clientX;
      shelf.setAttribute("data-tracking", "");
      if (!frame) frame = requestAnimationFrame(apply);
    });
    shelf.addEventListener("pointerleave", () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      shelf.removeAttribute("data-tracking");
      for (const item of items) item.style.setProperty("--m", "1");
    });
  }

  for (const item of items) {
    item.querySelector("a")?.addEventListener("click", () => {
      item.removeAttribute("data-bounce");
      // Restart the animation even if it's mid-bounce.
      void item.offsetWidth;
      item.setAttribute("data-bounce", "");
    });
    item.addEventListener("animationend", () => item.removeAttribute("data-bounce"));
  }
}

document.addEventListener("tabs:change", syncRunning);
document.addEventListener("astro:page-load", () => {
  wire();
  syncRunning();
});
wire();
syncRunning();
