/**
 * The minimap beside the outline, drawn the way Xcode draws one: not
 * shrunken text, but a bar for every line — its real position and length,
 * in its real color — so paragraphs read as texture, code as its syntax
 * colors, headings as heavier strokes, and blocks (code, diagrams, the
 * cover) as the blocks they are. It's measured from the rendered article,
 * so it can't disagree with it; it's redrawn when the article reflows or
 * the theme changes.
 *
 * The lens is the part in view. Point anywhere to jump there, or drag the
 * lens; hovering lights that section in the outline. aria-hidden, since
 * the outline beside it is the same navigation for everyone.
 */

/** The largest the map draws a post: short posts don't get blown up. */
const MAX_SCALE = 0.11;
/** Blocks drawn as blocks; everything else is drawn as its lines. */
const BLOCKS = "pre, .hero, .diagram, figure, img, video, iframe, table, .callout, blockquote, .screens, .frame, details, .tipjar, .side, .cells .art";
/** Text that isn't reading matter: diagram labels, screen-reader text. */
const SKIP_TEXT = "svg, .sr-only, .codebar";

interface Bar { x: number; y: number; w: number; h: number; color: string; alpha: number }
interface Box { x: number; y: number; w: number; h: number; fill: string; stroke: string }

let off: AbortController | null = null;

const opaque = (c: string) => c && c !== "transparent" && !/rgba\(.*,\s*0\)$/.test(c);

