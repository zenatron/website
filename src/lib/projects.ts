import fs from "node:fs";
import path from "node:path";
import { getCollection, getEntry } from "astro:content";
import type { CollectionEntry } from "astro:content";
import type { ProjectCard, Project } from "@/types/types";

export type ProjectEntry = CollectionEntry<"projects">;

function extractPlainText(content: string): string {
  let plainText = content.replace(/import\s+.*?from\s+['"].*?['"]/g, "");
  plainText = plainText.replace(/<[^>]*>/g, " ");
  plainText = plainText.replace(/```[\s\S]*?```/g, "");
  plainText = plainText.replace(/`.*?`/g, "");
  plainText = plainText
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/!\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\n>/g, "\n");
  plainText = plainText.replace(/\s+/g, " ").trim();
  return plainText;
}

export async function getAllProjects(): Promise<ProjectCard[]> {
  const entries = await getCollection("projects");
  return entries.map((entry) => ({
    metadata: {
      title: entry.data.title || entry.slug,
      description: entry.data.description || "",
      type: (entry.data.type || "other") as any,
      slug: entry.data.slug || entry.slug,
      date: entry.data.date,
      tags: entry.data.tags || [],
      thumbnail: entry.data.thumbnail,
      image: entry.data.image,
      images: entry.data.images,
      video: entry.data.video,
      videos: entry.data.videos,
      demoUrl: entry.data.demoUrl,
      featured: entry.data.featured || false,
      contentSource: (entry.data.contentSource || "mdx") as any,
      notebookHtml: entry.data.notebookHtml,
      githubRepo: entry.data.githubRepo,
    },
    links: {
      github: entry.data.github,
      live: entry.data.live || entry.data.demoUrl,
    },
    downloads: entry.data.downloads,
    featured: entry.data.featured || false,
    image: entry.data.image || null,
  }));
}

export async function getProjectBySlug(slug: string): Promise<{
  entry: ProjectEntry | null;
  htmlContent: string;
  links: { github?: string; live?: string };
  downloads?: { type?: string; filename: string; label?: string }[];
} | null> {
  const entry = await getEntry("projects", slug);
  if (!entry) return null;

  let htmlContent = "";
  if (entry.data.notebookHtml) {
    const filename = entry.data.notebookHtml.endsWith(".html")
      ? entry.data.notebookHtml
      : `${entry.data.notebookHtml}.html`;
    const htmlPath = path.join(process.cwd(), "public/downloads", filename);
    if (fs.existsSync(htmlPath)) {
      htmlContent = fs.readFileSync(htmlPath, "utf8");
    }
  }

  return {
    entry,
    htmlContent,
    links: {
      github: entry.data.github,
      live: entry.data.live || entry.data.demoUrl,
    },
    downloads: entry.data.downloads,
  };
}

export async function getSuggestedProjects(
  currentSlug: string,
  count: number = 3
): Promise<ProjectCard[]> {
  const allProjects = await getAllProjects();
  const otherProjects = allProjects.filter(
    (p) => p.metadata.slug !== currentSlug
  );

  if (otherProjects.length === 0) return [];

  const currentProject = allProjects.find(
    (p) => p.metadata.slug === currentSlug
  );
  const currentTags = currentProject?.metadata.tags || [];

  const scored = otherProjects.map((project) => {
    const projectTags = project.metadata.tags || [];
    const sharedTags = projectTags.filter((tag) =>
      currentTags.includes(tag)
    ).length;

    const projectDate = project.metadata.date
      ? new Date(project.metadata.date).getTime()
      : 0;
    const now = Date.now();
    const daysSince = (now - projectDate) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - daysSince / 365);
    const score = sharedTags * 10 + recencyScore;

    return { project, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((item) => item.project);
}

export async function getProjectStaticPaths() {
  const entries = await getCollection("projects");
  const mdxPaths = entries.map((entry) => ({
    params: { slug: entry.data.slug || entry.slug },
  }));

  const { getGithubRepos } = await import("@/lib/github");
  const githubProjects = await getGithubRepos();
  const githubPaths = githubProjects.map((project) => ({
    params: { slug: project.metadata.slug },
  }));

  return [...mdxPaths, ...githubPaths];
}
