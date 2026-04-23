import { motion } from "framer-motion";
import { FaImage } from "react-icons/fa";
import { SiGithub } from "react-icons/si";
import { useState, useEffect, useMemo } from "react";
import TerminalWindow, { T, tA } from "@/components/ui/TerminalWindow";

/* ── Types ── */
interface IconRef {
  url: string;
  name: string;
}

interface Subsection {
  title: string;
  icons: IconRef[];
}

interface Section {
  title: string;
  /** When the section has h3 subsections */
  subsections: Subsection[];
  /** When the section just contains icons directly (no h3s) */
  icons: IconRef[];
}

interface ParsedReadme {
  sections: Section[];
}

/* ── Icon name humanization ──
 * Material-icon-theme & devicon URLs encode the slug — humanize a few
 * cases that wouldn't read well as just the filename.
 */
const NAME_OVERRIDES: Record<string, string> = {
  cpp: "C++",
  csharp: "C#",
  cuda: "CUDA",
  tex: "LaTeX",
  tailwindcss: "Tailwind CSS",
  next: "Next.js",
  nextjs: "Next.js",
  vscode: "VS Code",
  pnpm: "pnpm",
  bun: "Bun",
  prisma: "Prisma",
  prettier: "Prettier",
  vercel: "Vercel",
  vagrant: "Vagrant",
  docker: "Docker",
  jupyter: "Jupyter",
  unity: "Unity",
  markdown: "Markdown",
  database: "Databases",
  console: "Console",
  git: "Git",
  java: "Java",
  python: "Python",
  rust: "Rust",
  typescript: "TypeScript",
  javascript: "JavaScript",
  react: "React",
  astro: "Astro",
  yaml: "YAML",
  blender: "Blender",
};

function iconNameFromUrl(url: string): string {
  try {
    const last = url.split("?")[0].split("#")[0].split("/").pop() || url;
    let slug = last.replace(/\.svg$/i, "");
    // devicon-style "blender-original" → "blender"
    slug = slug.replace(/-(original|plain|line|wordmark|colored|alt)+$/i, "");
    const key = slug.toLowerCase();
    if (NAME_OVERRIDES[key]) return NAME_OVERRIDES[key];
    // Title-case fallback ("foo-bar" → "Foo Bar")
    return slug
      .split(/[-_]/)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  } catch {
    return url;
  }
}

/* ── Parser ──
 * Walks the markdown looking for h2 sections, optional h3 subsections,
 * and <img src="..."> tags. Skips anything inside HTML comments.
 */
function stripHtmlComments(input: string): string {
  return input.replace(/<!--[\s\S]*?-->/g, "");
}

function extractIcons(block: string): IconRef[] {
  const icons: IconRef[] = [];
  const seen = new Set<string>();
  // Match <img src="..."> or <img src=...> (unquoted)
  const re = /<img\b[^>]*\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block)) !== null) {
    const url = m[1] || m[2] || m[3];
    if (!url || seen.has(url)) continue;
    seen.add(url);
    icons.push({ url, name: iconNameFromUrl(url) });
  }
  return icons;
}

