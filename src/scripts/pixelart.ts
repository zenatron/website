/**
 * Project art, drawn in the home page's mesh language: a grid of square
 * cells, each lit from 0 to 1, some in the project's own hue. Every
 * project names a motif in its frontmatter; each motif is a function from
 * a cell (and the time) to how lit it is.
 *
 * Canvases animate gently while on screen and hold still otherwise, and
 * always hold still for reduced motion. Colours come from the theme
 * tokens, so the art follows light and dark.
 */

const PITCH = 8;
const BLOCK = 6;

type Cell = { v: number; tone?: "hue" | "add" | "del" };
type Ctx = { i: number; j: number; cols: number; rows: number; t: number; seed: number };
type Motif = (c: Ctx) => Cell | null;

/** A stable 0..1 for a cell, so the art is the same on every visit. */
function hash(i: number, j: number, seed: number) {
  let h = Math.imul(i * 374761393 + j * 668265263 + seed * 2246822519, 3266489917) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0;
  return ((h ^ (h >>> 13)) >>> 0) / 4294967296;
}

/** π's first thousand digits, from a spigot, computed once; larger art repeats them. */
let PI: number[] | null = null;
function piDigits() {
  if (PI) return PI;
  const n = 1000;
  const len = Math.floor((10 * n) / 3) + 1;
  const a = new Array(len).fill(2);
  const out: number[] = [];
  let nines = 0,
    predigit = 0;
  for (let k = 0; k < n; k++) {
    let q = 0;
    for (let i = len; i > 0; i--) {
      const x = 10 * a[i - 1] + q * i;
      a[i - 1] = x % (2 * i - 1);
      q = Math.floor(x / (2 * i - 1));
    }
    a[0] = q % 10;
    q = Math.floor(q / 10);
    if (q === 9) nines++;
    else if (q === 10) {
      out.push(predigit + 1);
      for (; nines > 0; nines--) out.push(0);
      predigit = 0;
    } else {
      if (k > 0) out.push(predigit);
      predigit = q;
      for (; nines > 0; nines--) out.push(9);
    }
  }
  return (PI = out);
}

