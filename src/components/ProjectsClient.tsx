import { useState, useRef } from "react";
import { ProjectCard } from "@/types/types";
import SearchBar from "./SearchBar";
import { motion } from "framer-motion";
import { FaHashtag, FaGithub, FaCalendarAlt } from "react-icons/fa";
import { SiJupyter } from "react-icons/si";
import GradientText from "./bits/GradientText";
import VariableProximity from "./bits/VariableProximity";
import CardSpotlight from "./GlassCard";

interface ProjectsClientProps {
  projects: ProjectCard[];
}

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  const [filteredProjects, setFilteredProjects] = useState<ProjectCard[]>(projects);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
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

  // Filter by type
  const displayProjects = filteredProjects.filter(project => 
    !selectedType || (selectedType === 'github' ? !!project.links.github : project.metadata.type === selectedType)
  );

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
          {"Exploring software engineering through personal projects and open-source contributions."}
        </p>
      </section>

      {/* Search and Filter Section */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between items-center mb-8">
        {/* Sort Controls */}
        <div className="flex items-center gap-2 order-2 md:order-1 mt-4 md:mt-0">
          {/* Type Filter */}
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

        <SearchBar
          items={projects}
          onFilteredItems={setFilteredProjects}
          className="w-full md:w-[32rem] order-1 md:order-2 md:mx-auto"
        />

        {/* Empty div for flex spacing */}
        <div className="w-[105px] hidden md:block order-3"></div>
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
            No projects found matching your search criteria.
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