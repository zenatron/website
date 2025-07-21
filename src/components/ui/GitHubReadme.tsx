"use client";

import { motion } from "framer-motion";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import Link from "next/link";
import { useState, useEffect } from "react";

interface GitHubReadmeData {
  content: string;
  loading: boolean;
  error: string | null;
}

export default function GitHubReadme() {
  const [readmeData, setReadmeData] = useState<GitHubReadmeData>({
    content: '',
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

        const content = await response.text();
        setReadmeData({
          content,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching README:', error);
        setReadmeData({
          content: '',
          loading: false,
          error: 'Failed to load README content'
        });
      }
    };

    fetchReadme();
  }, []);

  // Parse the README content to extract sections
  const parseReadmeContent = (content: string) => {
    const lines = content.split('\n');
    const sections: { [key: string]: string[] } = {};
    let currentSection = '';

    for (const line of lines) {
      if (line.startsWith('## ') || line.startsWith('### ')) {
        currentSection = line.replace(/^#+\s*/, '').replace(/\s*$/, '');
        sections[currentSection] = [];
      } else if (currentSection && line.trim()) {
        sections[currentSection].push(line);
      }
    }



    return sections;
  };

  // Extract image URLs from markdown and HTML
  const extractImages = (content: string): string[] => {
    if (!content) return [];

    // Look for img tags with or without quotes around src
    const htmlImageRegex = /<img[^>]+src=([^>\s]+)/g;
    const images: string[] = [];
    let match;

    while ((match = htmlImageRegex.exec(content)) !== null) {
      // Clean up the URL by removing quotes if present
      let url = match[1].replace(/['"]/g, '');
      images.push(url);
    }

    return images;
  };

  // Extract links from markdown and HTML
  const extractLinks = (content: string): Array<{text: string, url: string, icon?: string}> => {
    if (!content) return [];

    // Look for HTML links with images
    const htmlLinkRegex = /<a[^>]+href=([^>\s]+)[^>]*>(.*?)<\/a>/g;
    const links: Array<{text: string, url: string, icon?: string}> = [];
    let match;

    while ((match = htmlLinkRegex.exec(content)) !== null) {
      const url = match[1].replace(/['"]/g, '');
      const linkContent = match[2];

      // Extract icon from img tag within the link
      const iconMatch = linkContent.match(/<img[^>]+src=([^>\s]+)/);
      const icon = iconMatch ? iconMatch[1].replace(/['"]/g, '') : undefined;

      // Extract text (remove img tags)
      const text = linkContent.replace(/<img[^>]*>/g, '').trim() || 'Link';

      links.push({ text, url, icon });
    }

    return links;
  };
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

  // Parse the README content
  const sections = parseReadmeContent(readmeData.content);
  const currentlyLearningImages = extractImages(sections['🧠 Currently Learning']?.join('\n') || '');
  const techImages = extractImages(sections['⚙️ Technologies & Languages']?.join('\n') || '');
  const contactLinks = extractLinks(sections['📫 Get in Touch']?.join('\n') || '');

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
        <div className="p-6 md:p-8">
          {/* Currently Learning Section */}
          {currentlyLearningImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h3 className="text-xl font-semibold text-primary-text mb-4 flex items-center gap-2">
                🧠 Currently Learning
              </h3>
              <div className="grid grid-cols-4 md:grid-cols-5 gap-4">
                {currentlyLearningImages.map((imageUrl, index) => {
                  // Extract tech name from URL or use index
                  const techName = imageUrl.split('/').pop()?.replace('.svg', '') || `Tech ${index + 1}`;
                  return (
                    <motion.div
                      key={imageUrl}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex flex-col items-center gap-2 p-3 bg-neutral-800/30 rounded-xl border border-neutral-600/20"
                      title={techName}
                    >
                      <img src={imageUrl} alt={techName} className="w-8 h-8" />
                      <span className="text-xs text-muted-text text-center capitalize">{techName}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Technologies & Languages Section */}
          {techImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h3 className="text-xl font-semibold text-primary-text mb-4 flex items-center gap-2">
                ⚙️ Technologies & Languages
              </h3>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {techImages.map((imageUrl, index) => {
                  // Extract tech name from URL or use index
                  const techName = imageUrl.split('/').pop()?.replace('.svg', '') || `Tech ${index + 1}`;
                  return (
                    <motion.div
                      key={imageUrl}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="flex flex-col items-center gap-2 p-3 bg-neutral-800/30 rounded-xl border border-neutral-600/20"
                      title={techName}
                    >
                      <img src={imageUrl} alt={techName} className="w-8 h-8" />
                      <span className="text-xs text-muted-text text-center capitalize">{techName}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Contact Links */}
          {contactLinks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <h3 className="text-xl font-semibold text-primary-text mb-4 flex items-center justify-center gap-2">
                📫 Get in Touch
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {contactLinks.map((contact, index) => (
                  <motion.div
                    key={contact.url}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Link
                      href={contact.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-4 bg-neutral-800/30 rounded-xl border border-neutral-600/20 hover:border-accent/30 transition-all duration-200"
                    >
                      {contact.icon && <img src={contact.icon} alt={contact.text} className="w-8 h-8" />}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
