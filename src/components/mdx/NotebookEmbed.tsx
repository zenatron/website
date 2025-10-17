"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaChevronUp, FaExternalLinkAlt } from "react-icons/fa";
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
      {/* Header with Toggle and Open in New Tab */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center gap-3 text-left hover:opacity-80 transition-opacity duration-200"
        >
          <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
            <svg 
              className="w-5 h-5 text-accent" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary-text">
              {title}
            </h3>
            <p className="text-sm text-secondary-text">
              {isOpen ? "Click to collapse" : "Click to expand notebook"}
            </p>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-accent"
          >
            {isOpen ? <FaChevronUp size={20} /> : <FaChevronDown size={20} />}
          </motion.div>
        </button>
        
        {/* Open in New Tab Button */}
        <a
          href={`/downloads/${notebookHtml}.html`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2 
                     text-sm inline-flex items-center gap-2
                     hover:bg-white/10 hover:border-white/20 shadow-lg transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <FaExternalLinkAlt className="text-accent" size={14} />
          <span className="hidden sm:inline">Open Full Screen</span>
          <span className="sm:hidden">Open</span>
        </a>
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
