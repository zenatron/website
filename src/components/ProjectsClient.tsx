import { useState, useRef, useEffect } from 'react';
import { FaTimes, FaHashtag, FaGithub, FaCalendarAlt, FaSortAlphaDown, FaSortAlphaUp, FaRegClock } from 'react-icons/fa';
import { SiJupyter } from 'react-icons/si';
import { MdKeyboardTab } from 'react-icons/md';
import { ProjectCard as ProjectCardType } from '@/types/types';
import GradientText from './bits/GradientText';
import VariableProximity from './bits/VariableProximity';
import CardSpotlight from './GlassCard';
import { motion } from 'framer-motion';

export default function ProjectsClient({ projects }: { projects: ProjectCardType[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [sortBy, setSortBy] = useState<'title' | 'date'>('date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tagSuggestionsRef = useRef<HTMLDivElement>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not in an input field already
      if (
        document.activeElement?.tagName !== 'INPUT' && 
        document.activeElement?.tagName !== 'TEXTAREA' &&
        e.key === '/'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Normalize tag helper function
  const normalizeTag = (tag: string) => tag.toLowerCase().replace(/\s+/g, '-');

  // Extract unique tags and types from projects
  const allTags = Array.from(
    new Set(
      projects.flatMap(project => 
        (project.metadata.tags || []).map(normalizeTag)
      )
    )
  ).sort();

  const allTypes = Array.from(
    new Set(
      projects.map(project => project.links.github ? 'github' : project.metadata.type)
    )
  ).sort();

  // Get tag suggestions based on current input
  const getTagSuggestions = () => {
    const hashIndex = searchQuery.lastIndexOf('#');
    if (hashIndex === -1) return [];
    
    const tagQuery = searchQuery.slice(hashIndex + 1).toLowerCase();
    
    return allTags.filter(tag => tag.includes(tagQuery));
  };

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedSuggestionIndex >= 0 && tagSuggestionsRef.current) {
      const suggestions = tagSuggestionsRef.current.children;
      if (suggestions[selectedSuggestionIndex]) {
        suggestions[selectedSuggestionIndex].scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedSuggestionIndex]);

  // Handle tag suggestion click or selection
  const handleTagSelect = (tag: string) => {
    // Add the tag to selectedTags if it's not already there
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    
    // Remove the tag query from the search input
    const hashIndex = searchQuery.lastIndexOf('#');
    let newQuery = searchQuery;
    
    if (hashIndex !== -1) {
      const beforeHash = searchQuery.slice(0, hashIndex).trimEnd();
      newQuery = beforeHash;
    }
    
    setSearchQuery(newQuery);
    setShowTagSuggestions(false);
    setSelectedSuggestionIndex(-1);
    searchInputRef.current?.focus();
  };

  // Remove a selected tag
  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    searchInputRef.current?.focus();
  };

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

  // Filter and sort projects
  const filteredAndSortedProjects = projects
    .filter(project => {
      const matchesType = !selectedType || 
        (selectedType === 'github' ? !!project.links.github : project.metadata.type === selectedType);
      
      if (!matchesType) return false;

      // Check if project matches all selected tags (exact match)
      if (selectedTags.length > 0) {
        const projectTags = project.metadata.tags?.map(normalizeTag) || [];
        const hasAllSelectedTags = selectedTags.every(selectedTag => 
          projectTags.some(tag => tag === selectedTag)
        );
        if (!hasAllSelectedTags) return false;
      }

      // Check if project matches search terms
      const searchTerms = searchQuery.toLowerCase().split(' ');
      const projectContent = project.metadata.title.toLowerCase() + ' ' +
        (project.metadata.description?.toLowerCase() || '');
      
      return searchTerms.every(term => {
        if (term.startsWith('#')) {
          const tagQuery = term.slice(1).toLowerCase();
          if (!tagQuery) return true;
          return project.metadata.tags?.some(tag => 
            normalizeTag(tag).includes(tagQuery)
          );
        }
        return term === '' || projectContent.includes(term);
      });
    })
    .sort((a, b) => {
      if (sortBy === 'title') {
        return order === 'asc'
          ? a.metadata.title.localeCompare(b.metadata.title)
          : b.metadata.title.localeCompare(a.metadata.title);
      } else {
        const dateA = new Date(a.metadata.date || '');
        const dateB = new Date(b.metadata.date || '');
        return order === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
    });

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

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
          <div className="overflow-hidden rounded-lg bg-white/5 backdrop-blur-md border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center">
            <button
              onClick={() => {
                setSortBy('date');
                setOrder(order === 'asc' ? 'desc' : 'asc');
              }}
              className={`px-3 py-1.5 flex items-center gap-2 border-r border-white/5 transition-colors hover:bg-white/5
                ${sortBy === 'date' ? 'text-accent' : 'text-muted-text'}`}
            >
              <FaRegClock size={14} />
              <span className="text-sm">Date</span>
            </button>
            <button
              onClick={() => {
                setSortBy('title');
                setOrder(order === 'asc' ? 'desc' : 'asc');
              }}
              className={`px-3 py-1.5 flex items-center gap-2 transition-colors hover:bg-white/5
                ${sortBy === 'title' ? 'text-accent' : 'text-muted-text'}`}
            >
              {order === 'asc' ? <FaSortAlphaDown size={14} /> : <FaSortAlphaUp size={14} />}
              <span className="text-sm">Title</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-auto order-1 md:order-2 md:mx-auto">
          <div className="relative max-w-2xl mx-auto md:w-[32rem]">
            <div className="overflow-hidden rounded-lg bg-white/5 backdrop-blur-md border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center group">
              <div className="px-3 text-muted-text border-r border-white/5 flex items-center justify-center">
                <kbd className="text-xs bg-white/5 px-1.5 py-0.5 rounded font-mono text-muted-text">/</kbd>
              </div>
              <div className="flex flex-1 items-center flex-wrap gap-1 py-1 px-2">
                {/* Selected tag bubbles */}
                {selectedTags.map(tag => (
                  <div 
                    key={tag}
                    className="flex items-center gap-1 bg-accent/20 text-accent rounded-full px-2 py-0.5 text-sm"
                  >
                    <FaHashtag size={10} />
                    <span>{tag}</span>
                    <button 
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-white transition-colors"
                    >
                      <FaTimes size={10} />
                    </button>
                  </div>
                ))}
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={selectedTags.length > 0 ? "" : "Search projects... (Use # for tags)"}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    const hasHash = e.target.value.includes('#');
                    setShowTagSuggestions(hasHash);
                    if (hasHash) {
                      setSelectedSuggestionIndex(-1);
                    }
                  }}
                  onKeyDown={(e) => {
                    const suggestions = getTagSuggestions();
                    
                    if (e.key === 'Escape') {
                      setSearchQuery('');
                      setShowTagSuggestions(false);
                      setSelectedSuggestionIndex(-1);
                      searchInputRef.current?.blur();
                      return;
                    }

                    // Handle backspace to remove the last tag when input is empty
                    if (e.key === 'Backspace' && searchQuery === '' && selectedTags.length > 0) {
                      e.preventDefault();
                      const newTags = [...selectedTags];
                      newTags.pop();
                      setSelectedTags(newTags);
                      return;
                    }

                    if (showTagSuggestions && suggestions.length > 0) {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setSelectedSuggestionIndex(prev => 
                          prev < suggestions.length - 1 ? prev + 1 : prev
                        );
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setSelectedSuggestionIndex(prev => 
                          prev > 0 ? prev - 1 : -1
                        );
                      } else if ((e.key === 'Tab' || e.key === 'Enter') && selectedSuggestionIndex >= 0) {
                        e.preventDefault();
                        handleTagSelect(suggestions[selectedSuggestionIndex]);
                      } else if (e.key === 'Tab' && suggestions.length > 0) {
                        e.preventDefault();
                        handleTagSelect(suggestions[0]);
                      }
                    }
                  }}
                  className="flex-1 py-1 bg-transparent text-primary-text focus:outline-none transition-colors placeholder-muted-text min-w-[100px]"
                />
              </div>
              {(searchQuery || selectedTags.length > 0) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTags([]);
                    setShowTagSuggestions(false);
                  }}
                  className="px-3 text-muted-text hover:text-accent transition-colors"
                >
                  <FaTimes size={14} />
                </button>
              )}
            </div>
            
            {/* Tag Suggestions Dropdown */}
            {showTagSuggestions && (
              <div 
                ref={tagSuggestionsRef}
                className="absolute z-50 mt-2 w-full max-h-48 overflow-y-auto rounded-lg bg-white/5 backdrop-blur-xl border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.2)]"
              >
                {getTagSuggestions().map((tag, index) => (
                  <button
                    key={tag}
                    onClick={() => handleTagSelect(tag)}
                    className={`w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm transition-colors flex items-center gap-2
                      ${selectedSuggestionIndex === index ? 'bg-white/10' : ''}`}
                  >
                    <FaHashtag className="text-accent" />
                    <span className="flex-1">{tag}</span>
                    {selectedSuggestionIndex === index && (
                      <div className="flex items-center gap-1 text-accent text-xs">
                        {"TAB"}
                        <MdKeyboardTab />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 order-3 md:order-3 mb-4 md:mb-0">
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

      {/* Projects Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {filteredAndSortedProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-muted-text col-span-2"
          >
            No projects found matching your criteria.
          </motion.div>
        ) : (
          filteredAndSortedProjects.map((project) => (
            <motion.div key={project.metadata.title} variants={item}>
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
                          className="tag-bubble cursor-default"
                        >
                          <FaHashtag className="mr-1 text-xs opacity-70" />
                          {normalizeTag(tag)}
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