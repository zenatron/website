"use client";

import { motion } from "framer-motion";
import { FaGithub, FaGlobe, FaExternalLinkAlt } from "react-icons/fa";
import Link from "next/link";
import { ProjectCard as Project } from "@/types/types";

export default function ProjectCard({ project }: { project: Project }) {
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
    "bg-secondary-bg p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cardClasses}
    >
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
