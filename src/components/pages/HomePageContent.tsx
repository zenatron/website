import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import TerminalWindow, { T, tA } from "@/components/ui/TerminalWindow";
import ContactModal from "@/components/ui/ContactModal";
import { motion } from "framer-motion";
import { QUICK_FACTS } from "@/lib/config";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import {
  CTA_TEXTS,
  TerminalHeader,
  ScrollReveal,
  CTAButton,
  TerminalDivider,
} from "@/components/ui/TerminalShared";

/* ── Quotes (reused from QuoteCarousel) ── */
const QUOTES = [
  { text: "The best code is the code you don't have to think about at 2am.", attribution: "me, mass apply reject era" },
  { text: "Ship it. Fix it later. Unless it's auth. Don't ship broken auth.", attribution: "me, learning from others' mistakes" },
  { text: "The goal isn't to write clever code. It's to write code the next person can delete.", attribution: "me, after inheriting spaghetti" },
  { text: "Good tools disappear. You only notice the bad ones.", attribution: "me, after switching IDEs" },
  { text: "Keep your friends rich and your enemies rich, and wait to find out which is which.", attribution: "Ultron" },
  { text: "Every expert was once a beginner who refused to quit.", attribution: "probably a poster somewhere" },
  { text: "Make it work, make it right, make it fast. In that order.", attribution: "Kent Beck (paraphrased)" },
];

/* ── Live-typing fortune terminal ── */
const TerminalFortune = () => {
  const [lines, setLines] = useState<Array<{ type: string; text: string }>>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [currentType, setCurrentType] = useState<"command" | "quote">("command");
  const [isIdle, setIsIdle] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const typeText = (text: string, speed: number): Promise<void> =>
      new Promise((resolve) => {
        let i = 0;
        const tick = () => {
          if (cancelled) return;
          if (i <= text.length) {
            setCurrentLine(text.slice(0, i));
            i++;
            setTimeout(tick, speed + Math.random() * 20 - 10);
          } else {
            resolve();
          }
        };
        tick();
      });

    const addLine = (type: string, text: string) => {
      if (cancelled) return;
      setLines((prev) => {
        const next = [...prev, { type, text }];
        return next.length > 30 ? next.slice(-30) : next;
      });
      setCurrentLine("");
    };

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        setTimeout(() => {
          if (!cancelled) resolve();
        }, ms);
      });

    const run = async () => {
      let idx = 0;
      while (!cancelled) {
        const quote = QUOTES[idx % QUOTES.length];
        idx++;

        // "Up arrow" recalls previous command instantly, pause, then "enter"
        setIsIdle(false);
        setCurrentType("command");
        setCurrentLine("$ fortune");
        await wait(250);
        if (cancelled) break;
        addLine("command", "$ fortune");
        await wait(100);
        if (cancelled) break;

        setCurrentType("quote");
        const qText = `> "${quote.text}"\n— ${quote.attribution}`;
        await typeText(qText, 28);
        if (cancelled) break;
        addLine("quote", qText);
        addLine("blank", "");
        setCurrentLine("");

        setIsIdle(true);
        await wait(2500);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const renderLine = (line: { type: string; text: string }, i: number) => {
    if (line.type === "command") {
      return (
        <div key={i} className="leading-relaxed">
          <span style={{ color: T.green }}>$</span>
          <span style={{ color: T.fg }}> fortune</span>
        </div>
      );
    }
    if (line.type === "quote") {
      // Strip leading "> " then split on newline
      const inner = line.text.startsWith("> ") ? line.text.slice(2) : line.text;
      const parts = inner.split("\n");
      return (
        <div key={i} className="leading-relaxed flex gap-[1ch]">
          <span className="shrink-0" style={{ color: T.green }}>&gt;</span>
          <span style={{ color: T.fg }}>
            {parts.map((part, j) => (
              <span key={j}>
                {j > 0 && "\n"}
                {part}
              </span>
            ))}
          </span>
        </div>
      );
    }
    return <div key={i} className="h-5" />;
  };

  return (
    <TerminalWindow title="~/fortune" noPadding>
      <div className="h-[240px] sm:h-[220px] overflow-hidden flex flex-col justify-end px-3 sm:px-4 py-3 font-mono text-sm md:text-base whitespace-pre-wrap">
        {lines.map(renderLine)}

        {/* Currently typing line */}
        {currentLine && currentType === "command" && (
          <div className="leading-relaxed">
            <span style={{ color: T.green }}>{currentLine[0]}</span>
            <span style={{ color: T.fg }}>{currentLine.slice(1)}</span>
            <span
              className="inline-block w-[7px] h-[1.1em] align-text-bottom ml-px"
              style={{ backgroundColor: T.cursor }}
            />
          </div>
        )}
        {currentLine && currentType === "quote" && (() => {
          const inner = currentLine.startsWith("> ") ? currentLine.slice(2) : currentLine.slice(1);
          const prefix = currentLine.length >= 1 ? currentLine[0] : "";
          const parts = inner.split("\n");
          return (
            <div className="leading-relaxed flex gap-[1ch]">
              <span className="shrink-0" style={{ color: T.green }}>{prefix}</span>
              <span style={{ color: T.fg }}>
                {parts.map((part, j) => (
                  <span key={j}>
                    {j > 0 && "\n"}
                    {part}
                  </span>
                ))}
                <span
                  className="inline-block w-[7px] h-[1.1em] align-text-bottom ml-px"
                  style={{ backgroundColor: T.cursor }}
                />
              </span>
            </div>
          );
        })()}

        {/* Idle blinking cursor */}
        {isIdle && !currentLine && (
          <div className="leading-relaxed">
            <span style={{ color: T.green }}>$</span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="inline-block w-[7px] h-[1.1em] align-text-bottom ml-1"
              style={{ backgroundColor: T.cursor }}
            />
          </div>
        )}
      </div>
    </TerminalWindow>
  );
};

/* ── Deterministic fake git hash ── */
const fakeHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).slice(0, 7).padStart(7, "0");
};

