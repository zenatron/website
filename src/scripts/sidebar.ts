/**
 * The sidebar persists across navigation, so active state, expansion and
 * the filter are synced here rather than re-rendered.
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
    // The "N more" row points at the index too; the folder row owns that state.
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

/* ── search ──────────────────────────────────────────────────── */

/** Do the query's characters appear in order? `revprox` matches the post. */
function subsequence(needle: string, hay: string): boolean {
  let i = 0;
  for (const ch of hay) if (ch === needle[i]) i += 1;
  return i === needle.length;
}

function wireMore() {
  document.querySelectorAll<HTMLButtonElement>("[data-more]").forEach((btn) => {
    if (btn.dataset.wired) return;
    btn.dataset.wired = "1";
    const group = document.querySelector<HTMLElement>(`[data-group="${btn.dataset.more}"]`);
    const label = btn.querySelector<HTMLElement>("[data-more-label]");
    const original = label?.textContent ?? "";
    btn.addEventListener("click", () => {
      const showingAll = group?.dataset.all === "true";
      if (group) group.dataset.all = String(!showingAll);
      btn.setAttribute("aria-expanded", String(!showingAll));
      if (label) label.textContent = showingAll ? original : "fewer";
    });
  });
}

function wireSearch() {
  const input = document.querySelector<HTMLInputElement>("[data-search]");
  const empty = document.querySelector<HTMLElement>("[data-empty]");
  if (!input || input.dataset.wired) return;
  input.dataset.wired = "1";

  const apply = () => {
    const q = input.value.trim().toLowerCase();
    const rows = [...document.querySelectorAll<HTMLElement>("#sidebar .row")];

    if (!q) {
      for (const r of rows) r.hidden = false;
      document.querySelectorAll<HTMLElement>("[data-group]").forEach((g) => {
        delete g.dataset.searching;
      });
      // Restore whatever was expanded before the search forced them open.
      syncActive();
      if (empty) empty.hidden = true;
      return;
    }

    let hits = 0;
    for (const row of rows) {
      const label = row.querySelector("a")?.textContent?.toLowerCase() ?? "";
      // The "N more" row is a control, not a file; never match it.
      const match = !row.classList.contains("more") &&
        (label.includes(q) || subsequence(q, label));
      row.hidden = !match;
      if (match) hits += 1;
    }
    // While searching, every folder is open and unfolded so that matches
    // past the display cap are reachable.
    document.querySelectorAll<HTMLElement>("[data-group]").forEach((g) => {
      g.dataset.open = "true";
      g.dataset.searching = "true";
    });
    if (empty) empty.hidden = hits > 0;
  };

  input.addEventListener("input", apply);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      input.value = "";
      apply();
    }
    if (e.key === "Enter") {
      const q = input.value.trim().toLowerCase();
      const rows = [...document.querySelectorAll<HTMLElement>("#sidebar .row")]
        .filter((r) => !r.hidden && !r.classList.contains("more"));
      const label = (r: HTMLElement) => r.querySelector("a")?.textContent?.toLowerCase() ?? "";
      // A substring hit beats a subsequence hit, or "sso" opens
      // projects-system-documentation instead of the SSO post.
      const best =
        rows.find((r) => label(r).startsWith(q)) ??
        rows.find((r) => label(r).includes(q)) ??
        rows[0];
      best?.querySelector<HTMLAnchorElement>("a")?.click();
    }
  });
}

function sync() {
  wireTwisties();
  wireMore();
  wireSearch();
  const input = document.querySelector<HTMLInputElement>("[data-search]");
  if (input) input.value = "";
  document.querySelectorAll<HTMLElement>("#sidebar .row").forEach((r) => (r.hidden = false));
  const empty = document.querySelector<HTMLElement>("[data-empty]");
  if (empty) empty.hidden = true;
  syncActive();
}

document.addEventListener("astro:page-load", sync);
sync();
