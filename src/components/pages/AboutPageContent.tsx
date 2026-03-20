import { useState, useEffect, useRef, memo, useCallback } from "react";
import { createPortal } from "react-dom";
import GitHubReadme from "@/components/ui/GitHubReadme";
import HobbiesSection from "@/components/ui/HobbiesSection";
import ResumeSection from "@/components/ui/ResumeSection";
import ContactModal from "@/components/ui/ContactModal";
import TerminalBoot from "@/components/ui/TerminalBoot";
import { T } from "@/components/ui/TerminalWindow";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { QUICK_FACTS } from "@/lib/config";
import { Terminal } from "lucide-react";

const CTA_TEXTS = [
  "get-in-touch",
  "reach-out",
  "say-hello",
  "shoot-your-shot",
  "lets-talk",
  "slide-into-inbox",
  "make-my-day",
];

const CODING_START_DATE = new Date("2019-06-01");
const getDaysOfExperience = () => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - CODING_START_DATE.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};
const getSecondsOfExperience = () => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - CODING_START_DATE.getTime());
  return Math.floor(diffTime / 1000);
};

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
      <AnimatePresence mode="wait">
        <motion.span
          key={ctaIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {CTA_TEXTS[ctaIndex]}
        </motion.span>
      </AnimatePresence>
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
const TerminalDivider = () => (
  <div className="flex items-center justify-center gap-4" style={{ color: T.gutter }}>
    <div
      className="h-px flex-1"
      style={{
        background: `linear-gradient(to right, transparent, ${T.gutter}80)`,
      }}
    />
    <span className="font-mono text-xs">···</span>
    <div
      className="h-px flex-1"
      style={{
        background: `linear-gradient(to left, transparent, ${T.gutter}80)`,
      }}
    />
  </div>
);

export default function AboutPageContent() {
  const [seconds, setSeconds] = useState(getSecondsOfExperience());
  const [ctaIndex1, setCtaIndex1] = useState(0);
  const [ctaIndex2, setCtaIndex2] = useState(3);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [booted, setBooted] = useState(false);
  const [bootKey, setBootKey] = useState(0);

  const handleBootComplete = useCallback(() => setBooted(true), []);

  const replayBoot = useCallback(() => {
    sessionStorage.removeItem("terminal-boot-played");
    setBooted(false);
    setBootKey((k) => k + 1);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(getSecondsOfExperience());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCtaIndex1((prev) => (prev + 1) % CTA_TEXTS.length);
      setCtaIndex2((prev) => (prev + 1) % CTA_TEXTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const openModal = () => setIsModalOpen(true);

  return (
    <>
      {/* Terminal Boot Overlay */}
      {mounted && (
        <TerminalBoot key={bootKey} onComplete={handleBootComplete} />
      )}

      {/* Faint scanline overlay — hybrid terminal DNA */}
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.02]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.04) 3px, rgba(255,255,255,0.04) 4px)",
        }}
      />

      <motion.main
        id="main-content"
        className="flex-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: booted ? 1 : 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {/* Hero Section */}
        <section className="px-4 pb-16 pt-24 sm:pb-20 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="space-y-8 text-center">
              <div className="space-y-6">
                <p className="font-mono text-sm tracking-wider" style={{ color: T.comment }}>
                  <span style={{ color: T.purple }}>//</span> ABOUT
                </p>
                <h1 className="text-4xl tracking-tight md:text-5xl lg:text-6xl">
                  Phil Vishnevsky
                </h1>
                <p className="mx-auto max-w-2xl text-lg leading-relaxed text-secondary-text">
                  I write code, break things, and occasionally ship something
                  useful.
                </p>
              </div>

              {/* Quick facts — terminal key:value style */}
              <div
                className="mx-auto max-w-md rounded border px-5 py-4 font-mono text-sm"
                style={{ backgroundColor: T.bg, borderColor: T.gutter }}
              >
                {QUICK_FACTS.map((fact, i) => (
                  <div
                    key={fact.label}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="flex items-center gap-2" style={{ color: T.comment }}>
                      <fact.icon className="h-3.5 w-3.5" />
                      {fact.label.toLowerCase()}
                    </span>
                    <span style={{ color: T.fg }}>{fact.value}</span>
                  </div>
                ))}
              </div>

              {/* CTA + replay button */}
              <div className="flex items-center justify-center gap-3">
                <CTAButton ctaIndex={ctaIndex1} onClick={openModal} />
                <button
                  onClick={replayBoot}
                  className="group flex h-10 w-10 items-center justify-center rounded border transition-all duration-200"
                  style={{
                    borderColor: T.gutter,
                    backgroundColor: T.bg,
                    color: T.comment,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${T.purple}66`;
                    e.currentTarget.style.color = T.purple;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = T.gutter;
                    e.currentTarget.style.color = T.comment;
                  }}
                  title="Replay terminal intro"
                  aria-label="Replay terminal intro"
                >
                  <Terminal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <div className="mx-auto max-w-5xl px-4 space-y-16 sm:space-y-24 pb-16 sm:pb-24 sm:px-6">
          {/* Resume Section */}
          <section id="resume" className="scroll-mt-24">
            <div className="space-y-8">
              <TerminalHeader
                label="EXPERIENCE"
                title="The story so far"
                description={
                  <p className="text-secondary-text max-w-xl mx-auto">
                    Started coding in 2019. Haven&apos;t really stopped.
                    That&apos;s, like,{" "}
                    <span
                      className="tabular-nums font-mono font-medium"
                      style={{ color: T.yellow }}
                    >
                      {getDaysOfExperience().toLocaleString()}
                    </span>{" "}
                    days of experience. Or{" "}
                    <span
                      className="tabular-nums font-mono font-medium"
                      style={{ color: T.yellow }}
                    >
                      {seconds.toLocaleString()}
                    </span>{" "}
                    seconds
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                      className="inline-block w-[2px] h-[1em] ml-0.5 align-text-bottom"
                      style={{ backgroundColor: T.cursor }}
                    />
                  </p>
                }
              />
              <ScrollReveal>
                <ResumeSection />
              </ScrollReveal>
            </div>
          </section>

          <TerminalDivider />

          {/* Skills & Tech Section */}
          <section id="skills" className="scroll-mt-24">
            <div className="space-y-8">
              <TerminalHeader label="SKILLS" title="Tech & expertise" />
              <ScrollReveal>
                <GitHubReadme repo="zenatron/zenatron" processSections={true} />
              </ScrollReveal>
            </div>
          </section>

          <TerminalDivider />

          {/* Apps, Tools & Hobbies Section */}
          <section id="hobbies" className="scroll-mt-24">
            <div className="space-y-8">
              <TerminalHeader
                label="OFF THE CLOCK"
                title="Stuff I like"
                description={
                  <p className="text-secondary-text max-w-xl mx-auto">
                    Apps I use, hobbies I have, opinions I&apos;ll probably
                    change.
                  </p>
                }
              />
              <ScrollReveal>
                <HobbiesSection />
              </ScrollReveal>
            </div>
          </section>

          <TerminalDivider />

          {/* Bottom CTA Section */}
          <ScrollReveal className="text-center">
            <div className="space-y-6">
              <div className="font-mono text-sm" style={{ color: T.comment }}>
                <span style={{ color: T.gutter }}>{"─".repeat(3)}</span>
                {" "}EOF{" "}
                <span style={{ color: T.gutter }}>{"─".repeat(3)}</span>
              </div>
              <h2 className="text-3xl tracking-tight md:text-4xl">
                Made it this far? I&apos;m impressed.
              </h2>
              <CTAButton ctaIndex={ctaIndex2} onClick={openModal} />
              <p className="font-mono text-xs" style={{ color: T.comment }}>
                <span style={{ color: T.green }}>exit 0</span> · thanks for scrolling
              </p>
            </div>
          </ScrollReveal>
        </div>
      </motion.main>

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
