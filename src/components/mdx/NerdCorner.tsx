"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

interface NerdCornerProps {
  title?: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function NerdCorner({
  title = "Deep Dive",
  subtitle,
  defaultOpen = false,
  children,
}: NerdCornerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="nerd-corner my-8 relative">
      {/* Outer container with accent left border */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border-light)",
        }}
      >
        {/* Accent left edge */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{
            background:
              "linear-gradient(180deg, var(--accent) 0%, var(--accent-secondary) 100%)",
          }}
        />

        {/* Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-4 pl-5 pr-4 py-4 text-left transition-colors duration-150 hover:bg-white/[0.02] group"
        >
          {/* Terminal-style prompt */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className="font-mono text-sm"
              style={{ color: "var(--accent)" }}
            >
              ~/
            </span>
            <span
              className="font-mono text-xs px-1.5 py-0.5 rounded"
              style={{
                background: "var(--btn-primary)",
                color: "var(--accent)",
              }}
            >
              optional
            </span>
          </div>

          {/* Title and subtitle */}
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-base group-hover:text-accent transition-colors duration-150"
              style={{ color: "var(--primary-text)" }}
            >
              {title}
            </h3>
            {subtitle && !isOpen && (
              <p
                className="text-sm mt-0.5 truncate"
                style={{ color: "var(--secondary-text)" }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Expand indicator */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className="text-xs hidden sm:block"
              style={{ color: "var(--muted-text)" }}
            >
              {isOpen ? "collapse" : "expand"}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="p-1.5 rounded transition-colors duration-150"
              style={{
                background: isOpen ? "var(--btn-primary)" : "transparent",
                color: "var(--accent)",
              }}
            >
              <FaChevronDown size={12} />
            </motion.div>
          </div>
        </button>

        {/* Collapsible Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              {/* Divider */}
              <div
                className="mx-5 h-px"
                style={{ background: "var(--border-light)" }}
              />

              {/* Content area */}
              <div className="pl-5 pr-4 py-5">
                <div className="nerd-corner-content">{children}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
