import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { ProjectCard, Project } from "@/types/types";
import Counter from "@/components/mdx/Counter";
import Callout from "@/components/mdx/Callout";
import NotebookEmbed from "@/components/mdx/NotebookEmbed";

const projectsDirectory = path.join(process.cwd(), "src/content/projects");

// MDX components available in project files
const components = {
  Counter,
  Callout,
  NotebookEmbed,
};

// Rehype-highlight options
const rehypeHighlightOptions = {
  detect: true,
  ignoreMissing: true,
  subset: false,
};

// Extract plain text from MDX content for searching
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

// Get all MDX project files
async function getMDXProjects(): Promise<ProjectCard[]> {
  const files = fs.readdirSync(projectsDirectory);
  const mdxFiles = files.filter(
    (file) => file.endsWith(".mdx") || file.endsWith(".md")
  );

  const projects = await Promise.all(
    mdxFiles.map(async (file) => {
      const fullPath = path.join(projectsDirectory, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      const slug = data.slug || file.replace(/\.(mdx|md)$/, "");

      return {
        metadata: {
          title: data.title || slug,
          description: data.description || "",
          type: data.type || "other",
          slug,
          date: data.date,
          tags: data.tags || [],
          thumbnail: data.thumbnail,
          image: data.image,
          images: data.images,
          video: data.video,
          videos: data.videos,
          demoUrl: data.demoUrl,
          featured: data.featured || false,
          contentSource: data.contentSource || ("mdx" as const),
          notebookHtml: data.notebookHtml,
        },
        links: {
          github: data.github,
          live: data.live || data.demoUrl,
        },
        downloads: data.downloads,
        featured: data.featured || false,
        image: data.image || null,
      } as ProjectCard;
    })
  );

  return projects;
}

// Get all projects for the main projects page
export async function getAllProjects(): Promise<ProjectCard[]> {
  const mdxProjects = await getMDXProjects();
  return mdxProjects;
}

// Get a single project by slug with full content
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  // Check if it's an MDX project
  let fullPath = path.join(projectsDirectory, `${slug}.mdx`);

  if (fs.existsSync(fullPath)) {
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const searchableContent = extractPlainText(content);

    try {
      const { content: compiledContent } = await compileMDX({
        source: content,
        components,
        options: {
          parseFrontmatter: false,
          mdxOptions: {
            remarkPlugins: [remarkMath, remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              rehypeKatex,
              [rehypeHighlight, rehypeHighlightOptions],
            ],
            development: process.env.NODE_ENV === "development",
          },
        },
      });

      // Check if this is a notebook project with HTML content
      let htmlContent = "";
      if (data.notebookHtml) {
        // Only append .html if it doesn't already end with it
        const filename = data.notebookHtml.endsWith(".html")
          ? data.notebookHtml
          : `${data.notebookHtml}.html`;
        const htmlPath = path.join(process.cwd(), "public/downloads", filename);
        if (fs.existsSync(htmlPath)) {
          htmlContent = fs.readFileSync(htmlPath, "utf8");
        }
      }

      return {
        metadata: {
          title: data.title || slug,
          description: data.description || "",
          type: data.type || "other",
          slug,
          date: data.date,
          tags: data.tags || [],
          image: data.image,
          images: data.images,
          video: data.video,
          videos: data.videos,
          demoUrl: data.demoUrl,
          featured: data.featured || false,
          contentSource: data.contentSource || ("mdx" as const),
          notebookHtml: data.notebookHtml,
        },
        content: compiledContent,
        htmlContent,
        searchableContent,
        links: {
          github: data.github,
          live: data.live || data.demoUrl,
        },
        downloads: data.downloads,
      };
    } catch (error) {
      console.error(`Error compiling MDX for ${slug}:`, error);
      return null;
    }
  }

  // Check if it's a GitHub project (check for matching MDX file first for enhanced content)
  if (slug.startsWith("github-")) {
    // First, check if there's an MDX file for this GitHub project
    const mdxPath = path.join(projectsDirectory, `${slug}.mdx`);
    if (fs.existsSync(mdxPath)) {
      // Enhanced GitHub project with custom content
      const fileContents = fs.readFileSync(mdxPath, "utf8");
      const { data, content } = matter(fileContents);

      const searchableContent = extractPlainText(content);

      try {
        const { content: compiledContent } = await compileMDX({
          source: content,
          components,
          options: {
            parseFrontmatter: false,
            mdxOptions: {
              remarkPlugins: [remarkMath, remarkGfm],
              rehypePlugins: [
                rehypeSlug,
                rehypeKatex,
                [rehypeHighlight, rehypeHighlightOptions],
              ],
              development: process.env.NODE_ENV === "development",
            },
          },
        });

        // Get GitHub project data for additional metadata
        const { getGithubRepos } = await import("@/lib/github");
        const githubProjects = await getGithubRepos();
        const githubProject = githubProjects.find(
          (p) => p.metadata.slug === slug
        );

        return {
          metadata: {
            title: data.title || githubProject?.metadata.title || slug,
            description:
              data.description || githubProject?.metadata.description || "",
            type: data.type || "web",
            slug,
            date: data.date,
            tags: data.tags || githubProject?.metadata.tags || [],
            image: data.image,
            images: data.images,
            video: data.video,
            videos: data.videos,
            demoUrl: data.demoUrl,
            featured: data.featured || githubProject?.featured || false,
            contentSource: "mdx" as const,
            githubRepo: data.githubRepo || githubProject?.metadata.githubRepo,
          },
          content: compiledContent,
          searchableContent,
          links: {
            github: data.github || githubProject?.links.github,
            live: data.live || data.demoUrl || githubProject?.links.live,
          },
          downloads: data.downloads,
        };
      } catch (error) {
        console.error(`Error compiling MDX for ${slug}:`, error);
      }
    }

    // Fallback to basic GitHub project with just README
    const { getGithubRepos } = await import("@/lib/github");
    const githubProjects = await getGithubRepos();
    const githubProject = githubProjects.find((p) => p.metadata.slug === slug);

    if (githubProject) {
      return {
        metadata: githubProject.metadata,
        links: githubProject.links,
      };
    }
  }

  return null;
}

// Generate static params for all projects
export async function generateStaticParams() {
  // MDX files (includes migrated notebooks)
  const files = fs.readdirSync(projectsDirectory);
  const mdxSlugs = files
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => ({
      slug: file.replace(/\.(mdx|md)$/, ""),
    }));

  // GitHub projects
  const { getGithubRepos } = await import("@/lib/github");
  const githubProjects = await getGithubRepos();
  const githubSlugs = githubProjects.map((project) => ({
    slug: project.metadata.slug,
  }));

  return [...mdxSlugs, ...githubSlugs];
}
