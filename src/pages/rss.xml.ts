import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "@/data/site";

/**
 * The writing feed. Coursework prep posts stay out: a feed is a promise
 * about what shows up in it, and the twelve data-mining entries would
 * bury the guides people actually subscribe for.
 */
export const GET: APIRoute = async (context) => {
  const posts = (await getCollection("blog"))
    .filter((post) => post.data.series !== "data-mining")
    .sort(
      (a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    );

  return rss({
    title: `${SITE.name} — Writing`,
    description:
      "Guides on homelab networking, self-hosting, and building things that don't break in production.",
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.excerpt,
      pubDate: new Date(post.data.date),
      link: `/blog/${post.slug}/`,
      categories: post.data.tags,
    })),
    customData: "<language>en-us</language>",
  });
};
