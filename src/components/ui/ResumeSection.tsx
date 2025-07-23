"use client";

import { motion } from "framer-motion";
import { FaDownload, FaFileAlt, FaEye, FaLinkedin, FaGithub, FaExternalLinkAlt, FaCode, FaGraduationCap, FaMapMarkerAlt, FaCoffee, FaGamepad, FaCamera } from "react-icons/fa";
import { useState } from "react";
import Link from "next/link";

export default function ResumeSection() {
  const [isHovered, setIsHovered] = useState(false);

  const handleDownload = () => {
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = '/downloads/Resume_Phil_Vishnevsky.pdf';
    link.download = 'Resume_Phil_Vishnevsky.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = () => {
    window.open('/downloads/Resume_Phil_Vishnevsky.pdf', '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Left Side: Resume Embed */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <h3 className="text-xl font-semibold text-primary-text text-center lg:text-left">
          Resume Preview
        </h3>

        {/* PDF Embed Container */}
        <div className="relative bg-neutral-800/30 backdrop-blur-sm border border-neutral-600/30 rounded-2xl overflow-hidden shadow-lg">
          {/* PDF Embed */}
          <div className="aspect-[8.5/11] w-full">
            <iframe
              src="/downloads/Resume_Phil_Vishnevsky.pdf#toolbar=0&navpanes=0&scrollbar=0"
              className="w-full h-full border-0"
              title="Resume Preview"
            />
          </div>

          {/* Overlay with buttons */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePreview}
                className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg font-medium hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
              >
                <FaExternalLinkAlt className="text-sm" />
                <span>Open Full Size</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className="px-4 py-2 bg-accent/80 backdrop-blur-md text-white rounded-lg font-medium hover:bg-accent transition-all duration-300 flex items-center gap-2"
              >
                <FaDownload className="text-sm" />
                <span>Download</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Side: Quick Profile */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-6"
      >
        <h3 className="text-xl font-semibold text-primary-text text-center lg:text-left">
          At a Glance
        </h3>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-neutral-800/30 backdrop-blur-sm rounded-2xl border border-neutral-600/20 text-center">
            <div className="text-2xl font-bold text-accent mb-1">5+</div>
            <div className="text-xs text-muted-text">Years Experience</div>
          </div>
          <div className="p-4 bg-neutral-800/30 backdrop-blur-sm rounded-2xl border border-neutral-600/20 text-center">
            <div className="text-2xl font-bold text-accent mb-1">25+</div>
            <div className="text-xs text-muted-text">Projects Built</div>
          </div>
          <div className="p-4 bg-neutral-800/30 backdrop-blur-sm rounded-2xl border border-neutral-600/20 text-center">
            <div className="text-2xl font-bold text-accent mb-1">15+</div>
            <div className="text-xs text-muted-text">Technologies</div>
          </div>
          <div className="p-4 bg-neutral-800/30 backdrop-blur-sm rounded-2xl border border-neutral-600/20 text-center">
            <div className="text-2xl font-bold text-accent mb-1">3</div>
            <div className="text-xs text-muted-text">Degrees</div>
          </div>
        </div>

        {/* Key Highlights */}
        <div className="space-y-3">
          <h4 className="text-lg font-medium text-primary-text">Key Highlights</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-neutral-800/20 backdrop-blur-sm rounded-xl border border-neutral-600/20">
              <FaCode className="text-accent text-lg flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-primary-text">Full-Stack Developer</div>
                <div className="text-xs text-muted-text">React, Next.js, Node.js, Python</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-neutral-800/20 backdrop-blur-sm rounded-xl border border-neutral-600/20">
              <FaGraduationCap className="text-accent text-lg flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-primary-text">Multi-Disciplinary Background</div>
                <div className="text-xs text-muted-text">CS, Business, Game Development</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-neutral-800/20 backdrop-blur-sm rounded-xl border border-neutral-600/20">
              <FaMapMarkerAlt className="text-accent text-lg flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-primary-text">Based in Toronto</div>
                <div className="text-xs text-muted-text">Open to remote opportunities</div>
              </div>
            </div>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="space-y-3">
          <h4 className="text-lg font-medium text-primary-text">Beyond Code</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center p-3 bg-neutral-800/20 backdrop-blur-sm rounded-xl border border-neutral-600/20">
              <FaCoffee className="text-accent text-lg mb-1" />
              <div className="text-xs text-muted-text text-center">Coffee Enthusiast</div>
            </div>
            <div className="flex flex-col items-center p-3 bg-neutral-800/20 backdrop-blur-sm rounded-xl border border-neutral-600/20">
              <FaGamepad className="text-accent text-lg mb-1" />
              <div className="text-xs text-muted-text text-center">Game Developer</div>
            </div>
            <div className="flex flex-col items-center p-3 bg-neutral-800/20 backdrop-blur-sm rounded-xl border border-neutral-600/20">
              <FaCamera className="text-accent text-lg mb-1" />
              <div className="text-xs text-muted-text text-center">Photography</div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center p-4 bg-neutral-800/25 backdrop-blur-md border border-neutral-600/30 rounded-2xl"
        >
          <h4 className="text-lg font-semibold mb-2 text-primary-text">
            Let's Connect
          </h4>
          <p className="text-muted-text mb-4 text-sm">
            Ready to discuss opportunities and exciting projects?
          </p>
          <Link
            href="mailto:phil@underscore.games"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Get In Touch
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
