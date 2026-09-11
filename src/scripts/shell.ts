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

function sync() {
  syncTitlebar();
  syncKeycap();
  wireDrawer();
  setDrawer(false); // a navigation always closes the drawer
}

document.addEventListener("astro:page-load", sync);
sync();
