import type { APIRoute } from "astro";
import { getAllBlogPosts, POST_SERIES } from "@/lib/blog";
import { getAllProjects, projectSlug, PROJECT_KIND } from "@/lib/projects";
import type { Preview } from "@/lib/previews";

/**
 * What a link to a post or project shows when you hover it in the middle
 * of another one: the file it goes to, set the way the explorer sets it,
 * and the sentence that says what's there. Fetched by scripts/peek.ts the
 * first time a pointer lands on such a link, so a page that never hovers
 * one never pays for it.
 */
export const GET: APIRoute = async () => {
  const [posts, projects] = await Promise.all([getAllBlogPosts(), getAllProjects()]);
  const out: Record<string, Preview> = {};

  for (const p of posts) {
    const series = POST_SERIES.find((s) => s.key === p.data.series);
    const mins = p.data.readingTime?.match(/\d+/)?.[0];
    out[`/blog/${p.slug}/`] = {
      file: p.slug,
      title: p.data.title,
      summary: p.data.excerpt,
      aside: mins ? `${mins} min` : undefined,
      context: series
        ? `${series.label} · part ${p.data.seriesOrder ?? "?"}`
        : new Date(p.data.date).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }),
      hue: series?.hue,
    };
  }

  for (const p of projects) {
    const kind = PROJECT_KIND[p.data.type];
    out[`/projects/${projectSlug(p)}/`] = {
      file: projectSlug(p),
      title: p.data.title,
      summary: p.data.description || undefined,
      aside: kind?.label,
      context: p.data.tags.slice(0, 4).join(" · ") || undefined,
      hue: kind?.hue,
    };
  }

  return new Response(JSON.stringify(out), {
    headers: { "Content-Type": "application/json" },
  });
};
