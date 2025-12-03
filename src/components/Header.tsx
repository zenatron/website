"use client";

import Link from "next/link";
import Image from "next/image";
import MobileMenu from "@/components/ui/MobileMenu";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ContactModal from "@/components/ui/ContactModal";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [draggedLink, setDraggedLink] = useState<string | null>(null);
  const [wobblyLinks, setWobblyLinks] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle drag attempt on nav links
  const handleDragStart = (e: React.DragEvent, href: string) => {
    e.preventDefault();
    setDraggedLink(href);

    // Random wobble for all links
    const newWobbles: Record<string, { x: number; y: number }> = {};
    NAV_LINKS.forEach((link) => {
      newWobbles[link.href] = {
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 10,
      };
    });
    setWobblyLinks(newWobbles);

    // Snap back after a moment
    setTimeout(() => {
      setWobblyLinks({});
      setDraggedLink(null);
    }, 500);
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6">
          {/* Brand - in bubble matching nav style */}
          <Link
            href="/"
            title="Home"
            className="group flex items-center gap-2.5 rounded-full border border-white/[0.06] bg-white/[0.02] p-1.5 backdrop-blur-sm transition-colors hover:border-white/[0.1] hover:bg-white/[0.04] sm:px-3"
          >
            <Image
              src="/images/phil_headshot_scaled.webp"
              alt="Phil Vishnevsky"
              width={48}
              height={48}
              quality={100}
              className="h-6 w-6 shrink-0 rounded-full object-cover"
            />
            <span className="hidden text-sm font-medium text-primary-text sm:block">
              Phil Vishnevsky
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.02] px-1.5 py-1.5 backdrop-blur-sm md:flex">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(link.href + "/");
              const wobble = wobblyLinks[link.href] || { x: 0, y: 0 };
              return (
                <motion.div
                  key={link.href}
                  animate={{
                    x: wobble.x,
                    y: wobble.y,
                    rotate: wobble.x * 0.5,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <Link
                    ref={(el) => {
                      linkRefs.current[link.href] = el;
                    }}
                    href={link.href}
                    draggable
                    onDragStart={(e) => handleDragStart(e, link.href)}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-sm transition-colors duration-150 block cursor-pointer",
                      isActive
                        ? "bg-white/[0.08] text-primary-text"
                        : "text-secondary-text hover:text-primary-text",
                      draggedLink === link.href && "opacity-70"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="hidden rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-sm font-medium text-secondary-text backdrop-blur-sm transition-colors hover:border-accent/30 hover:bg-accent/10 hover:text-accent sm:block"
            >
              Get in touch
            </button>
            <MobileMenu />
          </div>
        </div>
      </header>

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
