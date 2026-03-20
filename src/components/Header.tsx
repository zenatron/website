import MobileMenu from "@/components/ui/MobileMenu";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ContactModal from "@/components/ui/ContactModal";
import { T } from "@/components/ui/TerminalWindow";
import { motion } from "framer-motion";

const NAV_LINKS = [
  { href: "/projects", label: "~/projects" },
  { href: "/blog", label: "~/blog" },
  { href: "/about", label: "~/about" },
];

export default function Header() {
  const [pathname, setPathname] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    setMounted(true);
    setPathname(window.location.pathname);
  }, []);

  return (
    <>
      <header
        className="fixed left-0 right-0 top-0 z-40 border-b backdrop-blur-md"
        style={{
          backgroundColor: `${T.bg}e6`,
          borderColor: T.gutter,
        }}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 font-mono">
          {/* Brand */}
          <a
            href="/"
            className="group flex items-center gap-2.5 text-sm transition-colors duration-150"
            style={{ color: T.fg }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = T.purple;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = T.fg;
            }}
          >
            <img
              src="/images/phil_headshot_scaled.webp"
              alt="Phil Vishnevsky"
              width={48}
              height={48}
              className="h-6 w-6 shrink-0 rounded-full object-cover"
              style={{ border: `1px solid ${T.gutter}` }}
            />
            <span className="hidden sm:block">/home/phil</span>
          </a>

          {/* Navigation */}
          <nav
            className="hidden items-center gap-0.5 rounded border px-1 py-1 text-sm md:flex relative"
            style={{ backgroundColor: `${T.bg}80`, borderColor: T.gutter }}
            onMouseLeave={() => setHoveredLink(null)}
          >
            {/* Animated indicator */}
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href ||
                pathname.startsWith(link.href + "/");
              const shouldShow =
                hoveredLink === link.href || (!hoveredLink && isActive);

              return shouldShow ? (
                <motion.div
                  key={`indicator-${link.href}`}
                  layoutId="nav-indicator"
                  className="absolute rounded"
                  style={{
                    left: linkRefs.current[link.href]?.offsetLeft,
                    top: linkRefs.current[link.href]?.offsetTop,
                    width: linkRefs.current[link.href]?.offsetWidth,
                    height: linkRefs.current[link.href]?.offsetHeight,
                    backgroundColor: `${T.purple}18`,
                  }}
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              ) : null;
            })}

            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href ||
                pathname.startsWith(link.href + "/");
              return (
                <a
                  key={link.href}
                  ref={(el) => {
                    linkRefs.current[link.href] = el;
                  }}
                  href={link.href}
                  onMouseEnter={() => setHoveredLink(link.href)}
                  className="relative rounded px-3 py-1.5 transition-colors duration-150 block z-10"
                  style={{
                    color:
                      isActive || hoveredLink === link.href
                        ? T.purple
                        : T.comment,
                  }}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="hidden rounded px-3 py-1.5 text-sm transition-all duration-150 sm:block"
              style={{
                backgroundColor: `${T.purple}18`,
                border: `1px solid ${T.purple}44`,
                color: T.purple,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${T.purple}28`;
                e.currentTarget.style.borderColor = `${T.purple}66`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${T.purple}18`;
                e.currentTarget.style.borderColor = `${T.purple}44`;
              }}
            >
              <span style={{ color: T.green }}>$</span> contact
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
