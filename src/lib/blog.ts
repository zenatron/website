import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { BlogPost } from "@/types/types";
import Counter from "@/components/mdx/Counter";
import Callout from "@/components/mdx/Callout";
import { createElement } from "react";
import { extractHeadings } from "@/utils/extractHeadings";

const blogDirectory = path.join(process.cwd(), "src/content/blog");

// Define components that can be imported in MDX files
const components = {
  Counter,
  Callout,
};

// Configure rehype-highlight options
const rehypeHighlightOptions = {
  detect: true, // Auto-detect language if not specified
  ignoreMissing: true, // Don't throw on missing language
  subset: false, // Use all languages
};

// Extract plain text from MDX content for searching
function extractPlainText(content: string): string {
  // Remove import statements
  let plainText = content.replace(/import\s+.*?from\s+['"].*?['"]/g, "");

  // Remove JSX/HTML tags
  plainText = plainText.replace(/<[^>]*>/g, " ");

  // Remove code blocks
  plainText = plainText.replace(/```[\s\S]*?```/g, "");

  // Remove inline code
  plainText = plainText.replace(/`.*?`/g, "");

  // Remove Markdown formatting
  plainText = plainText
    .replace(/#{1,6}\s+/g, "") // Headers
    .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
    .replace(/\*(.*?)\*/g, "$1") // Italic
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Links
    .replace(/!\[(.*?)\]\(.*?\)/g, "$1") // Images
    .replace(/\n>/g, "\n"); // Blockquotes

  // Remove extra whitespace
  plainText = plainText.replace(/\s+/g, " ").trim();

  return plainText;
}

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  try {
    // Try MDX file first, then fall back to MD
    let fullPath = path.join(blogDirectory, `${slug}.mdx`);

    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(blogDirectory, `${slug}.md`);

      if (!fs.existsSync(fullPath)) {
        return null;
      }
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    // Extract plain text for searching
    const searchableContent = extractPlainText(content);

    // Extract headings from the raw content
    const headings = extractHeadings(content);

    try {
      const { content: compiledContent } = await compileMDX({
        source: content,
        components,
        options: {
          parseFrontmatter: false, // We already parsed it with gray-matter
          mdxOptions: {
            remarkPlugins: [remarkMath, remarkGfm],
            rehypePlugins: [
              rehypeSlug, // Add IDs to headings
              rehypeKatex,
              [rehypeHighlight, rehypeHighlightOptions],
            ],
            development: process.env.NODE_ENV === "development",
          },
        },
      });

      return {
        slug,
        content: compiledContent,
        searchableContent,
        headings,
        metadata: {
          title: data.title || "Untitled",
          date: data.date || "1970-01-01",
          readingTime: data.readingTime,
          excerpt: data.excerpt || "",
          tags: data.tags || [],
        },
      };
    } catch (error: unknown) {
      console.error(`Failed to compile MDX for ${slug}:`, error);
      // Return a placeholder for failed compilations
      return {
        slug,
        content: createElement(
          "div",
          {},
          `Error loading content: ${error instanceof Error ? error.message : "Unknown error"}`
        ),
        searchableContent,
        headings,
        metadata: {
          title: data.title || "Untitled",
          date: data.date || "1970-01-01",
          readingTime: data.readingTime,
          excerpt: data.excerpt || "",
          tags: data.tags || [],
        },
      };
    }
  } catch (error) {
    console.error(`Failed to load blog post ${slug}:`, error);
    return null;
  }
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const files = fs.readdirSync(blogDirectory);

  // Process files in batches to avoid overwhelming the system
  const validPosts: BlogPost[] = [];

  for (const file of files) {
    if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;

    try {
      const slug = file.replace(/\.(md|mdx)$/, "");
      const fullPath = path.join(blogDirectory, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      // Extract plain text for searching
      const searchableContent = extractPlainText(content);

      // Extract headings from the raw content
      const headings = extractHeadings(content);

      try {
        const { content: compiledContent } = await compileMDX({
          source: content,
          components,
          options: {
            parseFrontmatter: false, // We already parsed it with gray-matter
            mdxOptions: {
              remarkPlugins: [remarkMath, remarkGfm],
              rehypePlugins: [
                rehypeSlug, // Add IDs to headings
                rehypeKatex,
                [rehypeHighlight, rehypeHighlightOptions],
              ],
              development: process.env.NODE_ENV === "development",
            },
          },
        });

        validPosts.push({
          slug,
          content: compiledContent,
          searchableContent,
          headings,
          metadata: {
            title: data.title || "Untitled",
            date: data.date || "1970-01-01",
            readingTime: data.readingTime,
            excerpt: data.excerpt || "",
            tags: data.tags || [],
          },
        });
      } catch (error: unknown) {
        console.error(`Failed to compile content for ${slug}:`, error);
        // Add a placeholder for failed compilations
        validPosts.push({
          slug,
          content: createElement(
            "div",
            {},
            `Error loading content: ${error instanceof Error ? error.message : "Unknown error"}`
          ),
          searchableContent,
          headings,
          metadata: {
            title: data.title || "Untitled",
            date: data.date || "1970-01-01",
            readingTime: data.readingTime,
            excerpt: data.excerpt || "",
            tags: data.tags || [],
          },
        });
      }
    } catch (error) {
      console.error(`Failed to process file ${file}:`, error);
      // Skip this file and continue with others
    }
  }

  return validPosts.sort(
    (a, b) =>
      new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
  );
}

export async function generateStaticParams() {
  const files = fs.readdirSync(blogDirectory);
  return files
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => ({
      slug: file.replace(/\.(md|mdx)$/, ""),
    }));
}

// Get suggested/related blog posts based on shared tags and recency
export async function getSuggestedPosts(
  currentSlug: string,
  count: number = 3
): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts();

  // Exclude the current post
  const otherPosts = allPosts.filter((post) => post.slug !== currentSlug);

  if (otherPosts.length === 0) {
    return [];
  }

  // Get the current post to compare tags
  const currentPost = allPosts.find((post) => post.slug === currentSlug);
  const currentTags = currentPost?.metadata.tags || [];

  // Score each post based on shared tags
  const scoredPosts = otherPosts.map((post) => {
    const postTags = post.metadata.tags || [];

    // Count shared tags
    const sharedTags = postTags.filter((tag) =>
      currentTags.includes(tag)
    ).length;

    // Calculate recency score (newer posts get higher scores)
    const postDate = new Date(post.metadata.date).getTime();
    const currentDate = new Date().getTime();
    const daysSincePost = (currentDate - postDate) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - daysSincePost / 365); // Decay over a year

    // Combined score: prioritize shared tags, then recency
    const score = sharedTags * 10 + recencyScore;

    return {
      post,
      score,
      sharedTags,
    };
  });

  // Sort by score (highest first), then by date (newest first)
  scoredPosts.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return (
      new Date(b.post.metadata.date).getTime() -
      new Date(a.post.metadata.date).getTime()
    );
  });

  // Return the top N posts
  return scoredPosts.slice(0, count).map((item) => item.post);
}
