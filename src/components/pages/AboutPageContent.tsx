import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import GitHubReadme from "@/components/ui/GitHubReadme";
import HobbiesSection from "@/components/ui/HobbiesSection";
import ResumeSection from "@/components/ui/ResumeSection";
import NowSection from "@/components/ui/NowSection";
import GitHubActivity from "@/components/ui/GitHubActivity";
import GitHubHeatmap from "@/components/ui/GitHubHeatmap";
import PrinciplesSection from "@/components/ui/PrinciplesSection";
import SetupSection from "@/components/ui/SetupSection";
import ContactModal from "@/components/ui/ContactModal";
import TerminalBoot from "@/components/ui/TerminalBoot";
import { T, tA } from "@/components/ui/TerminalWindow";
import { motion } from "framer-motion";
import { QUICK_FACTS } from "@/lib/config";
import { Terminal } from "lucide-react";
import {
  CTA_TEXTS,
  TerminalHeader,
  ScrollReveal,
  CTAButton,
  TerminalDivider,
  QuickFactsPanel,
} from "@/components/ui/TerminalShared";

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

  // Listen for contact modal event from command palette
  useEffect(() => {
    const handler = () => setIsModalOpen(true);
    window.addEventListener("open-contact-modal", handler);
    return () => window.removeEventListener("open-contact-modal", handler);
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
        <section className="px-4 pb-16 pt-24 sm:pb-20 sm:pt-28 sm:px-6">
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
              <QuickFactsPanel />

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

                  <CTAButton ctaIndex={ctaIndex1} onClick={openModal} />
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={replayBoot}
                    className="group inline-flex items-center gap-2 rounded px-4 py-2 font-mono text-xs transition-all duration-200"
                    style={{
                      backgroundColor: T.bg,
                      border: `1px solid ${T.gutter}`,
                      color: T.comment,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = tA(T.purple, "66");
                      e.currentTarget.style.color = T.purple;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = T.gutter;
                      e.currentTarget.style.color = T.comment;
                    }}
                    title="Replay terminal intro"
                    aria-label="Replay terminal intro"
                  >
                    <Terminal className="h-3.5 w-3.5" />
                    <span>replay-intro</span>
                    <span style={{ color: T.comment }}>↵</span>
                  </button>
                </div>
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

          {/* What I'm Doing Now */}
          <section id="now" className="scroll-mt-24">
            <div className="space-y-8">
              <TerminalHeader
                label="CURRENTLY"
                title="What I'm up to"
                description={
                  <p className="text-secondary-text max-w-xl mx-auto">
                    What I&apos;m building, learning, and reading right now.
                  </p>
                }
              />
              <ScrollReveal>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <GitHubHeatmap />
                  <GitHubActivity />
                </div>
              </ScrollReveal>
              <ScrollReveal>
                <NowSection />
              </ScrollReveal>
              <ScrollReveal>
                <GitHubReadme repo="zenatron/zenatron" processSections={true} />
              </ScrollReveal>
            </div>
          </section>

          <TerminalDivider />

          {/* Apps, Tools, Hobbies, Principles & Setup */}
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
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <HobbiesSection />
                  <div id="principles" className="space-y-8 scroll-mt-24">
                    <PrinciplesSection />
                    <SetupSection />
                  </div>
                </div>
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
