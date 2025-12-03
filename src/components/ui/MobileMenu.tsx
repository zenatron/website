"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import Link from "next/link";
import ContactModal from "@/components/ui/ContactModal";
import pkg from "../../../package.json";

const NAV_ITEMS = [
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export default function MobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const versionText = `v${pkg.version}`;

  // Set mounted on first menu open
  const handleMenuOpen = () => {
    setMenuOpen(!menuOpen);
    if (!mounted) setMounted(true);
  };

  const handleContactClick = () => {
    setMenuOpen(false);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-secondary-text transition-colors duration-150 hover:border-white/20 hover:text-primary-text md:hidden"
        onClick={handleMenuOpen}
        aria-label="Toggle Menu"
        aria-expanded={menuOpen}
        title="Toggle Menu"
      >
        {menuOpen ? (
          <FaTimes className="h-4 w-4" />
        ) : (
          <FaBars className="h-4 w-4" />
        )}
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/65 transition-opacity duration-200 ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Menu Drawer */}
      <nav
        className={`fixed top-0 right-0 z-40 flex h-full w-[65vw] max-w-[240px] flex-col gap-6 border-l border-white/[0.06] bg-primary-bg/95 backdrop-blur-md px-5 py-8 transition-transform duration-200 md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-text">
            Menu
          </p>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.02] text-secondary-text transition-colors duration-150 hover:border-white/[0.1] hover:text-primary-text"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <FaTimes className="h-3.5 w-3.5" />
          </button>
        </div>

        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-base font-medium text-primary-text transition-colors duration-150 hover:bg-white/[0.04] hover:text-accent"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Get in touch CTA */}
        <button
          type="button"
          onClick={handleContactClick}
          className="rounded-full px-4 py-2.5 text-base font-medium text-accent transition-colors duration-150"
          style={{
            backgroundColor: "rgba(124, 138, 255, 0.15)",
            border: "1px solid rgba(124, 138, 255, 0.3)",
          }}
        >
          Get in touch
        </button>

        <div className="mt-auto pt-4 border-t border-white/[0.06]">
          <span className="text-xs text-muted-text">{versionText}</span>
        </div>
      </nav>

      {/* Contact Modal */}
      {mounted &&
        isModalOpen &&
        createPortal(
          <ContactModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />,
          document.body
        )}
    </>
  );
}
