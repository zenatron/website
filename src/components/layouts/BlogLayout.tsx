"use client";

import { BlogPost } from "@/types/types";
import BlogClient from "@/components/layouts/BlogClient";

export default function BlogLayout({ posts }: { posts: BlogPost[] }) {
  return (
    <main className="flex-1 relative overflow-hidden">
      {/* Content */}
      <div className="relative z-10 px-6 py-10">
        <BlogClient posts={posts} />
      </div>
    </main>
  );
}
