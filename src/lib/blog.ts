import { getCollection, getEntry } from "astro:content";
import type { CollectionEntry } from "astro:content";

export type BlogPostEntry = CollectionEntry<"blog">;

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

export async function getAllBlogPosts() {
  const posts = await getCollection("blog");
  return posts
    .map((post) => ({
      ...post,
      searchableContent: extractPlainText(post.body ?? ""),
    }))
    .sort(
      (a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    );
}

export async function getBlogPostBySlug(slug: string) {
  const post = await getEntry("blog", slug);
  if (!post) return null;
  return {
    ...post,
    searchableContent: extractPlainText(post.body ?? ""),
  };
}

export async function getSuggestedPosts(
  currentSlug: string,
  count: number = 3
) {
  const allPosts = await getAllBlogPosts();
  const otherPosts = allPosts.filter((post) => post.slug !== currentSlug);

  if (otherPosts.length === 0) return [];

  const currentPost = allPosts.find((post) => post.slug === currentSlug);
  const currentTags = currentPost?.data.tags || [];

  const scoredPosts = otherPosts.map((post) => {
    const postTags = post.data.tags || [];
    const sharedTags = postTags.filter((tag) =>
      currentTags.includes(tag)
    ).length;

    const postDate = new Date(post.data.date).getTime();
    const currentDate = new Date().getTime();
    const daysSincePost = (currentDate - postDate) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - daysSincePost / 365);
    const score = sharedTags * 10 + recencyScore;

    return { post, score, sharedTags };
  });

  scoredPosts.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (
      new Date(b.post.data.date).getTime() -
      new Date(a.post.data.date).getTime()
    );
  });

  return scoredPosts.slice(0, count).map((item) => item.post);
}
