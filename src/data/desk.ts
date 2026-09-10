/**
 * The things on the desk that aren't apps.
 *
 * Each one opens a window rendering data that already exists elsewhere in
 * the repo — the machine specs from about.ts, the Now list, the
 * principles, the fortunes — so the page can't drift out of sync with the
 * rest of the site.
 */
export type DeskKind = "neofetch" | "text" | "list" | "fortune" | "link";

export interface DeskItem {
  /** The filename shown under the icon. */
  file: string;
  kind: DeskKind;
  /** Icon glyph, drawn as a small mono monogram rather than an image. */
  badge: string;
  hue: "violet" | "orange" | "blue" | "green" | "accent" | "link";
  /** Starting position, percent of the desk surface. */
  x: number;
  y: number;
  /** For kind: "link" — where double-clicking goes. */
  href?: string;
  note?: string;
}

export const DESK: DeskItem[] = [
  { file: "neofetch",      kind: "neofetch", badge: "»_", hue: "green",  x: 4,  y: 6,  note: "The two machines this site gets written on." },
  { file: "now.txt",       kind: "list",     badge: "≡",  hue: "blue",   x: 26, y: 10, note: "What I'm building, learning and reading." },
  { file: "principles.md", kind: "text",     badge: "¶",  hue: "violet", x: 48, y: 6,  note: "The whole essay in four lines." },
  { file: "fortune",       kind: "fortune",  badge: "★",  hue: "accent", x: 70, y: 12, note: "Roll again." },
  { file: "resume.pdf",    kind: "link",     badge: "↧",  hue: "link",   x: 34, y: 52, href: "/downloads/Resume_Phil_Vishnevsky.pdf", note: "The formal version." },
];
