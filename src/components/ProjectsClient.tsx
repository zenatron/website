import { useState, useRef } from "react";
import { ProjectCard } from "@/types/types";
import SearchBar from "./SearchBar";
import { motion } from "framer-motion";
import { FaHashtag, FaGithub, FaCalendarAlt, FaSortAlphaDown, FaSortAlphaUp, FaSort } from "react-icons/fa";
import { SiJupyter } from "react-icons/si";
import GradientText from "./bits/GradientText";
import VariableProximity from "./bits/VariableProximity";
import CardSpotlight from "./GlassCard";

type SortField = 'title' | 'date';
type SortDirection = 'asc' | 'desc';

interface ProjectsClientProps {
  projects: ProjectCard[];
}

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  const [filteredProjects, setFilteredProjects] = useState<ProjectCard[]>(projects);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Get icon for project type
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'data':
        return <SiJupyter className="text-accent" />;
      case 'github':
        return <FaGithub className="text-accent" />;
      default:
        return null;
    }
  };

  const allTypes = Array.from(
    new Set(
      projects.map(project => project.links.github ? 'github' : project.metadata.type)
    )
  ).sort();

  // Handle sort button click
  const handleSortClick = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set default direction for new field (asc for title, desc for date)
      setSortField(field);
      setSortDirection(field === 'title' ? 'asc' : 'desc');
    }
  };

  // Get the appropriate icon based on current sort state
  const getSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return <FaSort className="opacity-50" />;
    }
    
    if (field === 'title') {
      return sortDirection === 'asc' ? <FaSortAlphaDown /> : <FaSortAlphaUp />;
    } else {
      // Date icons (newest first is desc, oldest first is asc)
      return sortDirection === 'desc' ? <FaCalendarAlt /> : <FaCalendarAlt className="rotate-180" />;
    }
  };

  // Filter by type and sort
  const displayProjects = [...filteredProjects]
    // Filter by type
    .filter(project => !selectedType || (selectedType === 'github' ? !!project.links.github : project.metadata.type === selectedType))
    // Sort by field and direction
    .sort((a, b) => {
      if (sortField === 'title') {
        const comparison = a.metadata.title.localeCompare(b.metadata.title);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else {
        // Sort by date - handle missing dates
        if (!a.metadata.date) return sortDirection === 'asc' ? -1 : 1;
        if (!b.metadata.date) return sortDirection === 'asc' ? 1 : -1;
        
        const dateA = new Date(a.metadata.date).getTime();
        const dateB = new Date(b.metadata.date).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });

  const containerRef = useRef(null);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <section className="flex flex-col items-center justify-center text-center animate-fade-in mb-10">
        <div
          ref={containerRef}
          style={{ 
            position: 'relative',
            minHeight: '100px',
            width: '100%',
            padding: '10px'
          }}
        >
          <GradientText
            animationSpeed={24}
            transparent={true}
          >
            <VariableProximity
              label="Projects"
              className="text-6xl md:text-6xl font-bold"
              fromFontVariationSettings="'wght' 100, 'opsz' 8"
              toFontVariationSettings="'wght' 900, 'opsz' 48"
              containerRef={containerRef as unknown as React.RefObject<HTMLElement>}
              radius={100}
              falloff="linear"
            />
          </GradientText>
        </div>
        <p className="text-lg md:text-xl text-muted-text leading-relaxed">
          {"A showcase of my coding journey, from passion projects to GitHub collaborations."}
        </p>
      </section>

      {/* Search and Filter Section */}
      <div className="flex flex-col items-center gap-4 mb-8">
        {/* Desktop Layout */}
        <div className="hidden md:flex w-full items-center">
          {/* Left - Sort Controls */}
          <div className="flex-shrink-0">
            <div className="overflow-hidden rounded-lg bg-white/5 backdrop-blur-md border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center">
              <button
                onClick={() => handleSortClick('title')}
                className={`px-3 py-1.5 flex items-center gap-2 border-r border-white/5 transition-colors hover:bg-white/5
                  ${sortField === 'title' ? 'text-accent' : 'text-muted-text'}`}
                aria-label={`Sort by title ${sortField === 'title' && sortDirection === 'asc' ? 'descending' : 'ascending'}`}
              >
                {getSortIcon('title')}
                <span className="text-sm">Title</span>
              </button>
              
              <button
                onClick={() => handleSortClick('date')}
                className={`px-3 py-1.5 flex items-center gap-2 transition-colors hover:bg-white/5
                  ${sortField === 'date' ? 'text-accent' : 'text-muted-text'}`}
                aria-label={`Sort by date ${sortField === 'date' && sortDirection === 'desc' ? 'oldest first' : 'newest first'}`}
              >
                {getSortIcon('date')}
                <span className="text-sm">Date</span>
              </button>
            </div>
          </div>

          {/* Center - Search Bar */}
          <div className="flex-grow mx-4">
            <div className="max-w-[32rem] mx-auto">
              <SearchBar
                items={projects}
                onFilteredItems={setFilteredProjects}
                className="w-full"
              />
            </div>
          </div>

          {/* Right - Type Filter */}
          <div className="flex-shrink-0">
            <div className="overflow-hidden rounded-lg bg-white/5 backdrop-blur-md border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center">
              {allTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(selectedType === type ? null : type)}
                  className={`px-3 py-1.5 flex items-center gap-2 border-r border-white/5 transition-colors hover:bg-white/5 capitalize
                    ${selectedType === type ? 'text-accent' : 'text-muted-text'}`}
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

          {/* Controls row with both sort and filter */}
          <div className="flex justify-between w-full gap-2">
            {/* Sort Controls - Left aligned */}
            <div className="overflow-hidden rounded-lg bg-white/5 backdrop-blur-md border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center flex-1">
              <button
                onClick={() => handleSortClick('title')}
                className={`px-2 py-1.5 flex items-center gap-1 border-r border-white/5 transition-colors hover:bg-white/5 flex-1 justify-center
                  ${sortField === 'title' ? 'text-accent' : 'text-muted-text'}`}
                aria-label={`Sort by title ${sortField === 'title' && sortDirection === 'asc' ? 'descending' : 'ascending'}`}
              >
                {getSortIcon('title')}
                <span className="text-xs">Title</span>
              </button>
              
              <button
                onClick={() => handleSortClick('date')}
                className={`px-2 py-1.5 flex items-center gap-1 transition-colors hover:bg-white/5 flex-1 justify-center
                  ${sortField === 'date' ? 'text-accent' : 'text-muted-text'}`}
                aria-label={`Sort by date ${sortField === 'date' && sortDirection === 'desc' ? 'oldest first' : 'newest first'}`}
              >
                {getSortIcon('date')}
                <span className="text-xs">Date</span>
              </button>
            </div>

            {/* Type Filter - Right aligned */}
            <div className="overflow-hidden rounded-lg bg-white/5 backdrop-blur-md border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center flex-1">
              {allTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(selectedType === type ? null : type)}
                  className={`px-2 py-1.5 flex items-center gap-1 border-r border-white/5 transition-colors hover:bg-white/5 capitalize flex-1 justify-center
                    ${selectedType === type ? 'text-accent' : 'text-muted-text'}`}
                >
                  {getTypeIcon(type)}
                  <span className="text-xs">{type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {displayProjects.length === 0 ? (
          <div className="col-span-full text-center text-muted-text py-12">
            {"No projects found matching your search criteria."}
          </div>
        ) : (
          displayProjects.map((project) => (
            <motion.div
              key={project.metadata.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CardSpotlight 
                href={project.links.github || `/projects/${project.metadata.slug}`}
                external={!!project.links.github}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(project.metadata.type)}
                      <h2 className="text-2xl font-bold group-hover:text-accent transition-colors">
                        {project.metadata.title}
                      </h2>
                    </div>
                    {project.links.github && (
                      <FaGithub className="text-muted-text text-xl" />
                    )}
                  </div>
                  {project.metadata.date && (
                    <div className="flex items-center text-muted-text text-sm mb-3">
                      <FaCalendarAlt className="mr-2" />
                      <time>{project.metadata.date}</time>
                    </div>
                  )}
                  <p className="text-muted-text mb-4 line-clamp-2">
                    {project.metadata.description}
                  </p>
                  {/* Tags */}
                  {project.metadata.tags && project.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.metadata.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-accent/10 text-accent"
                        >
                          <FaHashtag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardSpotlight>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
} 