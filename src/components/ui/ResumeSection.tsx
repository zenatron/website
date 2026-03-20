import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  FaDownload,
  FaExternalLinkAlt,
  FaGraduationCap,
  FaRocket,
  FaGamepad,
  FaLaptopCode,
} from "react-icons/fa";
import TerminalWindow, { T } from "@/components/ui/TerminalWindow";

const currentYear = new Date().getFullYear();

const TIMELINE_EVENTS = [
  {
    year: `${currentYear}`,
    title: "Embedded, AI & Game Development",
    description: "Building AI tools and indie games",
    icon: FaGamepad,
    type: "work" as const,
  },
  {
    year: "2023-Present",
    title: "Full-Stack Engineering",
    description: "Web apps, containers, and embedded",
    icon: FaLaptopCode,
    type: "work" as const,
  },
  {
    year: "2022-2025",
    title: "UNC Charlotte",
    description: "BS, Computer Science",
    icon: FaGraduationCap,
    type: "education" as const,
  },
  {
    year: "2019",
    title: "First Lines of Code",
    description: "Self-taught coding journey begins",
    icon: FaRocket,
    type: "milestone" as const,
  },
];

const TYPE_COLORS: Record<string, { text: string; label: string }> = {
  work: { text: T.purple, label: "work" },
  education: { text: T.blue, label: "edu" },
  milestone: { text: T.yellow, label: "milestone" },
};

const STATS = [
  { label: "years_coding", numValue: currentYear - 2019, suffix: "+", color: T.purple },
  { label: "projects", numValue: 15, suffix: "+", color: T.blue },
  { label: "technologies", numValue: 11, suffix: "+", color: T.green },
];

/* ── Animated count-up stat with TUI progress bar ── */
function AnimatedStat({
  numValue,
  suffix,
  label,
  color,
  maxValue = 20,
}: {
  numValue: number;
  suffix: string;
  label: string;
  color: string;
  maxValue?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1200;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * numValue));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, numValue]);

  const filledBlocks = Math.round((display / maxValue) * 10);
  const emptyBlocks = 10 - filledBlocks;

  return (
    <div ref={ref} className="font-mono text-xs sm:text-sm">
      <div className="flex items-baseline justify-between mb-1">
        <span style={{ color: T.comment }}>{label}</span>
        <span className="tabular-nums font-bold" style={{ color }}>
          {display}{suffix}
        </span>
      </div>
      <div className="flex items-center gap-0.5">
        <span style={{ color: T.gutter }}>[</span>
        <span style={{ color }}>{"█".repeat(filledBlocks)}</span>
        <span style={{ color: T.gutter }}>{"░".repeat(emptyBlocks)}</span>
        <span style={{ color: T.gutter }}>]</span>
      </div>
    </div>
  );
}

