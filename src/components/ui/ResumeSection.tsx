"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaDownload,
  FaExternalLinkAlt,
  FaBriefcase,
  FaGraduationCap,
  FaRocket,
  FaGamepad,
  FaLaptopCode,
} from "react-icons/fa";

const currentYear = new Date().getFullYear();

const TIMELINE_EVENTS = [
  {
    year: `${currentYear}`,
    title: "Embedded, AI & Game Development",
    description: "Building AI tools and indie games",
    icon: FaGamepad,
    type: "work",
  },
  {
    year: "2023-Present",
    title: "Full-Stack Engineering",
    description: "Web apps, containers, and embedded",
    icon: FaLaptopCode,
    type: "work",
  },
  {
    year: "2022-2025",
    title: "UNC Charlotte",
    description: "BS, Computer Science",
    icon: FaGraduationCap,
    type: "education",
  },
  {
    year: "2019",
    title: "First Lines of Code",
    description: "Self-taught programming journey begins",
    icon: FaRocket,
    type: "milestone",
  },
];

export default function ResumeSection() {
  const [isHovered, setIsHovered] = useState(false);

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
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr,1.2fr] lg:gap-16">
      {/* Left Side: Interactive Timeline */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <h3 className="mb-8 text-lg font-medium text-primary-text">
          My Journey
        </h3>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-accent/50 via-accent/20 to-transparent" />

          {/* Events */}
          <div className="space-y-8">
            {TIMELINE_EVENTS.map((event, index) => (
              <motion.div
                key={event.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative flex gap-6"
              >
                {/* Icon node */}
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-primary-bg transition-all duration-300 group-hover:border-accent/50 group-hover:bg-accent/10">
                  <event.icon className="h-4 w-4 text-muted-text transition-colors group-hover:text-accent" />
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <div className="mb-1 flex items-baseline gap-3">
                    <span className="text-2xl font-bold tabular-nums text-primary-text transition-colors group-hover:text-accent">
                      {event.year}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                        event.type === "education"
                          ? "bg-blue-500/10 text-blue-400"
                          : event.type === "milestone"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-accent/10 text-accent"
                      }`}
                    >
                      {event.type}
                    </span>
                  </div>
                  <h4 className="mb-1 font-medium text-primary-text">
                    {event.title}
                  </h4>
                  <p className="text-sm text-muted-text">{event.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* "More to come" indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex items-center gap-4 pl-[52px]"
          >
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent/60" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent/40 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent/20 [animation-delay:300ms]" />
            </div>
            <span className="text-sm italic text-muted-text">
              More chapters loading...
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side: Resume Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-primary-text">Full Resume</h3>
          {/* Always visible download button for mobile */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-secondary-text transition-colors hover:border-accent/30 hover:bg-accent/10 hover:text-accent lg:hidden"
          >
            <FaDownload className="h-3 w-3" />
            Download
          </button>
        </div>

        {/* PDF Embed Container */}
        <div
          className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-2xl shadow-black/20"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Decorative corner accents */}
          <div className="pointer-events-none absolute left-0 top-0 h-16 w-16 border-l-2 border-t-2 border-accent/20 rounded-tl-2xl" />
          <div className="pointer-events-none absolute right-0 bottom-0 h-16 w-16 border-r-2 border-b-2 border-accent/20 rounded-br-2xl" />

          {/* PDF Embed */}
          <div className="aspect-[8.5/11] w-full">
            <iframe
              src="/downloads/Resume_Phil_Vishnevsky.pdf#toolbar=0&navpanes=0&zoom=FitH"
              className="h-full w-full border-0"
              title="Resume Preview"
              loading="lazy"
            />
          </div>

          {/* Overlay with buttons - desktop only */}
          <div
            className={`absolute inset-0 hidden items-end justify-center bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8 transition-all duration-300 lg:flex ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handlePreview}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <FaExternalLinkAlt className="h-3.5 w-3.5" />
                Open Full Size
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent/90 hover:shadow-accent/40"
              >
                <FaDownload className="h-3.5 w-3.5" />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          {[
            { label: "Years Coding", value: `${currentYear - 2019}+` },
            { label: "Projects", value: "15+" },
            { label: "Technologies", value: "11+" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-accent">{stat.value}</div>
              <div className="text-xs text-muted-text">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
