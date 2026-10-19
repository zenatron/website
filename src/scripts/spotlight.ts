/**
 * Spotlight's brain.
 *
 * Opens on ⌘K / Ctrl K from anywhere, on the menu bar's magnifier, and on
 * Help › Search. What it can find is gathered from the sidebar each time
 * it opens — every place, project and post, with the sidebar's own icons
 * — plus a handful of commands, and on a built site the text of the posts
 * through the same Pagefind index the sidebar's search uses.
 *
 * Matching is by title, ranked the way Spotlight ranks: a title that
 * starts with the query, then one with a word that does, then anywhere
 * in it, then the letters in order through the slug.
 */
import { navigate } from "astro:transitions/client";
import { loadPagefind, type PagefindHit } from "@/scripts/sidebar";

interface Entry {
  title: string;
  kind: string;
  /** Where it goes, or what it does. */
  href?: string;
  run?: () => void;
  slug: string;
  icon?: Node;
  sub?: string;
  html?: boolean;
}

const MAX = 8;
const MAX_TEXT = 4;

const dialog = () => document.querySelector<HTMLDialogElement>("[data-spotlight]");

function glyph(path: string): SVGElement {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("width", "18");
  svg.setAttribute("height", "18");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.4");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  const p = document.createElementNS(ns, "path");
  p.setAttribute("d", path);
  svg.append(p);
  return svg;
}

/** Everything findable, read from the sidebar so the two can't disagree. */
function gather(): Entry[] {
  const out: Entry[] = [];
  const home = document.querySelector<HTMLImageElement>("#sidebar .me img");
  out.push({ title: "Home", kind: "Page", href: "/", slug: "home", icon: home?.cloneNode(true) });

  for (const a of document.querySelectorAll<HTMLAnchorElement>("#sidebar .row a[data-nav]")) {
    const row = a.closest<HTMLElement>(".row")!;
    const art = row.querySelector(".tile, .ficon");
    const icon = document.createElement("span");
    icon.className = "sp-art";
    icon.style.cssText = "display:block;width:100%;height:100%";
    if (art) icon.append(...[...art.childNodes].map((n) => n.cloneNode(true)));
    const section = row.closest(".sect")?.querySelector(".sectlabel a")?.textContent?.trim();
    const path = new URL(a.href).pathname;
    out.push({
      title: row.dataset.title ?? a.textContent!.trim(),
      kind: section === "Projects" ? "Project" : section === "Writing" ? "Post" : "Page",
      href: path,
      slug: path.replace(/\/+$/, "").split("/").pop()!.toLowerCase(),
      icon,
    });
  }
  out.push(
    { title: "Projects", kind: "Folder", href: "/projects/", slug: "projects", icon: glyph("M1.8 4.6A1.3 1.3 0 0 1 3.1 3.3h3.1l1.4 1.5h5.3a1.3 1.3 0 0 1 1.3 1.3v5.8a1.3 1.3 0 0 1-1.3 1.3H3.1a1.3 1.3 0 0 1-1.3-1.3z") },
    { title: "Writing", kind: "Folder", href: "/blog/", slug: "blog writing posts", icon: glyph("M1.8 4.6A1.3 1.3 0 0 1 3.1 3.3h3.1l1.4 1.5h5.3a1.3 1.3 0 0 1 1.3 1.3v5.8a1.3 1.3 0 0 1-1.3 1.3H3.1a1.3 1.3 0 0 1-1.3-1.3z") },
  );

  const click = (sel: string) => () => document.querySelector<HTMLElement>(sel)?.click();
  const cmd = (title: string, path: string, run: () => void, slug = title.toLowerCase()): Entry =>
    ({ title, kind: "Command", run, slug, icon: glyph(path) });
  out.push(
    cmd("Change Appearance", "M8 2v12a6 6 0 0 1 0-12Zm0 0a6 6 0 0 1 0 12", click("[data-theme-toggle]"), "theme dark light mode appearance"),
    cmd("Toggle Sidebar", "M2.5 3.5h11v9h-11zM6 3.5v9", click('[data-light="rail"]'), "sidebar hide show"),
    cmd("Zoom Window", "M6 2.5H2.5V6M10 2.5h3.5V6M6 13.5H2.5V10M10 13.5h3.5V10", click('[data-light="zoom"]'), "zoom full width window"),
    cmd("Open Résumé", "M4 1.8h5.2L12.5 5v8.2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2.8a1 1 0 0 1 1-1z", () => { location.href = document.querySelector<HTMLAnchorElement>(".resume")?.href ?? "/"; }, "resume cv pdf"),
    cmd("Email Phil", "M2 3.5h12v9H2zM2.6 4.4 8 8.6l5.4-4.2", () => { location.href = document.querySelector<HTMLAnchorElement>('.socials a[href^="mailto:"]')?.href ?? "/say-hi/"; }, "email contact mail"),
  );
  return out;
}

