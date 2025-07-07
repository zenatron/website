"use client";

import {
  FaProjectDiagram,
  FaLightbulb,
  FaUser
} from "react-icons/fa";
import GlassCard from "./GlassCard";
import Link from "next/link";
import ShinyText from "./ShinyText";
import pkg from "../../../package.json";

interface MobileMenuProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

export default function MobileMenu({ menuOpen, setMenuOpen }: MobileMenuProps) {
  const versionText = `v${pkg.version}`;

  return (
    <>
      {/* Hamburger Button */}
      <button
        className="md:hidden flex items-center justify-center p-2 text-primary-text hover:text-accent transition-colors"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle Menu"
        aria-expanded={menuOpen}
        title="Toggle Menu"
      >
        {menuOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 animate-fade-in"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 animate-fade-in"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        )}
      </button>

      {/* Mobile Menu */}
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-20 transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMenuOpen(false)}
        ></div>

        {/* Menu */}
        <nav
          className={`fixed top-0 right-0 h-screen w-1/2 max-w-80
            border-l border-white/5
            flex flex-col items-start space-y-6 py-6 px-6 z-30
            transition-transform transform duration-300
            ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
          style={{
            backgroundColor: 'rgba(16, 16, 16, 0.9)',
            backdropFilter: 'blur(25px)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Back Button */}
          <button
            className="text-primary-text hover:text-accent flex items-center space-x-2"
            onClick={() => setMenuOpen(false)}
            aria-label="Close Menu"
            title="Close Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span>Close</span>
          </button>

          {/* Links */}
          {/* Icon Section */}
          <section className="flex flex-col mt-12 gap-4 md:gap-6 w-full max-w-2xl">
            <GlassCard
              href="/projects"
              onClick={() => setMenuOpen(false)}
              className="p-4 md:p-6"
            >
              <div className="group flex items-center justify-center gap-4 h-full">
                <FaProjectDiagram className="text-xl md:text-2xl text-accent" />
                <h3 className="text-sm md:text-lg font-bold">Projects</h3>
              </div>
            </GlassCard>
            <GlassCard
              href="/blog"
              onClick={() => setMenuOpen(false)}
              className="p-4 md:p-6"
            >
              <div className="group flex items-center justify-center gap-4 h-full">
                <FaLightbulb className="text-xl md:text-2xl text-accent" />
                <h3 className="text-sm md:text-lg font-bold">Blog</h3>
              </div>
            </GlassCard>
            <GlassCard
              href="/about"
              onClick={() => setMenuOpen(false)}
              className="p-4 md:p-6"
            >
              <div className="group flex items-center justify-center gap-4 h-full">
                <FaUser className="text-xl md:text-2xl text-accent" />
                <h3 className="text-sm md:text-lg font-bold">About</h3>
              </div>
            </GlassCard>
          </section>
          <Link
            href="https://github.com/zenatron/portfolio/deployments"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 left-0 right-0 flex justify-center"
          >
            <ShinyText
              text={versionText}
              disabled={false}
              speed={3}
              className="tag-bubble text-xs border-gray-600 hover:border-gray-400"
            />
          </Link>
        </nav>
      </>
    </>
  );
}
