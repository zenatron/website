import { useState, useEffect, useRef, memo, useCallback } from "react";
import { createPortal } from "react-dom";
import TerminalWindow, { T } from "@/components/ui/TerminalWindow";
import ContactModal from "@/components/ui/ContactModal";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { QUICK_FACTS } from "@/lib/config";
import { FaGithub, FaLinkedin } from "react-icons/fa";

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

const CTA_TEXTS = [
  "get-in-touch",
  "reach-out",
  "say-hello",
  "shoot-your-shot",
  "lets-talk",
  "slide-into-dms",
  "make-my-day",
];

/* ── Terminal-styled section header ── */
const TerminalHeader = ({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: React.ReactNode;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-4 text-center"
    >
      <p className="font-mono text-sm tracking-wider" style={{ color: T.comment }}>
        <span style={{ color: T.purple }}>//</span> {label}
      </p>
      <h2 className="text-3xl tracking-tight md:text-4xl">{title}</h2>
      {description}
    </motion.div>
  );
};

/* ── Scroll-triggered section reveal ── */
const ScrollReveal = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ── Terminal-style divider ── */
const TerminalDivider = () => (
  <div className="flex items-center justify-center gap-4" style={{ color: T.gutter }}>
    <div
      className="h-px flex-1"
      style={{ background: `linear-gradient(to right, transparent, ${T.gutter}80)` }}
    />
    <span className="font-mono text-xs">···</span>
    <div
      className="h-px flex-1"
      style={{ background: `linear-gradient(to left, transparent, ${T.gutter}80)` }}
    />
  </div>
);

/* ── Terminal CTA button ── */
const CTAButton = memo(
  ({ ctaIndex, onClick }: { ctaIndex: number; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="group inline-flex items-center gap-2 rounded px-5 py-2.5 font-mono text-sm transition-all duration-200 hover:brightness-125"
      style={{
        backgroundColor: `${T.purple}18`,
        border: `1px solid ${T.purple}44`,
        color: T.purple,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = `${T.purple}28`;
        e.currentTarget.style.borderColor = `${T.purple}66`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = `${T.purple}18`;
        e.currentTarget.style.borderColor = `${T.purple}44`;
      }}
    >
      <span style={{ color: T.green }}>$</span>
      <span className="inline-block w-[16ch] text-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={ctaIndex}
            className="inline-block"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {CTA_TEXTS[ctaIndex]}
          </motion.span>
        </AnimatePresence>
      </span>
      <span
        className="transition-transform duration-200 group-hover:translate-x-0.5"
        style={{ color: T.comment }}
      >
        ↵
      </span>
    </button>
  )
);
CTAButton.displayName = "CTAButton";

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

                <p className="mx-auto max-w-2xl text-lg leading-relaxed text-secondary-text">
                  Mostly building tools, games and AI stuff. I try to write code
                  I can actually read later and avoid 3am incident pages.
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
                    style={{ backgroundColor: `${T.gutter}80` }}
                  />

                  {/* Social links */}
                  <div className="py-1 font-mono text-sm md:text-base">
                    <a
                      href="https://github.com/zenatron"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-3 sm:px-4 py-2 transition-colors duration-150"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${T.purple}10`;
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
                      <span
                        className="w-[8ch] text-left transition-colors duration-150 group-hover:!text-[#c678dd]"
                        style={{ color: T.fg }}
                      >
                        github
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
                        e.currentTarget.style.backgroundColor = `${T.purple}10`;
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
                      <span
                        className="w-[8ch] text-left transition-colors duration-150 group-hover:!text-[#c678dd]"
                        style={{ color: T.fg }}
                      >
                        linkedin
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
                      backgroundColor: `${T.blue}18`,
                      border: `1px solid ${T.blue}44`,
                      color: T.blue,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${T.blue}28`;
                      e.currentTarget.style.borderColor = `${T.blue}66`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = `${T.blue}18`;
                      e.currentTarget.style.borderColor = `${T.blue}44`;
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
                      e.currentTarget.style.borderColor = `${T.purple}66`;
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
                    <span style={{ color: T.purple }}>--sort</span>=<span style={{ color: T.yellow }}>date</span>
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
                              : `1px solid ${T.gutter}30`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `${T.purple}10`;
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
                              {project.type && (
                                <span
                                  className="text-xs capitalize"
                                  style={{ color: T.comment }}
                                >
                                  {project.type}
                                </span>
                              )}
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
                                <span style={{ color: T.blue }}>{tag}</span>
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
                    <span style={{ color: T.blue }}>↵</span>
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
                      <span>LOG</span>
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
                    <span style={{ color: T.purple }}>--limit</span>=<span style={{ color: T.yellow }}>{posts.length}</span>
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
                              : `1px solid ${T.gutter}30`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `${T.purple}10`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <span
                              className="shrink-0"
                              style={{ color: T.yellow }}
                            >
                              {hash}
                            </span>
                            <span
                              className="flex-1 min-w-0 truncate font-medium transition-colors duration-150"
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
                              className="text-xs tabular-nums shrink-0"
                              style={{ color: T.comment }}
                            >
                              {formatDate(post.date)}
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
                    <span style={{ color: T.blue }}>↵</span>
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
