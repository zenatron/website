'use client';

import { useState, useRef } from "react";
import { BlogPost } from "@/types/types";
import SearchBar from "./SearchBar";
import { motion } from "framer-motion";
import { FaHashtag, FaCalendarAlt } from "react-icons/fa";
import GradientText from "./bits/GradientText";
import VariableProximity from "./bits/VariableProximity";
import CardSpotlight from "./GlassCard";

interface BlogClientProps {
  posts: BlogPost[];
}

export default function BlogClient({ posts }: BlogClientProps) {
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(posts);
  const containerRef = useRef(null);

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

      {/* Search Section */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between items-center mb-8">
        {/* Empty div for flex spacing */}
        <div className="w-[105px] hidden md:block order-1"></div>

        <SearchBar
          items={posts}
          onFilteredItems={setFilteredPosts}
          className="w-full md:w-[32rem] order-1 md:order-2 md:mx-auto"
        />

        {/* Empty div for flex spacing */}
        <div className="w-[105px] hidden md:block order-3"></div>
      </div>

      {/* Blog Posts */}
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {filteredPosts.length === 0 ? (
          <div className="text-center text-muted-text py-12">
            No posts found matching your search criteria.
          </div>
        ) : (
          filteredPosts.map((post) => (
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