import { motion, AnimatePresence } from "framer-motion";
import {
  FaGithub,
  FaEnvelope,
  FaLinkedin,
  FaDiscord,
  FaCalendarAlt,
} from "react-icons/fa";
import { FaBluesky } from "react-icons/fa6";
import { useEffect, useRef, useCallback, useMemo, useState } from "react";

/* ── Atom One Dark palette (matching TerminalBoot) ── */
const T = {
  bg: "#282c34",
  fg: "#abb2bf",
  purple: "#c678dd",
  blue: "#61afef",
  green: "#98c379",
  yellow: "#e5c07b",
  red: "#e06c75",
  comment: "#5c6370",
  white: "#e6e6e6",
  gutter: "#3e4451",
  cursor: "#528bff",
};

interface ContactOption {
  name: string;
  icon: React.ReactNode;
  href: string;
  cmd: string; // terminal-style command hint
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const contactOptions: ContactOption[] = useMemo(
    () => [
      {
        name: "Email",
        icon: <FaEnvelope className="text-base" />,
        href: "mailto:phil@pvi.sh",
        cmd: "mail phil@pvi.sh",
      },
      {
        name: "GitHub",
        icon: <FaGithub className="text-base" />,
        href: "https://github.com/zenatron",
        cmd: "gh profile zenatron",
      },
      {
        name: "LinkedIn",
        icon: <FaLinkedin className="text-base" />,
        href: "https://www.linkedin.com/in/philvishnevsky/",
        cmd: "open linkedin/philvishnevsky",
      },
      {
        name: "Book a Call",
        icon: <FaCalendarAlt className="text-base" />,
        href: "https://z3n.me/phil",
        cmd: "cal schedule --with phil",
      },
      {
        name: "Bluesky",
        icon: <FaBluesky className="text-base" />,
        href: "https://bsky.app/profile/zenatron.bsky.social",
        cmd: "bsky follow @zenatron",
      },
      {
        name: "Discord",
        icon: <FaDiscord className="text-base" />,
        href: "https://discord.com/users/492872848025583616",
        cmd: "discord dm zenatron",
      },
    ],
    []
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";

      const timeoutId = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 150);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "unset";
        clearTimeout(timeoutId);
      };
    }
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md overflow-hidden rounded-lg border shadow-2xl"
            style={{
              backgroundColor: T.bg,
              borderColor: T.gutter,
              fontFamily: 'var(--font-mono-terminal)',
              fontFeatureSettings: '"calt" 1, "liga" 1, "dlig" 1',
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Terminal title bar */}
            <div
              className="flex items-center gap-2 px-4 py-3 border-b"
              style={{ borderColor: T.gutter }}
            >
              {/* Traffic light dots */}
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="flex items-center gap-1.5 group"
                aria-label="Close modal"
              >
                <span
                  className="h-3 w-3 rounded-full transition-opacity group-hover:opacity-100 opacity-80"
                  style={{ backgroundColor: T.red }}
                />
                <span
                  className="h-3 w-3 rounded-full transition-opacity group-hover:opacity-100 opacity-80"
                  style={{ backgroundColor: T.yellow }}
                />
                <span
                  className="h-3 w-3 rounded-full transition-opacity group-hover:opacity-100 opacity-80"
                  style={{ backgroundColor: T.green }}
                />
              </button>
              <span
                id="modal-title"
                className="flex-1 text-center text-xs"
                style={{ color: T.comment }}
              >
                phil@portfolio: ~/contact
              </span>
              {/* Spacer to balance the dots */}
              <div className="w-[52px]" />
            </div>

            {/* Terminal body */}
            <div className="px-4 pt-3 pb-2">
              {/* Command prompt */}
              <div className="text-sm mb-3" style={{ color: T.fg }}>
                <span style={{ color: T.green }}>$</span>{" "}
                <span style={{ color: T.fg }}>contact</span>{" "}
                <span style={{ color: T.purple }}>--list</span>
              </div>

              {/* Separator */}
              <div
                className="text-xs mb-3"
                style={{ color: T.gutter }}
              >
                {"─".repeat(44)}
              </div>

              {/* Contact options as terminal entries */}
              <div className="space-y-0.5">
                {contactOptions.map((option, idx) => (
                  <a
                    key={option.name}
                    href={option.href}
                    target={
                      option.href.startsWith("mailto:") ? "_self" : "_blank"
                    }
                    rel={
                      option.href.startsWith("mailto:")
                        ? ""
                        : "noopener noreferrer"
                    }
                    onClick={onClose}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="flex items-center gap-3 px-2 py-2 rounded transition-colors group"
                    style={{
                      backgroundColor:
                        hoveredIdx === idx
                          ? `${T.purple}18`
                          : "transparent",
                    }}
                  >
                    {/* Arrow indicator */}
                    <span
                      className="text-xs transition-opacity"
                      style={{
                        color: T.green,
                        opacity: hoveredIdx === idx ? 1 : 0,
                      }}
                    >
                      {">"}
                    </span>

                    {/* Icon */}
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded"
                      style={{
                        color:
                          hoveredIdx === idx ? T.purple : T.comment,
                        backgroundColor:
                          hoveredIdx === idx
                            ? `${T.purple}20`
                            : `${T.fg}08`,
                      }}
                    >
                      {option.icon}
                    </span>

                    {/* Name + command */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span
                          className="text-sm font-medium"
                          style={{
                            color:
                              hoveredIdx === idx ? T.white : T.fg,
                          }}
                        >
                          {option.name}
                        </span>
                      </div>
                      <div
                        className="text-xs truncate"
                        style={{ color: T.comment }}
                      >
                        $ {option.cmd}
                      </div>
                    </div>

                    {/* External indicator */}
                    <span
                      className="text-xs transition-opacity"
                      style={{
                        color: T.comment,
                        opacity: hoveredIdx === idx ? 1 : 0,
                      }}
                    >
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Footer — terminal prompt */}
            <div
              className="px-4 py-3 border-t text-xs"
              style={{ borderColor: T.gutter }}
            >
              <span style={{ color: T.comment }}>
                Hartford, CT · Open to remote
              </span>
              <span className="float-right" style={{ color: T.gutter }}>
                ESC to close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
