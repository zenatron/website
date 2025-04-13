"use client";

import Link from "next/link";
import MobileMenu from "@/components/ui/MobileMenu";
import DecryptText from "./ui/DecryptText";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-2 bg-primary-bg text-primary-text shadow-md relative z-30">
      <Link href="/">
        <DecryptText
          initialText="pvi.sh"
          finalText="Phil Vishnevsky"
          className="text-xl font-bold hover:text-accent transition-colors"
          decryptionSpeed={40}
        />
      </Link>

      <nav className="hidden md:flex items-center space-x-4">
        <Link
          href="/projects"
          className="btn-nav hover:text-accent transition-transform duration-200 hover:scale-110"
        >
          {"Projects"}
        </Link>
        <Link
          href="/blog"
          className="btn-nav hover:text-accent transition-transform duration-200 hover:scale-110"
        >
          {"Blog"}
        </Link>
        <Link
          href="/about"
          className="btn-nav hover:text-accent transition-transform duration-200 hover:scale-110"
        >
          {"About"}
        </Link>
      </nav>

      <MobileMenu />
    </header>
  );
}
