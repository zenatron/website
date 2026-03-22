import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ContactModal from "@/components/ui/ContactModal";
import { T, tA } from "@/components/ui/TerminalWindow";
import pkg from "../../../package.json";

const NAV_ITEMS = [
  { href: "/projects", label: "~/projects" },
  { href: "/blog", label: "~/blog" },
  { href: "/about", label: "~/about" },
];

export default function MobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const versionText = `v${pkg.version}`;

  const handleMenuOpen = () => {
    setMenuOpen(!menuOpen);
    if (!mounted) setMounted(true);
  };

  const handleContactClick = () => {
    setMenuOpen(false);
    setIsModalOpen(true);
  };

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      {/* Hamburger */}
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded border font-mono text-xs transition-colors duration-150 md:hidden"
        style={{
          borderColor: T.gutter,
          backgroundColor: T.bg,
          color: T.comment,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = tA(T.purple, "66");
          e.currentTarget.style.color = T.purple;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = T.gutter;
          e.currentTarget.style.color = T.comment;
        }}
        onClick={handleMenuOpen}
        aria-label="Toggle Menu"
        aria-expanded={menuOpen}
      >
        {menuOpen ? "×" : "≡"}
      </button>

      {/* Portal backdrop + drawer outside header to avoid backdrop-filter stacking context */}
      {mounted &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className={`fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
                menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer */}
            <nav
              className={`fixed top-0 right-0 z-[91] flex h-full w-[50vw] flex-col border-l font-mono transition-transform duration-200 md:hidden ${
                menuOpen ? "translate-x-0" : "translate-x-full"
              }`}
              style={{
                backgroundColor: "rgba(15, 16, 18, 0.85)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderColor: T.gutter,
                boxShadow: menuOpen ? "-8px 0 24px rgba(0,0,0,0.6)" : "none",
              }}
            >
              {/* Title bar */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: T.gutter }}
              >
                <span className="text-xs" style={{ color: T.comment }}>
                  ~/menu
                </span>
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded text-sm transition-colors duration-150"
                  style={{ color: T.comment }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = T.red;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = T.comment;
                  }}
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  ×
                </button>
              </div>

              {/* Nav items */}
              <div className="px-4 py-4">
                <div
                  className="text-xs mb-3"
                  style={{ color: T.comment }}
                >
                  <span style={{ color: T.green }}>$</span> ls ~/
                </div>
                <ul className="space-y-1">
                  {NAV_ITEMS.map((item, i) => {
                    const isLast = i === NAV_ITEMS.length - 1;
                    const prefix = isLast ? "└─" : "├─";
                    return (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className="group flex items-center gap-2 rounded px-2 py-2.5 text-sm transition-colors duration-150"
                          style={{ color: T.fg }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = tA(T.purple, "10");
                            e.currentTarget.style.color = T.purple;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = T.fg;
                          }}
                        >
                          <span style={{ color: T.gutter }}>{prefix}</span>
                          {item.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Contact CTA */}
              <div className="px-4 py-3">
                <button
                  type="button"
                  onClick={handleContactClick}
                  className="w-full rounded px-3 py-2.5 text-sm transition-all duration-150"
                  style={{
                    backgroundColor: tA(T.purple, "18"),
                    border: `1px solid ${tA(T.purple, "44")}`,
                    color: T.purple,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = tA(T.purple, "28");
                    e.currentTarget.style.borderColor = tA(T.purple, "66");
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = tA(T.purple, "18");
                    e.currentTarget.style.borderColor = tA(T.purple, "44");
                  }}
                >
                  <span style={{ color: T.green }}>$</span> contact{" "}
                  <span style={{ color: T.comment }}>↵</span>
                </button>
              </div>

              {/* Version */}
              <div
                className="mt-auto px-4 py-3 border-t text-xs"
                style={{ borderColor: T.gutter, color: T.comment }}
              >
                {versionText}
              </div>
            </nav>
          </>,
          document.body
        )}

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
