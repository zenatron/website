import { T, tA } from "@/components/ui/TerminalWindow";
import dateFormatter from "@/utils/dateFormatter";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Shared types                                                             */
/* ────────────────────────────────────────────────────────────────────────── */

interface Download {
  filename: string;
  label?: string;
  type?: string;
}

export interface ProjectMeta {
  title: string;
  description?: string;
  type?: string;
  slug: string;
  date?: string | Date;
  tags?: string[];
}

export interface ProjectLinks {
  github?: string;
  live?: string;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Helper                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function displayUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.host + u.pathname.replace(/\/$/, "");
  } catch {
    return url;
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  ProjectHeader                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

interface ProjectHeaderProps {
  metadata: ProjectMeta;
  links?: ProjectLinks;
  downloads?: Download[];
}

export function ProjectHeader({
  metadata,
  links = {},
  downloads = [],
}: ProjectHeaderProps) {
  const formattedDate = metadata.date
    ? dateFormatter({ date: metadata.date, formatStyle: "long" })
    : null;

  const typeLabel = metadata.type ?? "project";

  return (
    <div
      className="rounded-t-lg border border-b-0 px-4 sm:px-6 py-3 font-mono"
      style={{
        backgroundColor: tA(T.bg, "cc"),
        borderColor: T.gutter,
      }}
    >
      {/* Command line */}
      <div className="text-xs sm:text-sm mb-4 flex items-center gap-2 flex-wrap">
        <span style={{ color: T.green }}>$</span>
        <span style={{ color: T.fg }}>cat</span>
        <span style={{ color: T.yellow }}>~/projects/{metadata.slug}</span>
      </div>

      {/* Title */}
      <h1
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 font-sans"
        style={{ color: T.fg }}
      >
        {metadata.title}
      </h1>

      {/* Meta row: type, date */}
      <div
        className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm mb-3"
      >
        <span style={{ color: T.purple }}>{typeLabel}</span>
        {formattedDate && (
          <>
            <span style={{ color: T.gutter }}>|</span>
            <span style={{ color: T.comment }}>{formattedDate}</span>
          </>
        )}
      </div>

      {/* Description */}
      {metadata.description && (
        <p
          className="text-sm sm:text-base mb-4 max-w-3xl font-sans"
          style={{ color: T.comment }}
        >
          {metadata.description}
        </p>
      )}

      {/* Tags */}
      {metadata.tags && metadata.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {metadata.tags.map((tag) => (
            <a
              key={tag}
              href={`/projects?tag=${encodeURIComponent(tag)}`}
              className="text-xs sm:text-sm transition-colors duration-150"
              style={{ color: T.blue }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = T.purple;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = T.blue;
              }}
            >
              [{tag}]
            </a>
          ))}
        </div>
      )}

      {/* Links as terminal commands */}
      {(links?.github || links?.live || downloads.length > 0) && (
        <div
          className="space-y-1.5 text-xs sm:text-sm"
          style={{
            borderTop: `1px solid ${T.gutter}`,
            paddingTop: "0.75rem",
          }}
        >
          {links?.github && (
            <a
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 group rounded px-2 py-1 -mx-2 transition-colors duration-150"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tA(T.purple, "0a");
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <span style={{ color: T.green }}>$</span>
              <span style={{ color: T.fg }}>open</span>
              <span style={{ color: T.yellow }}>
                {displayUrl(links.github)}
              </span>
              <span
                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: T.purple }}
              >
                {"\u21B5"}
              </span>
            </a>
          )}
          {links?.live && (
            <a
              href={links.live}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 group rounded px-2 py-1 -mx-2 transition-colors duration-150"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tA(T.purple, "0a");
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <span style={{ color: T.green }}>$</span>
              <span style={{ color: T.fg }}>open</span>
              <span style={{ color: T.yellow }}>
                {displayUrl(links.live)}
              </span>
              <span
                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: T.purple }}
              >
                {"\u21B5"}
              </span>
            </a>
          )}
          {downloads.length > 0 && (
            <div className="flex items-center gap-2 px-2 py-1 -mx-2">
              <span style={{ color: T.green }}>$</span>
              <span style={{ color: T.fg }}>ls</span>
              <span style={{ color: T.yellow }}>./downloads/</span>
              <span style={{ color: T.comment }}>
                # {downloads.length} file{downloads.length !== 1 ? "s" : ""}{" "}
                available
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  ProjectDownloadsBlock                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

interface ProjectDownloadsBlockProps {
  downloads: Download[];
}

export function ProjectDownloadsBlock({
  downloads,
}: ProjectDownloadsBlockProps) {
  if (downloads.length === 0) return null;

  return (
    <div
      className="mb-8 rounded-lg border p-4 font-mono"
      style={{
        borderColor: T.gutter,
        backgroundColor: tA(T.bg, "80"),
      }}
    >
      <div className="text-xs sm:text-sm mb-3">
        <span style={{ color: T.purple }}>Downloads</span>
      </div>
      <div className="space-y-2">
        {downloads.map((dl) => (
          <a
            key={dl.filename}
            href={`/downloads/${dl.filename}`}
            download
            className="flex items-center gap-2 group rounded px-2 py-1.5 -mx-2 transition-colors duration-150 text-xs sm:text-sm"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tA(T.green, "0a");
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <span style={{ color: T.green }}>$</span>
            <span style={{ color: T.fg }}>curl -O</span>
            <span style={{ color: T.yellow }}>{dl.filename}</span>
            {dl.label && (
              <span style={{ color: T.comment }}>
                {"  "}# {dl.label}
              </span>
            )}
            <span
              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: T.green }}
            >
              {"\u2193"}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  ProjectFooter                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

interface ProjectFooterProps {
  tags?: string[];
}

export function ProjectFooter({ tags = [] }: ProjectFooterProps) {
  return (
    <div
      className="rounded-b-lg border border-t-0 px-4 sm:px-6 py-4 font-mono"
      style={{
        backgroundColor: tA(T.bg, "cc"),
        borderColor: T.gutter,
      }}
    >
      {/* EOF divider */}
      <div className="text-xs sm:text-sm mb-4" style={{ color: T.comment }}>
        // EOF
      </div>

      {/* Back link */}
      <a
        href="/projects"
        className="flex items-center gap-2 group rounded px-2 py-1.5 -mx-2 transition-colors duration-150 text-xs sm:text-sm mb-4"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = tA(T.purple, "0a");
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <span style={{ color: T.green }}>$</span>
        <span style={{ color: T.fg }}>cd</span>
        <span style={{ color: T.yellow }}>~/projects</span>
        <span
          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: T.purple }}
        >
          {"\u21B5"}
        </span>
      </a>

      {/* Related tags */}
      {tags.length > 0 && (
        <div className="border-t pt-3" style={{ borderColor: T.gutter }}>
          <div className="text-xs mb-2" style={{ color: T.comment }}>
            related:
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <a
                key={tag}
                href={`/projects?tag=${encodeURIComponent(tag)}`}
                className="inline-flex items-center rounded px-2 py-0.5 text-xs transition-all duration-150"
                style={{
                  backgroundColor: tA(T.blue, "12"),
                  border: `1px solid ${tA(T.blue, "30")}`,
                  color: T.blue,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = tA(T.blue, "22");
                  e.currentTarget.style.borderColor = tA(T.blue, "50");
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = tA(T.blue, "12");
                  e.currentTarget.style.borderColor = tA(T.blue, "30");
                }}
              >
                [{tag}]
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Re-export T/tA for use in the Astro template's inline styles             */
/* ────────────────────────────────────────────────────────────────────────── */

export { T, tA };
