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

/** A palette hue by name, for motifs that need more than the page's one colour. */
type Named = "violet" | "blue" | "green" | "orange" | "ember" | "rose" | "teal";
type Cell = { v: number; tone?: "hue" | "add" | "del" | Named };
const NAMED: Named[] = ["violet", "blue", "green", "orange", "ember", "rose", "teal"];
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

/** A made-up git history, drawn once per band height and kept: see the `commits` motif. */
let historyCache: { key: string; width: number; cells: Map<number, Cell> } | null = null;
function commitHistory(rows: number, seed: number) {
  const key = `${rows}:${seed}`;
  if (historyCache?.key === key) return historyCache;
  let state = (seed * 2654435761) >>> 0 || 1;
  const rand = () => ((state = Math.imul(state ^ (state >>> 15), 2246822507) + 0x6d2b79f5) >>> 0) / 4294967296;
  const top = Math.round(rows * 0.36);
  const gap = 3;
  const maxLanes = Math.max(3, Math.min(5, Math.floor((rows * 0.5) / gap) + 1));
  const laneY = (l: number) => top + l * gap;
  const hues: Named[] = ["rose", "ember", "teal", "green", "violet", "blue", "orange"];
  const cells = new Map<number, Cell>();
  const put = (x: number, y: number, c: Cell) => {
    if (y < 0 || y >= rows) return;
    const k = x * rows + y;
    const old = cells.get(k);
    if (!old || old.v < c.v) cells.set(k, c);
  };
  // A fork or merge the way git draws one: along the lane, then over at 45°.
  const line = (x0: number, y0: number, x1: number, y1: number, tone?: Named) => {
    const dy = Math.abs(y1 - y0);
    const bend = Math.max(x0, x1 - dy);
    for (let cx = x0 + 1; cx < bend; cx++) if (cx % 2 === 0) put(cx, y0, { v: 0.26, tone });
    const n = Math.max(x1 - bend, dy, 1);
    for (let s = 0; s <= n; s++) put(Math.round(bend + ((x1 - bend) * s) / n), Math.round(y0 + ((y1 - y0) * s) / n), { v: 0.42, tone });
  };

  type Lane = { tone?: Named; age: number } | null;
  const lanes: Lane[] = Array.from({ length: maxLanes }, (_, l) => (l === 0 ? { age: 0 } : null));
  const TOTAL = 900;
  let x = 0;
  while (x < TOTAL) {
    const prev = x;
    x += 3 + Math.floor(rand() * 7);
    const ending = x > TOTAL - 70;
    const before = lanes.map((l) => l !== null);

    // Merges: an old enough branch joins a lane below it (usually main, sometimes another branch).
    for (let l = maxLanes - 1; l > 0; l--) {
      const lane = lanes[l];
      if (!lane || !before[l]) continue;
      if (ending || (lane.age > 4 && rand() < 0.11)) {
        const into = [...Array(l).keys()].filter((k) => lanes[k]);
        const target = rand() < 0.6 || into.length === 1 ? 0 : into[Math.floor(rand() * into.length)];
        line(prev, laneY(l), x, laneY(target), lane.tone);
        put(x, laneY(target), { v: 0.95, tone: lanes[target]!.tone }); // the merge commit
        lanes[l] = null;
      }
    }
    // Forks: a new branch leaves any active line for a free lane.
    if (!ending && rand() < 0.2) {
      const free = lanes.map((l, k) => (l ? -1 : k)).filter((k) => k > 0);
      const active = lanes.map((l, k) => (l ? k : -1)).filter((k) => k >= 0);
      if (free.length) {
        const parent = active[Math.floor(rand() * active.length)];
        const child = free[Math.floor(rand() * Math.min(free.length, 2))];
        lanes[child] = { tone: hues[Math.floor(rand() * hues.length)], age: 0 };
        line(prev, laneY(parent), x, laneY(child), lanes[child]!.tone);
      }
    }
    // The lines carry on, and some of them get a commit.
    let any = false;
    lanes.forEach((lane, l) => {
      if (!lane) return;
      if (before[l]) for (let cx = prev + 1; cx < x; cx++) if (cx % 2 === 0) put(cx, laneY(l), { v: 0.26, tone: lane.tone });
      lane.age++;
      if (rand() < (l === 0 ? 0.55 : 0.4)) {
        put(x, laneY(l), { v: 0.95, tone: lane.tone });
        any = true;
      }
    });
    if (!any) put(x, laneY(0), { v: 0.95 });
  }
  historyCache = { key, width: x + 1, cells };
  return historyCache;
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
    const base = Math.round(rows * 0.8);
    const budget = Math.round(rows * 0.42);
    const n = hash(b, 0, seed);
    // The tallest bar stops short of the top, where the nav sits on a cover.
    const height = Math.round((0.15 + n * n * 0.7) * Math.min(rows - 6, rows * 0.6));
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

  // ── Page covers ────────────────────────────────────────────
  // Each draws in the lower part of the band, below where the nav sits.

  /**
   * Code typing itself: a gutter of line numbers, indentation, and tokens in
   * their colours (keywords, names, strings, comments), the cursor at the end.
   * It starts over once the block is written.
   */
  writing({ i, j: row, cols, rows, t, seed }) {
    const j = row - Math.round(rows * 0.36);
    if (j < 0 || j % 2) return null;
    const line = j / 2;
    const lines = Math.max(3, Math.round((rows * 0.5) / 2));
    if (line >= lines) return null;
    const width = Math.min(cols - 6, Math.max(40, Math.round(cols * 0.5)));
    const left = Math.round((cols - width) / 2);
    const x = i - left;
    if (x < 0 || x >= width) return null;
    // The gutter: a line number's worth of cells, then a gap.
    if (x < 2) return { v: 0.16 };
    if (x < 4) return null;
    const cx = x - 4;
    // A line: indent, then words separated by single gaps, each word a token kind.
    const indent = [0, 2, 2, 4, 4, 2, 0, 2][(line + Math.floor(seed)) % 8];
    const isComment = hash(line, 11, seed) < 0.16;
    const length = indent + 6 + Math.floor(hash(line, 12, seed) * (width - 16 - indent));
    if (cx < indent || cx >= length) return null;
    // Words: walk from the indent, each 2–7 cells long, one cell apart.
    let pos = indent,
      w = 0;
    while (pos < length) {
      const wl = 2 + Math.floor(hash(line * 31 + w, 13, seed) * 6);
      if (cx >= pos && cx < pos + wl) break;
      if (cx === pos + wl) return null;
      pos += wl + 1;
      w++;
    }
    // Typed so far, across the whole block.
    const per = width - 4;
    const at = line * per + cx;
    const typed = Math.floor((t * 56) % (lines * per + 120));
    if (at === typed) return { v: Math.sin(t * 7) > 0 ? 1 : 0.4, tone: "hue" };
    if (at > typed) return { v: 0.05 };
    if (isComment) return { v: 0.22 };
    // The first word a keyword; then names, strings and the odd number.
    const kind =
      w === 0
        ? "violet"
        : hash(line * 7 + w, 14, seed) < 0.26
          ? "green"
          : hash(line * 5 + w, 15, seed) < 0.38
            ? "blue"
            : hash(line + w, 16, seed) < 0.18
              ? "orange"
              : undefined;
    return kind ? { v: 0.75, tone: kind as Named } : { v: 0.5 };
  },

  /**
   * A commit graph from a made-up history: commits at uneven gaps on whichever
   * branches are active, branches forking off any line and merging back into
   * another after a while, each in its own colour, main in neutral. It scrolls
   * left and loops: the history ends with everything merged, as it began.
   */
  commits({ i, j: row, rows, t, seed }) {
    const h = commitHistory(rows, seed);
    const wx = (((i + Math.floor(t * 4)) % h.width) + h.width) % h.width;
    return h.cells.get(wx * rows + row) ?? null;
  },

  /** A line through the years, a node for each milestone, a pulse running along it. */
  timeline({ i, j: row, cols, rows, t }) {
    const mid = Math.round(rows * 0.62);
    const j = row;
    const left = 4,
      right = cols - 5;
    if (i < left || i > right) return null;
    const stops = 8;
    const at = (k: number) => Math.round(left + ((right - left) * k) / (stops - 1));
    const pulse = left + (((t * 18) % (right - left + 40)) - 20);
    const near = Math.abs(i - pulse);
    for (let k = 0; k < stops; k++) {
      const x = at(k);
      if (Math.abs(i - x) <= 1 && Math.abs(j - mid) <= 1) {
        const lit = pulse >= x;
        return { v: lit ? 0.9 : 0.35, tone: lit && k === stops - 1 ? "hue" : undefined };
      }
      if (i === x && (j === mid - 3 || j === mid - 4) && k % 2 === 0) return { v: 0.2 };
    }
    if (j === mid) {
      if (near < 3) return { v: 1 - near * 0.25, tone: "hue" };
      return i % 2 ? null : { v: i < pulse ? 0.4 : 0.18 };
    }
    return null;
  },

  /**
   * A lens stopping down and opening up, drawn the way the aperture icon is:
   * the barrel's ring, and six blade edges running from the opening out to
   * it, so the blades read as a pinwheel even at a few cells across. The
   * opening between them lets the light through, in the page's hue.
   */
  aperture({ i, j, rows, cols, t }) {
    const R = Math.max(6, rows * 0.36);
    // At the foot of the band, out of the fade under the nav as far as it fits.
    const cx = cols / 2 - 0.5,
      cy = rows - R - 1;
    const x = i - cx,
      y = j - cy;
    const r = Math.hypot(x, y);
    if (r > R + 0.6) return null;
    if (r > R - 0.6) return { v: 0.6 };
    const N = 6;
    const TAU = Math.PI * 2;
    // How open the iris is, and the blades turning as they close.
    const open = 0.5 + 0.5 * Math.sin(t * 0.55);
    const apothem = R * (0.2 + 0.5 * open);
    const turn = (1 - open) * 0.9;
    const corner = apothem / Math.cos(Math.PI / N);
    const vx = (k: number) => corner * Math.cos(turn + (k * TAU) / N);
    const vy = (k: number) => corner * Math.sin(turn + (k * TAU) / N);
    // Each blade's edge: one side of the opening, carried on past its far
    // corner until it meets the ring.
    for (let k = 0; k < N; k++) {
      const ax = vx(k),
        ay = vy(k),
        bx = vx(k + 1),
        by = vy(k + 1);
      const side = Math.hypot(bx - ax, by - ay);
      const dx = (bx - ax) / side,
        dy = (by - ay) / side;
      const along = (x - ax) * dx + (y - ay) * dy;
      const off = Math.abs((x - ax) * dy - (y - ay) * dx);
      const b = bx * dx + by * dy;
      const reach = side - b + Math.sqrt(b * b - corner * corner + R * R);
      if (off < 0.55 && along > -0.3 && along < reach) return { v: 0.85 };
    }
    // Inside the opening when within the apothem along every side's normal.
    let inside = true;
    for (let k = 0; k < N && inside; k++) {
      const mid = turn + ((k + 0.5) * TAU) / N;
      if (x * Math.cos(mid) + y * Math.sin(mid) > apothem) inside = false;
    }
    if (inside) return { v: 0.25 + 0.45 * (1 - r / corner), tone: "hue" };
    // The blades themselves: a faint body behind their edges.
    return { v: 0.1 };
  },

  /** A row of app icons, swelling as the magnification passes along them. */
  dock({ i, j: row, cols, rows, t, seed }) {
    const n = 9;
    const size = 3,
      gap = 2;
    const width = n * size + (n - 1) * gap;
    const left = Math.round((cols - width) / 2);
    const base = rows - 3;
    if (i < left - 2 || i > left + width + 1) return null;
    if (row === base + 1 && (i - left) % 2 === 0) return { v: 0.18 };
    const k = Math.floor((i - left) / (size + gap));
    const within = (i - left) % (size + gap);
    if (k < 0 || k >= n || within >= size) return null;
    const pointer = ((Math.sin(t * 0.7) + 1) / 2) * (n - 1);
    const lift = Math.max(0, 1 - Math.abs(k - pointer) / 1.6);
    const height = size + Math.round(lift * 3);
    const top = base - height + 1;
    if (row < top || row > base) return null;
    const hued = hash(k, 3, seed) < 0.3;
    return { v: 0.45 + lift * 0.45, tone: hued ? "hue" : undefined };
  },

  /** Rings going out from a point, like a ping looking for someone. */
  signal({ i, j: row, cols, rows, t }) {
    const cx = Math.round(cols * 0.5),
      cy = Math.round(rows * 0.84);
    // Flattened, so whole rings fit in the band rather than running out of its top as stripes.
    const top = Math.round(rows * 0.34);
    const d = Math.hypot(i - cx, (row - cy) * 2.4);
    if (d < 1.2) return { v: 1, tone: "hue" };
    if (row > cy || row < top) return null;
    const period = 9;
    const phase = (d - t * 7) % period;
    const p = phase < 0 ? phase + period : phase;
    if (p < 1) {
      // Rings fade out within a few times the band's height, so they stay a ping, not stripes.
      const fade = Math.max(0, 1 - d / Math.min(cols * 0.45, (cy - top) * 2.4));
      return fade > 0.05 ? { v: 0.15 + fade * 0.7, tone: p < 0.5 && d < 10 ? "hue" : undefined } : null;
    }
    return null;
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

type Palette = { fg: string; hue: string; add: string; del: string; named: Record<string, string> };

function palette(el: HTMLElement): Palette {
  const s = getComputedStyle(el);
  const root = getComputedStyle(document.documentElement);
  return {
    fg: root.getPropertyValue("--c-text").trim(),
    hue: s.getPropertyValue("--art-hue").trim() || root.getPropertyValue("--c-accent").trim(),
    add: root.getPropertyValue("--c-hue-green").trim(),
    del: root.getPropertyValue("--c-danger").trim(),
    named: Object.fromEntries(NAMED.map((n) => [n, root.getPropertyValue(`--c-hue-${n}`).trim()])),
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
  // Behind a screenshot the art steps back, so it frames the shot instead of competing.
  const dim = el.hasAttribute("data-dim") ? 0.42 : 1;
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
          ctx.globalAlpha = 0.06 * fade * dim;
          ctx.fillStyle = pal.fg;
          ctx.fillRect(ox + i * PITCH + 2, oy + j * PITCH + 2, 2, 2);
          continue;
        }
        ctx.globalAlpha = Math.min(1, c.v) * fade * dim;
        ctx.fillStyle =
          c.tone === "hue" ? pal.hue : c.tone === "add" ? pal.add : c.tone === "del" ? pal.del : c.tone ? pal.named[c.tone] : pal.fg;
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
