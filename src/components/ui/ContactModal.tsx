import { motion, AnimatePresence } from "framer-motion";
import {
  FaEnvelope,
  FaDiscord,
  FaCalendarAlt,
} from "react-icons/fa";
import { FaBluesky } from "react-icons/fa6";
import { SiGithub, SiLinkedin } from "react-icons/si";
import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { T, tA } from "@/components/ui/TerminalWindow";

interface ContactOption {
  name: string;
  icon: React.ReactNode;
  href: string;
  cmd: string; // terminal-style command hint
  cmdParts: { text: string; color: string }[]; // colored command segments
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
        cmdParts: [
          { text: "mail", color: T.fg },
          { text: " phil@pvi.sh", color: T.orange },
        ],
      },
      {
        name: "GitHub",
        icon: <SiGithub className="h-4 w-4" />,
        href: "https://github.com/zenatron",
        cmd: "gh profile zenatron",
        cmdParts: [
          { text: "gh", color: T.fg },
          { text: " profile", color: T.purple },
          { text: " zenatron", color: T.orange },
        ],
      },
      {
        name: "LinkedIn",
        icon: <SiLinkedin className="h-4 w-4" />,
        href: "https://www.linkedin.com/in/philvishnevsky/",
        cmd: "open linkedin/philvishnevsky",
        cmdParts: [
          { text: "open", color: T.fg },
          { text: " linkedin/philvishnevsky", color: T.orange },
        ],
      },
      {
        name: "Book a Call",
        icon: <FaCalendarAlt className="text-base" />,
        // href: "https://z3n.me/phil",
        href: "https://fantastical.app/philv",
        cmd: "cal schedule --with phil",
        cmdParts: [
          { text: "cal", color: T.fg },
          { text: " schedule", color: T.fg },
          { text: " --with", color: T.purple },
          { text: " phil", color: T.orange },
        ],
      },
      {
        name: "Bluesky",
        icon: <FaBluesky className="text-base" />,
        href: "https://bsky.app/profile/zenatron.bsky.social",
        cmd: "bsky follow @zenatron",
        cmdParts: [
          { text: "bsky", color: T.fg },
          { text: " follow", color: T.fg },
          { text: " @zenatron", color: T.orange },
        ],
      },
      {
        name: "Discord",
        icon: <FaDiscord className="text-base" />,
        href: "https://discord.com/users/492872848025583616",
        cmd: "discord dm zenatron",
        cmdParts: [
          { text: "discord", color: T.fg },
          { text: " dm", color: T.fg },
          { text: " zenatron", color: T.orange },
        ],
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
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
                    className="flex items-center gap-2 px-2 py-2 rounded transition-colors group"
                    style={{
                      backgroundColor:
                        hoveredIdx === idx
                          ? tA(T.purple, "18")
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
                      style={{
                        color:
                          hoveredIdx === idx ? T.purple : T.comment,
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
                      <div className="text-xs truncate">
                        <span style={{ color: T.green }}>$</span>{" "}
                        {option.cmdParts.map((part, j) => (
                          <span key={j} style={{ color: part.color }}>{part.text}</span>
                        ))}
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
