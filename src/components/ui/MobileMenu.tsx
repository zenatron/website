"use client";

import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Link from "next/link";
import pkg from "../../../package.json";

const NAV_ITEMS = [
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export default function MobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const versionText = `v${pkg.version}`;

  return (
    <>
      {/* Hamburger Button */}
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-secondary-text transition-colors duration-150 hover:border-white/20 hover:text-primary-text md:hidden"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle Menu"
        aria-expanded={menuOpen}
        title="Toggle Menu"
      >
        {menuOpen ? <FaTimes className="h-4 w-4" /> : <FaBars className="h-4 w-4" />}
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
        className={`fixed top-0 right-0 z-40 flex h-full w-[78vw] max-w-xs flex-col gap-6 border-l border-white/10 bg-primary-bg px-5 py-8 transition-transform duration-200 md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.26em] text-muted-text">Menu</p>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-secondary-text transition-colors duration-150 hover:border-white/20 hover:text-primary-text"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        <ul className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-primary-text transition-colors duration-150 hover:border-white/20 hover:bg-white/5"
              >
                <span>{item.label}</span>
                <span className="text-xs uppercase tracking-[0.18em] text-muted-text">Go</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto space-y-1 text-xs text-muted-text">
          <span className="text-secondary-text">{versionText}</span>
        </div>
      </nav>
    </>
  );
}
