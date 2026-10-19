/**
 * The menu bar's menus, behaving like a menu bar's.
 *
 * Each menu is a <details>, so opening and closing already work without
 * this. What's added: only one is open at a time; once one is open,
 * pointing at another title opens that one instead, the way you slide
 * along a macOS menu bar; a click outside, Escape, choosing an item or a
 * navigation closes them. View and Window items drive the same switches
 * the traffic lights do, so the two can't disagree.
 */

const menus = () => [...document.querySelectorAll<HTMLDetailsElement>("[data-menu]")];
const closeAll = (except?: HTMLDetailsElement) => {
  for (const m of menus()) if (m !== except) m.open = false;
};
const anyOpen = () => menus().some((m) => m.open);

/** The View items say what they'll do now, as macOS relabels them. */
function relabel() {
  const root = document.documentElement;
  const rail = document.querySelector<HTMLElement>('[data-menu-action="rail"]');
  const zoom = document.querySelector<HTMLElement>('[data-menu-action="zoom"]');
  if (rail) rail.textContent = root.dataset.rail === "hidden" ? "Show Sidebar" : "Hide Sidebar";
  if (zoom) zoom.textContent = root.dataset.zoom === "full" ? "Exit Zoom" : "Zoom";
}

function act(action: string) {
  switch (action) {
    case "rail":
    case "zoom":
      document.querySelector<HTMLButtonElement>(`[data-light="${action}"]`)?.click();
      break;
    case "close-tab":
      document.dispatchEvent(new CustomEvent("tabs:close-current"));
      break;
    case "search": {
      // Where the sidebar is a drawer, open it first.
      const toggle = document.querySelector<HTMLButtonElement>(".drawer-toggle");
      if (toggle && getComputedStyle(toggle).display !== "none" && toggle.getAttribute("aria-expanded") !== "true") {
        toggle.click();
      }
      if (document.documentElement.dataset.rail === "hidden") {
        document.querySelector<HTMLButtonElement>('[data-light="rail"]')?.click();
      }
      document.querySelector<HTMLInputElement>("[data-search]")?.focus();
      break;
    }
  }
}

function wire() {
  const bar = document.querySelector<HTMLElement>("[data-menubar]");
  if (!bar || bar.dataset.wired) return;
  bar.dataset.wired = "1";

  for (const menu of menus()) {
    menu.addEventListener("toggle", () => {
      if (menu.open) {
        closeAll(menu);
        relabel();
      }
    });
    const summary = menu.querySelector("summary")!;
    summary.addEventListener("pointerenter", () => {
      if (!menu.open && anyOpen()) {
        closeAll(menu);
        menu.open = true;
      }
    });
  }

  // Choosing anything in a menu closes it.
  bar.addEventListener("click", (e) => {
    const item = (e.target as Element).closest<HTMLElement>(".drop a, .drop button");
    if (!item) return;
    const action = item.dataset.menuAction;
    closeAll();
    if (action) act(action);
  });
}

document.addEventListener("pointerdown", (e) => {
  if (!(e.target as Element).closest("[data-menubar]")) closeAll();
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || !anyOpen()) return;
  const open = menus().find((m) => m.open);
  closeAll();
  open?.querySelector("summary")?.focus();
});
document.addEventListener("astro:before-swap", () => closeAll());
document.addEventListener("astro:page-load", wire);
wire();
