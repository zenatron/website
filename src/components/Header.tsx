'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-6 py-2 bg-secondary relative">
      <h1 className="text-xl font-bold">Philip Vishnevsky</h1>

      {/* Hamburger Menu Button */}
      <button
        className="md:hidden flex items-center justify-center p-2 text-white hover:text-gray-400"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle Menu"
        aria-expanded={menuOpen}
      >
        {menuOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
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
            className="h-6 w-6"
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

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-4">
        <Link href="/projects" className="btn btn-secondary w-24 h-10 flex items-center justify-center">
          Projects
        </Link>
        <Link href="/blog" className="btn btn-secondary w-24 h-10 flex items-center justify-center">
          Blog
        </Link>
        <Link href="/about" className="btn btn-secondary w-24 h-10 flex items-center justify-center">
          About
        </Link>
      </nav>

      {/* Mobile Navigation */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={() => setMenuOpen(false)}
          ></div>

          {/* Menu */}
          <nav
            className={`absolute top-14 left-0 w-full bg-secondary flex flex-col items-center space-y-4 py-4 z-20
            transition-transform transform duration-300 ${
              menuOpen ? 'translate-y-0' : '-translate-y-full'
            }`}
          >
            <Link href="/projects" className="btn btn-secondary w-3/4 text-center">
              Projects
            </Link>
            <Link href="/blog" className="btn btn-secondary w-3/4 text-center">
              Blog
            </Link>
            <Link href="/about" className="btn btn-secondary w-3/4 text-center">
              About
            </Link>
          </nav>
        </>
      )}
    </header>
  );
}