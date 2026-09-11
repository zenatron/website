/**
 * The explorer persists across navigation, so active state and search are
 * synced here rather than re-rendered.
 *
 * There is no expansion state any more — the tree is two levels and
 * always open, which is what "too much nesting" was really about.
 */

/** Do the query's characters appear in order? `revprox` matches the post. */
function subsequence(needle: string, hay: string): boolean {
  let i = 0;
  for (const ch of hay) if (ch === needle[i]) i += 1;
  return i === needle.length;
}

function syncActive() {
  const here = location.pathname.replace(/\/+$/, "") || "/";

  document.querySelectorAll<HTMLAnchorElement>("#sidebar a[data-nav]").forEach((a) => {
    const href = new URL(a.href).pathname.replace(/\/+$/, "") || "/";
    const row = a.closest<HTMLElement>(".row");
    const isActive = href === here;
    if (row) row.toggleAttribute("data-active", isActive);
    if (isActive) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });

  // Keep the current file in view. The tree is its own scroller, and
  // scrollIntoView would scroll the page along with it.
  const active = document.querySelector<HTMLElement>("#sidebar .row[data-active]");
  const tree = document.querySelector<HTMLElement>("[data-tree]");
  if (active && tree) {
    const a = active.getBoundingClientRect();
    const t = tree.getBoundingClientRect();
    if (a.top < t.top || a.bottom > t.bottom) {
      tree.scrollTop += a.top - t.top - (t.height - a.height) / 2;
    }
  }
}

function wireSearch() {
  const input = document.querySelector<HTMLInputElement>("[data-search]");
  const empty = document.querySelector<HTMLElement>("[data-empty]");
  const tree = document.querySelector<HTMLElement>("[data-tree]");
  if (!input || input.dataset.wired) return;
  input.dataset.wired = "1";

  const apply = () => {
    const q = input.value.trim().toLowerCase();
    const rows = [...document.querySelectorAll<HTMLElement>("#sidebar .row")];
    const runs = [...document.querySelectorAll<HTMLElement>("#sidebar .runlabel")];
    const sections = [...document.querySelectorAll<HTMLElement>("#sidebar .sect")];
    tree?.toggleAttribute("data-searching", q !== "");

    if (!q) {
      for (const r of rows) r.hidden = false;
      for (const r of runs) r.hidden = false;
      for (const s of sections) s.hidden = false;
      if (empty) empty.hidden = true;
      return;
    }

    let hits = 0;
    for (const row of rows) {
      const label = row.querySelector("a")?.textContent?.toLowerCase() ?? "";
      // Match the post's title too: someone searching "caddy" means the
      // reverse-proxy post, whose filename never says so.
      const title = (row.dataset.title ?? "").toLowerCase();
      const match = label.includes(q) || title.includes(q) || subsequence(q, label);
      row.hidden = !match;
      if (match) hits += 1;
    }
    // Run labels only make sense next to their run.
    for (const run of runs) {
      run.hidden = !rows.some((r) => !r.hidden && r.dataset.run === run.dataset.run);
    }
    // And a section with nothing left in it is just a stray heading.
    for (const s of sections) {
      s.hidden = ![...s.querySelectorAll<HTMLElement>(".row")].some((r) => !r.hidden);
    }
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
      const rows = [...document.querySelectorAll<HTMLElement>("#sidebar .row")].filter((r) => !r.hidden);
      const label = (r: HTMLElement) => r.querySelector("a")?.textContent?.toLowerCase() ?? "";
      const title = (r: HTMLElement) => (r.dataset.title ?? "").toLowerCase();
      // A filename hit beats a title hit, or "sso" opens the wrong file.
      const best =
        rows.find((r) => label(r).startsWith(q)) ??
        rows.find((r) => label(r).includes(q)) ??
        rows.find((r) => title(r).includes(q)) ??
        rows[0];
      best?.querySelector<HTMLAnchorElement>("a")?.click();
    }
  });
}

function sync() {
  wireSearch();
  const input = document.querySelector<HTMLInputElement>("[data-search]");
  if (input) input.value = "";
  document.querySelectorAll<HTMLElement>("#sidebar .row, #sidebar .runlabel, #sidebar .sect")
    .forEach((r) => (r.hidden = false));
  document.querySelector("[data-tree]")?.removeAttribute("data-searching");
  const empty = document.querySelector<HTMLElement>("[data-empty]");
  if (empty) empty.hidden = true;
  syncActive();
}

document.addEventListener("astro:page-load", sync);
sync();
