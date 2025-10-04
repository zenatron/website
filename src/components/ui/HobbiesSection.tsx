"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FaExternalLinkAlt, FaImage } from "react-icons/fa";
import Link from "next/link";
import {
  favoriteItems,
  categoryLabels,
  type FavoriteItem,
} from "@/lib/favoriteItems";
import Image from "next/image";

export default function HobbiesSection() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [, setIsTransitioning] = useState(false);

  const categories = Array.from(
    new Set(favoriteItems.map((item) => item.category))
  );
  const filteredItems = selectedCategory
    ? favoriteItems.filter((item) => item.category === selectedCategory)
    : favoriteItems;

  const handleCategoryChange = (category: string) => {
    if (category === selectedCategory) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedCategory(category);
      setIsTransitioning(false);
    }, 150); // Small delay to ensure smooth transition
  };

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="flex justify-center">
        <div className="inline-flex flex-wrap gap-1.5 p-1.5 bg-neutral-900/50 backdrop-blur-sm border border-neutral-700/50 rounded-lg">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (selectedCategory !== null) {
                setIsTransitioning(true);
                setTimeout(() => {
                  setSelectedCategory(null);
                  setIsTransitioning(false);
                }, 150);
              }
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              selectedCategory === null
                ? "bg-accent text-white shadow-lg"
                : "text-muted-text hover:text-primary-text hover:bg-neutral-800/50"
            }`}
          >
            All
          </motion.button>

          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange(category)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? "bg-accent text-white shadow-lg"
                  : "text-muted-text hover:text-primary-text hover:bg-neutral-800/50"
              }`}
            >
              {categoryLabels[category as keyof typeof categoryLabels]}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="max-w-xl mx-auto">
        <div className="space-y-0.5">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory || "all"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="space-y-0.5"
            >
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    delay: index * 0.02,
                    duration: 0.2,
                    ease: "easeOut",
                  }}
                >
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
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
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
    <motion.div
      whileHover={{ x: 4, backgroundColor: "rgba(23, 23, 23, 0.2)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="flex gap-3 py-2 px-3 rounded-md cursor-pointer group min-h-[2.5rem]"
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center mt-0.5 md:mt-0">
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

      {/* Content - Responsive Layout */}
      <div className="flex-grow min-w-0">
        {/* Desktop/Tablet Layout - Single Line */}
        <div className="hidden md:flex items-center gap-2">
          <h4 className="font-medium text-primary-text group-hover:text-accent transition-colors">
            {item.name}
          </h4>
          {item.description && (
            <span className="text-sm text-muted-text">
              — {item.description}
            </span>
          )}
          {item.url && (
            <FaExternalLinkAlt className="w-3 h-3 text-muted-text opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          )}
        </div>

        {/* Mobile Layout - Stacked */}
        <div className="md:hidden">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-primary-text group-hover:text-accent transition-colors">
              {item.name}
            </h4>
            {item.url && (
              <FaExternalLinkAlt className="w-3 h-3 text-muted-text opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            )}
          </div>
          {item.description && (
            <p className="text-xs text-muted-text mt-0.5 leading-tight">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
