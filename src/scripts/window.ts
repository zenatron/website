/**
 * The traffic lights, working.
 *
 *   close    closes the tab you're on, like ⌘W in an editor
 *   minimize puts the explorer away (or opens the drawer, when the
 *            explorer is a drawer)
 *   zoom     lets the window fill the screen instead of stopping at
 *            --w-content
 *
 * Minimize and zoom are preferences, so they persist, and the inline
 * script in Shell restores them before first paint and after every swap —
 * the same way the theme is restored, and for the same reason.
 */

const PREFS = { rail: "window-rail", zoom: "window-zoom" } as const;

function load(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function save(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* private browsing — the choice just won't outlive the tab */
  }
}

const root = document.documentElement;
const drawerMode = () => window.matchMedia("(max-width: 900px)").matches;

function sync() {
  const hidden = root.dataset.rail === "hidden";
  const zoomed = root.dataset.zoom === "full";
  const rail = document.querySelector<HTMLButtonElement>('[data-light="rail"]');
  const zoom = document.querySelector<HTMLButtonElement>('[data-light="zoom"]');
  if (rail) {
    const label = hidden ? "Show sidebar" : "Hide sidebar";
    rail.setAttribute("aria-pressed", String(hidden));
    rail.setAttribute("aria-label", label);
    rail.title = label;
  }
  if (zoom) {
    const label = zoomed ? "Restore window size" : "Zoom window";
    zoom.setAttribute("aria-pressed", String(zoomed));
    zoom.setAttribute("aria-label", label);
    zoom.title = zoomed ? "Restore" : "Zoom";
  }
}

function toggle(attr: "rail" | "zoom", on: string) {
  const next = root.dataset[attr] === on ? null : on;
  if (next) root.dataset[attr] = next;
  else delete root.dataset[attr];
  save(PREFS[attr], next);
  sync();
}

function wire() {
  for (const btn of document.querySelectorAll<HTMLButtonElement>("[data-light]")) {
    if (btn.dataset.wired) continue;
    btn.dataset.wired = "1";
    btn.addEventListener("click", () => {
      const kind = btn.dataset.light;
      if (kind === "close") {
        document.dispatchEvent(new CustomEvent("tabs:close-current"));
      } else if (kind === "rail") {
        // When the explorer is a drawer, minimize is the drawer's toggle.
        if (drawerMode()) document.querySelector<HTMLButtonElement>(".drawer-toggle")?.click();
        else toggle("rail", "hidden");
      } else if (kind === "zoom") {
        toggle("zoom", "full");
      }
    });
  }
  sync();
}

document.addEventListener("astro:page-load", wire);
wire();
