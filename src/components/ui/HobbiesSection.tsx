"use client";

import { useState } from "react";
import { FaExternalLinkAlt, FaImage } from "react-icons/fa";
import Link from "next/link";
import {
  favoriteItems,
  categoryLabels,
  type FavoriteItem,
} from "@/lib/favoriteItems";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function HobbiesSection() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(
    new Set(favoriteItems.map((item) => item.category))
  );
  const filteredItems = selectedCategory
    ? favoriteItems.filter((item) => item.category === selectedCategory)
    : favoriteItems;

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="flex justify-center">
        <div className="flex flex-wrap justify-center gap-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-4 py-2 text-sm transition-colors duration-150",
              selectedCategory === null
                ? "text-primary-text"
                : "text-muted-text hover:text-secondary-text"
            )}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-4 py-2 text-sm transition-colors duration-150",
                selectedCategory === category
                  ? "text-primary-text"
                  : "text-muted-text hover:text-secondary-text"
              )}
            >
              {categoryLabels[category as keyof typeof categoryLabels]}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="max-w-2xl mx-auto">
        <div className="divide-y divide-white/5">
          {filteredItems.map((item) => (
            <div key={item.name}>
              {item.url ? (
                <Link
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FavoriteItemRow item={item} />
                </Link>
              ) : (
                <FavoriteItemRow item={item} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface FavoriteItemRowProps {
  item: FavoriteItem;
}

function FavoriteItemRow({ item }: FavoriteItemRowProps) {
  const isImageIcon = typeof item.icon === "string";
  const IconComponent = !isImageIcon ? (item.icon as React.ElementType) : null;

  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="flex items-center gap-4 py-3 px-2 rounded-lg cursor-pointer group transition-colors duration-150 hover:bg-white/[0.02]">
      {/* Icon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
        {isImageIcon ? (
          imageError ? (
            <FaImage
              className="w-4 h-4 text-muted-text"
              title={`Failed to load icon for ${item.name}`}
            />
          ) : (
            <Image
              src={item.icon as string}
              alt={item.name}
              width={16}
              height={16}
              className="object-contain"
              style={{
                filter: item.invertIcon ? "invert(1)" : "none",
              }}
              onError={handleImageError}
            />
          )
        ) : IconComponent ? (
          <IconComponent className="w-4 h-4" style={{ color: item.color }} />
        ) : (
          <div className="w-4 h-4 bg-gray-400 rounded" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-primary-text transition-colors group-hover:text-accent">
            {item.name}
          </span>
          {item.url && (
            <FaExternalLinkAlt className="w-3 h-3 text-muted-text opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </div>
        {item.description && (
          <p className="text-sm text-secondary-text truncate">
            {item.description}
          </p>
        )}
      </div>

      {/* Category badge on larger screens */}
      <span className="hidden shrink-0 text-xs text-muted-text md:block">
        {categoryLabels[item.category as keyof typeof categoryLabels]}
      </span>
    </div>
  );
}
