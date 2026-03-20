/**
 * Shared TUI primitives used across Home, About, and other pages.
 * Keeps things DRY — one source of truth for terminal UI patterns.
 */
import { useRef, memo } from "react";
import { T, tA } from "@/components/ui/TerminalWindow";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { QUICK_FACTS } from "@/lib/config";

/* ── Rotating CTA text options ── */
export const CTA_TEXTS = [
  "get-in-touch",
  "reach-out",
  "say-hello",
  "shoot-your-shot",
  "lets-talk",
  "slide-into-dms",
  "make-my-day",
];

/* ── Terminal-styled section header ── */
export const TerminalHeader = ({
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
export const ScrollReveal = ({
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

/* ── Terminal CTA button ── */
export const CTAButton = memo(
  ({ ctaIndex, onClick }: { ctaIndex: number; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="group inline-flex items-center gap-2 rounded px-5 py-2.5 font-mono text-sm transition-all duration-200 hover:brightness-125"
      style={{
        backgroundColor: tA(T.purple, "18"),
        border: `1px solid ${tA(T.purple, "44")}`,
        color: T.purple,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = tA(T.purple, "28");
        e.currentTarget.style.borderColor = tA(T.purple, "66");
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = tA(T.purple, "18");
        e.currentTarget.style.borderColor = tA(T.purple, "44");
      }}
    >
      <span style={{ color: T.green }}>$</span>
      {/* Fixed-width container sized to the longest CTA text */}
      <span className="relative inline-grid items-center overflow-hidden">
        {/* Invisible sizer rows — the grid takes the width of the longest */}
        {CTA_TEXTS.map((t) => (
          <span key={t} className="invisible col-start-1 row-start-1">{t}</span>
        ))}
        {/* Visible animated text on top */}
        <span className="col-start-1 row-start-1">
          <AnimatePresence mode="wait">
            <motion.span
              key={ctaIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="block"
            >
              {CTA_TEXTS[ctaIndex]}
            </motion.span>
          </AnimatePresence>
        </span>
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

/* ── Terminal-style divider ── */
export const TerminalDivider = () => (
  <div className="flex items-center justify-center gap-4" style={{ color: T.gutter }}>
    <div
      className="h-px flex-1"
      style={{
        background: `linear-gradient(to right, transparent, ${tA(T.gutter, "80")})`,
      }}
    />
    <span className="font-mono text-xs">···</span>
    <div
      className="h-px flex-1"
      style={{
        background: `linear-gradient(to left, transparent, ${tA(T.gutter, "80")})`,
      }}
    />
  </div>
);

/* ── Quick facts panel (terminal key:value) ── */
export const QuickFactsPanel = () => (
  <div
    className="mx-auto max-w-md rounded border px-5 py-4 font-mono text-sm"
    style={{ backgroundColor: T.bg, borderColor: T.gutter }}
  >
    {QUICK_FACTS.map((fact) => (
      <div
        key={fact.label}
        className="flex items-center justify-between py-1"
      >
        <span className="flex items-center gap-2" style={{ color: T.comment }}>
          <fact.icon className="h-3.5 w-3.5" />
          {fact.label.toLowerCase()}
        </span>
        <span
          className="flex items-center gap-2"
          style={{ color: fact.label === "Status" ? T.green : T.fg }}
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
);
