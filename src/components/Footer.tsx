"use client";

import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FaBluesky } from "react-icons/fa6";
import CalendarPopup from "@/components/ui/Calendar";

const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/links", label: "Links" },
];

const SOCIAL_LINKS = [
  { href: "https://github.com/zenatron", icon: FaGithub, label: "GitHub" },
  {
    href: "https://linkedin.com/in/philipvishnevsky",
    icon: FaLinkedin,
    label: "LinkedIn",
  },
  {
    href: "https://bsky.app/profile/zenatron.bsky.social",
    icon: FaBluesky,
    label: "Bluesky",
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/[0.04]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-6">
          {/* Left: Copyright */}
          <span className="text-xs text-muted-text">
            © {new Date().getFullYear()} Phil Vishnevsky
          </span>

          {/* Center: Navigation */}
          <nav className="flex items-center gap-4 sm:gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-secondary-text transition-colors hover:text-primary-text"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Social Icons + Calendar */}
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-text transition-colors hover:text-primary-text"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4" />
              </Link>
            ))}
            <CalendarPopup />
          </div>
        </div>
      </div>
    </footer>
  );
}
