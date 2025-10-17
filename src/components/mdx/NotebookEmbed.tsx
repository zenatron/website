"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaExternalLinkAlt } from "react-icons/fa";
import { SiJupyter } from "react-icons/si";
import HtmlRenderer from "@/components/HtmlRenderer";

interface NotebookEmbedProps {
  notebookHtml: string; // The HTML filename (without .html extension)
  title?: string; // Optional custom title
  defaultOpen?: boolean; // Whether to start expanded
}

export default function NotebookEmbed({ 
  notebookHtml, 
  title = "View Full Jupyter Notebook",
  defaultOpen = false 
}: NotebookEmbedProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only load HTML when expanded
    if (isOpen && !htmlContent) {
      setLoading(true);
      fetch(`/downloads/${notebookHtml}.html`)
        .then((res) => res.text())
        .then((content) => {
          setHtmlContent(content);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error loading notebook HTML:", error);
          setLoading(false);
        });
    }
  }, [isOpen, notebookHtml, htmlContent]);

  return (
    <div className="my-8 rounded-lg border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
      {/* Header with Toggle */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10">
        {/* Jupyter Icon */}
        <div className="flex-shrink-0">
          <SiJupyter className="w-6 h-6 text-accent" />
        </div>

        {/* Title and description - clickable to toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 text-left min-w-0 hover:opacity-80 transition-opacity duration-200"
        >
          <h3 className="text-lg font-semibold text-primary-text mb-1">
            {title}
          </h3>
          <p className="text-sm text-secondary-text">
            {isOpen ? "Click to collapse" : "Click to expand Jupyter notebook"}
          </p>
        </button>

        {/* Right side buttons - Desktop: side by side, Mobile: stacked */}
        <div className="flex sm:flex-row flex-col items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Open in New Tab Button */}
          <a
            href={`/downloads/${notebookHtml}.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg
                       hover:bg-white/10 hover:border-white/20 shadow-lg transition-all duration-300
                       flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            title="Open notebook in new tab"
          >
            <FaExternalLinkAlt className="text-accent" size={16} />
          </a>

          {/* Chevron Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors duration-200"
          >
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-accent"
            >
              <FaChevronDown size={20} />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10">
              <div className="p-6 bg-black/20">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                  </div>
                ) : htmlContent ? (
                  <HtmlRenderer htmlContent={htmlContent} />
                ) : (
                  <div className="text-center py-12 text-secondary-text">
                    Failed to load notebook content
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
