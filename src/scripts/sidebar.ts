/**
 * The sidebar persists across navigation, so active state, search and
 * which folders are open are synced here rather than re-rendered.
 *
 * A series is a folder. Its open state lives on the persisted DOM, so it
 * lasts the visit; a folder holding the page you're on opens itself.
 */

/** Do the query's characters appear in order? `revprox` matches the post. */
function subsequence(needle: string, hay: string): boolean {
  let i = 0;
  for (const ch of hay) if (ch === needle[i]) i += 1;
  return i === needle.length;
}

/**
 * What a row is matched on: its URL's last segment — "tailscale-explained"
 * — so the fuzzy subsequence match runs over a short slug rather than a
 * whole title, where "derp" matched twenty posts. Titles are matched as
 * plain substrings, separately.
 */
function nameOf(row: HTMLElement): string {
  const a = row.querySelector("a");
  if (!a) return "";
  return new URL(a.href).pathname.replace(/\/+$/, "").split("/").pop()!.toLowerCase();
}

/** Open or close a folder: its label, and every file it holds. */
function setFolded(label: HTMLElement, folded: boolean) {
  const key = label.dataset.foldKey;
  label.toggleAttribute("data-folded", folded);
  label.querySelector("[data-fold-toggle]")?.setAttribute("aria-expanded", String(!folded));
  document.querySelectorAll<HTMLElement>(`#sidebar .row[data-fold="${CSS.escape(key ?? "")}"]`)
    .forEach((r) => r.toggleAttribute("data-folded", folded));
}