function parseReadme(raw: string, useSeparators: boolean): ParsedReadme {
  let content = raw;

  if (useSeparators) {
    // Use the region between the first and second `---` lines.
    const lines = content.split("\n");
    const sepIdxs: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (/^---\s*$/.test(lines[i])) sepIdxs.push(i);
      if (sepIdxs.length === 2) break;
    }
    if (sepIdxs.length === 2) {
      content = lines.slice(sepIdxs[0] + 1, sepIdxs[1]).join("\n");
    }
  }

  content = stripHtmlComments(content);

  // Split on h2 headings. Keep the heading text with its body.
  const h2Parts = content.split(/^##\s+/m).slice(1); // discard preamble
  const sections: Section[] = h2Parts.map((part) => {
    const newlineIdx = part.indexOf("\n");
    const title = (newlineIdx === -1 ? part : part.slice(0, newlineIdx)).trim();
    const body = newlineIdx === -1 ? "" : part.slice(newlineIdx + 1);

    // Look for h3 subsections. If none, treat the whole body as one icon set.
    const h3Parts = body.split(/^###\s+/m);
    const beforeH3 = h3Parts[0];
    const subParts = h3Parts.slice(1);

    if (subParts.length === 0) {
      return { title, subsections: [], icons: extractIcons(beforeH3) };
    }

    const subsections: Subsection[] = subParts.map((sub) => {
      const nl = sub.indexOf("\n");
      const subTitle = (nl === -1 ? sub : sub.slice(0, nl)).trim();
      const subBody = nl === -1 ? "" : sub.slice(nl + 1);
      return { title: subTitle, icons: extractIcons(subBody) };
    });

    return { title, subsections, icons: extractIcons(beforeH3) };
  });

  return { sections };
}

/* ── Single icon tile ── */
function IconTile({ icon }: { icon: IconRef }) {
  const [hovered, setHovered] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div
      className="group relative flex flex-col items-center gap-1.5 rounded-md p-2 transition-all duration-150"
      style={{
        backgroundColor: hovered ? tA(T.purple, "10") : "transparent",
        border: `1px solid ${hovered ? tA(T.purple, "44") : tA(T.gutter, "60")}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={icon.name}
    >
      <div className="flex h-8 w-8 items-center justify-center sm:h-9 sm:w-9">
        {errored ? (
          <FaImage className="h-6 w-6" style={{ color: T.comment }} />
        ) : (
          <img
            src={icon.url}
            alt={icon.name}
            width={36}
            height={36}
            loading="lazy"
            className="h-7 w-7 object-contain sm:h-8 sm:w-8"
            onError={() => setErrored(true)}
          />
        )}
      </div>
      <span
        className="font-mono text-[10px] leading-none transition-colors sm:text-[11px]"
        style={{ color: hovered ? T.purple : T.comment }}
      >
        {icon.name}
      </span>
    </div>
  );
}

/* ── Icon grid ── */
function IconGrid({ icons }: { icons: IconRef[] }) {
  if (icons.length === 0) return null;
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 sm:gap-2.5 md:grid-cols-8">
      {icons.map((icon) => (
        <IconTile key={icon.url} icon={icon} />
      ))}
    </div>
  );
}

/* ── Section title (h2) — terminal "$ ls section/" style ── */
function SectionTitle({ title, count }: { title: string; count: number }) {
  // Strip leading emoji + spaces for the slug; keep the original for display.
  const slug = title
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  return (
    <div className="mb-3 flex items-baseline justify-between gap-3 font-mono text-xs sm:text-sm">
      <div className="min-w-0 truncate">
        <span style={{ color: T.green }}>$</span>{" "}
        <span style={{ color: T.fg }}>ls</span>{" "}
        <span style={{ color: T.purple }}>--section</span>{" "}
        <span style={{ color: T.orange }}>{slug || "section"}</span>
      </div>
      <span className="shrink-0" style={{ color: T.comment }}>
        {count} item{count === 1 ? "" : "s"}
      </span>
    </div>
  );
}

/* ── Subsection title (h3) — tree-style node ── */
function SubsectionTitle({
  title,
  isLast,
  count,
}: {
  title: string;
  isLast: boolean;
  count: number;
}) {
  const prefix = isLast ? "└─" : "├─";
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3 font-mono text-xs sm:text-sm">
      <div className="min-w-0 truncate">
        <span className="select-none" style={{ color: T.gutter }}>
          {prefix}
        </span>{" "}
        <span style={{ color: T.cyan }}>{title.toLowerCase()}</span>
        <span style={{ color: T.gutter }}>/</span>
      </div>
      <span className="shrink-0" style={{ color: T.comment }}>
        {count}
      </span>
    </div>
  );
}

/* ── Section title heading text (the human-readable h2) ── */
function SectionHeading({ title }: { title: string }) {
  return (
    <h3 className="mb-2 text-base font-semibold tracking-tight sm:text-lg">
      {title}
    </h3>
  );
}

interface GitHubReadmeProps {
  repo?: string;
  /** When true, only the region between the first two `---` rules is parsed. */
  processSections?: boolean;
}

interface FetchState {
  data: ParsedReadme | null;
  loading: boolean;
  error: string | null;
}

export default function GitHubReadme({
  repo = "zenatron/zenatron",
  processSections = true,
}: GitHubReadmeProps) {
  const [state, setState] = useState<FetchState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Pre-rendered at build time — see src/pages/api/github/readme.json.ts
        const res = await fetch("/api/github/readme.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = (await res.json()) as { content?: string; error?: string };
        if (payload.error || !payload.content) {
          throw new Error(payload.error ?? "empty_readme");
        }
        const parsed = parseReadme(payload.content, processSections);
        if (!cancelled) {
          setState({ data: parsed, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading README:", err);
          setState({
            data: null,
            loading: false,
            error: "Failed to load README content",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [processSections]);

  const totalIcons = useMemo(() => {
    if (!state.data) return 0;
    return state.data.sections.reduce(
      (sum, s) =>
        sum +
        s.icons.length +
        s.subsections.reduce((subSum, sub) => subSum + sub.icons.length, 0),
      0
    );
  }, [state.data]);

  /* ── Loading ── */
  if (state.loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <TerminalWindow title={`~/github/${repo}/README.md`}>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <span style={{ color: T.green }}>$</span>{" "}
              <span style={{ color: T.fg }}>curl</span>{" "}
              <span style={{ color: T.yellow }}>github.com/{repo}/README.md</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block"
                style={{ color: T.yellow }}
              >
                ⠋
              </motion.span>
              <span style={{ color: T.comment }}>Fetching README...</span>
            </div>
          </div>
        </TerminalWindow>
      </motion.div>
    );
  }

  /* ── Error ── */
  if (state.error || !state.data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <TerminalWindow title={`~/github/${repo}/README.md`}>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <span style={{ color: T.green }}>$</span>{" "}
              <span style={{ color: T.fg }}>curl</span>{" "}
              <span style={{ color: T.yellow }}>github.com/{repo}/README.md</span>
            </div>
            <div>
              <span style={{ color: T.red }}>error:</span>{" "}
              <span style={{ color: T.fg }}>Failed to load GitHub README</span>
            </div>
            <div>
              <span style={{ color: T.comment }}>{"  "}try: </span>
              <a
                href={`https://github.com/${repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline transition-colors hover:brightness-125"
                style={{ color: T.blue }}
              >
                open in browser
              </a>
            </div>
          </div>
        </TerminalWindow>
      </motion.div>
    );
  }

  /* ── Success ── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <TerminalWindow
        title={`~/github/${repo}/README.md`}
        statusBar={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SiGithub className="h-4 w-4" style={{ color: T.fg }} />
              <span>{repo}</span>
              <span className="hidden sm:inline" style={{ color: T.gutter }}>
                · {totalIcons} icons
              </span>
            </div>
            <a
              href={`https://github.com/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:brightness-150"
            >
              [<span style={{ color: T.green }}>$</span>{" "}
              <span style={{ color: T.fg }}>open</span>{" "}
              <span style={{ color: T.purple }}>--github</span>{" "}
              <span style={{ color: T.fg }}>↗</span>]
            </a>
          </div>
        }
      >
        <div className="space-y-8">
          {state.data.sections.map((section, idx) => {
            const sectionCount =
              section.icons.length +
              section.subsections.reduce(
                (sum, sub) => sum + sub.icons.length,
                0
              );

            return (
              <section key={`${section.title}-${idx}`}>
                <SectionTitle title={section.title} count={sectionCount} />
                <SectionHeading title={section.title} />

                {/* direct icons (no subsections) */}
                {section.icons.length > 0 && (
                  <IconGrid icons={section.icons} />
                )}

                {/* h3 subsections */}
                {section.subsections.length > 0 && (
                  <div className="space-y-5">
                    {section.subsections.map((sub, subIdx) => (
                      <div key={`${sub.title}-${subIdx}`}>
                        <SubsectionTitle
                          title={sub.title}
                          isLast={subIdx === section.subsections.length - 1}
                          count={sub.icons.length}
                        />
                        <IconGrid icons={sub.icons} />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}

          {state.data.sections.length === 0 && (
            <div className="font-mono text-sm" style={{ color: T.comment }}>
              <span style={{ color: T.yellow }}>warn:</span> no sections found
            </div>
          )}
        </div>
      </TerminalWindow>
    </motion.div>
  );
}