const MOTIFS: Record<string, Motif> = {
  /** The notch: a dark shape at the top with glances lit in its wings, and a banner that drops and lifts. */
  notch({ i, j: row, cols, rows, t }) {
    // Drawn a little below the top edge, where a nav may sit over it.
    const j = row - Math.round(rows * 0.22);
    if (j < 0) return null;
    const cx = cols / 2;
    const w = Math.max(10, Math.round(cols * 0.16));
    const h = Math.max(4, Math.round(rows * 0.28));
    const dx = Math.abs(i + 0.5 - cx);
    const inNotch = dx < w / 2 && j < h && !(dx > w / 2 - 1.5 && j >= h - 1);
    if (inNotch) return { v: 0.08 };
    const edge = (dx >= w / 2 - 0.5 && dx < w / 2 + 0.5 && j < h) || (j === h && dx < w / 2 - 1);
    if (edge) return { v: 0.55 };
    // Left wing: a music visualizer. Right wing: a battery.
    const wingY = Math.floor(h / 2);
    if (i < cx - w / 2 - 1 && i > cx - w / 2 - 9 && Math.abs(j - wingY) <= 2) {
      const bar = Math.floor(cx - w / 2 - 2 - i);
      const level = Math.floor(((Math.sin(t * 3 + bar * 1.7) + 1) / 2) * 3);
      if (bar % 2 === 0 && wingY + 2 - j <= level) return { v: 0.9, tone: "hue" };
    }
    if (i > cx + w / 2 + 1 && i < cx + w / 2 + 8 && j >= wingY - 1 && j <= wingY + 1) {
      const k = i - (cx + w / 2 + 2);
      if (j === wingY - 1 || j === wingY + 1 || k === 0 || k === 5) return { v: 0.5 };
      if (k < 4) return { v: 0.85 };
    }
    // A banner drops below the notch every few seconds.
    const cycle = (t / 4) % 1;
    const drop = cycle < 0.5 ? Math.min(1, cycle * 6) : Math.max(0, (0.85 - cycle) * 3);
    const by = h + 2 + Math.round(drop * 3);
    if (drop > 0.05 && j === by && dx < w * 0.45) return { v: 0.7 * drop, tone: dx < 2 ? "hue" : undefined };
    return null;
  },

  /** A month of spending as daily bars, the budget as a dashed line, today pulsing. */
  ledger({ i, j, cols, rows, t, seed }) {
    const bars = Math.floor(cols / 3);
    const b = Math.floor(i / 3);
    if (i % 3 === 2 || b >= bars) return null;
    const base = rows - 3;
    const budget = Math.round(rows * 0.42);
    const n = hash(b, 0, seed);
    const height = Math.round((0.15 + n * n * 0.7) * (rows - 6));
    const grow = Math.min(1, t / 1.5 - b * 0.01);
    const top = base - Math.round(height * Math.max(0, grow));
    if (j === budget && i % 4 < 2) return { v: 0.35 };
    if (j > base || j < top) return null;
    const today = b === bars - 4;
    if (today) return { v: 0.6 + 0.4 * Math.abs(Math.sin(t * 2)), tone: "hue" };
    return { v: j < budget ? 0.75 : 0.4 };
  },

  /** A waveform crossing the frame, with two stretches that match: the duplicates. */
  waveform({ i, j, cols, rows, t, seed }) {
    const mid = rows / 2;
    const env = (x: number) =>
      Math.abs(Math.sin(x * 0.11 + seed) * 0.6 + Math.sin(x * 0.037) * 0.4) * (0.35 + 0.65 * hash(Math.floor(x / 3), 1, seed));
    // The two duplicates share one shape.
    const dupA = Math.floor(cols * 0.22),
      dupB = Math.floor(cols * 0.62),
      dupW = Math.floor(cols * 0.1);
    let x = i + Math.floor(t * 6);
    const local = i - dupA,
      local2 = i - dupB;
    const isDup = (local >= 0 && local < dupW) || (local2 >= 0 && local2 < dupW);
    if (isDup) x = 9999 + (local >= 0 && local < dupW ? local : local2);
    const amp = env(x) * (rows * 0.42);
    const d = Math.abs(j + 0.5 - mid);
    if (d > amp) return d < 0.6 ? { v: 0.2 } : null;
    return { v: 0.35 + 0.5 * (1 - d / Math.max(1, amp)), tone: isDup ? "hue" : undefined };
  },

  /** Two files side by side, lines removed on the left and added on the right, a cursor reading down. */
  diff({ i, j, cols, rows, t, seed }) {
    const gap = 3;
    const pane = Math.floor((cols - gap) / 2);
    const right = i >= pane + gap;
    if (i >= pane && i < pane + gap) return null;
    const col = right ? i - pane - gap : i;
    if (j % 2 === 1) return null;
    const line = j / 2;
    const indent = Math.floor(hash(line, 2, seed) * 4) * 2;
    const len = indent + 6 + Math.floor(hash(line, 3, seed) * (pane - indent - 8));
    const kind = hash(line, 4, seed);
    const changed = kind < 0.22;
    const lineLen = changed && right ? Math.min(pane - 2, len + 4) : len;
    if (col < 1 || col < indent || col > lineLen) return null;
    const reading = Math.floor((t * 4) % (rows / 2)) === line;
    if (changed) return { v: reading ? 1 : 0.75, tone: right ? "add" : "del" };
    return { v: reading ? 0.7 : 0.3 };
  },

  /** π, one digit to a cell, with a window scanning for your bytes. */
  pi({ i, j, cols, rows, t }) {
    const digits = piDigits();
    const k = j * cols + i;
    const d = digits[k % digits.length];
    const scan = Math.floor(t * 9) % (cols * rows);
    const inWindow = k >= scan && k < scan + 6;
    if (inWindow) return { v: 1, tone: "hue" };
    // Only the high digits light, so the field reads as texture, not noise.
    if (d < 7) return null;
    return { v: 0.12 + ((d - 6) / 3) * 0.3 };
  },

  /** Three clusters of points, the way a k-means plot draws them. */
  clusters({ i, j, cols, rows, seed }) {
    const centers = [
      [0.25, 0.35],
      [0.6, 0.65],
      [0.8, 0.3],
    ];
    for (let c = 0; c < centers.length; c++) {
      const dx = (i / cols - centers[c][0]) * (cols / rows),
        dy = j / rows - centers[c][1];
      const r = Math.hypot(dx, dy);
      if (r < 0.22 && hash(i, j, seed + c) < (0.22 - r) * 3.2) return { v: 0.8, tone: c === 1 ? "hue" : undefined };
    }
    return null;
  },
};

