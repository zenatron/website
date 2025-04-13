"use client";

import { useState } from "react";
import { FaProjectDiagram, FaLightbulb, FaUser } from "react-icons/fa";
import GlassCard from "./GlassCard";

export default function MobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        className="md:hidden flex items-center justify-center p-2 text-primary-text hover:text-accent transition-colors"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle Menu"
        aria-expanded={menuOpen}
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
          className={`fixed top-0 right-0 h-full w-4/5 
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
          <section className="mt-12 grid gap-4 md:gap-6 grid-cols-3 mx-auto max-w-2xl">
            <GlassCard
              href="/projects"
              onClick={() => setMenuOpen(false)}
              className="p-4 md:p-10 h-full"
            >
              <div className="group flex flex-col items-center justify-center h-full">
                <FaProjectDiagram className="text-2xl md:text-4xl text-accent mb-2 group-hover:animate-bounce" />
                <h3 className="text-sm md:text-lg font-bold">Projects</h3>
              </div>
            </GlassCard>
            <GlassCard
              href="/blog"
              onClick={() => setMenuOpen(false)}
              className="p-4 md:p-10 h-full"
            >
              <div className="group flex flex-col items-center justify-center h-full">
                <FaLightbulb className="text-2xl md:text-4xl text-accent mb-2 group-hover:animate-bounce" />
                <h3 className="text-sm md:text-lg font-bold">Blog</h3>
              </div>
            </GlassCard>
            <GlassCard
              href="/about"
              onClick={() => setMenuOpen(false)}
              className="p-4 md:p-10 h-full"
            >
              <div className="group flex flex-col items-center justify-center h-full">
                <FaUser className="text-2xl md:text-4xl text-accent mb-2 group-hover:animate-bounce" />
                <h3 className="text-sm md:text-lg font-bold">About</h3>
              </div>
            </GlassCard>
          </section>
        </nav>
      </>
    </>
  );
}
