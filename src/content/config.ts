import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.string(),
    readingTime: z.string().optional(),
    excerpt: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional().default(""),
    type: z.string().optional().default("other"),
    slug: z.string().optional(),
    date: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    thumbnail: z.string().optional(),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
    video: z.string().optional(),
    videos: z.array(z.string()).optional(),
    demoUrl: z.string().optional(),
    featured: z.boolean().optional().default(false),
    contentSource: z.string().optional().default("mdx"),
    notebookHtml: z.string().optional(),
    githubRepo: z.string().optional(),
    github: z.string().optional(),
    live: z.string().optional(),
    downloads: z
      .array(
        z.object({
          type: z.string().optional(),
          filename: z.string(),
          label: z.string().optional(),
        })
      )
      .optional(),
  }),
});

const unpublished = defineCollection({
  type: "content",
});

export const collections = { blog, projects, unpublished };