function init() {
  off?.abort();
  off = null;

  const map = document.querySelector<HTMLElement>("[data-minimap]");
  const canvas = map?.querySelector("canvas");
  const lens = map?.querySelector<HTMLElement>("[data-minimap-lens]");
  const article = document.querySelector<HTMLElement>(".layout > article");
  if (!map || !canvas || !lens || !article) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const pane = document.querySelector<HTMLElement>(".pane");
  const paneScrolls = () => !!pane && getComputedStyle(pane).overflowY === "auto";
  const view = () => {
    if (pane && paneScrolls()) {
      const r = pane.getBoundingClientRect();
      return { top: r.top, height: pane.clientHeight };
    }
    return { top: 0, height: innerHeight };
  };
  const scrollBy = (dy: number) => (paneScrolls() ? pane!.scrollBy(0, dy) : window.scrollBy(0, dy));

  const links = [...document.querySelectorAll<HTMLAnchorElement>("[data-toc-link]")];
  const heads = links
    .map((link) => ({ link, el: document.getElementById(link.dataset.tocLink!) }))
    .filter((h): h is { link: HTMLAnchorElement; el: HTMLElement } => !!h.el);

  let scale = 1;

  /* ── measure and draw ─────────────────────────────────────── */

  function draw() {
    if (!map!.offsetParent) return; // the rail is hidden at this width
    const a = article!.getBoundingClientRect();
    const docH = article!.scrollHeight;
    const w = map!.clientWidth;
    scale = Math.min(MAX_SCALE, map!.clientHeight / docH);
    const sx = w / a.width;
    const h = Math.ceil(docH * scale);
    const dpr = devicePixelRatio || 1;
    canvas!.width = Math.round(w * dpr);
    canvas!.height = Math.round(h * dpr);
    canvas!.style.height = `${h}px`;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, w, h);

    const X = (px: number) => (px - a.left) * sx;
    const Y = (py: number) => (py - a.top) * scale;

    // Blocks: their own ground and edge, from the page.
    const boxes: Box[] = [];
    const taken = new Set<Element>();
    for (const el of article!.querySelectorAll<HTMLElement>(BLOCKS)) {
      if ([...taken].some((t) => t.contains(el))) continue;
      const r = el.getBoundingClientRect();
      if (!r.height) continue;
      taken.add(el);
      const cs = getComputedStyle(el);
      // A block with no ground of its own (a figure around an image)
      // borrows its first child's, or the raised surface.
      const inner = el.querySelector<HTMLElement>(".art, svg, img, pre");
      const fill = opaque(cs.backgroundColor)
        ? cs.backgroundColor
        : inner && opaque(getComputedStyle(inner).backgroundColor)
          ? getComputedStyle(inner).backgroundColor
          : "";
      boxes.push({ x: X(r.left), y: Y(r.top), w: r.width * sx, h: r.height * scale, fill, stroke: cs.borderTopColor });
    }

    // Lines: every run of text, as the boxes the browser laid it out in.
    const bars: Bar[] = [];
    const colors = new Map<Element, { color: string; alpha: number }>();
    const colorOf = (el: Element) => {
      let c = colors.get(el);
      if (!c) {
        const cs = getComputedStyle(el);
        const heading = el.closest("h1, h2, h3, h4");
        const code = el.closest("pre");
        const link = el.closest("a");
        // Reading text steps back; what you'd scan for stands up.
        const alpha = heading ? 1 : code ? 0.9 : link ? 0.95 : 0.5;
        c = { color: cs.color, alpha };
        colors.set(el, c);
      }
      return c;
    };
    const walker = document.createTreeWalker(article!, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) =>
        n.nodeValue?.trim() && !n.parentElement?.closest(SKIP_TEXT) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
    });
    const range = document.createRange();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const parent = n.parentElement!;
      range.selectNodeContents(n);
      const { color, alpha } = colorOf(parent);
      for (const r of range.getClientRects()) {
        if (!r.width) continue;
        // A bar is the line's ink, not its leading: about half its box.
        const bh = Math.max(r.height * scale * 0.5, 1 / dpr);
        bars.push({ x: X(r.left), y: Y(r.top) + (r.height * scale - bh) / 2, w: Math.max(r.width * sx, 1 / dpr), h: bh, color, alpha });
      }
    }

    for (const b of boxes) {
      if (b.fill) {
        ctx!.globalAlpha = 1;
        ctx!.fillStyle = b.fill;
        ctx!.fillRect(b.x, b.y, b.w, b.h);
      }
      if (opaque(b.stroke)) {
        ctx!.globalAlpha = 0.9;
        ctx!.strokeStyle = b.stroke;
        ctx!.lineWidth = 1 / dpr;
        ctx!.strokeRect(b.x + 0.5 / dpr, b.y + 0.5 / dpr, b.w - 1 / dpr, b.h - 1 / dpr);
      }
    }
    for (const b of bars) {
      ctx!.globalAlpha = b.alpha;
      ctx!.fillStyle = b.color;
      ctx!.fillRect(b.x, b.y, b.w, b.h);
    }
    ctx!.globalAlpha = 1;
    placeLens();
  }

  /* ── the lens ─────────────────────────────────────────────── */

  function placeLens() {
    const v = view();
    const a = article!.getBoundingClientRect();
    const mapH = canvas!.clientHeight;
    const hgt = Math.min(v.height * scale, mapH);
    const top = Math.min(Math.max((v.top - a.top) * scale, 0), Math.max(mapH - hgt, 0));
    lens!.style.transform = `translateY(${top}px)`;
    lens!.style.height = `${hgt}px`;
  }

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      placeLens();
    });
  };

  let redraw = 0;
  const schedule = () => {
    clearTimeout(redraw);
    redraw = window.setTimeout(draw, 120);
  };

  /* ── pointing ─────────────────────────────────────────────── */

  let grab = 0;
  const mapY = (e: PointerEvent) => e.clientY - canvas!.getBoundingClientRect().top;
  const lensTop = () => new DOMMatrixReadOnly(getComputedStyle(lens!).transform).m42;

  /** Bring the lens's top to this map y. */
  function scrollToLens(y: number) {
    const v = view();
    const a = article!.getBoundingClientRect();
    scrollBy(a.top + y / scale - v.top);
  }

  function peek(y: number | null) {
    const docTop = article!.getBoundingClientRect().top;
    let current: HTMLAnchorElement | null = null;
    if (y !== null) for (const h of heads) if ((h.el.getBoundingClientRect().top - docTop) * scale <= y) current = h.link;
    for (const h of heads) h.link.toggleAttribute("data-peek", h.link === current);
  }

  off = new AbortController();
  const signal = off.signal;

  map.addEventListener(
    "pointerdown",
    (e) => {
      if (e.button !== 0) return;
      const y = mapY(e);
      const top = lensTop();
      const hgt = lens!.offsetHeight;
      // On the lens, it's picked up where it's held; elsewhere, the
      // lens jumps there, centered on the pointer.
      grab = y >= top && y <= top + hgt ? y - top : hgt / 2;
      map!.setPointerCapture(e.pointerId);
      map!.dataset.dragging = "";
      scrollToLens(y - grab);
      e.preventDefault();
    },
    { signal }
  );
  map.addEventListener(
    "pointermove",
    (e) => {
      const y = mapY(e);
      if (map!.hasAttribute("data-dragging")) scrollToLens(y - grab);
      peek(y);
    },
    { signal }
  );
  const drop = () => delete map!.dataset.dragging;
  map.addEventListener("pointerup", drop, { signal });
  map.addEventListener("pointercancel", drop, { signal });
  map.addEventListener("pointerleave", () => peek(null), { signal });

  document.addEventListener("scroll", onScroll, { capture: true, passive: true, signal });
  addEventListener("resize", schedule, { signal });

  // Images and fonts arriving reflow the article; so does the rail width.
  const ro = new ResizeObserver(schedule);
  ro.observe(article);
  ro.observe(map);
  signal.addEventListener("abort", () => ro.disconnect());

  // Colors are read from the page, so a theme change is a redraw.
  const mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  signal.addEventListener("abort", () => mo.disconnect());
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", schedule, { signal });

  document.fonts?.ready.then(() => !signal.aborted && schedule());
  draw();
}

document.addEventListener("astro:page-load", init);
init();
