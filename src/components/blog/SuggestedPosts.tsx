"use client";

import Link from "next/link";
import { BlogPost } from "@/types/types";
import dateFormatter from "@/utils/dateFormatter";

interface SuggestedPostsProps {
  posts: BlogPost[];
}

export default function SuggestedPosts({ posts }: SuggestedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 pt-8 border-t border-white/[0.06]">
      <h2 className="text-2xl font-bold mb-6 text-primary-text">
        Related Posts
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <article className="card h-full flex flex-col transition-all duration-200 hover:scale-[1.02]">
              {/* Title */}
              <h3 className="text-lg font-semibold mb-3 text-primary-text group-hover:text-accent transition-colors duration-150 line-clamp-2">
                {post.metadata.title}
              </h3>

              {/* Excerpt */}
              {post.metadata.excerpt && (
                <p className="text-sm text-muted-text mb-4 line-clamp-2 flex-grow">
                  {post.metadata.excerpt}
                </p>
              )}

              {/* Tags */}
              {post.metadata.tags && post.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.metadata.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="tag-bubble text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/blog?tag=${tag}`;
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                  {post.metadata.tags.length > 3 && (
                    <span className="text-xs text-muted-text">
                      +{post.metadata.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-2 text-xs text-muted-text mt-auto">
                <time>
                  {dateFormatter({
                    date: post.metadata.date,
                    formatStyle: "short",
                  })}
                </time>
                {post.metadata.readingTime && (
                  <>
                    <span>•</span>
                    <span>{post.metadata.readingTime}</span>
                  </>
                )}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
