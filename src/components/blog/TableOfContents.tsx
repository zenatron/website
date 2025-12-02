"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Heading,
  NestedHeading,
  buildHeadingHierarchy,
} from "@/utils/extractHeadings";
import { FaChevronDown, FaList } from "react-icons/fa";

// Custom hook for tracking active heading with IntersectionObserver
function useActiveHeading(headings: Heading[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);

        if (visibleEntries.length > 0) {
          // Get the first visible heading (topmost)
          const topEntry = visibleEntries.reduce((prev, current) => {
            return prev.boundingClientRect.top < current.boundingClientRect.top
              ? prev
              : current;
          });

          setActiveId(topEntry.target.id);
        }
      },
      {
        rootMargin: "-20% 0% -35% 0%",
        threshold: 0,
      }
    );

    // Observe all headings
    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  return { activeId, setActiveId };
}

// Custom hook for outside click detection
function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose: () => void
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, isOpen, onClose]);
}

// Custom hook for heading navigation
function useHeadingNavigation(
  setActiveId: (id: string) => void,
  onNavigate?: () => void
) {
  return useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (element) {
        // Smooth scroll to the heading with offset for header
        const headerOffset = 80; // Adjust based on your header height + some padding
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        setActiveId(id);
        onNavigate?.();
      }
    },
    [setActiveId, onNavigate]
  );
}

interface TableOfContentsProps {
  headings: Heading[];
  className?: string;
}

interface TOCItemProps {
  heading: NestedHeading;
  activeId: string | null;
  onHeadingClick: (id: string) => void;
  isMobile?: boolean;
}

function TOCItem({
  heading,
  activeId,
  onHeadingClick,
  isMobile = false,
}: TOCItemProps) {
  const isActive = activeId === heading.id;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onHeadingClick(heading.id);
    },
    [heading.id, onHeadingClick]
  );

  const baseClasses = `
    block py-2 px-3 text-sm transition-colors duration-200
    hover:text-accent hover:bg-accent/10 rounded-md
    ${isActive ? "text-accent font-medium bg-accent/5" : "text-muted-text"}
  `;

  const levelClasses = isMobile
    ? ""
    : `
    ${heading.level === 1 ? "font-semibold text-base" : ""}
    ${heading.level === 2 ? "ml-3" : ""}
    ${heading.level === 3 ? "ml-6 text-xs" : ""}
    ${heading.level === 4 ? "ml-9 text-xs" : ""}
    ${heading.level === 5 ? "ml-12 text-xs" : ""}
    ${heading.level === 6 ? "ml-16 text-xs" : ""}
  `;

  return (
    <li className="mb-1">
      <a
        href={`#${heading.id}`}
        onClick={handleClick}
        className={`${baseClasses} ${levelClasses}`}
      >
        {isMobile && (
          <span className="text-xs opacity-60 mr-2">
            {"•".repeat(heading.level)}
          </span>
        )}
        {heading.text}
      </a>
      {heading.children.length > 0 && (
        <ul className="mt-1 space-y-0.5">
          {heading.children.map((child) => (
            <TOCItem
              key={child.id}
              heading={child}
              activeId={activeId}
              onHeadingClick={onHeadingClick}
              isMobile={isMobile}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function TableOfContents({
  headings,
  className = "",
}: TableOfContentsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const nestedHeadings = buildHeadingHierarchy(headings);

  // Use custom hooks for shared logic
  const { activeId, setActiveId } = useActiveHeading(headings);

  useOutsideClick(dropdownRef, isDropdownOpen, () => setIsDropdownOpen(false));

  const handleHeadingClick = useHeadingNavigation(setActiveId, () =>
    setIsDropdownOpen(false)
  );

  if (headings.length === 0) {
    return null;
  }

  const activeHeading = headings.find((h) => h.id === activeId);

  // Determine which version to render based on className
  const showMobileOnly = className?.includes("mobile-only");
  const showDesktopOnly = className?.includes("desktop-only");

  return (
    <>
      {/* Mobile Version - Dropdown */}
      {!showDesktopOnly && (
        <div
          className={`lg:hidden z-20 mb-8 ${className}`}
          ref={dropdownRef}
        >
          <div className="relative max-w-4xl mx-auto px-4">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-neutral-800/60 backdrop-blur-md border border-neutral-600/40 rounded-xl p-4 flex items-center justify-between text-left transition-colors duration-200 hover:bg-neutral-800/70 active:bg-neutral-800/80 shadow-lg cursor-pointer touch-manipulation"
              aria-expanded={isDropdownOpen}
              aria-label="Toggle table of contents"
            >
              <div className="flex items-center gap-3">
                <FaList className="text-sm" />
                <div>
                  <div className="text-xs uppercase tracking-wide opacity-60 mb-1">
                    Table of Contents
                  </div>
                  <div className="text-sm font-medium">
                    {activeHeading ? activeHeading.text : "Jump to section"}
                  </div>
                </div>
              </div>
              <FaChevronDown
                className={`text-muted-text transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-800/90 backdrop-blur-md border border-neutral-600/40 rounded-xl shadow-lg max-h-80 overflow-y-auto z-30">
                <div className="p-4">
                  <nav aria-label="Mobile table of contents navigation">
                    <ul className="space-y-1" role="list">
                      {nestedHeadings.map((heading) => (
                        <TOCItem
                          key={heading.id}
                          heading={heading}
                          activeId={activeId}
                          onHeadingClick={handleHeadingClick}
                          isMobile={true}
                        />
                      ))}
                    </ul>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Version - Sidebar */}
      {!showMobileOnly && (
        <div className={`hidden lg:block ${className}`}>
          <div className="z-30">
            <div className="bg-neutral-800/60 backdrop-blur-md border border-neutral-600/40 rounded-xl p-4 shadow-lg max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FaList className="text-xs" />
                  <h3 className="text-sm font-medium text-foreground">
                    Table of Contents
                  </h3>
                </div>
                <button
                  onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
                  className="p-1 rounded hover:bg-neutral-700/50 transition-colors duration-200"
                  aria-expanded={!isDesktopCollapsed}
                  aria-label="Toggle table of contents"
                >
                  <FaChevronDown
                    className={`text-muted-text transition-transform duration-200 text-xs ${
                      isDesktopCollapsed ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Collapsible content */}
              {!isDesktopCollapsed && (
                <nav aria-label="Table of contents navigation">
                  <ul className="space-y-1" role="list">
                    {nestedHeadings.map((heading) => (
                      <TOCItem
                        key={heading.id}
                        heading={heading}
                        activeId={activeId}
                        onHeadingClick={handleHeadingClick}
                        isMobile={false}
                      />
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
