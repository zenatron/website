import { useEffect, useState, useRef, useCallback } from "react";
import type { Heading, NestedHeading } from "@/utils/extractHeadings";
import { buildHeadingHierarchy } from "@/utils/extractHeadings";
import { T, tA } from "@/components/ui/TerminalWindow";

// Custom hook for tracking active heading based on scroll position.
// Instead of IntersectionObserver (which triggers from mid-viewport and
// causes "jumping" when headings are close together), this uses a scroll
// listener that finds the last heading that has scrolled past the top.
function useActiveHeading(headings: Heading[]) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const isClickScrolling = useRef(false);

  // Allow click-to-scroll to temporarily lock the active heading
  const lockActiveId = useCallback((id: string) => {
    isClickScrolling.current = true;
    setActiveId(id);
    // Release the lock after the smooth scroll settles
    setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  }, []);

  useEffect(() => {
    const SCROLL_OFFSET = 100; // Matches the click-scroll offset (80px header + margin)

    function onScroll() {
      if (isClickScrolling.current) return;

      // Find the last heading whose top edge has scrolled past the offset line
      let current: string | null = null;
      for (const { id } of headings) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= SCROLL_OFFSET) {
          current = id;
        } else {
          break; // Headings are in document order, so stop at the first one below
        }
      }
      setActiveId(current);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // Set initial state

    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);

  return { activeId, setActiveId: lockActiveId };
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
        const headerOffset = 80;
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

// Tree connector characters
function getTreePrefix(
  isLast: boolean,
  depth: number,
  parentPrefixes: string[]
): { prefix: string; childPrefixes: string[] } {
  const connector = isLast ? "└── " : "├── ";
  const prefix = parentPrefixes.join("") + connector;
  const childPrefixes = [...parentPrefixes, isLast ? "    " : "│   "];
  return { prefix, childPrefixes };
}

interface TOCItemProps {
  heading: NestedHeading;
  activeId: string | null;
  onHeadingClick: (id: string) => void;
  lineNumber: number;
  isLast: boolean;
  parentPrefixes: string[];
}