function wireFolders() {
  for (const btn of document.querySelectorAll<HTMLButtonElement>("#sidebar [data-fold-toggle]")) {
    if (btn.dataset.wired) continue;
    btn.dataset.wired = "1";
    const label = btn.closest<HTMLElement>(".runlabel")!;
    btn.addEventListener("click", () => setFolded(label, !label.hasAttribute("data-folded")));
  }
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

  // The page you're on is never inside a closed folder.
  const current = document.querySelector<HTMLElement>("#sidebar .row[data-active][data-folded]");
  const folder = current && document.querySelector<HTMLElement>(
    `#sidebar .runlabel[data-fold-key="${CSS.escape(current.dataset.fold ?? "")}"]`
  );
  if (folder) setFolded(folder, false);

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

/*
 * Search inside the files. A build runs Pagefind over dist/ and writes a
 * static index to /pagefind/; it's loaded the first time the search box
 * is focused, and never under `astro dev`, where there's no index — the
 * filename filter above works the same either way.
 */
export interface PagefindHit {
  url: string;
  excerpt: string;
  meta: { title?: string };
  sub_results?: { title: string; url: string; excerpt: string; locations?: number[] }[];
}
export interface Pagefind {
  options(o: object): Promise<void>;
  init(): Promise<void>;
  debouncedSearch(q: string, o?: object, ms?: number): Promise<{ results: { data(): Promise<PagefindHit> }[] } | null>;
}
let pagefind: Promise<Pagefind | null> | null = null;
export function loadPagefind(): Promise<Pagefind | null> {
  if (import.meta.env.DEV) return Promise.resolve(null);
  pagefind ??= (async () => {
    try {
      const url = "/pagefind/pagefind.js";
      const pf = (await import(/* @vite-ignore */ url)) as Pagefind;
      await pf.options({ excerptLength: 16 });
      await pf.init();
      return pf;
    } catch {
      return null;
    }
  })();
  return pagefind;
}

const MAX_HITS = 5;

/** The file's row in the tree, for its name and its color. */
function rowFor(url: string): HTMLElement | null {
  const path = new URL(url, location.href).pathname.replace(/\/+$/, "");
  const link = [...document.querySelectorAll<HTMLAnchorElement>("#sidebar .row a[data-nav]")].find(
    (a) => new URL(a.href).pathname.replace(/\/+$/, "") === path
  );
  return link?.closest<HTMLElement>(".row") ?? null;
}

function renderHit(hit: PagefindHit): HTMLLIElement {
  // The section with the most matches is where the link lands.
  const best = [...(hit.sub_results ?? [])].sort(
    (a, b) => (b.locations?.length ?? 0) - (a.locations?.length ?? 0)
  )[0];
  const row = rowFor(hit.url);

  const li = document.createElement("li");
  li.className = "hit";
  const a = document.createElement("a");
  a.href = best?.url ?? hit.url;

  const dot = document.createElement("span");
  dot.className = "dot";
  dot.setAttribute("aria-hidden", "true");
  const hue = row?.style.getPropertyValue("--h");
  if (hue) dot.style.setProperty("--h", hue);
  else dot.dataset.plain = "";

  const file = document.createElement("span");
  file.className = "file";
  file.textContent = row?.dataset.title ?? hit.meta.title ?? hit.url;
  // Under which heading, when the hit isn't in the page's opening lines.
  if (best && best.url.includes("#")) {
    const where = document.createElement("span");
    where.className = "where";
    where.textContent = ` › ${best.title}`;
    file.append(where);
  }

  // Pagefind's excerpt is the site's own text with <mark> around the
  // match; it's built from this site's pages, so it's set as HTML.
  const excerpt = document.createElement("span");
  excerpt.className = "excerpt";
  excerpt.innerHTML = best?.excerpt ?? hit.excerpt;

  a.append(dot, file, excerpt);
  li.append(a);
  return li;
}

function clearHits() {
  const box = document.querySelector<HTMLElement>("[data-hits]");
  if (!box) return;
  box.hidden = true;
  box.querySelector("[data-hits-list]")?.replaceChildren();
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
    const sections = [...document.querySelectorAll<HTMLElement>("#sidebar .sect:not(.hits)")];
    tree?.toggleAttribute("data-searching", q !== "");
    // A section's count says how many of its files are showing, as the
    // "in files" count does for hits; the full count comes back on clear.
    const counts = sections.map((s) => s.querySelector<HTMLElement>(".count"));
    for (const c of counts) if (c && !c.dataset.total) c.dataset.total = c.textContent ?? "";

    if (!q) {
      for (const r of rows) r.hidden = false;
      for (const r of runs) r.hidden = false;
      for (const s of sections) s.hidden = false;
      for (const c of counts) if (c) c.textContent = c.dataset.total ?? "";
      if (empty) empty.hidden = true;
      clearHits();
      return;
    }

    let hits = 0;
    for (const row of rows) {
      const label = nameOf(row);
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
    sections.forEach((s, i) => {
      const shown = [...s.querySelectorAll<HTMLElement>(".row")].filter((r) => !r.hidden).length;
      s.hidden = shown === 0;
      if (counts[i]) counts[i]!.textContent = String(shown);
    });
    if (empty) empty.hidden = hits > 0;
    void searchText(q, hits);
  };

  const searchText = async (q: string, fileHits: number) => {
    const box = document.querySelector<HTMLElement>("[data-hits]");
    const list = box?.querySelector<HTMLElement>("[data-hits-list]");
    const count = box?.querySelector<HTMLElement>("[data-hits-count]");
    if (!box || !list || q.length < 2) return clearHits();
    const pf = await loadPagefind();
    if (!pf) return;
    const found = await pf.debouncedSearch(q, {}, 180);
    // null: a newer keystroke replaced this search.
    if (!found || input.value.trim().toLowerCase() !== q) return;
    const data = await Promise.all(found.results.slice(0, MAX_HITS).map((r) => r.data()));
    if (input.value.trim().toLowerCase() !== q) return;
    list.replaceChildren(...data.map(renderHit));
    if (count) count.textContent = String(found.results.length);
    box.hidden = data.length === 0;
    if (empty) empty.hidden = fileHits > 0 || data.length > 0;
  };

  // Load the index on the way in, so the first keystroke doesn't wait.
  input.addEventListener("focus", () => void loadPagefind(), { once: true });

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
      const label = nameOf;
      const title = (r: HTMLElement) => (r.dataset.title ?? "").toLowerCase();
      // A filename hit beats a title hit, or "sso" opens the wrong file.
      const best =
        rows.find((r) => label(r).startsWith(q)) ??
        rows.find((r) => label(r).includes(q)) ??
        rows.find((r) => title(r).includes(q)) ??
        rows[0];
      // No file by that name: the best hit inside one.
      const link =
        best?.querySelector<HTMLAnchorElement>("a") ??
        document.querySelector<HTMLAnchorElement>("[data-hits]:not([hidden]) .hit a");
      link?.click();
    }
  });
}

function sync() {
  wireSearch();
  wireFolders();
  const input = document.querySelector<HTMLInputElement>("[data-search]");
  if (input) input.value = "";
  document.querySelectorAll<HTMLElement>("#sidebar .row, #sidebar .runlabel, #sidebar .sect:not(.hits)")
    .forEach((r) => (r.hidden = false));
  document.querySelectorAll<HTMLElement>("#sidebar .sect:not(.hits) .count[data-total]")
    .forEach((c) => (c.textContent = c.dataset.total ?? ""));
  document.querySelector("[data-tree]")?.removeAttribute("data-searching");
  const empty = document.querySelector<HTMLElement>("[data-empty]");
  if (empty) empty.hidden = true;
  clearHits();
  syncActive();
}

document.addEventListener("astro:page-load", sync);
sync();
