"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavigationItem {
  href: string;
  label: string;
  title: string;
}

interface PillNavigationProps {
  items: NavigationItem[];
  className?: string;
}

export default function PillNavigation({
  items,
  className = "",
}: PillNavigationProps) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={`relative ${className}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Elegant glass navigation container */}
      <div
        className="flex items-center gap-0.5 p-0.5
                   bg-neutral-800/25 backdrop-blur-md
                   border border-neutral-600/30
                   rounded-2xl shadow-lg
                   transition-all duration-300 ease-out"
        onMouseLeave={() => setHoveredItem(null)}
      >
        {items.map((item) => {
          const active = isActive(item.href);
          const shouldShowSelected = hoveredItem
            ? hoveredItem === item.href
            : active;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative px-3 py-1.5 sm:px-4 sm:py-2
                text-sm font-medium rounded-xl
                border border-transparent
                transition-all duration-150 ease-out
                hover:scale-105 active:scale-95
                focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-transparent
                ${
                  shouldShowSelected
                    ? "bg-neutral-800/60 backdrop-blur-md border-neutral-600/40 text-primary-text shadow-lg"
                    : "text-secondary-text"
                }
              `}
              title={item.title}
              onMouseEnter={() => setHoveredItem(item.href)}
            >
              <span className="relative whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
