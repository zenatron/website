import type { BlogPost } from "@/types/types";
import TerminalWindow, { T, tA } from "@/components/ui/TerminalWindow";

interface SeriesStripProps {
  series: {
    slug: string;
    title: string;
    posts: BlogPost[];
  };
}

export default function SeriesStrip({ series }: SeriesStripProps) {
  if (!series || series.posts.length === 0) return null;

  return (
    <div className="mb-12">
      <TerminalWindow
        title={`~/series/${series.slug}.series`}
        statusBar={
          <div className="flex items-center justify-between">
            <span>
              <span style={{ color: T.fg }}>{series.posts.length}</span> part{series.posts.length !== 1 ? "s" : ""}
            </span>
            <span>series</span>
          </div>
        }
      >
        {/* Command line */}
        <div
          className="font-mono text-xs sm:text-sm mb-4"
          style={{ color: T.comment }}
        >
          <span style={{ color: T.green }}>$</span>{" "}
          <span style={{ color: T.fg }}>cat</span>{" "}
          <span style={{ color: T.cyan }}>~/series/{series.slug}.series</span>
        </div>

        {/* Comment header */}
        <div
          className="font-mono text-xs sm:text-sm mb-4"
          style={{ color: T.comment }}
        >
          <span style={{ color: T.purple }}>//</span>{" "}
          <span style={{ color: T.fg }}>{series.title}</span>
          {" "}series · {series.posts.length} parts
        </div>

        {/* Series post list */}
        <div className="font-mono text-sm space-y-0">
          {series.posts.map((post, i) => {
            const isLast = i === series.posts.length - 1;
            return (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block group py-3 transition-colors duration-150"
                style={{
                  borderBottom: isLast
                    ? "none"
                    : `1px solid ${tA(T.gutter, "30")}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = tA(T.purple, "08");
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {/* Title row: number, title, reading time */}
                <p className="leading-snug flex items-baseline gap-x-2 gap-y-1 flex-wrap">
                  <span
                    className="tabular-nums shrink-0"
                    style={{ color: T.comment }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="group-hover:text-[var(--t-purple)] transition-colors duration-150 font-medium min-w-0 flex-1"
                    style={{ color: T.fg }}
                  >
                    {post.metadata.title}
                  </span>
                  {post.metadata.readingTime && (
                    <span className="shrink-0 text-xs" style={{ color: T.cyan }}>
                      {post.metadata.readingTime}
                    </span>
                  )}
                </p>

                {/* Excerpt row */}
                {post.metadata.excerpt && (
                  <p
                    className="text-xs mt-0.5 line-clamp-1"
                    style={{
                      paddingLeft: "1.75rem",
                      color: T.comment,
                    }}
                  >
                    {post.metadata.excerpt}
                  </p>
                )}
              </a>
            );
          })}
        </div>
      </TerminalWindow>
    </div>
  );
}
