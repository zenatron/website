import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

export type BlogPostEntry = CollectionEntry<"blog">;

/**
 * The series posts belong to, with the color each is drawn in wherever a
 * post shows its kind — the explorer, the 404's suggestions. `label` is
 * the explorer's lowercase run name; `title` heads the series on /blog
 * and in a post's next/previous links.
 */
export const POST_SERIES: { key: string; label: string; title: string; hue: "violet" | "orange" | "blue" | "green" }[] = [
  { key: "homelab-networking", label: "homelab & networking", title: "Homelab & networking", hue: "blue" },
  { key: "data-mining", label: "data mining coursework", title: "Data mining coursework", hue: "violet" },
];

export async function getAllBlogPosts() {
  const posts = await getCollection("blog");
  return posts.sort(
      (a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    );
}

/**
 * Reading time, said one way everywhere it appears — the byline, the
 * explorer, the series list, the archive, a link's preview: "24 min".
 * Frontmatter stores "24min".
 */
export function readingMinutes(value?: string): string {
  const n = value?.match(/\d+/)?.[0];
  return n ? `${n} min` : "";
}
