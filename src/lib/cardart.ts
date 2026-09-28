/**
 * What a card should show, in order of preference:
 *
 *   1. a real thumbnail declared in frontmatter
 *   2. the post's own diagram — the one frontmatter names as `cover`,
 *      else the first one it ships
 *   3. a typographic cover built from the title
 *
 * A hero band never shows a diagram: the post body shows the same one
 * whole a screen later, and cropped to 21:7 it loses its labels.
 *
 * Generated art is the fallback, not the default. The previous version had
 * this backwards and drew a dot field over content that already had
 * artwork sitting in the repo.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

export type CardArt =
  | { kind: "image"; src: string }
  | { kind: "diagram"; src: string }
  | { kind: "type"; lead: string; rest: string };

/** The diagram a post leads with: the named cover, else the first it ships. */
function coverDiagram(slug: string, cover?: string): string | null {
  const dir = join(process.cwd(), "public", "images", "blog", slug);
  if (!existsSync(dir)) return null;
  if (cover && existsSync(join(dir, cover))) return `/images/blog/${slug}/${cover}`;
  const svg = readdirSync(dir).filter((f) => f.endsWith(".svg")).sort();
  return svg.length ? `/images/blog/${slug}/${svg[0]}` : null;
}

/**
 * Split a title into something worth setting large and the remainder.
 * "Week 7 Prep: Regression" -> lead "07", rest "Week 7 Prep"
 * "Principles"              -> lead "Principles"
 */
function typographic(title: string): { lead: string; rest: string } {
  const week = title.match(/\bweek\s+(\d+)/i);
  if (week) return { lead: String(week[1]).padStart(2, "0"), rest: title.split(":")[0].trim() };

  const midterm = title.match(/\bmidterm\s+(\d+)/i);
  if (midterm) return { lead: `M${midterm[1]}`, rest: title.split(":")[0].trim() };

  const head = title.split(":")[0].trim();
  const words = head.split(/\s+/);
  return words.length <= 2
    ? { lead: head, rest: "" }
    : { lead: words.slice(0, 2).join(" "), rest: words.slice(2).join(" ") };
}

/** Portrait art cropped into a 21:7 hero band becomes an unreadable zoom. */
async function isPortrait(src: string): Promise<boolean> {
  try {
    const { width = 0, height = 0 } = await sharp(join(process.cwd(), "public", src.replace(/^\//, ""))).metadata();
    return height > width;
  } catch {
    return false;
  }
}

export async function cardArt(opts: {
  slug: string;
  title: string;
  thumbnail?: string;
  /** A blog post's chosen diagram; see coverDiagram. */
  cover?: string;
  collection: "blog" | "projects";
  /** A hero band is wide; a card is not. */
  context?: "card" | "hero";
}): Promise<CardArt> {
  const context = opts.context ?? "card";
  if (opts.thumbnail && existsSync(join(process.cwd(), "public", opts.thumbnail.replace(/^\//, "")))) {
    // A phone screenshot makes a fine card and a terrible banner.
    if (!(context === "hero" && (await isPortrait(opts.thumbnail)))) {
      return { kind: "image", src: opts.thumbnail };
    }
    return { kind: "type", ...typographic(opts.title) };
  }
  if (opts.collection === "blog" && context === "card") {
    const diagram = coverDiagram(opts.slug, opts.cover);
    if (diagram) return { kind: "diagram", src: diagram };
  }
  return { kind: "type", ...typographic(opts.title) };
}
