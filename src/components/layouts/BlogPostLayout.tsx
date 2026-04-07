import type { BlogPost } from "@/types/types";
import dateFormatter from "@/utils/dateFormatter";
import { T, tA } from "@/components/ui/TerminalWindow";

/* ── Header chrome ── */

interface BlogPostHeaderProps {
  title: string;
  slug: string;
  date: string;
  readingTime?: string;
  tags?: string[];
}

export function BlogPostHeader({
  title,
  slug,
  date,
  readingTime,
  tags,
}: BlogPostHeaderProps) {
  return (
    <div
      className="rounded-lg border overflow-hidden mb-8"
      style={{ backgroundColor: tA(T.bg, "80"), borderColor: T.gutter }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-b"
        style={{ borderColor: T.gutter }}
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full opacity-80"
            style={{ backgroundColor: T.red }}
          />
          <span
            className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full opacity-80"
            style={{ backgroundColor: T.yellow }}
          />
          <span
            className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full opacity-80"
            style={{ backgroundColor: T.green }}
          />
        </div>
        <span
          className="flex-1 text-center font-mono text-[11px] sm:text-xs md:text-sm truncate px-2"
          style={{ color: T.comment }}
        >
          ~/blog/{slug}.mdx
        </span>
        <div className="hidden sm:block w-[52px] shrink-0" />
      </div>

      {/* Command + metadata body */}
      <div className="p-3 sm:p-4 md:p-5 font-mono text-sm">
        {/* Command line */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span style={{ color: T.green }}>$</span>
          <span style={{ color: T.fg }}>cat</span>
          <span style={{ color: T.cyan }}>~/blog/{slug}.mdx</span>
        </div>

        {/* Title */}
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold mt-4 mb-3"
          style={{
            color: T.fg,
            fontFamily:
              '"Atkinson Hyperlegible", system-ui, -apple-system, sans-serif',
          }}
        >
          {title}
        </h1>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm">
          <span style={{ color: T.green }}>
            {dateFormatter({ date, formatStyle: "long" })}
          </span>
          {readingTime && (
            <span style={{ color: T.cyan }}>{readingTime}</span>
          )}
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag) => (
              <a
                key={tag}
                href={`/blog?tag=${tag}`}
                className="transition-colors duration-150 hover:opacity-80"
                style={{ color: T.cyan }}
                title={`View posts tagged ${tag}`}
              >
                [{tag}]
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Footer chrome ── */

interface BlogPostFooterProps {
  tags?: string[];
  suggestedPosts: BlogPost[];
}

export function BlogPostFooter({
  tags,
  suggestedPosts,
}: BlogPostFooterProps) {
  return (
    <div className="mt-12">
      {/* EOF divider */}
      <div
        className="font-mono text-sm mb-8 flex items-center gap-3"
        style={{ color: T.comment }}
      >
        <span
          className="flex-1 border-t"
          style={{ borderColor: T.gutter }}
        />
        <span>// EOF</span>
        <span
          className="flex-1 border-t"
          style={{ borderColor: T.gutter }}
        />
      </div>

      {/* Tags (bottom) */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 font-mono text-sm">
          <span style={{ color: T.comment }}>tags:</span>
          {tags.map((tag) => (
            <a
              key={tag}
              href={`/blog?tag=${tag}`}
              className="transition-colors duration-150 hover:opacity-80"
              style={{ color: T.cyan }}
              title={`View posts tagged ${tag}`}
            >
              [{tag}]
            </a>
          ))}
        </div>
      )}

      {/* Suggested posts */}
      {suggestedPosts.length > 0 && (
        <div
          className="rounded-lg border overflow-hidden mb-8"
          style={{
            backgroundColor: tA(T.bg, "80"),
            borderColor: T.gutter,
          }}
        >
          <div
            className="px-3 sm:px-4 py-2 sm:py-2.5 border-b font-mono text-xs sm:text-sm"
            style={{ borderColor: T.gutter, color: T.comment }}
          >
            suggested reads
          </div>
          <div className="p-3 sm:p-4 md:p-5 font-mono text-sm space-y-3">
            {suggestedPosts.map((post, i) => (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block group transition-colors duration-150"
              >
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span style={{ color: T.comment }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="group-hover:underline"
                    style={{ color: T.blue }}
                  >
                    {post.metadata.title}
                  </span>
                  {post.metadata.readingTime && (
                    <span
                      className="text-xs"
                      style={{ color: T.cyan }}
                    >
                      {post.metadata.readingTime}
                    </span>
                  )}
                </div>
                {post.metadata.excerpt && (
                  <p
                    className="ml-6 text-xs mt-0.5 line-clamp-1"
                    style={{ color: T.comment }}
                  >
                    {post.metadata.excerpt}
                  </p>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Navigation back */}
      <div className="font-mono text-sm">
        <a
          href="/blog"
          className="inline-flex items-center gap-2 transition-colors duration-150 hover:opacity-80"
          style={{ color: T.green }}
        >
          <span>$</span>
          <span style={{ color: T.fg }}>cd</span>
          <span style={{ color: T.cyan }}>~/blog</span>
        </a>
      </div>
    </div>
  );
}
