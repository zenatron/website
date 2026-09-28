/**
 * Peek: hover a link to another post or project, in the middle of
 * reading one, and see where it goes before you leave — the file, its
 * title, and the sentence that says what's there. An editor does the
 * same for a symbol.
 *
 * Only where there's a real pointer to hover with. On touch a link is a
 * link, and the card is aria-hidden everywhere: the link's own text is
 * what a screen reader needs, and it already has it.
 */
import type { Preview } from "@/lib/previews";

const SHOW_AFTER = 350;
const GAP = 8;
const EDGE = 16;

const canHover = () => matchMedia("(hover: hover) and (pointer: fine)").matches;

let previews: Promise<Record<string, Preview>> | null = null;
function load() {
  previews ??= fetch("/previews.json")
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}));
  return previews;
}

/** The previews key for a link, or null if it isn't one worth peeking. */
function keyFor(a: HTMLAnchorElement): string | null {
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return null;
  const path = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
  if (!/^\/(blog|projects)\/[^/]+\/$/.test(path)) return null;
  // A link to the page you're on — a heading anchor — goes nowhere new.
  const here = location.pathname.endsWith("/") ? location.pathname : `${location.pathname}/`;
  return path === here ? null : path;
}

let card: HTMLElement | null = null;
function ensureCard(): HTMLElement {
  if (card && document.body.contains(card)) return card;
  card = document.createElement("div");
  card.className = "peek";
  card.setAttribute("aria-hidden", "true");
  document.body.append(card);
  return card;
}

function fill(el: HTMLElement, p: Preview) {
  el.replaceChildren();
  const head = document.createElement("div");
  head.className = "peek-head";
  const dot = document.createElement("span");
  dot.className = "peek-dot";
  if (p.hue) dot.style.setProperty("--h", `var(--c-hue-${p.hue})`);
  else dot.dataset.plain = "";
  const file = document.createElement("span");
  file.className = "peek-file";
  file.append(p.file);
  const ext = document.createElement("span");
  ext.className = "peek-ext";
  ext.textContent = ".mdx";
  file.append(ext);
  head.append(dot, file);
  if (p.aside) {
    const aside = document.createElement("span");
    aside.className = "peek-aside";
    aside.textContent = p.aside;
    head.append(aside);
  }
  const title = document.createElement("p");
  title.className = "peek-title";
  title.textContent = p.title;
  el.append(head, title);
  if (p.summary) {
    const s = document.createElement("p");
    s.className = "peek-summary";
    s.textContent = p.summary;
    el.append(s);
  }
  if (p.context) {
    const c = document.createElement("p");
    c.className = "peek-context";
    c.textContent = p.context;
    el.append(c);
  }
}

/** Under the link, or over it when there's no room below; kept on screen. */
function place(el: HTMLElement, a: HTMLAnchorElement) {
  // The line the pointer is on, for a link that wraps.
  const rects = [...a.getClientRects()];
  const r = rects.find((x) => x.bottom >= lastY && x.top <= lastY) ?? rects[0] ?? a.getBoundingClientRect();
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const left = Math.min(Math.max(EDGE, r.left), innerWidth - w - EDGE);
  const below = r.bottom + GAP + h <= innerHeight - EDGE;
  el.style.left = `${left}px`;
  el.style.top = `${below ? r.bottom + GAP : r.top - GAP - h}px`;
  el.dataset.side = below ? "below" : "above";
}

let lastY = 0;
let timer = 0;
let current: HTMLAnchorElement | null = null;

function hide() {
  clearTimeout(timer);
  current = null;
  card?.removeAttribute("data-open");
}

function onOver(e: PointerEvent) {
  const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>(".prose a[href]");
  if (!a || a === current || !canHover()) return;
  const key = keyFor(a);
  if (!key) return;
  current = a;
  lastY = e.clientY;
  clearTimeout(timer);
  timer = window.setTimeout(async () => {
    const p = (await load())[key];
    if (!p || current !== a) return;
    const el = ensureCard();
    fill(el, p);
    place(el, a);
    el.setAttribute("data-open", "");
  }, SHOW_AFTER);
}

function onOut(e: PointerEvent) {
  if (!current) return;
  const to = e.relatedTarget as Node | null;
  if (to && current.contains(to)) return;
  hide();
}

// Delegated once: the listeners outlive every page swap.
document.addEventListener("pointerover", onOver);
document.addEventListener("pointerout", onOut);
document.addEventListener("scroll", hide, { capture: true, passive: true });
document.addEventListener("astro:before-swap", hide);
addEventListener("blur", hide);
