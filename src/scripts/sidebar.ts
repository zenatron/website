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

/**
 * A row's name as it's shown — "tailscale-explained.mdx" — without the
 * screen-reader title inside the link, which made the fuzzy match run
 * across a whole sentence: "derp" matched twenty files.
 */
function nameOf(row: HTMLElement): string {
  const a = row.querySelector("a");
  if (!a) return "";
  return [...a.childNodes]
    .filter((n) => !(n instanceof HTMLElement && n.classList.contains("sr-only")))
    .map((n) => n.textContent)
    .join("")
    .toLowerCase();
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

/*
 * Search inside the files. A build runs Pagefind over dist/ and writes a
 * static index to /pagefind/; it's loaded the first time the search box
 * is focused, and never under `astro dev`, where there's no index — the
 * filename filter above works the same either way.
 */
interface PagefindHit {
  url: string;
  excerpt: string;
  meta: { title?: string };
  sub_results?: { title: string; url: string; excerpt: string; locations?: number[] }[];
}
interface Pagefind {
  options(o: object): Promise<void>;
  init(): Promise<void>;
  debouncedSearch(q: string, o?: object, ms?: number): Promise<{ results: { data(): Promise<PagefindHit> }[] } | null>;
}
let pagefind: Promise<Pagefind | null> | null = null;
function loadPagefind(): Promise<Pagefind | null> {
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
  const stem = row?.querySelector("a")?.firstChild?.textContent;
  if (stem) {
    file.append(stem);
    const ext = document.createElement("span");
    ext.className = "ext";
    ext.textContent = ".mdx";
    file.append(ext);
  } else {
    file.textContent = hit.meta.title ?? hit.url;
  }
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

    if (!q) {
      for (const r of rows) r.hidden = false;
      for (const r of runs) r.hidden = false;
      for (const s of sections) s.hidden = false;
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
    for (const s of sections) {
      s.hidden = ![...s.querySelectorAll<HTMLElement>(".row")].some((r) => !r.hidden);
    }
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
  const input = document.querySelector<HTMLInputElement>("[data-search]");
  if (input) input.value = "";
  document.querySelectorAll<HTMLElement>("#sidebar .row, #sidebar .runlabel, #sidebar .sect:not(.hits)")
    .forEach((r) => (r.hidden = false));
  document.querySelector("[data-tree]")?.removeAttribute("data-searching");
  const empty = document.querySelector<HTMLElement>("[data-empty]");
  if (empty) empty.hidden = true;
  clearHits();
  syncActive();
}

document.addEventListener("astro:page-load", sync);
sync();
