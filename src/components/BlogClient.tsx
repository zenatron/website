'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaSortNumericDown,
  FaSortNumericUp,
} from 'react-icons/fa';
import { BlogPost } from '@/types/types';

export default function BlogClient({ posts }: { posts: BlogPost[] }) {
  const [sortBy, setSortBy] = useState<'title' | 'date'>('date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Sort posts dynamically
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'title') {
      return order === 'asc'
        ? a.metadata.title.localeCompare(b.metadata.title)
        : b.metadata.title.localeCompare(a.metadata.title);
    } else if (sortBy === 'date') {
      const dateA = new Date(a.metadata.date);
      const dateB = new Date(b.metadata.date);
      return order === 'asc'
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    }
    return 0;
  });

  return (
    <main className="flex-1 px-6 py-6 bg-primary-bg text-primary-text">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Blog</h1>
        <div className="flex items-center space-x-4">
          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'title' | 'date')}
            className="bg-primary-bg text-primary-text px-4 py-2 rounded-lg border border-accent/20 
              focus:outline-none focus:ring-2 focus:ring-accent shadow-sm hover:shadow-md 
              transition-all duration-75"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
          </select>

          {/* Sort Order Button */}
          <button
            onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
            className="bg-btnPrimary text-white px-4 py-2 rounded-lg flex items-center 
              hover:bg-btnPrimaryHover active:bg-accent/80 shadow-sm hover:shadow-md 
              transition-all duration-75 border border-accent/20"
          >
            {sortBy === 'title' ? (
              order === 'asc' ? (
                <FaSortAlphaDown className="text-xl" />
              ) : (
                <FaSortAlphaUp className="text-xl" />
              )
            ) : order === 'asc' ? (
              <FaSortNumericDown className="text-xl" />
            ) : (
              <FaSortNumericUp className="text-xl" />
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group bg-secondary-bg text-primary-text p-6 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all transform relative"
          >
            {/* Spotlight effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-accent/10 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2 group-hover:text-accent transition-colors">
                {post.metadata.title}
              </h2>
              <p className="text-muted-text text-sm mb-4">{post.metadata.date}</p>
              <p className="text-muted-text">{post.metadata.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}