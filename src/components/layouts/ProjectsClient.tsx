import { useState, useRef, Suspense, useMemo } from "react";
import { ProjectCard } from "@/types/types";
import SearchBar from "../ui/SearchBar";
import { motion } from "framer-motion";
import {
  FaHashtag,
  FaGithub,
  FaCalendarAlt,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaSort,
} from "react-icons/fa";
import { SiJupyter } from "react-icons/si";
import GlassCard from "../ui/GlassCard";
import dateFormatter from "@/utils/dateFormatter";
import GradientText from "../ui/GradientText";
import VariableProximity from "../ui/VariableProximity";
type SortField = "title" | "date";
type SortDirection = "asc" | "desc";

interface ProjectsClientProps {
  projects: ProjectCard[];
}

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  const [filteredProjects, setFilteredProjects] =
    useState<ProjectCard[]>(projects);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const containerRef = useRef(null);

  // Get icon for project type
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "data":
        return <SiJupyter className="text-accent" />;
      case "github":
        return <FaGithub className="text-accent" />;
      default:
        return null;
    }
  };

  const allTypes = Array.from(
    new Set(
      projects.map((project) =>
        project.links.github ? "github" : project.metadata.type
      )
    )
  ).sort();

  // Handle sort button click
  const handleSortClick = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set default direction for new field (asc for title, desc for date)
      setSortField(field);
      setSortDirection(field === "title" ? "asc" : "desc");
    }
  };

  // Get the appropriate icon based on current sort state
  const getSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return <FaSort className="opacity-50" />;
    }

    if (field === "title") {
      return sortDirection === "asc" ? <FaSortAlphaDown /> : <FaSortAlphaUp />;
    } else {
      // Date icons (newest first is desc, oldest first is asc)
      return sortDirection === "desc" ? (
        <FaCalendarAlt />
      ) : (
        <FaCalendarAlt className="rotate-180" />
      );
    }
  };

  // Filter by type and sort
  const sortedProjects = useMemo(() => {
    return (
      [...filteredProjects]
        // Filter by type
        .filter(
          (project) =>
            !selectedType ||
            (selectedType === "github"
              ? !!project.links.github
              : project.metadata.type === selectedType)
        )
        // Sort by field and direction
        .sort((a, b) => {
          if (sortField === "title") {
            const comparison = a.metadata.title.localeCompare(b.metadata.title);
            return sortDirection === "asc" ? comparison : -comparison;
          } else {
            // Sort by date - handle missing dates
            if (!a.metadata.date) return sortDirection === "asc" ? -1 : 1;
            if (!b.metadata.date) return sortDirection === "asc" ? 1 : -1;

            const dateA = new Date(a.metadata.date).getTime();
            const dateB = new Date(b.metadata.date).getTime();
            return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
          }
        })
    );
  }, [filteredProjects, selectedType, sortField, sortDirection]);

  // Group projects by year
  const groupedProjects = useMemo(() => {
    const groups: { [year: string]: ProjectCard[] } = {};

    sortedProjects.forEach((project) => {
      const year = project.metadata.date
        ? new Date(project.metadata.date).getFullYear().toString()
        : "Undated";

      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(project);
    });

    // Convert to array and sort years (newest first, but 'Undated' last)
    return Object.entries(groups)
      .map(([year, projects]) => ({ year, projects }))
      .sort((a, b) => {
        if (a.year === "Undated") return 1;
        if (b.year === "Undated") return -1;
        return parseInt(b.year) - parseInt(a.year);
      });
  }, [sortedProjects]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <section className="flex flex-col items-center justify-center text-center animate-fade-in mb-10">
        <div
          ref={containerRef}
          style={{
            position: "relative",
            minHeight: "100px",
            width: "100%",
            padding: "10px",
          }}
        >
          <GradientText animationSpeed={24} transparent={true} colors={["#00d4ff", "#0099ff", "#0047ff", "#00d4ff"]}>
            <VariableProximity
              label="Projects"
              className="text-6xl md:text-6xl font-bold"
              fromFontVariationSettings="'wght' 100, 'opsz' 8"
              toFontVariationSettings="'wght' 900, 'opsz' 48"
              containerRef={
                containerRef as unknown as React.RefObject<HTMLElement>
              }
              radius={100}
              falloff="linear"
            />
          </GradientText>
        </div>
        <p className="text-lg md:text-xl text-muted-text leading-relaxed">
          {'Philosophy: "Build Smarter. Solve Faster"'}
        </p>
      </section>

      {/* Search and Filter Section */}
      <div className="flex flex-col items-center gap-4 mb-8">
        {/* Desktop Layout - Centered */}
        <div className="hidden md:flex flex-col items-center gap-4 w-full max-w-2xl">
          {/* Search Bar on top, centered */}
          <div className="w-full">
            <Suspense fallback={<div>Loading...</div>}>
              <SearchBar
                items={projects}
                onFilteredItems={setFilteredProjects}
                className="w-full"
              />
            </Suspense>
          </div>

          {/* Controls below in a row */}
          <div className="flex items-center gap-4">
            {/* Sort Controls */}
            <div className="overflow-hidden rounded-lg bg-white/5 backdrop-blur-md border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center">
              <button
                onClick={() => handleSortClick("title")}
                className={`px-3 py-1.5 flex items-center gap-2 border-r border-white/5 transition-colors hover:bg-white/5
                  ${sortField === "title" ? "text-accent" : "text-muted-text"}`}
                aria-label={`Sort by title ${
                  sortField === "title" && sortDirection === "asc"
                    ? "descending"
                    : "ascending"
                }`}
                title={`Sort by title: ${
                  sortField === "title" && sortDirection === "asc"
                    ? "descending"
                    : "ascending"
                }`}
              >
                {getSortIcon("title")}
                <span className="text-sm">Title</span>
              </button>

              <button
                onClick={() => handleSortClick("date")}
                className={`px-3 py-1.5 flex items-center gap-2 transition-colors hover:bg-white/5
                  ${sortField === "date" ? "text-accent" : "text-muted-text"}`}
                aria-label={`Sort by date ${
                  sortField === "date" && sortDirection === "desc"
                    ? "oldest first"
                    : "newest first"
                }`}
                title={`Sort by date: ${
                  sortField === "date" && sortDirection === "desc"
                    ? "oldest first"
                    : "newest first"
                }`}
              >
                {getSortIcon("date")}
                <span className="text-sm">Date</span>
              </button>
            </div>

            {/* Type Filter */}
            <div className="overflow-hidden rounded-lg bg-white/5 backdrop-blur-md border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center">
              {allTypes.map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setSelectedType(selectedType === type ? null : type)
                  }
                  className={`px-3 py-1.5 flex items-center gap-2 border-r border-white/5 transition-colors hover:bg-white/5 capitalize
                    ${
                      selectedType === type ? "text-accent" : "text-muted-text"
                    }`}
                  title={`Filter by type: ${type}`}
                >
                  {getTypeIcon(type)}
                  <span className="text-sm">{type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex flex-col w-full gap-4 md:hidden">
          {/* Search Bar on top */}
          <SearchBar
            items={projects}
            onFilteredItems={setFilteredProjects}
            className="w-full"
          />

          {/* Sort Controls below, not full width */}
          <div className="self-center overflow-hidden rounded-lg bg-white/5 backdrop-blur-md border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center">
            <button
              onClick={() => handleSortClick("title")}
              className={`px-3 py-1.5 flex items-center gap-2 border-r border-white/5 transition-colors hover:bg-white/5
                ${sortField === "title" ? "text-accent" : "text-muted-text"}`}
              aria-label={`Sort by title ${
                sortField === "title" && sortDirection === "asc"
                  ? "descending"
                  : "ascending"
              }`}
              title={`Sort by title: ${
                sortField === "title" && sortDirection === "asc"
                  ? "descending"
                  : "ascending"
              }`}
            >
              {getSortIcon("title")}
              <span className="text-sm">Title</span>
            </button>

            <button
              onClick={() => handleSortClick("date")}
              className={`px-3 py-1.5 flex items-center gap-2 transition-colors hover:bg-white/5
                ${sortField === "date" ? "text-accent" : "text-muted-text"}`}
              aria-label={`Sort by date ${
                sortField === "date" && sortDirection === "desc"
                  ? "oldest first"
                  : "newest first"
              }`}
              title={`Sort by date: ${
                sortField === "date" && sortDirection === "desc"
                  ? "oldest first"
                  : "newest first"
              }`}
            >
              {getSortIcon("date")}
              <span className="text-sm">Date</span>
            </button>
          </div>

          {/* Type Filter */}
          <div className="self-center overflow-hidden rounded-lg bg-white/5 backdrop-blur-md border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center">
            {allTypes.map((type) => (
              <button
                key={type}
                onClick={() =>
                  setSelectedType(selectedType === type ? null : type)
                }
                className={`px-3 py-1.5 flex items-center gap-2 border-r border-white/5 transition-colors hover:bg-white/5 capitalize
                  ${selectedType === type ? "text-accent" : "text-muted-text"}`}
                title={`Filter by type: ${type}`}
              >
                {getTypeIcon(type)}
                <span className="text-sm">{type}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects with Year Grouping */}
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {sortedProjects.length === 0 ? (
          <div className="text-center text-muted-text py-12">
            No projects found matching your search criteria.
          </div>
        ) : (
          groupedProjects.map((yearGroup, yearIndex) => (
            <motion.div
              key={yearGroup.year}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: yearIndex * 0.1 }}
              className="space-y-6"
            >
              {/* Year Header */}
              <div className="flex items-center gap-4 mb-6">
                <motion.h2
                  className="text-3xl font-bold text-accent"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {yearGroup.year}
                </motion.h2>
                <div className="flex-1 h-px bg-gradient-to-r from-accent/50 to-transparent" />
                <span className="text-sm text-secondary-text bg-secondary-bg/50 px-3 py-1 rounded-full">
                  {yearGroup.projects.length} project
                  {yearGroup.projects.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Projects Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                {yearGroup.projects.map((project, projectIndex) => (
                  <motion.div
                    key={project.metadata.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: yearIndex * 0.1 + projectIndex * 0.05,
                    }}
                    whileHover={{ y: -4 }}
                  >
                    <GlassCard
                      href={
                        project.links.github ||
                        `/projects/${project.metadata.slug}`
                      }
                      external={!!project.links.github}
                      className="h-full p-4 hover:border-accent/30 transition-all duration-300"
                      spotlightColor="rgba(34, 123, 224, 0.1)"
                    >
                      <div className="relative z-10 h-full flex flex-col">
                        {/* Title and Type */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(project.metadata.type)}
                            <h3 className="text-lg font-bold group-hover:text-accent transition-colors line-clamp-2">
                              {project.metadata.title}
                            </h3>
                          </div>
                          {project.links.github && (
                            <FaGithub className="text-muted-text text-lg flex-shrink-0" />
                          )}
                        </div>

                        {/* Date */}
                        {project.metadata.date && (
                          <div className="flex items-center text-secondary-text text-sm mb-3">
                            <FaCalendarAlt className="mr-2" />
                            <time>
                              {dateFormatter({
                                date: project.metadata.date,
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </time>
                          </div>
                        )}

                        {/* Description */}
                        <p className="text-muted-text mb-4 line-clamp-3 flex-grow">
                          {project.metadata.description}
                        </p>

                        {/* Tags */}
                        {project.metadata.tags &&
                          project.metadata.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-auto">
                              {project.metadata.tags
                                .slice(0, 3)
                                .map((tag, index) => (
                                  <span
                                    key={index}
                                    className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-accent/10 text-accent"
                                  >
                                    <FaHashtag className="w-3 h-3" />
                                    {tag}
                                  </span>
                                ))}
                              {project.metadata.tags.length > 3 && (
                                <span className="text-xs text-secondary-text px-2 py-1">
                                  +{project.metadata.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
