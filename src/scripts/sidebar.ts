/**
 * The sidebar persists across navigation, so active state and expansion
 * are synced here rather than re-rendered.
 *
 * Expansion is remembered for the session: someone reading a post should
 * find `blog` still open on the next one.
 */

const KEY = "sidebar-expanded";

function readExpanded(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

function writeExpanded(set: Set<string>) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    /* private browsing — expansion just won't persist */
  }
}

function applyExpanded(set: Set<string>) {
  document.querySelectorAll<HTMLElement>("[data-group]").forEach((group) => {
    const name = group.dataset.group!;
    const open = set.has(name);
    group.dataset.open = String(open);
    document
      .querySelector(`[data-twisty="${name}"]`)
      ?.setAttribute("aria-expanded", String(open));
  });
}

function syncActive() {
  const here = location.pathname.replace(/\/+$/, "") || "/";
  let activeFolder: string | null = null;

  document.querySelectorAll<HTMLAnchorElement>("#sidebar a[data-nav]").forEach((a) => {
    const href = new URL(a.href).pathname.replace(/\/+$/, "") || "/";
    const row = a.closest<HTMLElement>(".row");
    if (!row) return;
    // The `…` row links to the index as well; the folder row owns that state.
    const isActive = href === here && !row.classList.contains("more");
    row.toggleAttribute("data-active", isActive);
    if (isActive) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
    if (isActive) {
      const group = a.closest<HTMLElement>("[data-group]");
      if (group) activeFolder = group.dataset.group!;
    }
  });

  // Opening the folder that contains the current route is not a preference,
  // so it is applied on top of the stored set rather than written into it.
  const expanded = readExpanded();
  const seg = here.split("/")[1];
  if (activeFolder) expanded.add(activeFolder);
  else if (seg && document.querySelector(`[data-group="${seg}"]`)) expanded.add(seg);
  applyExpanded(expanded);
}

function wireTwisties() {
  document.querySelectorAll<HTMLButtonElement>("[data-twisty]").forEach((btn) => {
    if (btn.dataset.wired) return;
    btn.dataset.wired = "1";
    btn.addEventListener("click", () => {
      const name = btn.dataset.twisty!;
      const expanded = readExpanded();
      const open = btn.getAttribute("aria-expanded") !== "true";
      if (open) expanded.add(name);
      else expanded.delete(name);
      writeExpanded(expanded);
      applyExpanded(expanded);
    });
  });
}

function sync() {
  wireTwisties();
  syncActive();
}

document.addEventListener("astro:page-load", sync);
sync();
