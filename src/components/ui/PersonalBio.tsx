"use client";

import { motion } from "framer-motion";
import { FaQuoteLeft, FaQuoteRight, FaHeart, FaCode, FaRocket } from "react-icons/fa";
import { useState } from "react";

interface BioSection {
  title: string;
  content: string;
  icon: React.ElementType;
  color: string;
}

const bioSections: BioSection[] = [
  {
    title: "My Journey",
    content: "I'm a passionate software engineer with a love for creating digital experiences that make a difference. My journey began with curiosity about how things work, which led me down the rabbit hole of programming. What started as tinkering with simple scripts has evolved into a career building full-stack applications, exploring AI, and contributing to open source projects.",
    icon: FaRocket,
    color: "rgba(59, 130, 246, 0.15)"
  },
  {
    title: "What Drives Me",
    content: "I believe technology should be accessible, beautiful, and meaningful. Whether I'm crafting a user interface, optimizing backend performance, or diving into machine learning algorithms, I'm driven by the potential to solve real problems and create experiences that users genuinely enjoy. Every line of code is an opportunity to make something better.",
    icon: FaHeart,
    color: "rgba(239, 68, 68, 0.15)"
  },
  {
    title: "My Approach",
    content: "I approach every project with curiosity, attention to detail, and a collaborative mindset. I believe the best solutions come from understanding both the technical requirements and the human needs behind them. I'm always learning, always questioning, and always looking for ways to improve both my code and my craft.",
    icon: FaCode,
    color: "rgba(16, 185, 129, 0.15)"
  }
];

export default function PersonalBio() {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      {/* Main Bio Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative p-8 bg-gradient-to-br from-accent/5 via-purple-500/5 to-transparent backdrop-blur-md border border-accent/20 rounded-3xl overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 left-4 text-6xl text-accent">
            <FaQuoteLeft />
          </div>
          <div className="absolute bottom-4 right-4 text-6xl text-accent">
            <FaQuoteRight />
          </div>
        </div>

        <div className="relative z-10 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-primary-text mb-6"
          >
            Hello, I'm Phil
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-muted-text leading-relaxed max-w-4xl mx-auto mb-8"
          >
            A software engineer, creative thinker, and problem solver who believes in the power of 
            technology to create meaningful experiences. I'm passionate about building applications 
            that not only work well but also bring joy to the people who use them.
          </motion.p>

          {/* Key Highlights */}
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
              "Game Dev Hobbyist"
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
        </div>
      </motion.div>

      {/* Bio Sections - Inline on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {bioSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
            className="relative"
          >
            {/* Mobile: Expandable, Desktop: Always expanded */}
            <motion.button
              onClick={() => setExpandedSection(expandedSection === index ? null : index)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full p-6 bg-neutral-800/25 backdrop-blur-md border border-neutral-600/30 rounded-2xl hover:border-accent/30 transition-all duration-300 text-left lg:cursor-default"
            >
              <div className="flex items-center gap-4 lg:flex-col lg:text-center">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl text-accent lg:text-3xl lg:mb-2"
                  style={{
                    filter: expandedSection === index ? 'drop-shadow(0 0 8px rgba(34, 123, 224, 0.5))' : 'none'
                  }}
                >
                  <section.icon />
                </motion.div>
                <div className="flex-1 lg:flex-none">
                  <h3 className="text-xl font-semibold text-primary-text mb-1 lg:mb-3">
                    {section.title}
                  </h3>
                  {/* Desktop: Always show content */}
                  <div className="hidden lg:block">
                    <p className="text-muted-text leading-relaxed text-sm">
                      {section.content}
                    </p>
                  </div>
                  {/* Mobile: Show expand hint */}
                  <p className="text-muted-text text-sm lg:hidden">
                    Click to {expandedSection === index ? 'collapse' : 'expand'}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: expandedSection === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-muted-text lg:hidden"
                >
                  ▼
                </motion.div>
              </div>
            </motion.button>

            {/* Mobile: Expandable Content */}
            <motion.div
              initial={false}
              animate={{
                height: expandedSection === index ? "auto" : 0,
                opacity: expandedSection === index ? 1 : 0,
                marginTop: expandedSection === index ? 16 : 0
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden lg:hidden"
            >
              <div
                className="p-6 bg-neutral-800/20 backdrop-blur-sm border border-neutral-600/20 rounded-2xl"
                style={{
                  background: expandedSection === index
                    ? `linear-gradient(135deg, ${section.color}, rgba(0,0,0,0.1))`
                    : undefined
                }}
              >
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: expandedSection === index ? 1 : 0,
                    y: expandedSection === index ? 0 : 10
                  }}
                  transition={{ delay: expandedSection === index ? 0.2 : 0 }}
                  className="text-muted-text leading-relaxed"
                >
                  {section.content}
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>


    </div>
  );
}