function score(e: Entry, q: string): number {
  const t = e.title.toLowerCase();
  if (t.startsWith(q)) return 100 - t.length / 100;
  if (t.split(/[\s:—–-]+/).some((w) => w.startsWith(q))) return 80;
  if (t.includes(q)) return 60;
  if (e.slug.includes(q)) return 50;
  let i = 0;
  for (const ch of e.slug) if (ch === q[i]) i += 1;
  return i === q.length ? 30 : 0;
}

let entries: Entry[] = [];
let shown: Entry[] = [];
let selected = 0;

function row(e: Entry, i: number): HTMLElement {
  const el = document.createElement("div");
  el.className = "sp-row";
  el.id = `sp-${i}`;
  el.setAttribute("role", "option");
  el.setAttribute("aria-selected", String(i === selected));
  const icon = document.createElement("span");
  icon.className = "sp-icon";
  if (e.icon) icon.append(e.icon.cloneNode(true));
  const text = document.createElement("span");
  text.className = "sp-text";
  const title = document.createElement("span");
  title.className = "sp-title";
  title.textContent = e.title;
  text.append(title);
  if (e.sub) {
    const sub = document.createElement("span");
    sub.className = "sp-sub";
    // Pagefind's excerpt: this site's own text with <mark> round the hit.
    if (e.html) sub.innerHTML = e.sub;
    else sub.textContent = e.sub;
    text.append(sub);
  }
  const kind = document.createElement("span");
  kind.className = "sp-kind";
  kind.textContent = e.kind;
  el.append(icon, text, kind);
  el.addEventListener("pointermove", () => select(i));
  el.addEventListener("click", () => choose(i));
  return el;
}

function render(groups: { head: string; items: Entry[] }[]) {
  const box = document.querySelector<HTMLElement>("[data-spotlight-results]")!;
  shown = groups.flatMap((g) => g.items);
  if (selected >= shown.length) selected = 0;
  const nodes: HTMLElement[] = [];
  let i = 0;
  for (const g of groups) {
    if (!g.items.length) continue;
    const h = document.createElement("div");
    h.className = "sp-head";
    h.textContent = g.head;
    nodes.push(h);
    for (const e of g.items) nodes.push(row(e, i++));
  }
  const q = document.querySelector<HTMLInputElement>("[data-spotlight-input]")!.value.trim();
  if (!nodes.length && q) {
    const empty = document.createElement("p");
    empty.className = "sp-empty";
    empty.textContent = `No results for “${q}”`;
    nodes.push(empty);
  }
  box.replaceChildren(...nodes);
  syncActive();
}

function syncActive() {
  const input = document.querySelector<HTMLInputElement>("[data-spotlight-input]");
  document.querySelectorAll<HTMLElement>(".sp-row").forEach((r, i) => r.setAttribute("aria-selected", String(i === selected)));
  if (shown.length) input?.setAttribute("aria-activedescendant", `sp-${selected}`);
  else input?.removeAttribute("aria-activedescendant");
  document.getElementById(`sp-${selected}`)?.scrollIntoView({ block: "nearest" });
}

function select(i: number) {
  if (i === selected) return;
  selected = i;
  syncActive();
}

function choose(i: number) {
  const e = shown[i];
  if (!e) return;
  dialog()?.close();
  if (e.run) e.run();
  else if (e.href) navigate(e.href);
}

