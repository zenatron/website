import type { BlogPost } from "@/types/types";
import BlogClient from "@/components/layouts/BlogClient";

export interface SeriesData {
  slug: string;
  title: string;
  posts: BlogPost[];
}

export default function BlogLayout({ posts, series }: { posts: BlogPost[]; series?: SeriesData | null }) {
  return (
    <main className="flex-1 relative overflow-hidden">
      <BlogClient posts={posts} series={series ?? undefined} />
    </main>
  );
}
