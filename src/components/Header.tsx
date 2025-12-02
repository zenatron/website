"use client";

import Link from "next/link";
import MobileMenu from "@/components/ui/MobileMenu";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ContactModal from "@/components/ui/ContactModal";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6">
          {/* Brand - in bubble matching nav style */}
          <Link
            href="/"
            title="Home"
            className="group flex items-center gap-2.5 rounded-full border border-white/[0.06] bg-white/[0.02] p-1.5 backdrop-blur-sm transition-colors hover:border-white/[0.1] hover:bg-white/[0.04] sm:px-3"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent transition-colors group-hover:bg-accent/25">
              P
            </span>
            <span className="hidden text-sm font-medium text-primary-text sm:block">
              Phil Vishnevsky
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.02] px-1.5 py-1.5 backdrop-blur-sm md:flex">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm transition-colors duration-150",
                    isActive
                      ? "bg-white/[0.08] text-primary-text"
                      : "text-secondary-text hover:text-primary-text"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="hidden rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-sm font-medium text-secondary-text backdrop-blur-sm transition-colors hover:border-accent/30 hover:bg-accent/10 hover:text-accent sm:block"
            >
              Get in touch
            </button>
            <MobileMenu />
          </div>
        </div>
      </header>

      {/* Contact Modal */}
      {mounted && isModalOpen && createPortal(
        <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />,
        document.body
      )}
    </>
  );
}
