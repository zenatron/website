'use client';

import { useState, useRef, useEffect } from 'react';
import { FaCalendarAlt, FaSortAlphaDown, FaSortAlphaUp, FaRegClock, FaHashtag, FaTimes } from 'react-icons/fa';
import { BlogPost } from '@/types/types';
import { motion } from 'framer-motion';
import GradientText from './bits/GradientText';
import VariableProximity from './bits/VariableProximity';
import CardSpotlight from './GlassCard';

export default function BlogClient({ posts }: { posts: BlogPost[] }) {
  const [sortBy, setSortBy] = useState<'title' | 'date'>('date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
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

  // Extract unique tags from posts metadata
  const allTags = Array.from(
    new Set(
      posts.flatMap(post => post.metadata.tags || [])
    )
  ).sort();

  // Get tag suggestions based on current input
  const getTagSuggestions = () => {
    const hashIndex = searchQuery.lastIndexOf('#');
    if (hashIndex === -1) return [];
    
    const tagQuery = searchQuery.slice(hashIndex + 1).toLowerCase();
    return allTags.filter(tag => 
      tag.toLowerCase().includes(tagQuery)
    );
  };

  // Handle tag suggestion click or selection
  const handleTagSelect = (tag: string) => {
    const hashIndex = searchQuery.lastIndexOf('#');
    const beforeHash = searchQuery.slice(0, hashIndex);
    setSearchQuery(beforeHash + '#' + tag + ' ');
    setShowTagSuggestions(false);
    setSelectedSuggestionIndex(-1);
    searchInputRef.current?.focus();
  };

  // Reset suggestion state when suggestions are hidden
  useEffect(() => {
    if (!showTagSuggestions) {
      setSelectedSuggestionIndex(-1);
    }
  }, [showTagSuggestions]);

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

  // Sort and filter posts
  const sortedPosts = [...posts]
    .filter(post => {
      const searchTerms = searchQuery.toLowerCase().split(' ');
      const postContent = post.metadata.title.toLowerCase() + ' ' +
        (post.metadata.excerpt?.toLowerCase() || '') + ' ' +
        post.content.toLowerCase();
      
      return searchTerms.every(term => {
        if (term.startsWith('#')) {
          // Tag search
          const tagQuery = term.slice(1);
          return post.metadata.tags?.some(tag => 
            tag.toLowerCase().includes(tagQuery)
          );
        }
        // Regular text search
        return term === '' || postContent.includes(term);
      });
    })
    .sort((a, b) => {
      if (sortBy === 'title') {
        return order === 'asc'
          ? a.metadata.title.localeCompare(b.metadata.title)
          : b.metadata.title.localeCompare(a.metadata.title);
      } else {
        const dateA = new Date(a.metadata.date);
        const dateB = new Date(b.metadata.date);
        return order === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
            label="Blog"
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
        {"Read my thoughts on software engineering, data science, and more."}
      </p>
    </section>

      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between items-center mb-8">
        {/* Sort Controls */}
        <div className="flex items-center gap-2 order-2 md:order-1 mt-2 md:mt-0">
          <div className="overflow-hidden rounded-lg bg-secondary-bg/20 backdrop-blur-md border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center">
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
            <div className="overflow-hidden rounded-lg bg-secondary-bg/20 backdrop-blur-md border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center group">
              <div className="px-3 text-muted-text border-r border-white/5 flex items-center justify-center">
                <kbd className="text-xs bg-white/5 px-1.5 py-0.5 rounded font-mono text-muted-text">/</kbd>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search posts... (Use # for tags)"
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
                className="w-full py-2 px-4 bg-transparent text-primary-text focus:outline-none transition-colors placeholder-muted-text"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
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
                className="absolute z-50 mt-2 w-full max-h-48 overflow-y-auto rounded-lg bg-secondary-bg/30 backdrop-blur-xl border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.2)]"
              >
                {getTagSuggestions().map((tag, index) => (
                  <button
                    key={tag}
                    onClick={() => handleTagSelect(tag)}
                    className={`w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm transition-colors flex items-center gap-2
                      ${selectedSuggestionIndex === index ? 'bg-white/10' : ''}`}
                  >
                    <FaHashtag className="text-accent" />
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Empty div for flex spacing */}
        <div className="w-[105px] hidden md:block order-3"></div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6 min-h-[60vh]"
      >
        {sortedPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-muted-text"
          >
            {"No posts found for the selected filter."}
          </motion.div>
        ) : (
          sortedPosts.map((post) => (
            <motion.div key={post.slug} variants={item}>
              <CardSpotlight href={`/blog/${post.slug}`}>
                <div className="relative z-10">
                  <div className="flex items-center text-muted-text mb-2">
                    <FaCalendarAlt className="mr-2" />
                    <time>{formatDate(post.metadata.date)}</time>
                  </div>
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-accent 
                    transition-colors">
                    {post.metadata.title}
                  </h2>
                  {post.metadata.excerpt && (
                    <p className="text-muted-text line-clamp-2">
                      {post.metadata.excerpt}
                    </p>
                  )}
                  {/* Tags */}
                  {post.metadata.tags && post.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.metadata.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="tag-bubble cursor-default"
                        >
                          <FaHashtag className="mr-1 text-xs opacity-70" />
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