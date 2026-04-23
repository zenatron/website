import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import TerminalWindow, { T, tA } from "@/components/ui/TerminalWindow";

/* ── The whole essay in four lines ── */
const MANIFESTO: { text: string; color: string }[] = [
  { text: "build smarter.",      color: T.purple },
  { text: "walk with purpose.",  color: T.cyan   },
  { text: "never stop learning.", color: T.yellow },
  { text: "be kind.",            color: T.green  },
];

const POST_PATH = "/blog/principles";

export default function PrinciplesSection() {
  return (
    <TerminalWindow
      title="~/principles"
      statusBar={
        <div className="flex items-center justify-between">
          <span>
            <span style={{ color: T.fg }}>{MANIFESTO.length}</span> lines
            <span style={{ color: T.gutter }}> · </span>
            <span style={{ color: T.fg }}>1</span> post
          </span>
          <span>TL;DR</span>
        </div>
      }
    >
      {/* Command line */}
      <div
        className="font-mono text-xs md:text-sm mb-4"
        style={{ color: T.comment }}
      >
        <span style={{ color: T.green }}>$</span>{" "}
        <span style={{ color: T.fg }}>echo</span>{" "}
        <span style={{ color: T.orange }}>$MANIFESTO</span>
      </div>

      {/* The manifesto — typed out line by line */}
      <div className="font-mono text-sm sm:text-base space-y-1.5 mb-5">
        {MANIFESTO.map((line, i) => (
          <motion.div
            key={line.text}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex items-baseline gap-2"
          >
            <span className="select-none" style={{ color: T.gutter }}>
              ›
            </span>
            <span style={{ color: line.color }}>{line.text}</span>
          </motion.div>
        ))}
        {/* Trailing cursor for terminal vibe */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: MANIFESTO.length * 0.12 + 0.15 }}
          className="flex items-center gap-2"
        >
          <span className="select-none" style={{ color: T.gutter }}>
            ›
          </span>
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, repeatType: "reverse" }}
            className="inline-block w-[8px] h-[1.05em] align-text-bottom"
            style={{ backgroundColor: T.cursor }}
          />
        </motion.div>
      </div>

      {/* tl;dr blurb */}
      <div className="font-mono text-xs mb-4" style={{ color: T.comment }}>
        <span style={{ color: T.purple }}>//</span> read the rest:
      </div>

      {/* Read the full thing CTA */}
      <a
        href={POST_PATH}
        className="group block rounded-md transition-all duration-150"
        style={{
          backgroundColor: tA(T.purple, "10"),
          border: `1px solid ${tA(T.purple, "44")}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = tA(T.purple, "1c");
          e.currentTarget.style.borderColor = tA(T.purple, "77");
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = tA(T.purple, "10");
          e.currentTarget.style.borderColor = tA(T.purple, "44");
        }}
      >
        <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 font-mono text-xs sm:text-sm">
          <span style={{ color: T.green }}>$</span>
          <span style={{ color: T.fg }}>cat</span>
          <span className="truncate" style={{ color: T.blue }}>
            ~/blog/principles.mdx
          </span>
          <span className="ml-auto flex items-center gap-1.5 shrink-0" style={{ color: T.purple }}>
            <span className="hidden sm:inline">read full</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </span>
        </div>
      </a>
    </TerminalWindow>
  );
}
