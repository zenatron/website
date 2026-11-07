import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

export type ProjectEntry = CollectionEntry<"projects">;

export type KindHue = "violet" | "orange" | "blue" | "green";

/** A project's own color: a kind hue, or one of the featured projects'. */
export type ProjectHue = KindHue | "ember" | "rose" | "teal";

/**
 * What a project's `type` means on screen: a word and a color. The
 * colors are the homepage's — web apps are green — and they're the same
 * in the explorer, on the project page and anywhere else a project shows
 * its kind. A type with no entry here is shown hollow, without a color.
 */
export const PROJECT_KIND: Record<string, { label: string; hue: KindHue } | undefined> = {
  app: { label: "app", hue: "green" },
  tool: { label: "tool", hue: "orange" },
  data: { label: "coursework", hue: "violet" },
};

/** The slug a project is served at — frontmatter override, else the filename. */
export function projectSlug(entry: ProjectEntry): string {
  return entry.data.slug || entry.slug;
}

export async function getAllProjects(): Promise<ProjectEntry[]> {
  const entries = await getCollection("projects");
  return entries.sort((a, b) => {
    const da = a.data.date ? new Date(a.data.date).getTime() : 0;
    const db = b.data.date ? new Date(b.data.date).getTime() : 0;
    return db - da;
  });
}

/**
 * A project's color — the card's tint and the banner's mat. A project can
 * name its own (frontmatter `hue`, usually taken from its icon); otherwise
 * it's its kind's. The kind label and the explorer's dot always use the
 * kind's color, since there the color means "app" or "tool".
 */
export function projectHue(entry: ProjectEntry): ProjectHue | undefined {
  return entry.data.hue ?? PROJECT_KIND[entry.data.type]?.hue;
}
