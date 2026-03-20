import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { ProjectCard } from "@/types/types";
import { Search, X, ExternalLink } from "lucide-react";
import { FaGithub, FaGlobe, FaGamepad, FaCode } from "react-icons/fa";
import { SiJupyter } from "react-icons/si";
import { cn } from "@/lib/utils";
import ContactModal from "@/components/ui/ContactModal";
import TerminalWindow, { T, tA } from "@/components/ui/TerminalWindow";

interface ProjectsClientProps {
  projects: ProjectCard[];
}

const getTypeIcon = (type: string | undefined) => {
  const normalized = type?.toLowerCase() ?? "other";
  const iconClass = "h-4 w-4";

  switch (normalized) {
    case "data":
      return <SiJupyter className={iconClass} />;
    case "github":
      return <FaGithub className={iconClass} />;
    case "web":
      return <FaGlobe className={iconClass} />;
    case "game":
      return <FaGamepad className={iconClass} />;
    default:
      return <FaCode className={iconClass} />;
  }
};

const getTypeLabel = (type: string | undefined): string => {
  const normalized = type?.toLowerCase() ?? "other";
  switch (normalized) {
    case "data": return "data";
    case "github": return "github";
    case "web": return "web";
    case "game": return "game";
    default: return "other";
  }
};

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  const [searchParamsObj, setSearchParamsObj] = useState(() => new URLSearchParams(typeof window !== "undefined" ? window.location.search : ""));
  const initialTag = searchParamsObj.get("tag");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag);

  // Tag autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [tagQuery, setTagQuery] = useState(""); // tracks partial tag after #
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const chipRef = useRef<HTMLSpanElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync URL → state on popstate (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      setSearchParamsObj(new URLSearchParams(window.location.search));
      const urlTag = new URLSearchParams(window.location.search).get("tag");
      setSelectedTag(urlTag);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Slash-to-focus keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Get all unique types
  const allTypes = useMemo(() => {
    const types = new Set<string>();
    projects.forEach((p) => {
      if (p.links.github) types.add("github");
      else types.add((p.metadata.type ?? "other").toLowerCase());
    });
    return Array.from(types).sort();
  }, [projects]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach((project) => {
      project.metadata.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [projects]);

  // Filtered tag suggestions based on what user is typing after #
  const filteredSuggestions = useMemo(() => {
    if (!tagQuery) return allTags;
    const query = tagQuery.toLowerCase();
    return allTags.filter((tag) => tag.toLowerCase().includes(query));
  }, [allTags, tagQuery]);

  // Handle input change - detect # for tag autocomplete
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);

      // Check if user is typing a tag (starts with # or has # after space)
      const hashIndex = value.lastIndexOf("#");
      if (hashIndex !== -1) {
        const afterHash = value.slice(hashIndex + 1);
        // Only show suggestions if there's no space after the hash (still typing the tag)
        if (!afterHash.includes(" ")) {
          setTagQuery(afterHash);
          setShowSuggestions(true);
          setSuggestionIndex(0);
          return;
        }
      }
      setShowSuggestions(false);
      setTagQuery("");
    },
    []
  );

  // Handle selecting a tag from suggestions or clicking a topic
  const handleTagSelect = useCallback(
    (tag: string | null) => {
      setSelectedTag(tag);
      setSearchQuery(""); // Clear search when selecting/deselecting tag
      setShowSuggestions(false);
      setTagQuery("");

      const url = new URL(window.location.href);
      if (tag) {
        url.searchParams.set("tag", tag);
      } else {
        url.searchParams.delete("tag");
      }
      window.history.pushState({}, "", url.toString());
      setSearchParamsObj(new URLSearchParams(url.search));
      // Focus back on input
      setTimeout(() => searchInputRef.current?.focus(), 0);
    },
    []
  );

  // Complete the tag from suggestions
  const completeTag = useCallback(
    (tag: string) => {
      handleTagSelect(tag);
    },
    [handleTagSelect]
  );

  // Handle keyboard in search input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (showSuggestions && filteredSuggestions.length > 0) {
        if (e.key === "Tab" || e.key === "Enter") {
          e.preventDefault();
          completeTag(filteredSuggestions[suggestionIndex]);
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSuggestionIndex((prev) =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : prev
          );
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSuggestionIndex((prev) => (prev > 0 ? prev - 1 : 0));
          return;
        }
        if (e.key === "Escape") {
          setShowSuggestions(false);
          return;
        }
      }

      // Handle backspace to delete chip
      if (e.key === "Backspace" && selectedTag && searchQuery === "") {
        e.preventDefault();
        handleTagSelect(null);
      }
    },
    [
      showSuggestions,
      filteredSuggestions,
      suggestionIndex,
      completeTag,
      selectedTag,
      searchQuery,
      handleTagSelect,
    ]
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter projects with chip tag and text search
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Check type filter first
      const projectType = project.links.github
        ? "github"
        : (project.metadata.type ?? "other").toLowerCase();
      if (selectedType !== null && projectType !== selectedType) {
        return false;
      }

      // Check selected tag (from chip)
      if (selectedTag !== null) {
        const hasTag = project.metadata.tags?.some(
          (tag) => tag.toLowerCase() === selectedTag.toLowerCase()
        );
        if (!hasTag) return false;
      }

      // Check search query (text only, no hashtag parsing)
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const itemContent =
          (project.metadata.title?.toLowerCase() || "") +
          " " +
          (project.metadata.description?.toLowerCase() || "");

        // Split into terms and check each
        const terms = query.split(/\s+/).filter((t) => t && !t.startsWith("#"));
        if (terms.length > 0) {
          const matchesSearch = terms.every((term) =>
            itemContent.includes(term)
          );
          if (!matchesSearch) return false;
        }
      }

      return true;
    });
  }, [projects, searchQuery, selectedType, selectedTag]);

  // Group by year
  const groupedProjects = useMemo(() => {
    const groups = new Map<string, ProjectCard[]>();

    filteredProjects.forEach((project) => {
      const year = project.metadata.date
        ? new Date(project.metadata.date).getFullYear().toString()
        : "Undated";
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year)!.push(project);
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => {
        if (a === "Undated") return 1;
        if (b === "Undated") return -1;
        return parseInt(b) - parseInt(a);
      })
      .map(([year, projects]) => ({ year, projects }));
  }, [filteredProjects]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType(null);
    setSelectedTag(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("tag");
    window.history.pushState({}, "", url.toString());
    setSearchParamsObj(new URLSearchParams(url.search));
  };

  const hasActiveFilters =
    searchQuery !== "" || selectedType !== null || selectedTag !== null;

  return (
    <div className="px-4 pb-8 pt-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-8 sm:mb-16 space-y-4 font-mono">
          <p
            className="text-sm tracking-wider"
            style={{ color: T.comment }}
          >
            <span style={{ color: T.purple }}>//</span> PROJECTS
          </p>
          <h1 className="text-3xl tracking-tight md:text-4xl" style={{ color: T.fg }}>
            Stuff I&apos;ve shipped
          </h1>
          <p className="max-w-xl text-sm md:text-base" style={{ color: T.comment }}>
            games, tools, and the occasional experiment that actually worked.
          </p>
        </header>

        {/* Filters */}
        <div className="mb-12 space-y-4 font-mono">
          {/* Search with chip + autocomplete */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2" style={{ color: T.comment }} />

            {/* Container with chip + input */}
            <div
              className="flex w-full items-center gap-1.5 rounded border py-2 pl-10 pr-12 transition-colors"
              style={{
                backgroundColor: T.bg,
                borderColor: T.gutter,
              }}
            >
              {/* Tag chip */}
              {selectedTag && (
                <span
                  ref={chipRef}
                  className="inline-flex shrink-0 items-center gap-1 rounded px-2 py-0.5 text-sm"
                  style={{ backgroundColor: tA(T.purple, "20"), color: T.purple }}
                >
                  #{selectedTag}
                  <button
                    type="button"
                    onClick={() => handleTagSelect(null)}
                    className="ml-0.5 rounded p-0.5 transition-colors"
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${T.gutter}`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Input */}
              <input
                ref={searchInputRef}
                type="text"
                placeholder={
                  selectedTag
                    ? "add search terms..."
                    : "grep projects... (use # for tags)"
                }
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) parent.style.borderColor = tA(T.purple, "66");
                  if (searchQuery.includes("#")) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) parent.style.borderColor = T.gutter;
                }}
                className="min-w-0 flex-1 bg-transparent text-sm md:text-base outline-none"
                style={{ color: T.fg }}
              />
            </div>

            {/* Keyboard hint */}
            <kbd
              className="absolute right-3 top-1/2 -translate-y-1/2 hidden rounded border px-1.5 py-0.5 text-[10px] sm:inline-block font-mono"
              style={{ borderColor: T.gutter, backgroundColor: tA(T.gutter, "40"), color: T.comment }}
            >
              /
            </kbd>

            {/* Suggestions dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded border shadow-xl"
                style={{ backgroundColor: T.bg, borderColor: T.gutter }}
              >
                <div className="p-1.5">
                  <div className="mb-1.5 px-2 text-[10px] uppercase tracking-wider" style={{ color: T.comment }}>
                    tags {tagQuery && `matching "${tagQuery}"`}
                  </div>
                  <div className="max-h-[180px] overflow-y-auto">
                    {filteredSuggestions.map((tag, index) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => completeTag(tag)}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors"
                        style={{
                          backgroundColor: index === suggestionIndex ? tA(T.purple, "20") : "transparent",
                          color: index === suggestionIndex ? T.purple : T.fg,
                        }}
                        onMouseEnter={(e) => {
                          if (index !== suggestionIndex) {
                            e.currentTarget.style.backgroundColor = tA(T.gutter, "40");
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (index !== suggestionIndex) {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }
                        }}
                      >
                        <span style={{ color: T.comment }}>#</span>
                        {tag}
                        {index === suggestionIndex && (
                          <span className="ml-auto text-[10px]" style={{ color: T.comment }}>
                            Tab ↹
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Type filters row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs uppercase tracking-wider" style={{ color: T.comment }}>
              type:
            </span>
            <button
              type="button"
              onClick={() => setSelectedType(null)}
              className="rounded px-2 py-1 text-[11px] transition-colors duration-150"
              style={{
                backgroundColor: selectedType === null ? tA(T.purple, "25") : tA(T.gutter, "40"),
                color: selectedType === null ? T.purple : T.comment,
                border: `1px solid ${selectedType === null ? tA(T.purple, "44") : "transparent"}`,
              }}
              onMouseEnter={(e) => {
                if (selectedType !== null) {
                  e.currentTarget.style.color = T.fg;
                  e.currentTarget.style.backgroundColor = tA(T.gutter, "80");
                }
              }}
              onMouseLeave={(e) => {
                if (selectedType !== null) {
                  e.currentTarget.style.color = T.comment;
                  e.currentTarget.style.backgroundColor = tA(T.gutter, "40");
                }
              }}
            >
              [all]
            </button>
            {allTypes.map((type) => (
              <button
                type="button"
                key={type}
                onClick={() =>
                  setSelectedType(selectedType === type ? null : type)
                }
                className="flex items-center gap-1.5 rounded px-2 py-1 text-[11px] capitalize transition-colors duration-150"
                style={{
                  backgroundColor: selectedType === type ? tA(T.purple, "25") : tA(T.gutter, "40"),
                  color: selectedType === type ? T.purple : T.comment,
                  border: `1px solid ${selectedType === type ? tA(T.purple, "44") : "transparent"}`,
                }}
                onMouseEnter={(e) => {
                  if (selectedType !== type) {
                    e.currentTarget.style.color = T.fg;
                    e.currentTarget.style.backgroundColor = tA(T.gutter, "80");
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedType !== type) {
                    e.currentTarget.style.color = T.comment;
                    e.currentTarget.style.backgroundColor = tA(T.gutter, "40");
                  }
                }}
              >
                {getTypeIcon(type)}
                <span>[{type}]</span>
              </button>
            ))}
          </div>

          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs uppercase tracking-wider" style={{ color: T.comment }}>
              topics:
            </span>
            {allTags.slice(0, 8).map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  handleTagSelect(selectedTag === tag ? null : tag)
                }
                className="rounded px-2 py-1 text-[11px] transition-colors duration-150"
                style={{
                  backgroundColor: selectedTag === tag ? tA(T.purple, "25") : tA(T.gutter, "40"),
                  color: selectedTag === tag ? T.purple : T.comment,
                  border: `1px solid ${selectedTag === tag ? tA(T.purple, "44") : "transparent"}`,
                }}
                onMouseEnter={(e) => {
                  if (selectedTag !== tag) {
                    e.currentTarget.style.color = T.fg;
                    e.currentTarget.style.backgroundColor = tA(T.gutter, "80");
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTag !== tag) {
                    e.currentTarget.style.color = T.comment;
                    e.currentTarget.style.backgroundColor = tA(T.gutter, "40");
                  }
                }}
              >
                [{tag}]
              </button>
            ))}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-2 flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors duration-150"
                style={{ color: T.comment }}
                onMouseEnter={(e) => { e.currentTarget.style.color = T.red; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = T.comment; }}
              >
                <X className="h-3 w-3" />
                clear
              </button>
            )}
          </div>
        </div>

        {/* Projects */}
        <div className="space-y-12">
          {filteredProjects.length === 0 ? (
            <TerminalWindow title="~/projects" statusBar={<span>0 results</span>}>
              <div className="py-8 text-center font-mono">
                <p className="text-sm" style={{ color: T.comment }}>
                  <span style={{ color: T.green }}>$</span> find{" "}
                  <span style={{ color: T.yellow }}>~/projects</span>{" "}
                  <span style={{ color: T.purple }}>-name</span>{" "}
                  <span style={{ color: T.yellow }}>"{searchQuery || selectedTag || selectedType}"</span>
                </p>
                <p className="text-sm mt-2" style={{ color: T.red }}>
                  error: no projects found matching your criteria
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm transition-colors duration-150"
                  style={{ color: T.purple }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = T.blue; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = T.purple; }}
                >
                  $ clear-filters ↵
                </button>
              </div>
            </TerminalWindow>
          ) : (
            groupedProjects.map((group) => (
              <section key={group.year}>
                {/* Year header */}
                <div className="mb-4 flex items-center gap-3 font-mono">
                  <span className="text-lg" style={{ color: T.purple }}>
                    {group.year}
                  </span>
                  <span
                    className="rounded px-2 py-0.5 text-xs"
                    style={{ backgroundColor: tA(T.gutter, "60"), color: T.comment }}
                  >
                    {group.projects.length}
                  </span>
                  <div
                    className="h-px flex-1"
                    style={{ backgroundColor: tA(T.gutter, "60") }}
                  />
                </div>

                {/* Projects in TerminalWindow */}
                <TerminalWindow
                  title={`~/projects/${group.year}`}
                  noPadding
                  statusBar={
                    <div className="flex items-center justify-between">
                      <span>
                        <span style={{ color: T.fg }}>{group.projects.length}</span> project{group.projects.length !== 1 ? "s" : ""}
                      </span>
                      <span>LIST</span>
                    </div>
                  }
                >
                  {/* Command line */}
                  <div
                    className="px-3 sm:px-4 py-2 border-b font-mono text-xs md:text-sm"
                    style={{ borderColor: T.gutter, color: T.comment }}
                  >
                    <span style={{ color: T.green }}>$</span>{" "}
                    <span style={{ color: T.fg }}>ls</span>{" "}
                    <span style={{ color: T.purple }}>-la</span>{" "}
                    <span style={{ color: T.purple }}>--sort</span>=<span style={{ color: T.yellow }}>date</span>{" "}
                    <span style={{ color: T.blue }}>~/projects/{group.year}</span>
                  </div>

                  {/* Project rows */}
                  <div>
                    {group.projects.map((project, i) => {
                      const isLast = i === group.projects.length - 1;
                      const prefix = isLast ? "└─" : "├─";
                      const href = project.links.github || `/projects/${project.metadata.slug}`;
                      const isExternal = Boolean(project.links.github);
                      const projectType = project.links.github
                        ? "github"
                        : project.metadata.type || "other";

                      return (
                        <a
                          key={project.metadata.slug ?? project.metadata.title}
                          href={href}
                          target={isExternal ? "_blank" : undefined}
                          rel={isExternal ? "noopener noreferrer" : undefined}
                          className="group flex items-start sm:items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 transition-colors duration-150 font-mono text-sm md:text-base"
                          style={{
                            borderBottom: isLast
                              ? "none"
                              : `1px solid ${tA(T.gutter, "30")}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = tA(T.purple, "0a");
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <span
                            className="shrink-0 hidden sm:inline text-xs md:text-sm"
                            style={{ color: T.gutter }}
                          >
                            {prefix}
                          </span>
                          <span
                            className="shrink-0"
                            style={{ color: T.comment }}
                          >
                            {getTypeIcon(projectType)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                              <span className="font-medium transition-colors duration-150" style={{ color: T.fg }}>
                                <span className="group-hover:hidden">{project.metadata.title}</span>
                                <span className="hidden group-hover:inline" style={{ color: T.purple }}>{project.metadata.title}</span>
                              </span>
                              {project.metadata.featured && (
                                <span className="text-[11px]" style={{ color: T.yellow }}>★</span>
                              )}
                              <span className="text-xs capitalize" style={{ color: T.comment }}>
                                {getTypeLabel(projectType)}
                              </span>
                            </div>
                            {project.metadata.description && (
                              <p className="text-xs mt-1 truncate" style={{ color: T.comment }}>
                                {project.metadata.description}
                              </p>
                            )}
                          </div>
                          <div className="hidden md:flex items-center gap-1 shrink-0 text-[11px]">
                            {project.metadata.tags?.slice(0, 3).map((tag) => (
                              <span key={tag}>
                                <span style={{ color: T.gutter }}>[</span>
                                <span style={{ color: T.blue }}>{tag}</span>
                                <span style={{ color: T.gutter }}>]</span>
                              </span>
                            ))}
                          </div>
                          <span
                            className="text-xs tabular-nums shrink-0 hidden sm:inline"
                            style={{ color: T.comment }}
                          >
                            {project.metadata.date
                              ? new Date(project.metadata.date).getFullYear()
                              : ""}
                          </span>
                          <span
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0"
                            style={{ color: T.purple }}
                          >
                            {isExternal ? "↗" : "→"}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </TerminalWindow>
              </section>
            ))
          )}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center sm:hidden font-mono">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded px-5 py-2 text-sm transition-all duration-150"
            style={{
              backgroundColor: tA(T.purple, "18"),
              border: `1px solid ${tA(T.purple, "44")}`,
              color: T.purple,
            }}
          >
            <span style={{ color: T.green }}>$</span> contact ↵
          </button>
        </div>
      </div>

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
    </div>
  );
}
