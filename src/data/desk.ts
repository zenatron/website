/** What's drawn on a file's icon, and the ink it's drawn in. See FileIcon. */
export type FileGlyph = "checklist" | "markdown" | "resume" | "neofetch" | "fortune" | "desk";
export type FileInk = "violet" | "blue" | "teal" | "green" | "orange" | "amber" | "red";

/**
 * The things on the dock that aren't apps.
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
  /**
   * How it's drawn: a document (with its extension on a tag) or an
   * executable, and what's on it. See FileIcon.
   */
  icon: { form: "doc" | "exec" | "folder"; glyph: FileGlyph; ext?: string; ink?: FileInk };
  /** Starting position, percent of the desk surface. */
  x: number;
  y: number;
  /** For kind: "link" — where double-clicking goes. */
  href?: string;
  note?: string;
}

export const DESK: DeskItem[] = [
  { file: "neofetch",      kind: "neofetch", icon: { form: "exec", glyph: "neofetch" },                          x: 4,  y: 6,  note: "The three machines: two I write on, one that runs everything else." },
  { file: "now.txt",       kind: "list",     icon: { form: "doc", glyph: "checklist", ext: "txt", ink: "blue" },   x: 26, y: 10, note: "What I'm building, learning and reading." },
  { file: "principles.md", kind: "text",     icon: { form: "doc", glyph: "markdown", ext: "md", ink: "violet" },  x: 48, y: 6,  note: "The whole essay in four lines." },
  { file: "fortune",       kind: "fortune",  icon: { form: "exec", glyph: "fortune" },                           x: 70, y: 12, note: "Roll again." },
  { file: "resume.pdf",    kind: "link",     icon: { form: "doc", glyph: "resume", ext: "pdf", ink: "red" },      x: 34, y: 52, href: "/downloads/Resume_Phil_Vishnevsky.pdf", note: "The formal version." },
  { file: "desk",          kind: "link",     icon: { form: "folder", glyph: "desk" },                             x: 56, y: 52, href: "/about/#setup", note: "Everything these run on." },
];
