"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ProjectCard } from "@/types/types";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import dateFormatter from "@/utils/dateFormatter";
import {
  ArrowUpRight,
  Search,
  X,
  Grid3X3,
  List,
  ExternalLink,
} from "lucide-react";
import { FaGithub, FaGlobe, FaGamepad, FaCode } from "react-icons/fa";
import { SiJupyter } from "react-icons/si";
import { cn } from "@/lib/utils";

interface ProjectsClientProps {
  projects: ProjectCard[];
}

type ViewMode = "grid" | "list";

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

  const [searchQuery, setSearchQuery] = useState(
    initialTag ? `#${initialTag}` : ""
  );
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync URL tag param with search query
  useEffect(() => {
    const urlTag = searchParams.get("tag");
    if (urlTag) {
      setSearchQuery(`#${urlTag}`);
    }
  }, [searchParams]);

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

  // Filter projects with hashtag support
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Check type filter first
      const projectType = project.links.github
        ? "github"
        : (project.metadata.type ?? "other").toLowerCase();
      if (selectedType !== null && projectType !== selectedType) {
        return false;
      }

      // Check search query
      if (searchQuery) {
        const itemContent =
          (project.metadata.title?.toLowerCase() || "") +
          " " +
          (project.metadata.description?.toLowerCase() || "");

        // Split search query into terms
        const terms = searchQuery.toLowerCase().split(" ");

        // Check if all terms match
        const matchesSearch = terms.every((term) => {
          if (term === "") return true;

          // If term is a tag search (starts with #)
          if (term.startsWith("#")) {
            const tagQuery = term.slice(1).toLowerCase();
            if (!tagQuery) return true;
            const itemTagsLower =
              project.metadata.tags?.map((tag) => tag.toLowerCase().trim()) ||
              [];
            return itemTagsLower.some((tag) => tag.includes(tagQuery));
          }

          // For regular search terms
          return itemContent.includes(term);
        });

        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [projects, searchQuery, selectedType]);

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
    router.push("/projects", { scroll: false });
  };

  const hasActiveFilters = searchQuery !== "" || selectedType !== null;

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
        <div className="mb-12 space-y-4">
          {/* Search row with view toggle */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-text" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search... (# for tags)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/[0.06] bg-white/[0.02] py-2 pl-9 pr-10 text-sm text-primary-text placeholder-muted-text outline-none transition-colors focus:border-accent/30 sm:w-56"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-muted-text sm:inline-block">
                /
              </kbd>
            </div>

            {/* View toggle */}
            <div className="flex shrink-0 items-center gap-1 rounded-full border border-white/[0.06] p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "rounded-full p-2 transition-colors",
                  viewMode === "grid"
                    ? "bg-white/[0.08] text-primary-text"
                    : "text-muted-text hover:text-secondary-text"
                )}
                aria-label="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "rounded-full p-2 transition-colors",
                  viewMode === "list"
                    ? "bg-white/[0.08] text-primary-text"
                    : "text-muted-text hover:text-secondary-text"
                )}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Type filters row */}
          <div className="flex flex-wrap items-center gap-2">
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

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-muted-text hover:text-primary-text"
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

                {/* Projects grid/list */}
                {viewMode === "grid" ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.projects.map((project) => (
                      <ProjectGridCard
                        key={project.metadata.slug ?? project.metadata.title}
                        project={project}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {group.projects.map((project) => (
                      <ProjectListItem
                        key={project.metadata.slug ?? project.metadata.title}
                        project={project}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectGridCard({ project }: { project: ProjectCard }) {
  const [isHovering, setIsHovering] = useState(false);
  const [showCurious, setShowCurious] = useState(false);
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

  return (
    <div
      className="group relative flex flex-col rounded-2xl border border-white/[0.04] bg-white/[0.02] p-5 transition-all hover:border-white/[0.08] hover:bg-white/[0.04]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Curious easter egg */}
      {showCurious && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-accent/20 border border-accent/30 rounded-md text-xs text-accent whitespace-nowrap z-20 animate-fade-in">
          👀 Interested?
        </div>
      )}

      {/* Clickable overlay for main link */}
      <Link
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="absolute inset-0 z-0"
        aria-label={project.metadata.title}
      />

      {/* Header with icon inline with title */}
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
          {getTypeIcon(project.links.github ? "github" : project.metadata.type)}
        </div>
        <h3 className="flex-1 font-medium text-primary-text transition-colors group-hover:text-accent line-clamp-1">
          {project.metadata.title}
        </h3>
        {isExternal && (
          <ExternalLink className="h-4 w-4 shrink-0 text-muted-text opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </div>

      {/* Description */}
      {project.metadata.description && (
        <p className="mb-4 text-sm text-secondary-text line-clamp-2">
          {project.metadata.description}
        </p>
      )}

      {/* Tags */}
      {project.metadata.tags && project.metadata.tags.length > 0 && (
        <div className="relative z-10 mt-auto flex flex-wrap gap-2 pt-3">
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
  );
}

function ProjectListItem({ project }: { project: ProjectCard }) {
  const href = project.links.github || `/projects/${project.metadata.slug}`;
  const isExternal = Boolean(project.links.github);

  return (
    <div className="group relative flex items-center gap-4 rounded-xl px-4 py-4 transition-colors hover:bg-white/[0.02]">
      {/* Clickable overlay for main link */}
      <Link
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="absolute inset-0 z-0"
        aria-label={project.metadata.title}
      />

      {/* Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
        {getTypeIcon(project.links.github ? "github" : project.metadata.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-primary-text transition-colors group-hover:text-accent">
          {project.metadata.title}
        </h3>
        {project.metadata.description && (
          <p className="text-sm text-secondary-text line-clamp-1">
            {project.metadata.description}
          </p>
        )}
      </div>

      {/* Tags */}
      <div className="relative z-10 hidden shrink-0 items-center gap-2 md:flex">
        {project.metadata.tags?.slice(0, 2).map((tag) => (
          <Link
            key={tag}
            href={`/projects?tag=${encodeURIComponent(tag)}`}
            className="tag hover:text-accent"
          >
            {tag}
          </Link>
        ))}
      </div>

      {/* Date */}
      {project.metadata.date && (
        <span className="hidden shrink-0 text-sm text-muted-text md:block">
          {dateFormatter({ date: project.metadata.date, month: "short" })}
        </span>
      )}

      {/* Arrow */}
      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-text opacity-0 transition-all group-hover:text-accent group-hover:opacity-100" />
    </div>
  );
}
