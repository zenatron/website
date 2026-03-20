import { useRef } from "react";
import type { LinkItem } from "@/types/types";
import TerminalWindow, { T } from "@/components/ui/TerminalWindow";
import { motion, useInView } from "framer-motion";
import React from "react";
import { FaGithub, FaLinkedin, FaGlobe, FaCalendarAlt } from "react-icons/fa";
import { FaBluesky } from "react-icons/fa6";
import UgLogo from "../icons/UgIcon";

const iconMap: { [key: string]: React.ElementType } = {
  FaGithub,
  FaLinkedin,
  FaGlobe,
  FaCalendarAlt,
  FaBluesky,
  UgLogo,
};

interface LinksClientProps {
  links: LinkItem[];
}

/* ── Scroll-triggered section reveal ── */
const ScrollReveal = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

function getIcon(item: LinkItem): React.ElementType | null {
  if (typeof item.icon === "string") return iconMap[item.icon] || null;
  if (item.icon) return item.icon;
  return null;
}

export default function LinksClient({ links }: LinksClientProps) {
  return (
    <div className="px-4 pb-24 pt-24 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* Header */}
        <ScrollReveal className="space-y-4 text-center">
          <p
            className="font-mono text-sm tracking-wider"
            style={{ color: T.comment }}
          >
            <span style={{ color: T.purple }}>//</span> PHIL VISHNEVSKY
          </p>
          <h1 className="text-3xl tracking-tight md:text-4xl font-mono">
            <span style={{ color: T.fg }}>~/</span>
            <span style={{ color: T.purple }}>phil</span>
            <span style={{ color: T.fg }}>/</span>
            <span style={{ color: T.blue }}>links</span>
          </h1>
          <p
            className="font-mono text-sm md:text-base"
            style={{ color: T.comment }}
          >
            connect with me across platforms
          </p>
          <div className="flex items-center justify-center gap-2 font-mono text-[11px]">
            {["SWE", "AI/ML", "Games"].map((tag) => (
              <span key={tag} style={{ color: T.yellow }}>
                [{tag}]
              </span>
            ))}
          </div>
        </ScrollReveal>

        {/* Links terminal */}
        <ScrollReveal className="mx-auto max-w-2xl">
          <TerminalWindow
            title="~/links"
            statusBar={
              <span>
                <span style={{ color: T.fg }}>{links.length}</span> links
                available
              </span>
            }
          >
            {/* Command line */}
            <div
              className="font-mono text-xs md:text-sm mb-4"
              style={{ color: T.comment }}
            >
              <span style={{ color: T.green }}>$</span>{" "}
              <span style={{ color: T.fg }}>cat</span>{" "}
              <span style={{ color: T.purple }}>--format</span>
              <span style={{ color: T.fg }}>=</span>
              <span style={{ color: T.yellow }}>tree</span>{" "}
              <span style={{ color: T.blue }}>links.json</span>
            </div>

            {/* Link rows */}
            <div className="font-mono space-y-0">
              {links.map((link, i) => {
                const isLast = i === links.length - 1;
                const Icon = getIcon(link);
                const prefix = isLast ? "└─" : "├─";

                return (
                  <a
                    key={link.url}
                    href={link.url}
                    target={link.url.startsWith("/") ? undefined : "_blank"}
                    rel={
                      link.url.startsWith("/")
                        ? undefined
                        : "noopener noreferrer"
                    }
                    className="flex items-center gap-3 py-2 transition-colors duration-150 group text-sm md:text-base"
                    style={{ color: T.fg }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${T.purple}0a`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span
                      className="shrink-0 text-xs md:text-sm"
                      style={{ color: T.gutter }}
                    >
                      {prefix}
                    </span>
                    {Icon && (
                      <Icon
                        className="h-4 w-4 shrink-0 transition-colors duration-150 group-hover:!text-[#c678dd]"
                        style={{ color: T.comment }}
                      />
                    )}
                    <span className="flex flex-col min-w-0 gap-0">
                      <span
                        className="transition-colors duration-150 group-hover:!text-[#c678dd] truncate"
                        style={{ color: T.blue }}
                      >
                        {link.title}
                      </span>
                      {link.description && (
                        <span
                          className="text-xs md:text-sm truncate"
                          style={{ color: T.comment }}
                        >
                          {link.description}
                        </span>
                      )}
                    </span>
                    <span
                      className="ml-auto shrink-0 text-xs opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                      style={{ color: T.purple }}
                    >
                      ↵
                    </span>
                  </a>
                );
              })}
            </div>
          </TerminalWindow>
        </ScrollReveal>
      </div>
    </div>
  );
}
