"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaQuoteLeft, FaHeart, FaCode, FaRocket } from "react-icons/fa";

interface BioSection {
  title: string;
  content: string;
  icon: React.ElementType;
  color: string;
}

const bioSections: BioSection[] = [
  {
    title: "Hello, I'm Phil",
    content:
      "I'm a software engineer who loves building things that matter. I believe technology should make life better, not more complicated. When I write code, I'm thinking about the person who will use it and how I can make their day a little easier.",
    icon: FaQuoteLeft,
    color: "rgba(139, 92, 246, 0.15)",
  },
  {
    title: "My Journey",
    content:
      "I started programming because I was curious about how websites worked. That curiosity turned into late nights learning new frameworks, contributing to open source projects, and eventually building full-stack applications. Each project taught me something new, and I'm still learning every day.",
    icon: FaRocket,
    color: "rgba(59, 130, 246, 0.15)",
  },
  {
    title: "What Drives Me",
    content:
      "I get excited about solving real problems with code. Whether it's making a website load faster, building an intuitive interface, or automating something tedious, I love the moment when everything clicks and works beautifully. Good software should feel effortless to use.",
    icon: FaHeart,
    color: "rgba(239, 68, 68, 0.15)",
  },
  {
    title: "My Approach",
    content:
      "I like to understand the why before diving into the how. I ask questions, listen to users, and collaborate with my team to find the best solution. I write clean code that others can understand and maintain. Most importantly, I never stop learning new things.",
    icon: FaCode,
    color: "rgba(16, 185, 129, 0.15)",
  },
];

const PersonalBio: React.FC = () => {
  const [activeSection, setActiveSection] = useState<number>(0);

  return (
    <div className="space-y-6">
      {/* Main Content Box with Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative p-6 bg-gradient-to-br from-accent/5 via-purple-500/5 to-transparent backdrop-blur-md border border-accent/20 rounded-3xl overflow-hidden"
      >
        {/* Dynamic background gradient based on active section */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${bioSections[activeSection].color}, transparent 70%)`,
          }}
        />

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-3 left-3 text-4xl text-accent">
            {React.createElement(bioSections[activeSection].icon)}
          </div>
          <div className="absolute bottom-3 right-3 text-4xl text-accent">
            {React.createElement(bioSections[activeSection].icon)}
          </div>
        </div>

        <div className="relative z-10">
          {/* Dynamic Content */}
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-primary-text mb-4"
            >
              {bioSections[activeSection].title}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base text-muted-text leading-relaxed mb-6"
            >
              {bioSections[activeSection].content}
            </motion.p>
          </motion.div>

          {/* Key Highlights - only show for the first section */}
          {activeSection === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4"
            >
              {[
                "Full-Stack Developer",
                "AI Enthusiast",
                "Open Source Contributor",
                "Game Dev Hobbyist",
              ].map((highlight, index) => (
                <motion.span
                  key={highlight}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent font-medium text-sm"
                >
                  {highlight}
                </motion.span>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Navigation Icons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex justify-center gap-3"
      >
        {bioSections.map((section, index) => (
          <motion.button
            key={section.title}
            onClick={() => setActiveSection(index)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`relative p-3 rounded-xl border-2 transition-all duration-300 ${
              activeSection === index
                ? "border-accent bg-accent/10 shadow-lg"
                : "border-neutral-600/30 bg-neutral-800/25 hover:border-accent/50"
            }`}
            title={section.title}
          >
            {/* Background glow for active state */}
            {activeSection === index && (
              <motion.div
                layoutId="activeGlow"
                className="absolute inset-0 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${section.color}, transparent 70%)`,
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}

            <div
              className={`relative z-10 text-xl ${
                activeSection === index ? "text-accent" : "text-muted-text"
              }`}
              style={{
                filter:
                  activeSection === index
                    ? "drop-shadow(0 0 8px rgba(34, 123, 224, 0.5))"
                    : "none",
              }}
            >
              {React.createElement(section.icon)}
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default PersonalBio;
