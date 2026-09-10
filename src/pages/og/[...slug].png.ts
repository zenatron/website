import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { generateOGImage } from "@/lib/og";

export const getStaticPaths: GetStaticPaths = async () => {
  const blogPosts = await getCollection("blog");
  const projects = await getCollection("projects");

  const paths = [
    // Static pages
    { params: { slug: "home" }, props: { title: "Phil Vishnevsky", subtitle: "SWE, AI Enthusiast, and Homelabber", type: "page", tags: [] } },
    { params: { slug: "blog" }, props: { title: "Blog", subtitle: "Thoughts on code, tools, and building things", type: "page", tags: [] } },
    { params: { slug: "projects" }, props: { title: "Projects", subtitle: "My experiments, projects, and failures", type: "page", tags: [] } },
    { params: { slug: "about" }, props: { title: "About", subtitle: "The story so far", type: "page", tags: [], variant: "about" } },
    { params: { slug: "links" }, props: { title: "Elsewhere", subtitle: "Where to find me on the rest of the internet", type: "page", tags: [] } },
    { params: { slug: "desk" }, props: { title: "Desk", subtitle: "Things I actually use", type: "page", tags: [] } },
    { params: { slug: "stack" }, props: { title: "Stack", subtitle: "The tools and apps I actually use", type: "page", tags: [] } },

    // Blog posts
    ...blogPosts.map((post) => ({
      params: { slug: `blog/${post.slug}` },
      props: {
        title: post.data.title,
        subtitle: post.data.excerpt || "",
        type: "blog",
        tags: post.data.tags || [],
      },
    })),

    // Projects
    ...projects.map((project) => ({
      params: { slug: `projects/${project.data.slug || project.slug}` },
      props: {
        title: project.data.title,
        subtitle: project.data.description || "",
        type: "project",
        tags: project.data.tags || [],
      },
    })),
  ];

  return paths;
};

export const GET: APIRoute = async ({ props }) => {
  const { title, subtitle, type, tags, variant } = props as {
    title: string;
    subtitle: string;
    type: string;
    tags: string[];
    variant?: "default" | "about";
  };

  const png = await generateOGImage({ title, subtitle, type, tags, variant });

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
