'use client';

import Squares from '@/components/bits/Squares';
import { BlogPost } from '@/types/types';
import BlogClient from '@/components/BlogClient';

export default function BlogLayout({ posts }: { posts: BlogPost[] }) {
  return (
    <main className="flex-1 relative overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <Squares
          direction="diagonal"
          speed={0.2}
          borderColor="#333"
          squareSize={96}
          hoverFillColor="#222"
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 px-6 py-10">
        <BlogClient posts={posts} />
      </div>
    </main>
  );
} 