let seq = 0;
async function search(raw: string) {
  const q = raw.trim().toLowerCase();
  const mine = ++seq;
  selected = 0;
  if (!q) {
    // Nothing typed: what's open, then where to start.
    let open: { href: string }[] = [];
    try { open = JSON.parse(sessionStorage.getItem("open-tabs") ?? "[]"); } catch { /* none */ }
    const recent = open
      .map((t) => entries.find((e) => e.href && (e.href.replace(/\/+$/, "") || "/") === t.href))
      .filter((e): e is Entry => Boolean(e))
      .reverse()
      .slice(0, 5);
    const places = entries.filter((e) => e.kind === "Page" || e.kind === "Folder").filter((e) => !recent.includes(e));
    return render([{ head: "Open in tabs", items: recent }, { head: "Places", items: places }]);
  }

  const ranked = entries
    .map((e) => ({ e, s: score(e, q) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, MAX)
    .map((r) => r.e);
  const top = ranked.slice(0, 1);
  const rest = ranked.slice(1);
  render([
    { head: "Top Hit", items: top },
    { head: "Projects", items: rest.filter((e) => e.kind === "Project") },
    { head: "Writing", items: rest.filter((e) => e.kind === "Post") },
    { head: "Places", items: rest.filter((e) => e.kind === "Page" || e.kind === "Folder") },
    { head: "Commands", items: rest.filter((e) => e.kind === "Command") },
  ]);

  // Then the words inside the posts, when there's an index to ask.
  if (q.length < 2) return;
  const pf = await loadPagefind();
  if (!pf || mine !== seq) return;
  const found = await pf.debouncedSearch(q, {}, 160);
  if (!found || mine !== seq) return;
  const data: PagefindHit[] = await Promise.all(found.results.slice(0, MAX_TEXT).map((r) => r.data()));
  if (mine !== seq) return;
  const text: Entry[] = data.map((hit) => {
    const best = [...(hit.sub_results ?? [])].sort((a, b) => (b.locations?.length ?? 0) - (a.locations?.length ?? 0))[0];
    const url = best?.url ?? hit.url;
    const path = new URL(url, location.href).pathname;
    const owner = entries.find((e) => e.href && path.startsWith(e.href) && e.href !== "/");
    return {
      title: best && best.url.includes("#") ? `${hit.meta.title ?? ""} › ${best.title}` : hit.meta.title ?? url,
      kind: "In text",
      href: url,
      slug: "",
      icon: owner?.icon,
      sub: best?.excerpt ?? hit.excerpt,
      html: true,
    };
  });
  render([
    { head: "Top Hit", items: top },
    { head: "Projects", items: rest.filter((e) => e.kind === "Project") },
    { head: "Writing", items: rest.filter((e) => e.kind === "Post") },
    { head: "Places", items: rest.filter((e) => e.kind === "Page" || e.kind === "Folder") },
    { head: "Commands", items: rest.filter((e) => e.kind === "Command") },
    { head: "In the writing", items: text },
  ]);
}

export function openSpotlight() {
  const d = dialog();
  const input = document.querySelector<HTMLInputElement>("[data-spotlight-input]");
  if (!d || !input) return;
  if (d.open) return input.select();
  entries = gather();
  input.value = "";
  d.showModal();
  input.focus();
  void search("");
}

function wire() {
  const d = dialog();
  const input = document.querySelector<HTMLInputElement>("[data-spotlight-input]");
  if (!d || !input || d.dataset.wired) return;
  d.dataset.wired = "1";
  input.addEventListener("input", () => void search(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); select(Math.min(selected + 1, shown.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); select(Math.max(selected - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); choose(selected); }
  });
  // A click outside the panel lands on the dialog itself, beyond its box.
  d.addEventListener("click", (e) => {
    const r = d.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) d.close();
  });
  for (const t of document.querySelectorAll<HTMLElement>("[data-spotlight-open]")) {
    t.addEventListener("click", (e) => { e.preventDefault(); openSpotlight(); });
  }
}

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    const d = dialog();
    if (d?.open) d.close();
    else openSpotlight();
  }
});
document.addEventListener("astro:page-load", wire);
wire();
