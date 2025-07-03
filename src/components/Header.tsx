"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import MobileMenu from "@/components/ui/MobileMenu";
import DecryptText from "./ui/DecryptText";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        flex items-center justify-between px-6 py-4
        transition-all duration-300 ease-in-out
        ${isScrolled
          ? 'bg-primary-bg/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20'
          : 'bg-transparent'
        }
      `}
    >
      {/* Logo Section */}
      <div className="flex items-center">
        <Link href="/" title="Home" className="group">
          <DecryptText
            initialText="pvi.sh"
            finalText="Phil Vishnevsky"
            className="text-xl font-bold hover:text-accent transition-all duration-300 group-hover:scale-105"
            decryptionSpeed={40}
          />
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center">
        <div className="flex items-center space-x-1 bg-white/5 backdrop-blur-md rounded-full px-2 py-1 border border-white/10">
          {[
            { href: "/projects", label: "Projects", title: "Browse My Projects" },
            { href: "/blog", label: "Blog", title: "Read My Blog" },
            { href: "/about", label: "About", title: "Learn More About Me" }
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-300 ease-in-out
                hover:text-accent hover:scale-105
                ${isActive(item.href)
                  ? 'text-accent bg-accent/10 shadow-inner'
                  : 'text-secondary-text hover:bg-white/5'
                }
              `}
              title={item.title}
            >
              {item.label}
              {isActive(item.href) && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/20 to-purple-500/20 animate-pulse" />
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu />
    </header>
  );
}
