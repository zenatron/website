'use client';

import React from 'react';

const SkeletonCard = () => (
  <div className="h-[200px] w-full rounded-lg bg-white/5 border border-white/5 p-4 animate-pulse">
    <div className="h-6 w-3/4 rounded bg-gray-300/10 mb-3"></div> {/* Title */}
    <div className="h-4 w-1/2 rounded bg-gray-300/10 mb-4"></div> {/* Date/Meta */}
    <div className="h-4 w-full rounded bg-gray-300/10 mb-2"></div> {/* Excerpt line 1 */}
    <div className="h-4 w-5/6 rounded bg-gray-300/10 mb-4"></div> {/* Excerpt line 2 */}
    <div className="flex gap-2">
      <div className="h-5 w-16 rounded-full bg-gray-300/10"></div> {/* Tag 1 */}
      <div className="h-5 w-20 rounded-full bg-gray-300/10"></div> {/* Tag 2 */}
    </div>
  </div>
);

interface ClientSkeletonLoaderProps {
  itemCount?: number;
  layout?: 'list' | 'grid'; // Optional: To slightly adjust layout for projects vs blog
}

const ClientSkeletonLoader: React.FC<ClientSkeletonLoaderProps> = ({ itemCount = 6, layout = 'list' }) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header Skeleton */}
      <div className="flex flex-col items-center justify-center text-center mb-10 animate-pulse">
        <div className="h-12 w-1/2 bg-gray-300/10 rounded mb-4"></div>
        <div className="h-6 w-3/4 bg-gray-300/10 rounded"></div>
      </div>

      {/* Search/Sort Skeleton */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 animate-pulse">
        <div className="h-10 w-48 bg-gray-300/10 rounded-lg"></div> {/* Sort controls */}
        <div className="h-10 w-full md:w-1/2 bg-gray-300/10 rounded-lg"></div> {/* Search bar */}
        <div className="hidden md:block h-10 w-24"></div> {/* Spacer */}
      </div>

      {/* Items Skeleton */}
      <div className={`animate-pulse ${layout === 'list' ? 'space-y-6' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}`}>
        {[...Array(itemCount)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
};

export default ClientSkeletonLoader; 