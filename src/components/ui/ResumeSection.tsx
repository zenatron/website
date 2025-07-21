"use client";

import { motion } from "framer-motion";
import { FaDownload, FaFileAlt, FaEye, FaLinkedin, FaGithub } from "react-icons/fa";
import { useState } from "react";
import Link from "next/link";

export default function ResumeSection() {
  const [isHovered, setIsHovered] = useState(false);

  const handleDownload = () => {
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = '/downloads/Resume_Phil_Vishnevsky.pdf'; // Update with actual resume path
    link.download = 'Resume_Phil_Vishnevsky.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Main Resume Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-br from-accent/10 via-purple-500/5 to-transparent backdrop-blur-md border border-accent/20 rounded-3xl p-8 shadow-2xl"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-10 -right-10 w-32 h-32 bg-accent/5 rounded-full"
          />
          <motion.div
            animate={{
              rotate: [360, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-500/5 rounded-full"
          />
        </div>

        <div className="relative z-10 text-center">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <FaFileAlt className="text-4xl text-accent mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-primary-text mb-2">
              My Resume
            </h2>
            <p className="text-muted-text leading-relaxed max-w-2xl mx-auto">
              Download my latest resume to learn more about my professional experience, 
              education, and technical skills. Always kept up-to-date with my latest projects and achievements.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Download Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              onClick={handleDownload}
              className="relative group px-8 py-4 bg-accent text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 overflow-hidden"
            >
              {/* Button Background Animation */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: isHovered ? "0%" : "-100%" }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-gradient-to-r from-accent to-purple-500"
              />
              
              <div className="relative z-10 flex items-center gap-3">
                <motion.div
                  animate={{ rotate: isHovered ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <FaDownload className="text-lg" />
                </motion.div>
                <span>Download Resume</span>
              </div>
            </motion.button>

            {/* Preview Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-neutral-800/50 text-primary-text border border-neutral-600/30 rounded-2xl font-semibold hover:border-accent/50 hover:bg-neutral-700/50 transition-all duration-300 flex items-center gap-3"
              onClick={() => window.open('/downloads/Resume_Phil_Vishnevsky.pdf', '_blank')}
            >
              <FaEye className="text-lg" />
              <span>Preview Online</span>
            </motion.button>
          </div>

          {/* Resume Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="p-4 bg-neutral-800/30 backdrop-blur-sm rounded-2xl border border-neutral-600/20">
              <div className="text-2xl font-bold text-accent">5+</div>
              <div className="text-sm text-muted-text">Years Experience</div>
            </div>
            <div className="p-4 bg-neutral-800/30 backdrop-blur-sm rounded-2xl border border-neutral-600/20">
              <div className="text-2xl font-bold text-accent">20+</div>
              <div className="text-sm text-muted-text">Projects Completed</div>
            </div>
            <div className="p-4 bg-neutral-800/30 backdrop-blur-sm rounded-2xl border border-neutral-600/20">
              <div className="text-2xl font-bold text-accent">15+</div>
              <div className="text-sm text-muted-text">Technologies</div>
            </div>
          </motion.div>
        </div>
      </motion.div>



      {/* Contact CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-center p-6 bg-neutral-800/25 backdrop-blur-md border border-neutral-600/30 rounded-2xl"
      >
        <h3 className="text-lg font-semibold mb-2 text-primary-text">
          Let's Work Together
        </h3>
        <p className="text-muted-text mb-4">
          Interested in collaborating? I'm always open to discussing new opportunities and exciting projects.
        </p>
        <Link
          href="mailto:phil@underscore.games"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
        >
          Get In Touch
        </Link>
      </motion.div>
    </div>
  );
}
