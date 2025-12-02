"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FaGithub,
  FaEnvelope,
  FaLinkedin,
  FaDiscord,
  FaCalendarAlt,
} from "react-icons/fa";
import { FaBluesky } from "react-icons/fa6";
import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useCallback, useMemo } from "react";
import UgIcon from "@/components/icons/UgIcon";

interface ContactOption {
  name: string;
  icon: React.ReactNode;
  href: string;
  description: string;
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const contactOptions: ContactOption[] = useMemo(
    () => [
      {
        name: "Email",
        icon: <FaEnvelope className="text-xl" />,
        href: "mailto:phil@underscore.games",
        description: "Send a message",
      },
      {
        name: "GitHub",
        icon: <FaGithub className="text-xl" />,
        href: "https://github.com/zenatron",
        description: "View my code",
      },
      {
        name: "LinkedIn",
        icon: <FaLinkedin className="text-xl" />,
        href: "https://www.linkedin.com/in/philipvishnevsky/",
        description: "Connect professionally",
      },
      {
        name: "Book a Call",
        icon: <FaCalendarAlt className="text-xl" />,
        href: "https://z3n.me/phil",
        description: "Schedule time",
      },
      {
        name: "Bluesky",
        icon: <FaBluesky className="text-xl" />,
        href: "https://bsky.app/profile/zenatron.bsky.social",
        description: "Follow me",
      },
      {
        name: "Discord",
        icon: <FaDiscord className="text-xl" />,
        href: "https://discord.com/users/492872848025583616",
        description: "Chat with me",
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
            className="relative w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#161719] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
              <h2
                id="modal-title"
                className="text-lg font-medium text-primary-text"
              >
                Get in touch
              </h2>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-text transition-colors hover:bg-white/[0.06] hover:text-primary-text"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Contact Options */}
            <div className="p-4 space-y-1">
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
                  className="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors hover:bg-white/[0.04] group"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] text-accent transition-colors group-hover:bg-accent/15">
                    {option.icon}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary-text">
                      {option.name}
                    </p>
                    <p className="text-xs text-muted-text">
                      {option.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06]">
              <p className="text-xs text-center text-muted-text">
                Based in Charlotte, NC · Open to remote
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
