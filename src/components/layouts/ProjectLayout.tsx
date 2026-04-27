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
          ~/projects/{metadata.slug}.md
        </span>
        <div className="hidden sm:block w-[52px] shrink-0" />
      </div>

      {/* Metadata body */}
      <div className="p-3 sm:p-4 md:p-5 font-mono text-sm">
        {/* Title */}
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3"
          style={{
            color: T.fg,
            fontFamily:
              '"Atkinson Hyperlegible", system-ui, -apple-system, sans-serif',
          }}
        >
          {metadata.title}
        </h1>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm">
          {formattedDate && (
            <span style={{ color: T.green }}>{formattedDate}</span>
          )}
          <span style={{ color: T.cyan }}>{typeLabel}</span>
        </div>

        {/* Tags */}
        {metadata.tags && metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {metadata.tags.map((tag) => (
              <a
                key={tag}
                href={`/projects?tag=${encodeURIComponent(tag)}`}
                className="transition-colors duration-150 hover:opacity-80"
                style={{ color: T.cyan }}
                title={`View projects tagged ${tag}`}
              >
                [{tag}]
              </a>
            ))}
          </div>
        )}

        {/* Description */}
        {metadata.description && (
          <p
            className="text-sm sm:text-base mt-4 max-w-3xl"
            style={{
              color: T.comment,
              fontFamily:
                '"Atkinson Hyperlegible", system-ui, -apple-system, sans-serif',
            }}
          >
            {metadata.description}
          </p>
        )}

        {/* Links as terminal commands */}
        {(links?.github || links?.live || downloads.length > 0) && (
          <div
            className="space-y-1.5 text-xs sm:text-sm mt-4 pt-3"
            style={{ borderTop: `1px solid ${T.gutter}` }}
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
              <span style={{ color: T.orange }}>
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
              <span style={{ color: T.orange }}>
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
          </div>
        )}
      </div>
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
        <span style={{ color: T.purple }}>Project Files</span>
      </div>
      <div className="space-y-2">
        {downloads.map((dl) => {
          const isViewable = dl.filename.endsWith(".html");
          const ext = dl.filename.split(".").pop()?.toLowerCase() ?? "";
          const autoComment = dl.label
            ? dl.label
            : ext === "html"
              ? "view in browser"
              : ext === "ipynb"
                ? "jupyter notebook"
                : ext === "pdf"
                  ? "PDF document"
                  : ext === "zip"
                    ? "archive"
                    : "download";
          return (
            <a
              key={dl.filename}
              href={`/downloads/${dl.filename}`}
              {...(isViewable
                ? { target: "_blank", rel: "noopener noreferrer" }
                : { download: true })}
              className="flex items-center gap-2 group rounded px-2 py-1.5 -mx-2 transition-colors duration-150 text-xs sm:text-sm"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tA(T.green, "0a");
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <span style={{ color: T.green }}>$</span>
              <span style={{ color: T.fg }}>
                {isViewable ? "open" : "curl -O"}
              </span>
              <span style={{ color: T.orange }}>{dl.filename}</span>
              <span
                className="hidden sm:inline"
                style={{ color: T.comment }}
              >
                {"  "}# {autoComment}
              </span>
              <span
                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: T.green }}
              >
                {isViewable ? "\u21B5" : "\u2193"}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  ProjectFooter                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

interface SuggestedProject {
  slug: string;
  title: string;
  description?: string;
  tags?: string[];
}

interface ProjectFooterProps {
  tags?: string[];
  suggestedProjects?: SuggestedProject[];
}

export function ProjectFooter({
  tags,
  suggestedProjects = [],
}: ProjectFooterProps) {
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

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 font-mono text-sm">
          <span style={{ color: T.comment }}>tags:</span>
          {tags.map((tag) => (
            <a
              key={tag}
              href={`/projects?tag=${encodeURIComponent(tag)}`}
              className="transition-colors duration-150 hover:opacity-80"
              style={{ color: T.cyan }}
              title={`View projects tagged ${tag}`}
            >
              [{tag}]
            </a>
          ))}
        </div>
      )}

      {/* Suggested projects */}
      {suggestedProjects.length > 0 && (
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
            similar projects
          </div>
          <ul className="p-3 sm:p-4 md:p-5 font-mono text-sm space-y-4">
            {suggestedProjects.map((project, i) => (
              <li key={project.slug}>
                <a
                  href={`/projects/${project.slug}`}
                  className="block group transition-colors duration-150"
                >
                  <p
                    className="leading-snug"
                    style={{ paddingLeft: "1.75rem", textIndent: "-1.75rem" }}
                  >
                    <span
                      className="tabular-nums mr-2"
                      style={{ color: T.comment }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="group-hover:underline break-words"
                      style={{ color: T.blue }}
                    >
                      {project.title}
                    </span>
                  </p>
                  {project.description && (
                    <p
                      className="text-xs mt-1 line-clamp-2"
                      style={{ color: T.comment }}
                    >
                      {project.description}
                    </p>
                  )}
                  {project.tags && project.tags.length > 0 && (
                    <p
                      className="text-[11px] mt-1 flex flex-nowrap gap-2 overflow-hidden whitespace-nowrap"
                      style={{ color: T.cyan }}
                    >
                      {project.tags.slice(0, 3).map((tag) => (
                        <span key={tag}>[{tag}]</span>
                      ))}
                    </p>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation back */}
      <div className="font-mono text-sm">
        <a
          href="/projects"
          className="inline-flex items-center gap-2 transition-colors duration-150 hover:opacity-80"
          style={{ color: T.green }}
        >
          <span>$</span>
          <span style={{ color: T.fg }}>cd</span>
          <span style={{ color: T.cyan }}>~/projects</span>
        </a>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Re-export T/tA for use in the Astro template's inline styles             */
/* ────────────────────────────────────────────────────────────────────────── */

export { T, tA };
