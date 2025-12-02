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
  { href: "https://linkedin.com/in/philipvishnevsky", icon: FaLinkedin, label: "LinkedIn" },
  { href: "https://bsky.app/profile/zenatron.bsky.social", icon: FaBluesky, label: "Bluesky" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/[0.04]">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Left: Brand + Copyright */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
                P
              </span>
              <span className="text-sm font-medium text-primary-text">Phil Vishnevsky</span>
            </Link>
            <span className="hidden text-xs text-muted-text sm:inline">
              © {new Date().getFullYear()}
            </span>
          </div>

          {/* Center: Navigation */}
          <nav className="flex items-center gap-6">
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
            <CalendarPopup className="!h-7 !w-7" />
          </div>
        </div>
      </div>
    </footer>
  );
}
