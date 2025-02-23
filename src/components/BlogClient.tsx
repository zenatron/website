'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaCalendarAlt, FaSortAlphaDown, FaSortAlphaUp, FaRegClock, FaHashtag, FaSearch, FaTimes } from 'react-icons/fa';
import { BlogPost } from '@/types/types';
import { motion } from 'framer-motion';
import GradientText from './bits/GradientText';
import VariableProximity from './bits/VariableProximity';

export default function BlogClient({ posts }: { posts: BlogPost[] }) {
  const [sortBy, setSortBy] = useState<'title' | 'date'>('date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagSearch, setTagSearch] = useState('');
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
        setTagSearch('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract unique tags from posts metadata
  const allTags = Array.from(
    new Set(
      posts.flatMap(post => post.metadata.tags || [])
    )
  ).sort();

  // Filter tags based on search
  const filteredTags = allTags.filter(tag => 
    tag.toLowerCase().includes(tagSearch.toLowerCase())
  );

  // Sort and filter posts
  const sortedPosts = [...posts]
    .filter(post => 
      !selectedTag || (post.metadata.tags || []).includes(selectedTag)
    )
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

      <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row md:justify-between items-center mb-8">
        {/* Tag Filter */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center gap-2">
            <FaHashtag className="text-accent" />
            {selectedTag ? (
              <div className="flex items-center gap-2 bg-accent/10 px-3 py-1.5 rounded-md">
                <span className="text-sm">{selectedTag}</span>
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-muted-text hover:text-accent"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                className="btn-nav flex items-center gap-2"
              >
                <span>Filter by tag</span>
                <FaSearch size={14} />
              </button>
            )}
          </div>

          {/* Tag Dropdown */}
          {isTagDropdownOpen && (
            <div className="absolute z-50 mt-2 w-64 bg-secondary-bg rounded-md shadow-lg">
              <input
                type="text"
                placeholder="Search tags..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="w-full p-2 border-b border-accent/10 bg-transparent text-primary-text focus:outline-none"
              />
              <div className="max-h-48 overflow-y-auto">
                {filteredTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTag(tag);
                      setIsTagDropdownOpen(false);
                      setTagSearch('');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-accent/10 text-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setSortBy('date');
              setOrder(order === 'asc' ? 'desc' : 'asc');
            }}
            className={`btn-nav flex items-center space-x-2 ${
              sortBy === 'date' ? 'bg-accent/10' : ''
            }`}
          >
            <FaRegClock />
            <span>Date</span>
          </button>
          <button
            onClick={() => {
              setSortBy('title');
              setOrder(order === 'asc' ? 'desc' : 'asc');
            }}
            className={`btn-nav flex items-center space-x-2 ${
              sortBy === 'title' ? 'bg-accent/10' : ''
            }`}
          >
            {order === 'asc' ? <FaSortAlphaDown /> : <FaSortAlphaUp />}
            <span>Title</span>
          </button>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
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
            <motion.div
              key={post.slug}
              variants={item}
              className="group relative bg-secondary-bg rounded-lg p-6 shadow-md 
                hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                {/* Spotlight effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent 
                  via-accent/5 to-accent/10 opacity-0 group-hover:opacity-100 
                  transition-opacity rounded-lg pointer-events-none" />
                
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
              </Link>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}