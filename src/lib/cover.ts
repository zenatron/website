/**
 * Deterministic cover artwork.
 *
 * Every project and post gets a distinctive piece of generative art
 * derived from its own slug — no asset pipeline, no network request, and
 * the colors are CSS custom properties, so covers re-theme with the site
 * instead of being baked to one palette.
 */

const HUES = ["violet", "orange", "blue", "green", "accent", "link"] as const;
export type Hue = (typeof HUES)[number];

/** FNV-1a. Small, stable, and good enough to scatter slugs across hues. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** A tiny deterministic PRNG so a slug always draws the same picture. */
function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 0xffffffff;
  };
}

export interface Cover {
  hue: Hue;
  alt: Hue;
  dots: { cx: number; cy: number; r: number; fill: "hue" | "alt" | "ghost" }[];
  cols: number;
  rows: number;
}

/**
 * A dot field with a soft cluster in it. The cluster's centre, radius and
 * falloff all come from the slug, so no two covers read the same, but a
 * given slug never changes.
 */
export function cover(slug: string, shape: { cols?: number; rows?: number } = {}): Cover {
  const seed = hash(slug);
  const rand = rng(seed);
  const hue = HUES[seed % HUES.length];
  // `>>>`, not `>>` — a signed shift on a large hash goes negative, which
  // indexes past the end of HUES and yields `undefined`.
  const altIndex = (seed >>> 5) % HUES.length;
  const alt = HUES[altIndex] === hue ? HUES[(altIndex + 2) % HUES.length] : HUES[altIndex];

  const cols = shape.cols ?? 18;
  const rows = shape.rows ?? 9;
  // Kept away from the edges so the cluster survives an aspect-ratio crop.
  const cx0 = cols * 0.28 + rand() * cols * 0.44;
  const cy0 = rows * 0.28 + rand() * rows * 0.44;
  const spread = Math.min(cols, rows) * (0.26 + rand() * 0.16);

  const dots: Cover["dots"] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const d = Math.hypot(x - cx0, (y - cy0) * 1.35);
      const inside = d < spread;
      const edge = d < spread + 1.1;
      const jitter = rand();
      let fill: "hue" | "alt" | "ghost" = "ghost";
      if (inside) fill = jitter > 0.62 ? "alt" : "hue";
      else if (edge && jitter > 0.5) fill = "alt";
      const r = fill === "ghost" ? 3.1 : 4.6 - Math.min(d, spread) * 0.18;
      dots.push({ cx: x * 13 + 10, cy: y * 13 + 10, r: Math.max(2.6, r), fill });
    }
  }
  return { hue, alt, dots, cols, rows };
}
