"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ProjectCard } from "@/types/types";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  X,
  ExternalLink,
} from "lucide-react";
import { FaGithub, FaGlobe, FaGamepad, FaCode } from "react-icons/fa";
import { SiJupyter } from "react-icons/si";
import { cn } from "@/lib/utils";
import ContactModal from "@/components/ui/ContactModal";

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

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTag = searchParams.get("tag");

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
  
  // Track if we're currently updating the URL to avoid race conditions
  const isUpdatingUrl = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only sync URL → state on initial load or external navigation (not our own updates)
  useEffect(() => {
    if (isUpdatingUrl.current) {
      isUpdatingUrl.current = false;
      return;
    }
    const urlTag = searchParams.get("tag");
    // Sync from URL only if different from current state
    if (urlTag !== selectedTag) {
      setSelectedTag(urlTag);
    }
  }, [searchParams]); // Intentionally exclude selectedTag to avoid loops

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
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, []);

  // Handle selecting a tag from suggestions or clicking a topic
  const handleTagSelect = useCallback((tag: string | null) => {
    setSelectedTag(tag);
    setSearchQuery(""); // Clear search when selecting/deselecting tag
    setShowSuggestions(false);
    setTagQuery("");
    
    // Mark that we're updating the URL to prevent the sync effect from fighting us
    isUpdatingUrl.current = true;
    if (tag) {
      router.push(`/projects?tag=${encodeURIComponent(tag)}`, { scroll: false });
    } else {
      router.push("/projects", { scroll: false });
    }
    // Focus back on input
    setTimeout(() => searchInputRef.current?.focus(), 0);
  }, [router]);

  // Complete the tag from suggestions
  const completeTag = useCallback((tag: string) => {
    // Replace the #partial with full tag chip
    handleTagSelect(tag);
  }, [handleTagSelect]);

  // Handle keyboard in search input
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
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
  }, [showSuggestions, filteredSuggestions, suggestionIndex, completeTag, selectedTag, searchQuery, handleTagSelect]);

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
        const terms = query.split(/\s+/).filter(t => t && !t.startsWith("#"));
        if (terms.length > 0) {
          const matchesSearch = terms.every((term) => itemContent.includes(term));
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
    router.push("/projects", { scroll: false });
  };

  const hasActiveFilters = searchQuery !== "" || selectedType !== null || selectedTag !== null;

  return (
    <div className="px-4 pb-24 pt-32 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-16 space-y-6">
          <p className="text-sm font-medium tracking-[0.2em] text-accent">
            PROJECTS
          </p>
          <h1 className="text-4xl tracking-tight md:text-5xl">
            Stuff I&apos;ve shipped
          </h1>
          <p className="max-w-xl text-secondary-text">
            Games, tools, and the occasional experiment that actually worked.
          </p>
        </header>

        {/* Filters */}
        <div className="mb-12 space-y-6">
          {/* Search with chip + autocomplete */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-text" />
            
            {/* Container with chip + input */}
            <div className="flex w-full items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] py-2 pl-11 pr-12 transition-colors focus-within:border-accent/30 focus-within:bg-white/[0.04]">
              {/* Tag chip */}
              {selectedTag && (
                <span
                  ref={chipRef}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/20 px-2.5 py-1 text-sm text-accent"
                >
                  #{selectedTag}
                  <button
                    type="button"
                    onClick={() => handleTagSelect(null)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-white/10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {/* Input */}
              <input
                ref={searchInputRef}
                type="text"
                placeholder={selectedTag ? "Add search terms..." : "Search or type # for tags..."}
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  // Show suggestions if user had typed a partial tag
                  if (searchQuery.includes("#")) {
                    setShowSuggestions(true);
                  }
                }}
                className="min-w-0 flex-1 bg-transparent text-base text-primary-text placeholder-muted-text outline-none"
              />
            </div>
            
            {/* Keyboard hint */}
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-muted-text sm:inline-block">
              /
            </kbd>
            
            {/* Suggestions dropdown - scrollable with max 5 visible */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c0c10]/95 shadow-xl backdrop-blur-sm"
              >
                <div className="p-1.5">
                  <div className="mb-1.5 px-2 text-[10px] uppercase tracking-wider text-muted-text">
                    Tags {tagQuery && `matching "${tagQuery}"`}
                  </div>
                  <div className="max-h-[180px] overflow-y-auto">
                    {filteredSuggestions.map((tag, index) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => completeTag(tag)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                          index === suggestionIndex
                            ? "bg-accent/20 text-accent"
                            : "text-secondary-text hover:bg-white/[0.04]"
                        )}
                      >
                        <span className="text-muted-text">#</span>
                        {tag}
                        {index === suggestionIndex && (
                          <span className="ml-auto text-[10px] text-muted-text">
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
            <span className="mr-2 text-xs uppercase tracking-wider text-muted-text">
              Type:
            </span>
            <button
              type="button"
              onClick={() => setSelectedType(null)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition-colors",
                selectedType === null
                  ? "bg-white/[0.08] text-primary-text"
                  : "text-muted-text hover:text-secondary-text"
              )}
            >
              All
            </button>
            {allTypes.map((type) => (
              <button
                type="button"
                key={type}
                onClick={() =>
                  setSelectedType(selectedType === type ? null : type)
                }
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm capitalize transition-colors",
                  selectedType === type
                    ? "bg-accent/20 text-accent"
                    : "text-muted-text hover:text-secondary-text"
                )}
              >
                {getTypeIcon(type)}
                <span>{type}</span>
              </button>
            ))}
          </div>

          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-xs uppercase tracking-wider text-muted-text">
              Topics:
            </span>
            {allTags.slice(0, 8).map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagSelect(selectedTag === tag ? null : tag)}
                className={cn(
                  "tag-bubble",
                  selectedTag === tag
                    ? "!bg-accent/30"
                    : "opacity-80 hover:opacity-100"
                )}
              >
                #{tag}
              </button>
            ))}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-2 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-muted-text transition-colors hover:text-primary-text"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Projects */}
        <div className="space-y-16">
          {filteredProjects.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-secondary-text">No projects found.</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-accent hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            groupedProjects.map((group) => (
              <section key={group.year}>
                {/* Year header */}
                <div className="mb-6 flex items-center gap-4">
                  <span className="text-2xl font-medium text-primary-text">
                    {group.year}
                  </span>
                  <span className="rounded-full bg-white/[0.04] px-2.5 py-0.5 text-xs text-muted-text">
                    {group.projects.length}
                  </span>
                  <div className="h-px flex-1 bg-white/[0.04]" />
                </div>

                {/* Projects grid */}
                <div className="grid gap-6 sm:grid-cols-2">
                  {group.projects.map((project) => (
                    <ProjectGridCard
                      key={project.metadata.slug ?? project.metadata.title}
                      project={project}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center sm:hidden">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-full px-5 py-2 text-sm font-medium text-accent transition-colors"
            style={{
              backgroundColor: "rgba(124, 138, 255, 0.15)",
              border: "1px solid rgba(124, 138, 255, 0.3)",
            }}
          >
            Get in touch
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

// Placeholder messages based on project type - adds personality!
const placeholderMessages: Record<string, string[]> = {
  data: [
    "Imagine a beautiful chart here",
    "Data goes brrr",
    "Trust me, the graphs are gorgeous",
    "Too busy crunching numbers",
  ],
  web: [
    "Picture a stunning UI here",
    "The real thing is prettier",
    "CSS magic awaits inside",
    "Click to see the actual site",
  ],
  game: [
    "It's not a bug, it's a feature",
    "Insert gameplay here",
    "The fun is on the inside",
    "Achievement unlocked: Curiosity",
  ],
  github: [
    "Code speaks louder than images",
    "README.md is the real hero",
    "10,000 lines of pure poetry",
    "\"It works on my machine\"",
  ],
  other: [
    "No preview, just mysteries",
    "What's in the box?",
    "Surprise! Click to find out",
    "The preview is in another castle",
  ],
};

// Get a consistent "random" message based on project title (so it doesn't change on re-render)
const getPlaceholderMessage = (type: string, title: string): string => {
  const messages = placeholderMessages[type] || placeholderMessages.other;
  // Use title length as a simple hash to pick a consistent message
  const index = title.length % messages.length;
  return messages[index];
};

function ProjectGridCard({ project }: { project: ProjectCard }) {
  const [isHovering, setIsHovering] = useState(false);
  const [showCurious, setShowCurious] = useState(false);
  const [imageError, setImageError] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Show "Interested?" after 3 seconds of hovering
  useEffect(() => {
    if (isHovering) {
      hoverTimerRef.current = setTimeout(() => {
        setShowCurious(true);
      }, 3000);
    } else {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
      setShowCurious(false);
    }
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, [isHovering]);

  const href = project.links.github || `/projects/${project.metadata.slug}`;
  const isExternal = Boolean(project.links.github);
  
  // Get thumbnail: prefer thumbnail, fallback to image, then null
  const thumbnailSrc = project.metadata.thumbnail || project.metadata.image;
  const hasValidImage = thumbnailSrc && !imageError;
  
  // Determine project type for placeholder
  const projectType = project.links.github ? "github" : (project.metadata.type || "other");
  const placeholderMessage = getPlaceholderMessage(projectType, project.metadata.title);

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.02] transition-all hover:border-white/[0.08] hover:bg-white/[0.04]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Curious easter egg */}
      {showCurious && (
        <div 
          className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs text-accent whitespace-nowrap z-20 animate-fade-in"
          style={{
            backgroundColor: "rgba(124, 138, 255, 0.15)",
            border: "1px solid rgba(124, 138, 255, 0.3)",
          }}
        >
          👀 Interested?
        </div>
      )}

      {/* Clickable overlay for main link */}
      <Link
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="absolute inset-0 z-10"
        aria-label={project.metadata.title}
      />

      {/* Thumbnail / Placeholder */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {hasValidImage ? (
          <Image
            src={thumbnailSrc}
            alt={project.metadata.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 50vw"
            onError={() => setImageError(true)}
          />
        ) : (
          // Thematic placeholder with message
          <div className="absolute inset-0 bg-white/[0.02]">
            {/* Dot pattern background */}
            <div 
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(124, 138, 255, 0.3) 1px, transparent 0)`,
                backgroundSize: '20px 20px',
              }}
            />
            {/* Centered content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                {getTypeIcon(projectType)}
              </div>
              <p className="text-center text-sm text-muted-text italic">
                {placeholderMessage}
              </p>
            </div>
            {/* Subtle vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary-bg/50 via-transparent to-primary-bg/30" />
          </div>
        )}
        
        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        
        {/* External link indicator on image */}
        {isExternal && (
          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <ExternalLink className="h-4 w-4" />
          </div>
        )}
        
        {/* Featured badge */}
        {project.metadata.featured && (
          <div className="absolute left-3 top-3 rounded-full bg-accent/90 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Header with icon inline with title */}
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            {getTypeIcon(projectType)}
          </div>
          <h3 className="flex-1 font-medium text-primary-text transition-colors group-hover:text-accent line-clamp-1">
            {project.metadata.title}
          </h3>
        </div>

        {/* Description */}
        {project.metadata.description && (
          <p className="mb-4 text-sm text-secondary-text line-clamp-2">
            {project.metadata.description}
          </p>
        )}

        {/* Tags */}
        {project.metadata.tags && project.metadata.tags.length > 0 && (
          <div className="relative z-20 mt-auto flex flex-wrap gap-2 pt-3">
            {project.metadata.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/projects?tag=${encodeURIComponent(tag)}`}
                className="tag hover:text-accent"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