/* ── Date formatting ── */
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

/* ── Types ── */
interface ProjectData {
  title: string;
  slug: string;
  type?: string;
  description?: string;
  tags?: string[];
  date?: string;
}

interface PostData {
  title: string;
  slug: string;
  date: string;
  excerpt?: string;
}

/* ── Project type → theme color ── */
const TYPE_COLOR_MAP: Record<string, string> = {
  data: T.blue,
  web: T.green,
  game: T.purple,
  github: T.comment,
  other: T.yellow,
};

/* ════════════════════════════════════════════════════════════════════
   HomePageContent — Full TUI conversion
   ════════════════════════════════════════════════════════════════════ */
export default function HomePageContent({
  projects,
  posts,
}: {
  projects: ProjectData[];
  posts: PostData[];
}) {
  const [ctaIndex, setCtaIndex] = useState(0);
  const [ctaIndex2, setCtaIndex2] = useState(3);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Listen for contact modal event from command palette
  useEffect(() => {
    const handler = () => setIsModalOpen(true);
    window.addEventListener("open-contact-modal", handler);
    return () => window.removeEventListener("open-contact-modal", handler);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCtaIndex((prev) => (prev + 1) % CTA_TEXTS.length);
      setCtaIndex2((prev) => (prev + 1) % CTA_TEXTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Faint scanline overlay — terminal DNA */}
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.02]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.04) 3px, rgba(255,255,255,0.04) 4px)",
        }}
      />

      <main id="main-content" className="flex-1">
        {/* ─── Hero Section ─── */}
        <section className="px-4 pb-16 pt-24 sm:pb-20 sm:pt-28 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="space-y-8 text-center">
              <div className="space-y-6">
                <p
                  className="font-mono text-sm tracking-wider"
                  style={{ color: T.comment }}
                >
                  <span style={{ color: T.purple }}>//</span> HOME
                </p>

                <h1 className="text-4xl tracking-tight md:text-5xl lg:text-6xl">
                  Phil Vishnevsky
                </h1>

                <p className="mx-auto max-w-2xl text-lg leading-relaxed" style={{ color: T.fg }}>
                  Full-stack engineer focused on dev experience. I build servers, performant web apps, explore creative projects, and occasionally ship things that don't break in production.
                </p>
              </div>

              {/* $ whoami — facts + socials in TerminalWindow */}
              <div className="mx-auto max-w-md text-left">
                <TerminalWindow title="~" noPadding>
                  {/* Command line */}
                  <div
                    className="px-3 sm:px-4 py-2 border-b font-mono text-xs md:text-sm"
                    style={{ borderColor: T.gutter, color: T.comment }}
                  >
                    <span style={{ color: T.green }}>$</span>{" "}
                    <span style={{ color: T.fg }}>whoami</span>
                  </div>

                  {/* Key:value facts */}
                  <div className="px-3 sm:px-4 py-3 font-mono text-sm md:text-base">
                    {QUICK_FACTS.map((fact) => (
                      <div
                        key={fact.label}
                        className="flex items-center justify-between py-1"
                      >
                        <span
                          className="flex items-center gap-2"
                          style={{ color: T.comment }}
                        >
                          <fact.icon className="h-3.5 w-3.5" />
                          {fact.label.toLowerCase()}
                        </span>
                        <span
                          className="flex items-center gap-2"
                          style={{
                            color: fact.label === "Status" ? T.green : T.fg,
                          }}
                        >
                          {fact.label === "Status" && (
                            <span
                              className="inline-block h-2 w-2 rounded-full animate-pulse"
                              style={{ backgroundColor: T.green }}
                            />
                          )}
                          {fact.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div
                    className="mx-3 sm:mx-4 h-px"
                    style={{ backgroundColor: tA(T.gutter, "80") }}
                  />

                  {/* Social links */}
                  <div className="py-1 font-mono text-sm md:text-base">
                    <a
                      href="https://github.com/zenatron"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-3 sm:px-4 py-2 transition-colors duration-150"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = tA(T.purple, "10");
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <span style={{ color: T.gutter }}>├─</span>
                      <FaGithub
                        className="h-3.5 w-3.5 shrink-0"
                        style={{ color: T.comment }}
                      />
                      <span className="w-[8ch] text-left">
                        <span className="group-hover:hidden" style={{ color: T.fg }}>github</span>
                        <span className="hidden group-hover:inline" style={{ color: T.purple }}>github</span>
                      </span>
                      <span className="flex-1 text-right" style={{ color: T.comment }}>
                        zenatron
                      </span>
                      <span
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0"
                        style={{ color: T.purple }}
                      >
                        ↗
                      </span>
                    </a>
                    <a
                      href="https://linkedin.com/in/philvishnevsky"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-3 sm:px-4 py-2 transition-colors duration-150"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = tA(T.purple, "10");
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <span style={{ color: T.gutter }}>└─</span>
                      <FaLinkedin
                        className="h-3.5 w-3.5 shrink-0"
                        style={{ color: T.comment }}
                      />
                      <span className="w-[8ch] text-left">
                        <span className="group-hover:hidden" style={{ color: T.fg }}>linkedin</span>
                        <span className="hidden group-hover:inline" style={{ color: T.purple }}>linkedin</span>
                      </span>
                      <span className="flex-1 text-right" style={{ color: T.comment }}>
                        philvishnevsky
                      </span>
                      <span
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0"
                        style={{ color: T.purple }}
                      >
                        ↗
                      </span>
                    </a>
                  </div>
                </TerminalWindow>
              </div>

              {/* CTA buttons */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="/projects"
                    className="group inline-flex items-center gap-2 rounded px-5 py-2.5 font-mono text-sm transition-all duration-200 hover:brightness-125"
                    style={{
                      backgroundColor: tA(T.blue, "18"),
                      border: `1px solid ${tA(T.blue, "44")}`,
                      color: T.blue,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = tA(T.blue, "28");
                      e.currentTarget.style.borderColor = tA(T.blue, "66");
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = tA(T.blue, "18");
                      e.currentTarget.style.borderColor = tA(T.blue, "44");
                    }}
                  >
                    <span style={{ color: T.green }}>$</span> view-work
                    <span style={{ color: T.comment }}>↵</span>
                  </a>

                  <a
                    href="/about"
                    className="group inline-flex items-center gap-2 rounded px-5 py-2.5 font-mono text-sm transition-all duration-200 hover:brightness-125"
                    style={{
                      backgroundColor: T.bg,
                      border: `1px solid ${T.gutter}`,
                      color: T.fg,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = tA(T.purple, "66");
                      e.currentTarget.style.color = T.purple;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = T.gutter;
                      e.currentTarget.style.color = T.fg;
                    }}
                  >
                    <span style={{ color: T.green }}>$</span> about-me
                    <span style={{ color: T.comment }}>↵</span>
                  </a>
                </div>

                <div className="flex justify-center">
                  <CTAButton ctaIndex={ctaIndex} onClick={() => setIsModalOpen(true)} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Content Sections ─── */}
        <div className="mx-auto max-w-5xl px-4 space-y-16 sm:space-y-24 pb-16 sm:pb-24 sm:px-6">
          {/* ── Projects Section ── */}
          <section>
            <div className="space-y-8">
              <TerminalHeader label="RECENT WORK" title="Latest projects" />
              <ScrollReveal>
                <TerminalWindow
                  title="~/projects/recent"
                  statusBar={
                    <div className="flex items-center justify-between">
                      <span>{projects.length} super cool projects</span>
                      <span>LIST</span>
                    </div>
                  }
                  noPadding
                >
                  {/* Command line */}
                  <div
                    className="px-3 sm:px-4 py-2 border-b font-mono text-xs md:text-sm"
                    style={{ borderColor: T.gutter, color: T.comment }}
                  >
                    <span style={{ color: T.green }}>$</span>{" "}
                    <span style={{ color: T.fg }}>ls</span>{" "}
                    <span style={{ color: T.purple }}>-la</span>{" "}
                    <span style={{ color: T.purple }}>--sort</span>=<span style={{ color: T.orange }}>date</span>
                  </div>

                  {/* Project rows */}
                  <div>
                    {projects.map((project, i) => {
                      const isLast = i === projects.length - 1;
                      const prefix = isLast ? "└─" : "├─";
                      return (
                        <a
                          key={project.slug}
                          href={`/projects/${project.slug}`}
                          className="group flex items-start sm:items-center gap-3 sm:gap-4 px-3 sm:px-4 py-4 sm:py-5 transition-colors duration-150 font-mono text-sm md:text-base"
                          style={{
                            borderBottom: isLast
                              ? "none"
                              : `1px solid ${tA(T.gutter, "30")}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = tA(T.purple, "10");
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                        >
                          <span
                            className="shrink-0 hidden sm:inline"
                            style={{ color: T.gutter }}
                          >
                            {prefix}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                              <span
                                className="font-medium transition-colors duration-150"
                                style={{ color: T.fg }}
                              >
                                <span className="group-hover:hidden">
                                  {project.title}
                                </span>
                                <span
                                  className="hidden group-hover:inline"
                                  style={{ color: T.purple }}
                                >
                                  {project.title}
                                </span>
                              </span>
                              {project.type && (() => {
                                const typeColor = TYPE_COLOR_MAP[project.type?.toLowerCase() ?? "other"] ?? T.yellow;
                                return (
                                  <span className="text-[11px] font-mono">
                                    <span style={{ color: T.gutter }}>[</span>
                                    <span style={{ color: typeColor }}>{project.type}</span>
                                    <span style={{ color: T.gutter }}>]</span>
                                  </span>
                                );
                              })()}
                            </div>
                            {project.description && (
                              <p
                                className="text-xs mt-1 truncate"
                                style={{ color: T.comment }}
                              >
                                {project.description}
                              </p>
                            )}
                          </div>
                          <div className="hidden md:flex items-center gap-1 shrink-0 font-mono text-[11px]">
                            {project.tags?.slice(0, 3).map((tag) => (
                              <span key={tag}>
                                <span style={{ color: T.gutter }}>[</span>
                                <span style={{ color: T.cyan }}>{tag}</span>
                                <span style={{ color: T.gutter }}>]</span>
                              </span>
                            ))}
                          </div>
                          <span
                            className="text-xs tabular-nums shrink-0"
                            style={{ color: T.comment }}
                          >
                            {project.date
                              ? new Date(project.date).getFullYear()
                              : ""}
                          </span>
                          <span
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0"
                            style={{ color: T.purple }}
                          >
                            ↗
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </TerminalWindow>

                {/* "cd" link to full projects page */}
                <div className="mt-4 text-center">
                  <a
                    href="/projects"
                    className="inline-flex items-center gap-2 font-mono text-xs md:text-sm transition-colors duration-150"
                    style={{ color: T.comment }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = T.blue;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = T.comment;
                    }}
                  >
                    <span style={{ color: T.green }}>$</span> cd ~/projects{" "}
                    <span style={{ color: T.cyan }}>↵</span>
                  </a>
                </div>
              </ScrollReveal>
            </div>
          </section>

          <TerminalDivider />

          {/* ── Blog Section ── */}
          <section>
            <div className="space-y-8">
              <TerminalHeader
                label="WRITING"
                title="Recent posts"
                description={
                  <p className="text-secondary-text max-w-xl mx-auto">
                    Sometimes I write things down. Mostly about code.
                  </p>
                }
              />
              <ScrollReveal>
                <TerminalWindow
                  title="~/blog/recent.log"
                  statusBar={
                    <div className="flex items-center justify-between">
                      <span>{posts.length} blog posts</span>
                      <span>bLOG</span>
                    </div>
                  }
                  noPadding
                >
                  {/* Command line */}
                  <div
                    className="px-3 sm:px-4 py-2 border-b font-mono text-xs md:text-sm"
                    style={{ borderColor: T.gutter, color: T.comment }}
                  >
                    <span style={{ color: T.green }}>$</span>{" "}
                    <span style={{ color: T.fg }}>git log</span>{" "}
                    <span style={{ color: T.purple }}>--oneline</span>{" "}
                    <span style={{ color: T.purple }}>--limit</span>=<span style={{ color: T.orange }}>{posts.length}</span>
                  </div>

                  {/* Blog post rows */}
                  <div>
                    {posts.map((post, i) => {
                      const hash = fakeHash(post.slug);
                      const isLast = i === posts.length - 1;
                      return (
                        <a
                          key={post.slug}
                          href={`/blog/${post.slug}`}
                          className="group block px-3 sm:px-4 py-4 sm:py-5 transition-colors duration-150 font-mono text-sm md:text-base"
                          style={{
                            borderBottom: isLast
                              ? "none"
                              : `1px solid ${tA(T.gutter, "30")}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = tA(T.purple, "10");
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <div className="shrink-0 flex flex-col items-start leading-tight">
                              <span
                                className="text-xs md:text-sm"
                                style={{ color: T.yellow }}
                              >
                                {hash}
                              </span>
                              <span
                                className="text-[11px] tabular-nums"
                                style={{ color: T.green }}
                              >
                                {formatDate(post.date)}
                              </span>
                            </div>
                            <span
                              className="flex-1 min-w-0 line-clamp-2 font-medium transition-colors duration-150"
                              style={{ color: T.fg }}
                            >
                              <span className="group-hover:hidden">
                                {post.title}
                              </span>
                              <span
                                className="hidden group-hover:inline"
                                style={{ color: T.purple }}
                              >
                                {post.title}
                              </span>
                            </span>
                            <span
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0"
                              style={{ color: T.purple }}
                            >
                              ↗
                            </span>
                          </div>
                          {post.excerpt && (
                            <p
                              className="mt-1 text-xs truncate hidden sm:block"
                              style={{
                                color: T.comment,
                                paddingLeft: "calc(7ch + 0.75rem)",
                              }}
                            >
                              └─ {post.excerpt}
                            </p>
                          )}
                        </a>
                      );
                    })}
                  </div>
                </TerminalWindow>

                {/* "cd" link to full blog */}
                <div className="mt-4 text-center">
                  <a
                    href="/blog"
                    className="inline-flex items-center gap-2 font-mono text-xs md:text-sm transition-colors duration-150"
                    style={{ color: T.comment }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = T.blue;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = T.comment;
                    }}
                  >
                    <span style={{ color: T.green }}>$</span> cd ~/blog{" "}
                    <span style={{ color: T.cyan }}>↵</span>
                  </a>
                </div>
              </ScrollReveal>
            </div>
          </section>

          <TerminalDivider />

          {/* ── Fortune / Quotes Section ── */}
          <section>
            <ScrollReveal>
              <TerminalFortune />
            </ScrollReveal>
          </section>

          <TerminalDivider />

          {/* ── Bottom CTA / EOF ── */}
          <ScrollReveal className="text-center">
            <div className="space-y-6">
              <div
                className="font-mono text-sm md:text-base"
                style={{ color: T.comment }}
              >
                <span style={{ color: T.gutter }}>{"─".repeat(3)}</span>
                {" "}EOF{" "}
                <span style={{ color: T.gutter }}>{"─".repeat(3)}</span>
              </div>
              <h2 className="text-3xl tracking-tight md:text-4xl">
                Like what you see?
              </h2>
              <CTAButton
                ctaIndex={ctaIndex2}
                onClick={() => setIsModalOpen(true)}
              />
              <p
                className="font-mono text-xs md:text-sm"
                style={{ color: T.comment }}
              >
                <span style={{ color: T.green }}>exit 0</span> · thanks
                for visiting
              </p>
            </div>
          </ScrollReveal>
        </div>
      </main>

      {/* Contact Modal */}
      {mounted &&
        isModalOpen &&
        createPortal(
          <ContactModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />,
          document.body
        )}
    </>
  );
}
