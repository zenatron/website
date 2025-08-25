"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FaGithub,
  FaEnvelope,
  FaLinkedin,
  FaTimes,
  FaDiscord,
  FaCalendarAlt,
} from "react-icons/fa";
import { FaBluesky } from "react-icons/fa6";
import Link from "next/link";
import { useEffect, useRef, useCallback, useMemo } from "react";
import UgIcon from "@/components/icons/UgIcon";

interface ContactOption {
  name: string;
  icon: React.ReactNode;
  href: string;
  description: string;
  color: string;
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Memoize contact options to prevent recreation on every render
  const contactOptions: ContactOption[] = useMemo(
    () => [
      {
        name: "GitHub",
        icon: <FaGithub className="text-2xl" />,
        href: "https://github.com/zenatron",
        description: "Check out my code and projects",
        color: "hover:bg-gray-600/20 hover:border-gray-400/50",
      },
      {
        name: "Email",
        icon: <FaEnvelope className="text-2xl" />,
        href: "mailto:phil@underscore.games",
        description: "Send me a message directly",
        color: "hover:bg-red-600/20 hover:border-red-400/50",
      },
      {
        name: "LinkedIn",
        icon: <FaLinkedin className="text-2xl" />,
        href: "https://www.linkedin.com/in/philipvishnevsky/",
        description: "Connect professionally",
        color: "hover:bg-blue-600/20 hover:border-blue-400/50",
      },
      {
        name: "Bluesky",
        icon: <FaBluesky className="text-2xl" />,
        href: "https://bsky.app/profile/zenatron.bsky.social",
        description: "Follow me on social",
        color: "hover:bg-sky-600/20 hover:border-sky-400/50",
      },
      {
        name: "Discord",
        icon: <FaDiscord className="text-2xl" />,
        href: "https://discord.com/users/492872848025583616",
        description: "Chat with me on Discord",
        color: "hover:bg-indigo-600/20 hover:border-indigo-400/50",
      },
      {
        name: "Book a Call",
        icon: <FaCalendarAlt className="text-2xl" />,
        href: "https://z3n.me/phil",
        description: "Schedule a meeting",
        color: "hover:bg-green-600/20 hover:border-green-400/50",
      },
      {
        name: "Underscore Games",
        icon: <UgIcon className="w-7 h-7" />,
        href: "https://underscore.games",
        description: "Visit my game studio",
        color: "hover:bg-purple-600/20 hover:border-purple-400/50",
      },
    ],
    []
  );

  // Optimized keyboard handler with useCallback
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      // Simplified focus trap - only run when Tab is pressed
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

  // Handle keyboard events and body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";

      // Focus the close button when modal opens
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
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 400,
              duration: 0.3,
            }}
            className="relative w-full max-w-md sm:max-w-lg bg-neutral-900/90 backdrop-blur-md border border-neutral-700/50 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-700/40">
              <h2
                id="modal-title"
                className="text-xl font-bold text-primary-text"
              >
                {"Let's Connect!"}
              </h2>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="p-2 hover:bg-neutral-700/50 rounded-lg transition-colors duration-200"
                aria-label="Close modal"
              >
                <FaTimes className="text-sm text-muted-text hover:text-primary-text transition-colors" />
              </button>
            </div>

            {/* Contact Options Grid - Optimized */}
            <motion.div
              className="p-4 grid grid-cols-2 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {contactOptions.map((option) => (
                <Link
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
                  className="block group"
                >
                  <div className="p-3 h-full bg-neutral-800/30 border border-neutral-600/30 rounded-2xl shadow-lg hover:bg-neutral-700/40 hover:border-neutral-500/50 hover:-translate-y-1 transition-all duration-200 ease-out">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="text-accent group-hover:scale-110 transition-transform duration-200">
                        {option.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-primary-text group-hover:text-white transition-colors duration-200">
                          {option.name}
                        </h3>
                        <p className="text-xs text-muted-text group-hover:text-gray-300 transition-colors duration-200 leading-tight">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
