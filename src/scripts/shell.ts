/**
 * The shell's chrome persists across navigation, so it never re-renders.
 * Anything route-dependent in it is re-synced here on astro:page-load.
 */

const USER_HOST = "phil@pvish";

/** `~`, `~/blog`, `~/blog/reverse-proxy-homelab` */
function tildePath(pathname: string): string {
  const clean = pathname.replace(/\/+$/, "");
  return clean === "" ? "~" : `~${clean}`;
}

function syncTitlebar() {
  const el = document.querySelector<HTMLElement>("[data-titlebar-path]");
  if (!el) return;
  const path = tildePath(location.pathname);
  // Below 640px only the tail is shown, so the filename survives instead of
  // the prefix. Done by swapping text rather than with `direction: rtl`,
  // which scrambles the bidi ordering of the em dash.
  const narrow = window.matchMedia("(max-width: 640px)").matches;
  el.textContent = narrow ? path : `${USER_HOST} — ${path}`;
  el.dataset.path = path;
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
}

function wireDrawer() {
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
window.addEventListener("resize", syncTitlebar);
sync();