type Palette = { fg: string; hue: string; add: string; del: string };

function palette(el: HTMLElement): Palette {
  const s = getComputedStyle(el);
  const root = getComputedStyle(document.documentElement);
  return {
    fg: root.getPropertyValue("--c-text").trim(),
    hue: s.getPropertyValue("--art-hue").trim() || root.getPropertyValue("--c-accent").trim(),
    add: root.getPropertyValue("--c-hue-green").trim(),
    del: root.getPropertyValue("--c-danger").trim(),
  };
}

function mount(el: HTMLElement, still: boolean) {
  const canvas = el.querySelector("canvas")!;
  const ctx = canvas.getContext("2d")!;
  const motif = MOTIFS[el.dataset.motif ?? ""] ?? MOTIFS.clusters;
  const seed = [...(el.dataset.seed ?? "x")].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 1000;
  let cols = 0,
    rows = 0,
    pal = palette(el),
    raf = 0,
    visible = false;
  const start = performance.now();

  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = el.clientWidth,
      h = el.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.floor(w / PITCH);
    rows = Math.floor(h / PITCH);
  };

  // Art under the nav fades toward the top edge, so the links stay legible.
  const fadeTop = el.hasAttribute("data-fade-top");
  const draw = (t: number) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const ox = (el.clientWidth - cols * PITCH) / 2,
      oy = (el.clientHeight - rows * PITCH) / 2;
    for (let j = 0; j < rows; j++) {
      const fade = fadeTop ? Math.min(1, Math.max(0.06, (oy + j * PITCH - 44) / 64)) : 1;
      for (let i = 0; i < cols; i++) {
        const c = motif({ i, j, cols, rows, t, seed });
        if (!c) {
          // The ground: the same faint dots as the mesh.
          ctx.globalAlpha = 0.06 * fade;
          ctx.fillStyle = pal.fg;
          ctx.fillRect(ox + i * PITCH + 2, oy + j * PITCH + 2, 2, 2);
          continue;
        }
        ctx.globalAlpha = Math.min(1, c.v) * fade;
        ctx.fillStyle = c.tone === "hue" ? pal.hue : c.tone === "add" ? pal.add : c.tone === "del" ? pal.del : pal.fg;
        ctx.fillRect(ox + i * PITCH, oy + j * PITCH, BLOCK, BLOCK);
      }
    }
    ctx.globalAlpha = 1;
  };

  const frame = (now: number) => {
    draw((now - start) / 1000);
    raf = visible ? requestAnimationFrame(frame) : 0;
  };
  const kick = () => {
    if (still) draw(3);
    else if (!raf) raf = requestAnimationFrame(frame);
  };

  size();
  draw(still ? 3 : 0);
  new ResizeObserver(() => {
    size();
    draw(still ? 3 : (performance.now() - start) / 1000);
  }).observe(el);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) kick();
  }).observe(el);
  new MutationObserver(() => {
    pal = palette(el);
    if (still) draw(3);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    pal = palette(el);
    if (still) draw(3);
  });
}

const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll<HTMLElement>("[data-pixel-art]").forEach((el) => mount(el, still));
