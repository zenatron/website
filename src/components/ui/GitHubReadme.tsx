import { motion } from "framer-motion";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { useState, useEffect } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import TerminalWindow, { T } from "@/components/ui/TerminalWindow";

interface GitHubReadmeData {
  htmlContent: string;
  loading: boolean;
  error: string | null;
}

interface GitHubReadmeProps {
  repo?: string;
  processSections?: boolean;
}

export default function GitHubReadme({
  repo = "zenatron/zenatron",
  processSections = false,
}: GitHubReadmeProps) {
  const [readmeData, setReadmeData] = useState<GitHubReadmeData>({
    htmlContent: "",
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchReadme = async () => {
      try {
        const response = await fetch(
          `https://raw.githubusercontent.com/${repo}/main/README.md`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch README");
        }

        const rawContent = await response.text();
        let processedContent = rawContent;

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

        marked.setOptions({ gfm: true, breaks: true });
        const htmlContent = await marked(processedContent);
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <TerminalWindow title={`~/github/${repo}/README.md`}>
          <div className="font-mono text-sm space-y-2">
            <div>
              <span style={{ color: T.green }}>$</span>{" "}
              <span style={{ color: T.fg }}>curl</span>{" "}
              <span style={{ color: T.yellow }}>github.com/{repo}/README.md</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block"
                style={{ color: T.yellow }}
              >
                ⠋
              </motion.span>
              <span style={{ color: T.comment }}>Fetching README...</span>
            </div>
          </div>
        </TerminalWindow>
      </motion.div>
    );
  }

  if (readmeData.error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <TerminalWindow title={`~/github/${repo}/README.md`}>
          <div className="font-mono text-sm space-y-2">
            <div>
              <span style={{ color: T.green }}>$</span>{" "}
              <span style={{ color: T.fg }}>curl</span>{" "}
              <span style={{ color: T.yellow }}>github.com/{repo}/README.md</span>
            </div>
            <div>
              <span style={{ color: T.red }}>error:</span>{" "}
              <span style={{ color: T.fg }}>Failed to load GitHub README</span>
            </div>
            <div>
              <span style={{ color: T.comment }}>{"  "}try: </span>
              <a
                href={`https://github.com/${repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline transition-colors hover:brightness-125"
                style={{ color: T.blue }}
              >
                open in browser
              </a>
            </div>
          </div>
        </TerminalWindow>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <TerminalWindow
        title={`~/github/${repo}/README.md`}
        noPadding
        statusBar={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaGithub style={{ color: T.fg }} />
              <span>{repo}</span>
            </div>
            <a
              href={`https://github.com/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:brightness-150"
            >
              [<span style={{ color: T.green }}>$</span>{" "}
              <span style={{ color: T.fg }}>open</span>{" "}
              <span style={{ color: T.purple }}>--github</span>{" "}
              <span style={{ color: T.fg }}>↗</span>]
            </a>
          </div>
        }
      >
        {/* README Content */}
        <div
          className="p-5 sm:p-6 prose prose-invert max-w-none overflow-x-auto
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
      </TerminalWindow>
    </motion.div>
  );
}
