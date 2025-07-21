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

export default function GitHubReadme() {
  const [readmeData, setReadmeData] = useState<GitHubReadmeData>({
    htmlContent: '',
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchReadme = async () => {
      try {
        // Fetch the raw README content from GitHub
        const response = await fetch('https://raw.githubusercontent.com/zenatron/zenatron/main/README.md');

        if (!response.ok) {
          throw new Error('Failed to fetch README');
        }

        const rawContent = await response.text();

        // Remove everything before the first horizontal separator
        const separatorIndex = rawContent.indexOf('---');
        const processedContent = separatorIndex !== -1
          ? rawContent.substring(separatorIndex + 3).trim()
          : rawContent;

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
          error: null
        });
      } catch (error) {
        console.error('Error fetching README:', error);
        setReadmeData({
          htmlContent: '',
          loading: false,
          error: 'Failed to load README content'
        });
      }
    };

    fetchReadme();
  }, []);



  if (readmeData.loading) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-neutral-800/25 backdrop-blur-md border border-neutral-600/30 rounded-3xl overflow-hidden shadow-lg"
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
          className="relative bg-neutral-800/25 backdrop-blur-md border border-neutral-600/30 rounded-3xl overflow-hidden shadow-lg"
        >
          <div className="p-8 text-center">
            <p className="text-red-400 mb-4">{"Failed to load GitHub README."}</p>
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
        className="relative bg-neutral-800/25 backdrop-blur-md border border-neutral-600/30 rounded-3xl overflow-hidden shadow-lg"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 bg-neutral-900/50 border-b border-neutral-600/30">
          <div className="flex items-center gap-3">
            <FaGithub className="text-xl text-accent" />
            <span className="font-semibold text-primary-text">zenatron</span>
          </div>
          <Link
            href="https://github.com/zenatron"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1 bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded-lg text-accent text-sm transition-all duration-200"
          >
            <FaExternalLinkAlt className="text-xs" />
            {"See more"}
          </Link>
        </div>

        {/* README Content */}
        <div
          className="p-6 md:p-8 prose prose-invert max-w-none
            prose-h2:text-xl prose-h2:font-semibold prose-h2:text-primary-text prose-h2:mb-4 prose-h2:mt-6 prose-h2:first:mt-0 prose-h2:flex prose-h2:items-center prose-h2:gap-2
            prose-h3:text-lg prose-h3:font-semibold prose-h3:text-primary-text prose-h3:mb-3 prose-h3:mt-5 prose-h3:first:mt-0 prose-h3:flex prose-h3:items-center prose-h3:gap-2
            prose-p:text-muted-text prose-p:mb-4 prose-p:leading-relaxed
            prose-img:inline-block prose-img:w-8 prose-img:h-8 md:prose-img:w-10 md:prose-img:h-10 prose-img:mx-1 prose-img:my-1 prose-img:rounded-md prose-img:bg-white/10 prose-img:p-1
            prose-a:text-accent prose-a:no-underline hover:prose-a:text-accent/80 prose-a:transition-colors prose-a:duration-200
            prose-table:w-full prose-table:border-collapse prose-table:mb-6
            prose-thead:bg-neutral-800/50
            prose-tbody:divide-y prose-tbody:divide-neutral-600/30
            prose-tr:hover:bg-neutral-800/25 prose-tr:transition-colors
            prose-td:px-4 prose-td:py-3 prose-td:text-center
            prose-th:px-4 prose-th:py-3 prose-th:text-center prose-th:font-semibold prose-th:text-primary-text"
          dangerouslySetInnerHTML={{ __html: readmeData.htmlContent }}
        />
      </motion.div>
    </div>
  );
}
