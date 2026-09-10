import { getCollection, getEntry } from "astro:content";
import type { CollectionEntry } from "astro:content";

export type ProjectEntry = CollectionEntry<"projects">;

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

export async function getProjectBySlug(slug: string) {
  const all = await getAllProjects();
  return all.find((e) => projectSlug(e) === slug) ?? null;
}

export async function getSuggestedProjects(currentSlug: string, count = 3) {
  const all = await getAllProjects();
  const others = all.filter((p) => projectSlug(p) !== currentSlug);
  if (others.length === 0) return [];

  const current = all.find((p) => projectSlug(p) === currentSlug);
  const currentTags = current?.data.tags ?? [];

  return others
    .map((project) => {
      const shared = (project.data.tags ?? []).filter((t) =>
        currentTags.includes(t)
      ).length;
      const date = project.data.date ? new Date(project.data.date).getTime() : 0;
      const days = (Date.now() - date) / 86_400_000;
      return { project, score: shared * 10 + Math.max(0, 1 - days / 365) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((s) => s.project);
}
