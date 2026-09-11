/**
 * Where a logo's artwork actually is inside its file, and what shape it is.
 *
 * Logo files don't agree on padding: Discord's glyph sits 11% above the
 * middle of its own canvas and Bluesky's 6%, so centring the file doesn't
 * centre the logo. And the icon treatment needs to know whether the
 * artwork is a squircle, a circle, or neither, because that decides
 * whether it can wear its own outline or needs a plate behind it.
 *
 * Measured from the pixels at build time, so a replaced logo is measured
 * again rather than trusted to a hand-written number.
 */
import sharp from "sharp";
import { join } from "node:path";

export type IconShape = "square" | "circle" | "free";

export interface IconBox {
  /** Centre of the artwork, as a fraction of the square it's fitted into. */
  cx: number;
  cy: number;
  /** Size of the artwork, as a fraction of that square. */
  w: number;
  h: number;
  shape: IconShape;
  /**
   * How much further than its bounding box the artwork must be scaled to
   * cover the clip completely: a squircle drawn rounder than Apple's
   * (Vivaldi) would otherwise leave the plate showing in its corners, and
   * an edge that lands exactly on the clip leaves an antialiased fringe.
   */
  cover: number;
}

/** The clip's corner radius, as a fraction of its side. Matches AppIcon. */
export const SQUIRCLE = 0.225;

const N = 256;
const OPAQUE = 24;
const cache = new Map<string, Promise<IconBox>>();

export function iconBox(logo: string): Promise<IconBox> {
  let box = cache.get(logo);
  if (!box) {
    box = measure(logo);
    cache.set(logo, box);
  }
  return box;
}

async function measure(logo: string): Promise<IconBox> {
  const { data } = await sharp(join(process.cwd(), "public", "logos", logo))
    .ensureAlpha()
    .resize(N, N, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Each row's outer extent, so cut-outs (Spotify's arcs) don't read as
  // missing area — shape is about the silhouette, not the ink.
  const rows: ([number, number] | null)[] = [];
  for (let y = 0; y < N; y++) {
    let l = -1, r = -1;
    for (let x = 0; x < N; x++) {
      if (data[(y * N + x) * 4 + 3] > OPAQUE) {
        if (l < 0) l = x;
        r = x;
      }
    }
    rows.push(l < 0 ? null : [l, r]);
  }

  const filled = rows.map((r, y) => (r ? y : -1)).filter((y) => y >= 0);
  if (!filled.length) return { cx: 0.5, cy: 0.5, w: 1, h: 1, shape: "free", cover: 1 };
  const y0 = filled[0], y1 = filled[filled.length - 1];
  let x0 = N, x1 = -1, span = 0;
  for (const r of rows) {
    if (!r) continue;
    x0 = Math.min(x0, r[0]);
    x1 = Math.max(x1, r[1]);
    span += r[1] - r[0] + 1;
  }
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const aspect = w / h;
  const fill = span / (w * h);
  const widthAt = (t: number) => {
    const r = rows[Math.round(y0 + t * (h - 1))];
    return r ? (r[1] - r[0] + 1) / w : 0;
  };

  // A circle fills π/4 of its box and is 60% wide a tenth of the way down;
  // a squircle fills nearly all of it.
  const round = Math.abs(aspect - 1) < 0.05;
  const shape: IconShape =
    round && fill > 0.9 ? "square"
    : round && Math.abs(fill - Math.PI / 4) < 0.03 && Math.abs(widthAt(0.1) - 0.6) < 0.05 ? "circle"
    : "free";

  // The smallest scale at which every row of the clip is inside the
  // artwork's row at the same height. Rows and clip both in units of the
  // artwork's own box, scaled about its centre.
  const FRINGE = 1.02;
  let cover = shape === "free" ? 1 : FRINGE;
  if (shape === "square") {
    const inset = (v: number) => {
      const d = Math.min(v, 1 - v);
      return d >= SQUIRCLE ? 0 : SQUIRCLE - Math.sqrt(SQUIRCLE ** 2 - (SQUIRCLE - d) ** 2);
    };
    const covers = (s: number) => {
      for (let i = 0; i <= 100; i++) {
        const v = i / 100;
        const r = rows[Math.round(y0 + (0.5 + (v - 0.5) / s) * (h - 1))];
        if (!r) return false;
        const l = (r[0] - x0) / w, rt = (r[1] + 1 - x0) / w;
        if (l > 0.5 + (inset(v) - 0.5) / s || rt < 0.5 + (0.5 - inset(v)) / s) return false;
      }
      return true;
    };
    let s = 1;
    while (s < 1.25 && !covers(s)) s += 0.005;
    cover = s * FRINGE;
  }

  return {
    cx: (x0 + x1 + 1) / 2 / N,
    cy: (y0 + y1 + 1) / 2 / N,
    w: w / N,
    h: h / N,
    shape,
    cover,
  };
}
