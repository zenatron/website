/**
 * The shell's chrome persists across navigation, so it never re-renders.
 * Anything route-dependent in it is re-synced here on astro:page-load.
 */

/** `~`, `~/blog`, `~/blog/reverse-proxy-homelab` */
function tildePath(pathname: string): string {
  const clean = pathname.replace(/\/+$/, "");
  return clean === "" ? "~" : `~${clean}`;
}

/**
 * The window title: the page's name, from its <title>, with a proxy icon
 * borrowed from the explorer — the page's tile, or the file's dot — so the
 * two can never disagree. Pages with no row (home, the indexes) get the
 * site's mark. The path is kept as the tooltip.
 */
function syncTitlebar() {
  const title = document.querySelector<HTMLElement>("[data-titlebar-title]");
  const name = document.querySelector<HTMLElement>("[data-titlebar-name]");
  const proxy = document.querySelector<HTMLElement>("[data-titlebar-proxy]");
  if (!title || !name || !proxy) return;

  name.textContent = document.title.split(" | ")[0].trim();
  title.title = tildePath(location.pathname);

  // Matched by URL rather than [data-active]: the explorer marks its
  // active row on the same event, and may not have yet.
  const here = location.pathname.replace(/\/+$/, "") || "/";
  const link = [...document.querySelectorAll<HTMLAnchorElement>("#sidebar .row a[data-nav]")]
    .find((a) => (new URL(a.href).pathname.replace(/\/+$/, "") || "/") === here);
  const row = link?.closest<HTMLElement>(".row");
  const tile = row?.querySelector<HTMLElement>(".tile");
  const dot = row?.querySelector<HTMLElement>(".dot");
  const hue = row?.style.getPropertyValue("--h") ?? "";
  const tint = row?.style.getPropertyValue("--t") ?? "";

  let icon: HTMLElement;
  if (tile) {
    icon = document.createElement("span");
    icon.className = "ptile";
    icon.append(...[...tile.childNodes].map((n) => n.cloneNode(true)));
  } else if (dot) {
    icon = document.createElement("span");
    icon.className = "pdot";
    if (!hue) icon.dataset.plain = "";
  } else {
    const img = document.createElement("img");
    img.src = "/favicon.svg";
    img.alt = "";
    img.width = img.height = 16;
    icon = img;
  }
  if (hue) icon.style.setProperty("--h", hue);
  if (tint) icon.style.setProperty("--t", tint);
  proxy.replaceChildren(icon);
}

function syncKeycap() {
  const el = document.querySelector<HTMLElement>("[data-keycap]");
  if (!el) return;
  const platform =
    (navigator as any).userAgentData?.platform ?? navigator.platform ?? "";
  el.textContent = /mac/i.test(platform) ? "⌘K" : "Ctrl K";
}

/*  Mobile drawer */

function setDrawer(open: boolean) {
  const sidebar = document.getElementById("sidebar");
  const toggle = document.querySelector<HTMLButtonElement>(".drawer-toggle");
  const scrim = document.querySelector<HTMLElement>("[data-scrim]");
  if (!sidebar || !toggle || !scrim) return;
  sidebar.dataset.open = String(open);
  toggle.setAttribute("aria-expanded", String(open));
  scrim.hidden = !open;
  // Focus moves into the drawer so the keyboard lands where the eye does —
  // but never on touch, where focusing the search field summons the
  // on-screen keyboard over the very list you just asked to see.
  if (open && window.matchMedia("(hover: hover)").matches) {
    sidebar.querySelector<HTMLElement>("[data-search]")?.focus();
  } else if (open) {
    sidebar.querySelector<HTMLElement>("[data-drawer-close]")?.focus();
  }
}

function wireDrawer() {
  const closer = document.querySelector<HTMLButtonElement>("[data-drawer-close]");
  if (closer && !closer.dataset.wired) {
    closer.dataset.wired = "1";
    closer.addEventListener("click", () => setDrawer(false));
  }
  const toggle = document.querySelector<HTMLButtonElement>(".drawer-toggle");
  const scrim = document.querySelector<HTMLElement>("[data-scrim]");
  if (toggle && !toggle.dataset.wired) {
    toggle.dataset.wired = "1";
    toggle.addEventListener("click", () =>
      setDrawer(toggle.getAttribute("aria-expanded") !== "true")
    );
  }
  if (scrim && !scrim.dataset.wired) {
    scrim.dataset.wired = "1";
    scrim.addEventListener("click", () => setDrawer(false));
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setDrawer(false);
  });
}

/*  The pane
 *
 * On anything wider than a phone the window doesn't scroll; the pane
 * does. So the things a browser does for a scrolling page are done here
 * for the pane: back and forward return to where you were, a reload
 * keeps your place, and the keyboard scrolls it without a click first.
 */
const pane = () => document.querySelector<HTMLElement>(".pane");
const paneScrolls = () => {
  const p = pane();
  return Boolean(p) && getComputedStyle(p!).overflowY === "auto";
};

/** Scroll offsets by history entry — the router numbers them. */
const KEY = "pane-scroll";
const offsets = new Map<number, number>(
  (() => {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
    } catch {
      return [];
    }
  })(),
);
const entry = (): number | undefined => history.state?.index;

document.addEventListener(
  "scroll",
  (e) => {
    const i = entry();
    if (e.target === pane() && i !== undefined) offsets.set(i, pane()!.scrollTop);
  },
  { capture: true, passive: true },
);
addEventListener("pagehide", () => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify([...offsets]));
  } catch {
    /* private browsing — a reload starts at the top */
  }
});

function restore() {
  const p = pane();
  const top = offsets.get(entry() ?? -1);
  if (p && top && !location.hash && paneScrolls()) p.scrollTop = top;
}

// Back and forward: restored in the swap, before the new page is shown.
let traversing = false;
document.addEventListener("astro:before-preparation", (e) => {
  traversing = (e as Event & { navigationType?: string }).navigationType === "traverse";
});
document.addEventListener("astro:after-swap", () => {
  if (traversing) restore();
});

function syncPane() {
  const p = pane();
  if (!p || !paneScrolls()) return;
  // The sticky outline is as tall as the pane's view, not the viewport's.
  document.documentElement.style.setProperty("--pane-h", `${p.clientHeight}px`);
  if (document.activeElement === document.body || !document.activeElement) p.focus({ preventScroll: true });
}
addEventListener("resize", () => {
  const p = pane();
  if (p && paneScrolls()) document.documentElement.style.setProperty("--pane-h", `${p.clientHeight}px`);
});

function sync() {
  syncTitlebar();
  syncKeycap();
  wireDrawer();
  setDrawer(false); // a navigation always closes the drawer
  syncPane();
}

document.addEventListener("astro:page-load", sync);
sync();

// A reload, or a return to a page the browser didn't keep.
const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
if (nav && nav.type !== "navigate") restore();
