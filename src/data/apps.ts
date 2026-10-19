/**
 * The site's places, as apps: one list, in one order, with one icon each.
 * The Dock draws it on a desktop and the "Keep exploring" springboard
 * draws it on a phone, so the two can't drift into different orders or
 * colors. The pages' hues and glyphs come from PAGES, as the sidebar's
 * Favorites do; the indexes and home have their own.
 */
import { PAGES } from "@/data/site";
import type { PageGlyph, PageHue } from "@/components/PageIcon.astro";

export interface SiteApp {
  name: string;
  href: string;
  glyph: PageGlyph;
  hue: PageHue;
}

const page = (href: string): SiteApp => {
  const p = PAGES.find((x) => x.href === href)!;
  return { name: p.name[0].toUpperCase() + p.name.slice(1), href, glyph: p.glyph, hue: p.hue };
};

export const APPS: SiteApp[] = [
  { name: "Home", href: "/", glyph: "home", hue: "graphite" },
  { name: "Projects", href: "/projects/", glyph: "folder", hue: "blue" },
  { name: "Writing", href: "/blog/", glyph: "pen", hue: "yellow" },
  page("/about/"),
  page("/photos/"),
  page("/dock/"),
  page("/say-hi/"),
];
