"use client";

import { useState } from "react";
import {
  FaProjectDiagram,
  FaLightbulb,
  FaUser
} from "react-icons/fa";
import GlassCard from "./GlassCard";
import Link from "next/link";
import ShinyText from "./ShinyText";
import pkg from "../../../package.json";

export default function MobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
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
          className={`fixed top-0 right-0 h-full sm:w-3/5 md:w-1/2 lg:w-96 
            bg-secondary-bg/30 backdrop-blur-xl
            border-l border-white/5
            flex flex-col items-start space-y-6 py-6 px-6 z-30
            shadow-[0_0_15px_rgba(0,0,0,0.2)]
            transition-transform transform duration-300
            ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
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