export default function ResumeSection() {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/downloads/Resume_Phil_Vishnevsky.pdf";
    link.download = "Resume_Phil_Vishnevsky.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = () => {
    window.open("/downloads/Resume_Phil_Vishnevsky.pdf", "_blank");
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr,1.2fr] lg:gap-12">
      {/* Left Side: Timeline + Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <TerminalWindow
          title="~/journey/timeline.log"
          statusBar={
            <div className="flex justify-between">
              <span>{TIMELINE_EVENTS.length} logs</span>
              <span>LOG</span>
            </div>
          }
        >
          {/* Tree-style timeline */}
          <div className="font-mono text-xs sm:text-sm" style={{ color: T.fg }}>
            {TIMELINE_EVENTS.map((event, index) => {
              const isLast = index === TIMELINE_EVENTS.length - 1;
              const typeColor = TYPE_COLORS[event.type];
              /* Desktop: last item uses └─, others ├─ (all content on 2 lines) */
              const prefix = isLast ? "└─ " : "├─ ";
              const linePrefix = isLast ? "   " : "│  ";
              /* Mobile: last item still needs │ on continuation lines,
                 with └─ only on the final line (the tag) */
              const mobilePrefix = isLast ? "│  " : "├─ ";
              const mobileLinePrefix = "│  ";
              const mobileLastLine = isLast ? "└─ " : "│  ";

              return (
                <motion.div
                  key={event.year}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="group cursor-default"
                >
                  {/* Line 1: prefix + year (+ title on desktop) */}
                  <div className="hidden sm:flex items-baseline">
                    <span className="shrink-0" style={{ color: T.gutter }}>{prefix}</span>
                    <span
                      className="font-bold tabular-nums shrink-0"
                      style={{ color: typeColor.text }}
                    >
                      {event.year}
                    </span>
                    <span style={{ color: T.gutter }}>{" — "}</span>
                    <span style={{ color: T.fg }}>{event.title}</span>
                  </div>

                  {/* Desktop: description + type tag */}
                  <div className="hidden sm:flex items-center">
                    <span className="shrink-0" style={{ color: T.gutter }}>{linePrefix}</span>
                    <span style={{ color: T.comment }}>{event.description}</span>
                    <span style={{ color: T.gutter }}>{" ["}</span>
                    <span style={{ color: typeColor.text }}>{typeColor.label}</span>
                    <span style={{ color: T.gutter }}>{"]"}</span>
                  </div>

                  {/* Desktop: connector */}
                  {!isLast && <div className="hidden sm:block" style={{ color: T.gutter }}>│</div>}

                  {/* ── Mobile: stacked with tree running through all lines ── */}

                  {/* Mobile line 1: year */}
                  <div className="sm:hidden flex items-baseline">
                    <span className="shrink-0" style={{ color: T.gutter }}>{mobilePrefix}</span>
                    <span
                      className="font-bold tabular-nums shrink-0"
                      style={{ color: typeColor.text }}
                    >
                      {event.year}
                    </span>
                  </div>

                  {/* Mobile line 2: title */}
                  <div className="sm:hidden flex">
                    <span className="shrink-0" style={{ color: T.gutter }}>{mobileLinePrefix}</span>
                    <span style={{ color: T.fg }}>{event.title}</span>
                  </div>

                  {/* Mobile line 3: description */}
                  <div className="sm:hidden flex items-center">
                    <span className="shrink-0" style={{ color: T.gutter }}>{mobileLinePrefix}</span>
                    <span style={{ color: T.comment }}>{event.description}</span>
                  </div>

                  {/* Mobile line 4: type tag (last visible line of this entry) */}
                  <div className="sm:hidden flex">
                    <span className="shrink-0" style={{ color: T.gutter }}>{mobileLastLine}</span>
                    <span style={{ color: T.gutter }}>{"["}</span>
                    <span style={{ color: typeColor.text }}>{typeColor.label}</span>
                    <span style={{ color: T.gutter }}>{"]"}</span>
                  </div>

                  {/* Mobile: connector between entries */}
                  {!isLast && <div className="sm:hidden" style={{ color: T.gutter }}>│</div>}
                </motion.div>
              );
            })}

            {/* "More to come" */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-3 flex items-center gap-2"
            >
              <span style={{ color: T.gutter }}>{"   "}</span>
              <span className="animate-pulse" style={{ color: T.purple }}>...</span>
              <span className="italic" style={{ color: T.comment }}>more chapters loading</span>
            </motion.div>
          </div>
        </TerminalWindow>

        {/* Stats — TUI progress bars */}
        <div className="mt-6">
          <TerminalWindow
            title="~/stats/overview"
            statusBar={
              <div className="flex justify-between">
                <span>
                  last updated: <span style={{ color: T.green }}>now</span>
                </span>
                <span>STATS</span>
              </div>
            }
          >
            <div className="space-y-3">
              {STATS.map((stat) => (
                <AnimatedStat
                  key={stat.label}
                  numValue={stat.numValue}
                  suffix={stat.suffix}
                  label={stat.label}
                  color={stat.color}
                  maxValue={stat.label === "years_coding" ? 15 : 20}
                />
              ))}
            </div>
          </TerminalWindow>
        </div>
      </motion.div>

      {/* Right Side: Resume Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <TerminalWindow
          title="~/resume/resume.pdf"
          noPadding
          statusBar={
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="transition-colors hover:brightness-150"
                >
                  [<span style={{ color: T.green }}>$</span>{" "}
                  <span style={{ color: T.fg }}>open</span>{" "}
                  <span style={{ color: T.purple }}>--full-size</span>]
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="transition-colors hover:brightness-150"
                >
                  [<span style={{ color: T.green }}>$</span>{" "}
                  <span style={{ color: T.fg }}>download</span>{" "}
                  <span style={{ color: T.yellow }}>resume.pdf</span>]
                </button>
              </div>
              <span className="hidden sm:inline">PDF · 1 page</span>
            </div>
          }
        >
          {/* PDF Embed */}
          <div className="aspect-[8.5/11] w-full">
            <iframe
              src="/downloads/Resume_Phil_Vishnevsky.pdf#toolbar=0&navpanes=0&zoom=FitH"
              className="h-full w-full border-0"
              title="Resume Preview"
              loading="lazy"
            />
          </div>
        </TerminalWindow>

        {/* Action buttons below — always visible
        <div className="mt-3 flex gap-2 font-mono text-xs sm:text-sm">
          <button
            type="button"
            onClick={handlePreview}
            className="flex flex-1 items-center justify-center gap-2 rounded border py-2.5 transition-all hover:brightness-125"
            style={{
              borderColor: T.gutter,
              backgroundColor: T.bg,
              color: T.fg,
            }}
          >
            <FaExternalLinkAlt className="h-3 w-3" />
            <span className="hidden sm:inline">$ open --full-size</span>
            <span className="sm:hidden">open</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex flex-1 items-center justify-center gap-2 rounded border py-2.5 transition-all hover:brightness-125"
            style={{
              borderColor: `${T.purple}44`,
              backgroundColor: `${T.purple}12`,
              color: T.purple,
            }}
          >
            <FaDownload className="h-3 w-3" />
            <span className="hidden sm:inline">$ download resume.pdf</span>
            <span className="sm:hidden">download</span>
          </button>
        </div> */}
      </motion.div>
    </div>
  );
}
