import { ReactNode } from "react";
import { Heading } from "@/utils/extractHeadings";

export type BlogMetadata = {
  title: string;
  date: string;
  readingTime?: string;
  excerpt?: string;
  tags?: string[];
};

export type BlogPost = {
  slug: string;
  content: ReactNode;
  searchableContent: string; // Plain text version for searching
  metadata: BlogMetadata;
  headings: Heading[]; // Table of contents headings
};

export type ProjectTypes = "data" | "web" | "game" | "other";

// Content source type - determines how project content is rendered
export type ProjectContentSource = "mdx" | "github" | "notebook" | "html";

export type ProjectMetadata = {
  title: string;
  description: string;
  tags?: string[];
  type: ProjectTypes;
  slug: string; // Now required for all projects
  date?: string;
  // New metadata fields for enhanced content
  image?: string; // Featured image URL or path
  images?: string[]; // Gallery images
  video?: string; // Video URL (YouTube, local, etc.)
  videos?: string[]; // Multiple videos
  demoUrl?: string; // Live demo URL
  featured?: boolean;
  // Content source
  contentSource: ProjectContentSource;
  // GitHub-specific
  githubRepo?: string; // Format: "owner/repo"
  // Notebook-specific
  notebookHtml?: string; // Path to HTML file
};

export type ProjectCard = {
  metadata: ProjectMetadata;
  links: {
    github?: string;
    live?: string;
  };
  downloads?: {
    type?: string;
    filename: string;
    label?: string;
  }[];
  featured?: boolean;
  image?: string | null;
};

// Add this type for data science projects (backwards compatibility)
export type DataScienceProject = ProjectCard & {
  metadata: {
    type: "data";
    slug: string;
    contentSource: "notebook" | "html";
  };
  downloads: {
    filename: string;
  }[];
};

// New type for full project with content (for individual project pages)
export type Project = {
  metadata: ProjectMetadata;
  content?: ReactNode; // MDX compiled content
  searchableContent?: string; // Plain text for search
  htmlContent?: string; // HTML content for notebooks
  readmeContent?: string; // Markdown content from GitHub README
  links: {
    github?: string;
    live?: string;
  };
  downloads?: {
    type?: string;
    filename: string;
    label?: string;
  }[];
};

export interface LinkItem {
  title: string;
  url: string;
  description?: string;
  icon?: string | React.ElementType; // from react-icons, or a custom one
  image?: string; // URL to an image
  tags?: string[];
  featured?: boolean; // To highlight certain links
}
