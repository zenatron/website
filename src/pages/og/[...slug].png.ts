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
    { params: { slug: "projects" }, props: { title: "Projects", subtitle: "Things I've built and shipped", type: "page", tags: [] } },
    { params: { slug: "about" }, props: { title: "About", subtitle: "The story so far", type: "page", tags: [] } },
    { params: { slug: "links" }, props: { title: "Links", subtitle: "Find me elsewhere on the internet", type: "page", tags: [] } },

    // Blog posts
    ...blogPosts.map((post) => ({
      params: { slug: `blog/${post.id}` },
      props: {
        title: post.data.title,
        subtitle: post.data.excerpt || "",
        type: "blog",
        tags: post.data.tags || [],
      },
    })),

    // Projects
    ...projects.map((project) => ({
      params: { slug: `projects/${project.id}` },
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
  const { title, subtitle, type, tags } = props as {
    title: string;
    subtitle: string;
    type: string;
    tags: string[];
  };

  const png = await generateOGImage({ title, subtitle, type, tags });

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
