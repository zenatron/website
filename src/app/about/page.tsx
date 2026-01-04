"use client";

import { useState, useEffect, memo } from "react";
import { createPortal } from "react-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/ui/BackToTopButton";
import GitHubReadme from "@/components/ui/GitHubReadme";
import HobbiesSection from "@/components/ui/HobbiesSection";
import ResumeSection from "@/components/ui/ResumeSection";
import ContactModal from "@/components/ui/ContactModal";
import { motion, AnimatePresence } from "framer-motion";
import { QUICK_FACTS } from "@/lib/config";

const CTA_TEXTS = [
  "Get in touch",
  "Reach out",
  "Say hello",
  "Shoot your shot",
  "Let's talk",
  "Slide into my inbox",
  "Make my day",
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

// Memoized CTA button to prevent re-render when seconds counter updates
const CTAButton = memo(
  ({ ctaIndex, onClick }: { ctaIndex: number; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="group inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-accent transition-all duration-200 hover:scale-105"
      style={{
        backgroundColor: "rgba(124, 138, 255, 0.15)",
        border: "1px solid rgba(124, 138, 255, 0.3)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(124, 138, 255, 0.25)";
        e.currentTarget.style.borderColor = "rgba(124, 138, 255, 0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(124, 138, 255, 0.15)";
        e.currentTarget.style.borderColor = "rgba(124, 138, 255, 0.3)";
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={ctaIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {CTA_TEXTS[ctaIndex]}
        </motion.span>
      </AnimatePresence>
      <span className="transition-transform duration-200 group-hover:translate-x-0.5">
        →
      </span>
    </button>
  )
);
CTAButton.displayName = "CTAButton";

export default function AboutPage() {
  const [seconds, setSeconds] = useState(getSecondsOfExperience());
  const [ctaIndex1, setCtaIndex1] = useState(0);
  const [ctaIndex2, setCtaIndex2] = useState(3); // Start with different text
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(getSecondsOfExperience());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rotate CTA texts
  useEffect(() => {
    const interval = setInterval(() => {
      setCtaIndex1((prev) => (prev + 1) % CTA_TEXTS.length);
      setCtaIndex2((prev) => (prev + 1) % CTA_TEXTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const openModal = () => setIsModalOpen(true);

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        {/* Hero Section - matching home page style */}
        <section className="px-4 pb-16 pt-24 sm:pb-20 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="space-y-8 text-center">
              <div className="space-y-6">
                <p className="text-sm font-medium tracking-[0.2em] text-accent">
                  ABOUT
                </p>
                <h1 className="text-4xl tracking-tight md:text-5xl lg:text-6xl">
                  Phil Vishnevsky
                </h1>
                <p className="mx-auto max-w-2xl text-lg leading-relaxed text-secondary-text">
                  I write code, break things, and occasionally ship something
                  useful.
                </p>
              </div>

              {/* Quick facts row */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm">
                {QUICK_FACTS.map((fact, i) => (
                  <div
                    key={fact.label}
                    className="flex items-center gap-2 text-secondary-text"
                  >
                    <fact.icon className="h-4 w-4 text-muted-text" />
                    <span>{fact.value}</span>
                    {i < QUICK_FACTS.length - 1 && (
                      <span className="ml-4 h-1 w-1 rounded-full bg-white/20 hidden sm:inline-block" />
                    )}
                  </div>
                ))}
              </div>

              {/* CTA Button - Top */}
              <div>
                <CTAButton ctaIndex={ctaIndex1} onClick={openModal} />
              </div>
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <div className="mx-auto max-w-5xl px-4 space-y-16 sm:space-y-24 pb-16 sm:pb-24 sm:px-6">
          {/* Resume Section */}
          <section id="resume" className="scroll-mt-24">
            <div className="space-y-8">
              <div className="space-y-4 text-center">
                <p className="text-sm font-medium tracking-[0.2em] text-accent">
                  EXPERIENCE
                </p>
                <h2 className="text-3xl tracking-tight md:text-4xl">
                  The story so far
                </h2>
                <p className="text-secondary-text max-w-xl mx-auto">
                  Started coding in 2019. Haven&apos;t really stopped.
                  That&apos;s, like,{" "}
                  <span className="tabular-nums text-accent">
                    {getDaysOfExperience().toLocaleString()}
                  </span>{" "}
                  days of experience. Or{" "}
                  <span className="tabular-nums text-accent">
                    {seconds.toLocaleString()}
                  </span>{" "}
                  seconds.
                </p>
              </div>
              <ResumeSection />
            </div>
          </section>

          {/* Skills & Tech Section */}
          <section id="skills" className="scroll-mt-24">
            <div className="space-y-8">
              <div className="space-y-4 text-center">
                <p className="text-sm font-medium tracking-[0.2em] text-accent">
                  SKILLS
                </p>
                <h2 className="text-3xl tracking-tight md:text-4xl">
                  Tech & expertise
                </h2>
              </div>
              <GitHubReadme repo="zenatron/zenatron" processSections={true} />
            </div>
          </section>

          {/* Apps, Tools & Hobbies Section */}
          <section id="hobbies" className="scroll-mt-24">
            <div className="space-y-8">
              <div className="space-y-4 text-center">
                <p className="text-sm font-medium tracking-[0.2em] text-accent">
                  OFF THE CLOCK
                </p>
                <h2 className="text-3xl tracking-tight md:text-4xl">
                  Stuff I like
                </h2>
                <p className="text-secondary-text max-w-xl mx-auto">
                  Apps I use, hobbies I have, opinions I&apos;ll probably
                  change.
                </p>
              </div>
              <HobbiesSection />
            </div>
          </section>

          {/* Bottom CTA Section */}
          <section className="text-center">
            <div className="space-y-8">
              <h2 className="text-3xl tracking-tight md:text-4xl">
                Made it this far? I&apos;m impressed.
              </h2>
              <CTAButton ctaIndex={ctaIndex2} onClick={openModal} />
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <BackToTopButton />

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
    </div>
  );
}
