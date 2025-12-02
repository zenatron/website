"use client";

import { motion } from "framer-motion";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import Link from "next/link";
import { useState, useEffect } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

interface GitHubReadmeData {
  htmlContent: string;
  loading: boolean;
  error: string | null;
}

interface GitHubReadmeProps {
  repo?: string; // Format: "owner/repo", defaults to "zenatron/zenatron"
  processSections?: boolean; // Whether to process sections between separators
}

export default function GitHubReadme({ 
  repo = "zenatron/zenatron", // Default to your profile README
  processSections = false 
}: GitHubReadmeProps) {
  const [readmeData, setReadmeData] = useState<GitHubReadmeData>({
    htmlContent: "",
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchReadme = async () => {
      try {
        // Fetch the raw README content from GitHub
        const response = await fetch(
          `https://raw.githubusercontent.com/${repo}/main/README.md`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch README");
        }

        const rawContent = await response.text();

        let processedContent = rawContent;

        // Optionally remove sections between separators (for personal README)
        if (processSections) {
          const firstSeparatorIndex = rawContent.indexOf("---");
          const contentAfterFirst =
            firstSeparatorIndex !== -1
              ? rawContent.substring(firstSeparatorIndex + 3).trim()
              : rawContent;

          const secondSeparatorIndex = contentAfterFirst.indexOf("---");
          processedContent =
            secondSeparatorIndex !== -1
              ? contentAfterFirst.substring(0, secondSeparatorIndex).trim()
              : contentAfterFirst;
        }

        // Configure marked to handle HTML and GitHub-flavored markdown
        marked.setOptions({
          gfm: true,
          breaks: true,
        });

        // Convert markdown to HTML
        const htmlContent = await marked(processedContent);

        // Sanitize the HTML content
        const sanitizedHtml = DOMPurify.sanitize(htmlContent);

        setReadmeData({
          htmlContent: sanitizedHtml,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching README:", error);
        setReadmeData({
          htmlContent: "",
          loading: false,
          error: "Failed to load README content",
        });
      }
    };

    fetchReadme();
  }, [repo, processSections]);

  if (readmeData.loading) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative border border-white/[0.06] rounded-2xl overflow-hidden"
        >
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-text">{"Loading GitHub README..."}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (readmeData.error) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative border border-white/[0.06] rounded-2xl overflow-hidden"
        >
          <div className="p-8 text-center">
            <p className="text-red-400 mb-4">
              {"Failed to load GitHub README."}
            </p>
            <Link
              href="https://github.com/zenatron"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80 transition-colors"
            >
              {"View on GitHub"}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* GitHub README Embed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative border border-white/[0.06] rounded-2xl overflow-hidden"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 bg-white/[0.02] border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <FaGithub className="text-xl text-accent" />
            <span className="font-semibold text-primary-text">{repo}</span>
          </div>
          <Link
            href={`https://github.com/${repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-nav"
          >
            <FaExternalLinkAlt className="text-xs" />
            {"View on GitHub"}
          </Link>
        </div>

        {/* README Content */}
        <div
          className="p-6 md:p-8 prose prose-invert max-w-none overflow-x-auto
            [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-primary-text [&_h2]:mb-4 [&_h2]:mt-6 [&_h2:first-child]:mt-0 [&_h2]:flex [&_h2]:items-center [&_h2]:gap-2
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-primary-text [&_h3]:mb-3 [&_h3]:mt-5 [&_h3:first-child]:mt-0 [&_h3]:flex [&_h3]:items-center [&_h3]:gap-2
            [&_p]:text-muted-text [&_p]:mb-4 [&_p]:leading-relaxed
            [&_img]:inline-block [&_img]:w-8 md:[&_img]:w-10 [&_img]:h-8 md:[&_img]:h-10 [&_img]:mx-1 [&_img]:my-1 [&_img]:rounded-md
            [&_a]:text-accent [&_a]:no-underline hover:[&_a]:text-accent/80 [&_a]:transition-colors
            [&_table]:w-full [&_table]:border-collapse [&_table]:mb-6 [&_table]:min-w-[500px]
            [&_thead]:bg-white/[0.02]
            [&_tbody]:divide-y [&_tbody]:divide-white/[0.06]
            [&_tr]:hover:bg-white/[0.02] [&_tr]:transition-colors
            [&_td]:px-4 [&_td]:py-3 [&_td]:text-center [&_td]:whitespace-nowrap
            [&_th]:px-4 [&_th]:py-3 [&_th]:text-center [&_th]:font-semibold [&_th]:text-primary-text [&_th]:whitespace-nowrap"
          dangerouslySetInnerHTML={{ __html: readmeData.htmlContent }}
        />
      </motion.div>
    </div>
  );
}