function TOCItem({
  heading,
  activeId,
  onHeadingClick,
  lineNumber,
  isLast,
  parentPrefixes,
}: TOCItemProps) {
  const isActive = activeId === heading.id;
  const { prefix, childPrefixes } = getTreePrefix(
    isLast,
    heading.level,
    parentPrefixes
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onHeadingClick(heading.id);
    },
    [heading.id, onHeadingClick]
  );

  return (
    <>
      <li>
        <a
          href={`#${heading.id}`}
          onClick={handleClick}
          className="group flex items-center font-mono transition-colors duration-150"
          style={{
            backgroundColor: isActive ? tA(T.cursor, "18") : "transparent",
            borderLeft: isActive
              ? `2px solid ${T.cursor}`
              : "2px solid transparent",
          }}
        >
          {/* Line number gutter */}
          <span
            className="select-none shrink-0 w-8 text-right pr-2 text-[11px] leading-6"
            style={{ color: isActive ? T.cursor : T.comment }}
          >
            {isActive ? ">" : String(lineNumber).padStart(2, " ")}
          </span>

          {/* Tree structure + heading text */}
          <span className="flex-1 text-[12px] leading-6 truncate pr-2">
            <span
              className="select-none"
              style={{ color: T.comment }}
            >
              {prefix}
            </span>
            <span
              className="group-hover:underline"
              style={{
                color: isActive ? T.fg : T.comment,
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {heading.text}
            </span>
          </span>
        </a>
      </li>
      {heading.children.length > 0 &&
        heading.children.map((child, idx) => (
          <TOCItem
            key={child.id}
            heading={child}
            activeId={activeId}
            onHeadingClick={onHeadingClick}
            lineNumber={lineNumber + idx + 1}
            isLast={idx === heading.children.length - 1}
            parentPrefixes={childPrefixes}
          />
        ))}
    </>
  );
}

// Flatten headings for sequential line numbering
function flattenHeadings(headings: NestedHeading[]): NestedHeading[] {
  const result: NestedHeading[] = [];
  for (const h of headings) {
    result.push(h);
    if (h.children.length > 0) {
      result.push(...flattenHeadings(h.children));
    }
  }
  return result;
}

export default function TableOfContents({
  headings,
  className = "",
}: TableOfContentsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const nestedHeadings = buildHeadingHierarchy(headings);
  const flatList = flattenHeadings(nestedHeadings);

  const { activeId, setActiveId } = useActiveHeading(headings);

  useOutsideClick(dropdownRef, isDropdownOpen, () => setIsDropdownOpen(false));

  const handleHeadingClick = useHeadingNavigation(setActiveId, () =>
    setIsDropdownOpen(false)
  );

  if (headings.length === 0) {
    return null;
  }

  const activeHeading = headings.find((h) => h.id === activeId);

  const showMobileOnly = className?.includes("mobile-only");
  const showDesktopOnly = className?.includes("desktop-only");

  // Calculate line numbers for top-level rendering
  let lineCounter = 1;
  function getLineNumber() {
    return lineCounter++;
  }

  return (
    <>
      {/* Mobile Version - Terminal goto command */}
      {!showDesktopOnly && (
        <div className={`lg:hidden z-20 mb-8 ${className}`} ref={dropdownRef}>
          <div className="relative max-w-4xl mx-auto px-4">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full overflow-hidden rounded-lg border font-mono transition-colors duration-150 cursor-pointer touch-manipulation"
              style={{
                backgroundColor: tA(T.bg, "cc"),
                borderColor: T.gutter,
              }}
              aria-expanded={isDropdownOpen}
              aria-label="Toggle table of contents"
            >
              {/* Mini title bar */}
              <div
                className="flex items-center gap-2 px-3 py-1.5 border-b"
                style={{ borderColor: T.gutter }}
              >
                <div className="flex items-center gap-1">
                  <span
                    className="h-2 w-2 rounded-full opacity-70"
                    style={{ backgroundColor: T.red }}
                  />
                  <span
                    className="h-2 w-2 rounded-full opacity-70"
                    style={{ backgroundColor: T.yellow }}
                  />
                  <span
                    className="h-2 w-2 rounded-full opacity-70"
                    style={{ backgroundColor: T.green }}
                  />
                </div>
                <span
                  className="flex-1 text-center text-[10px] truncate"
                  style={{ color: T.comment }}
                >
                  :toc
                </span>
              </div>

              {/* Command line */}
              <div className="flex items-center gap-2 px-3 py-2.5 text-sm">
                <span style={{ color: T.green }}>$</span>
                <span style={{ color: T.fg }}>goto</span>
                <span
                  className="flex-1 text-left truncate"
                  style={{ color: T.blue }}
                >
                  {activeHeading ? activeHeading.text : "select section..."}
                </span>
                <span
                  className="transition-transform duration-200"
                  style={{
                    color: T.comment,
                    transform: isDropdownOpen ? "rotate(180deg)" : "none",
                    display: "inline-block",
                  }}
                >
                  {isDropdownOpen ? "^" : "v"}
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                className="absolute top-full left-4 right-4 mt-1 rounded-lg border overflow-hidden shadow-lg max-h-80 overflow-y-auto z-30"
                style={{
                  backgroundColor: T.bg,
                  borderColor: T.gutter,
                }}
              >
                <nav aria-label="Mobile table of contents navigation">
                  <ul className="py-1" role="list">
                    {flatList.map((heading, idx) => {
                      const isActive = activeId === heading.id;
                      const indent = (heading.level - 2) * 12;
                      return (
                        <li key={heading.id}>
                          <a
                            href={`#${heading.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleHeadingClick(heading.id);
                            }}
                            className="flex items-center font-mono px-3 py-1.5 transition-colors duration-150"
                            style={{
                              backgroundColor: isActive
                                ? tA(T.cursor, "18")
                                : "transparent",
                              paddingLeft: `${12 + indent}px`,
                            }}
                          >
                            <span
                              className="shrink-0 w-6 text-right pr-2 text-[11px]"
                              style={{
                                color: isActive ? T.cursor : T.comment,
                              }}
                            >
                              {isActive ? ">" : String(idx + 1).padStart(2, " ")}
                            </span>
                            <span
                              className="text-[12px] truncate"
                              style={{
                                color: isActive ? T.fg : T.comment,
                                fontWeight: isActive ? 500 : 400,
                              }}
                            >
                              {heading.text}
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Version - Terminal File Tree Sidebar */}
      {!showMobileOnly && (
        <div className={`hidden lg:block ${className}`}>
          <div
            className="rounded-lg border overflow-hidden"
            style={{
              backgroundColor: tA(T.bg, "cc"),
              borderColor: T.gutter,
            }}
          >
            {/* Title bar with traffic lights */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 border-b"
              style={{ borderColor: T.gutter }}
            >
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className="h-2 w-2 rounded-full opacity-70"
                  style={{ backgroundColor: T.red }}
                />
                <span
                  className="h-2 w-2 rounded-full opacity-70"
                  style={{ backgroundColor: T.yellow }}
                />
                <span
                  className="h-2 w-2 rounded-full opacity-70"
                  style={{ backgroundColor: T.green }}
                />
              </div>
              <span
                className="flex-1 text-center font-mono text-[10px] truncate"
                style={{ color: T.comment }}
              >
                :toc
              </span>
            </div>

            {/* File tree body */}
            <nav
              className="max-h-[calc(100vh-10rem)] overflow-y-auto scrollbar-hide py-1"
              aria-label="Table of contents navigation"
            >
              <ul role="list">
                {nestedHeadings.map((heading, idx) => {
                  const ln = getLineNumber();
                  const childCount = flattenHeadings([heading]).length - 1;
                  const item = (
                    <TOCItem
                      key={heading.id}
                      heading={heading}
                      activeId={activeId}
                      onHeadingClick={handleHeadingClick}
                      lineNumber={ln}
                      isLast={idx === nestedHeadings.length - 1}
                      parentPrefixes={[]}
                    />
                  );
                  // Advance counter for children
                  for (let i = 0; i < childCount; i++) getLineNumber();
                  return item;
                })}
              </ul>
            </nav>

            {/* Status bar */}
            <div
              className="px-3 py-1 border-t font-mono text-[10px] flex items-center justify-between"
              style={{ borderColor: T.gutter, color: T.comment }}
            >
              <span>{headings.length} headings</span>
              <span>
                {activeHeading
                  ? `L${flatList.findIndex((h) => h.id === activeId) + 1}`
                  : "--"}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
