"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaGlobe, FaExternalLinkAlt } from "react-icons/fa";
import Link from "next/link";
import { ProjectCard as Project } from "@/types/types";

export default function ProjectCard({ project }: { project: Project }) {
  const [isHovering, setIsHovering] = useState(false);
  const [showCurious, setShowCurious] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Show "Interested?" after 3 seconds of hovering
  useEffect(() => {
    if (isHovering) {
      hoverTimerRef.current = setTimeout(() => {
        setShowCurious(true);
      }, 3000);
    } else {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
      setShowCurious(false);
    }
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, [isHovering]);

  // All projects now link to their individual slug pages
  const cardLink = `/projects/${project.metadata.slug}`;

  const ExternalLinks = () => (
    <div className="flex gap-2 mt-3 border-t border-accent/10 pt-3">
      {project.links.github && (
        <a
          href={project.links.github}
          className="btn-nav text-xs"
          onClick={(e) => e.stopPropagation()}
          target="_blank"
          rel="noopener noreferrer"
          title="View on GitHub"
        >
          <FaGithub className="mr-1" /> GitHub
        </a>
      )}
      {project.links.live && (
        <a
          href={project.links.live}
          className="btn-nav text-xs"
          onClick={(e) => e.stopPropagation()}
          target="_blank"
          rel="noopener noreferrer"
          title="View Live Demo"
        >
          <FaGlobe className="mr-1" /> Live Demo
        </a>
      )}
    </div>
  );

  const cardClasses =
    "relative bg-secondary-bg p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cardClasses}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Curious easter egg */}
      <AnimatePresence>
        {showCurious && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-accent/20 border border-accent/30 rounded-md text-xs text-accent whitespace-nowrap z-10"
          >
            👀 Interested?
          </motion.div>
        )}
      </AnimatePresence>
      
      <Link
        href={cardLink}
        className="group block"
        title={project.metadata.title}
      >
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-bold group-hover:text-accent">
            {project.metadata.title}
          </h4>
          {project.links.github && <FaGithub className="text-muted-text" />}
        </div>
        <p className="text-sm text-muted-text mb-3">
          {project.metadata.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {project.metadata.tags?.map((tag) => (
            <span key={tag} className="tag-bubble text-xs">
              {tag}
            </span>
          ))}
        </div>
      </Link>
      {(project.links.github || project.links.live) && <ExternalLinks />}
    </motion.div>
  );
}
