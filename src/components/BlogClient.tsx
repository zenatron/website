'use client';

import { useState, useRef } from "react";
import { BlogPost } from "@/types/types";
import SearchBar from "./SearchBar";
import { motion } from "framer-motion";
import { FaHashtag, FaCalendarAlt, FaSortAlphaDown, FaSortAlphaUp, FaSort } from "react-icons/fa";
import GradientText from "./bits/GradientText";
import VariableProximity from "./bits/VariableProximity";
import CardSpotlight from "./GlassCard";

type SortField = 'title' | 'date';
type SortDirection = 'asc' | 'desc';

interface BlogClientProps {
  posts: BlogPost[];
}

export default function BlogClient({ posts }: BlogClientProps) {
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(posts);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const containerRef = useRef(null);

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

  // Sort the posts based on current sort field and direction
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortField === 'title') {
      const comparison = a.metadata.title.localeCompare(b.metadata.title);
      return sortDirection === 'asc' ? comparison : -comparison;
    } else {
      // Sort by date
      const dateA = new Date(a.metadata.date).getTime();
      const dateB = new Date(b.metadata.date).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

      {/* Search and Sort Section */}
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
                items={posts}
                onFilteredItems={setFilteredPosts}
                className="w-full"
              />
            </div>
          </div>

          {/* Right - Empty div for spacing */}
          <div className="flex-shrink-0 w-[105px]"></div>
        </div>

        {/* Mobile Layout */}
        <div className="flex flex-col w-full gap-4 md:hidden">
          {/* Search Bar on top */}
          <SearchBar
            items={posts}
            onFilteredItems={setFilteredPosts}
            className="w-full"
          />

          {/* Sort Controls below, not full width */}
          <div className="self-center overflow-hidden rounded-lg bg-white/5 backdrop-blur-md border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center">
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
      </div>

      {/* Blog Posts */}
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {sortedPosts.length === 0 ? (
          <div className="text-center text-muted-text py-12">
            No posts found matching your search criteria.
          </div>
        ) : (
          sortedPosts.map((post) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CardSpotlight href={`/blog/${post.slug}`}>
                <div className="relative z-10">
                  <div className="flex items-center text-muted-text mb-2">
                    <FaCalendarAlt className="mr-2" />
                    <time>{formatDate(post.metadata.date)}</time>
                  </div>
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors">
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