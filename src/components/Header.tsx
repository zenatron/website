"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import MobileMenu from "@/components/ui/MobileMenu";
import DecryptText from "./ui/DecryptText";
import PillNavigation from "./ui/PillNavigation";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{
        backgroundColor: isScrolled ? 'rgba(16, 16, 16, 0.6)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(15px)' : 'blur(0px)',
        borderBottom: `1px solid rgba(255, 255, 255, ${isScrolled ? 0.05 : 0})`,
        boxShadow: isScrolled
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
          : '0 0 0 0 rgba(0, 0, 0, 0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Logo Section */}
      <div className="flex items-center">
        <Link href="/" title="Home" className="group">
          <DecryptText
            initialText="pvi.sh"
            finalText="Phil Vishnevsky"
            className="text-xl font-bold hover:text-accent transition-all duration-300 group-hover:scale-105"
            decryptionSpeed={24}
          />
        </Link>
      </div>

      {/* Desktop Navigation */}
      <PillNavigation
        className="hidden md:flex items-center"
        items={[
          { href: "/projects", label: "Projects", title: "Browse My Projects" },
          { href: "/blog", label: "Blog", title: "Read My Blog" },
          { href: "/about", label: "About", title: "Learn More About Me" }
        ]}
      />

      {/* Mobile Menu */}
      <MobileMenu
        menuOpen={mobileMenuOpen}
        setMenuOpen={setMobileMenuOpen}
      />
    </header>
  );
}
