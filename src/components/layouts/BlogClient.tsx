"use client";

import { useState, useRef, Suspense, useMemo } from "react";
import { BlogPost } from "@/types/types";
import SearchBar from "../ui/SearchBar";
import { motion } from "framer-motion";
import {
  FaHashtag,
  FaCalendarAlt,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaSort,
  FaClock,
} from "react-icons/fa";
import GradientText from "../ui/GradientText";
import VariableProximity from "../ui/VariableProximity";
import GlassCard from "../ui/GlassCard";
import dateFormatter from "@/utils/dateFormatter";
type SortField = "title" | "date";
type SortDirection = "asc" | "desc";

interface BlogClientProps {
  posts: BlogPost[];
}

export default function BlogClient({ posts }: BlogClientProps) {
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(posts);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const containerRef = useRef(null);

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

  // Sort the posts based on current sort field and direction
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortField === "title") {
      const comparison = a.metadata.title.localeCompare(b.metadata.title);
      return sortDirection === "asc" ? comparison : -comparison;
    } else {
      // Sort by date
      const dateA = new Date(a.metadata.date).getTime();
      const dateB = new Date(b.metadata.date).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }
  });

  // Group posts by year
  const groupedPosts = useMemo(() => {
    const groups: { [year: string]: BlogPost[] } = {};

    sortedPosts.forEach(post => {
      const year = new Date(post.metadata.date).getFullYear().toString();
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(post);
    });

    // Sort years in descending order (newest first)
    const sortedYears = Object.keys(groups).sort((a, b) => parseInt(b) - parseInt(a));

    return sortedYears.map(year => ({
      year,
      posts: groups[year]
    }));
  }, [sortedPosts]);

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
          <GradientText animationSpeed={24} transparent={true}>
            <VariableProximity
              label="Blog"
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
          {"Never Stop Learning."}
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
          </div>

          {/* Center - Search Bar */}
          <div className="flex-grow mx-4">
            <div className="max-w-[32rem] mx-auto">
              <Suspense fallback={<div>Loading...</div>}>
                <SearchBar
                  items={posts}
                  onFilteredItems={setFilteredPosts}
                  className="w-full"
                />
              </Suspense>
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
        </div>
      </div>

      {/* Blog Posts with Year Grouping */}
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {sortedPosts.length === 0 ? (
          <div className="text-center text-muted-text py-12">
            No posts found matching your search criteria.
          </div>
        ) : (
          groupedPosts.map((yearGroup, yearIndex) => (
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
                  {yearGroup.posts.length} post{yearGroup.posts.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Posts Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                {yearGroup.posts.map((post, postIndex) => (
                  <motion.div
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: (yearIndex * 0.1) + (postIndex * 0.05) }}
                    whileHover={{ y: -4 }}
                  >
                    <GlassCard
                      href={`/blog/${post.slug}`}
                      className="h-full p-4 hover:border-accent/30 transition-all duration-300"
                      spotlightColor="rgba(34, 123, 224, 0.1)"
                    >
                      <div className="relative z-10 h-full flex flex-col">
                        {/* Title */}
                        <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors line-clamp-2">
                          {post.metadata.title}
                        </h3>

                        {/* Date and Reading Time */}
                        <div className="flex items-center text-secondary-text text-xs mb-3 gap-3">
                          <div className="flex items-center gap-1">
                            <FaCalendarAlt className="w-3 h-3" />
                            <time>
                              {dateFormatter({
                                date: post.metadata.date,
                                month: "short",
                                day: "numeric",
                              })}
                            </time>
                          </div>
                          {post.metadata.readingTime && (
                            <div className="flex items-center gap-1">
                              <FaClock className="w-3 h-3" />
                              <span>{post.metadata.readingTime}</span>
                            </div>
                          )}
                        </div>

                        {/* Excerpt */}
                        {post.metadata.excerpt && (
                          <p className="text-secondary-text text-sm line-clamp-3 mb-3 flex-grow">
                            {post.metadata.excerpt}
                          </p>
                        )}

                        {/* Tags */}
                        {post.metadata.tags && post.metadata.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-auto">
                            {post.metadata.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-accent/10 text-accent/80 hover:bg-accent/20 transition-colors"
                              >
                                <FaHashtag className="w-2 h-2" />
                                {tag}
                              </span>
                            ))}
                            {post.metadata.tags.length > 3 && (
                              <span className="text-xs text-secondary-text px-2 py-1">
                                +{post.metadata.tags.length - 3} more
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
