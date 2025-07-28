"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaExpand, FaTimes, FaDownload } from "react-icons/fa";
import Image from "next/image";

interface Photo {
  src: string;
  alt: string;
  caption?: string;
}

interface PhotoCarouselProps {
  photos: Photo[];
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export default function PhotoCarousel({
  photos,
  className = "",
  autoPlay = true,
  autoPlayInterval = 5000,
}: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || photos.length <= 1 || isFullscreen) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, photos.length, isFullscreen]);

  // Handle keyboard navigation and escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;

      switch (e.key) {
        case 'Escape':
          setIsFullscreen(false);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      // Focus the close button for accessibility
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setImageLoaded(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setImageLoaded(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setImageLoaded(false);
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
    setImageLoaded(false);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = photos[currentIndex].src;
    link.download = photos[currentIndex].alt || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (photos.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 bg-neutral-800/25 backdrop-blur-md border border-neutral-600/30 rounded-3xl ${className}`}>
        <p className="text-secondary-text">No photos available</p>
      </div>
    );
  }

  return (
    <>
      <div className={`relative overflow-hidden bg-neutral-800/25 backdrop-blur-md border border-neutral-600/30 rounded-3xl shadow-lg ${className}`}>
        {/* Main Image Display */}
        <div className="relative aspect-[4/3] md:aspect-[16/9] group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={photos[currentIndex].src}
                alt={photos[currentIndex].alt}
                fill
                className="object-cover"
                priority={currentIndex === 0}
                onLoad={() => setImageLoaded(true)}
              />

              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

              {/* Caption */}
              {photos[currentIndex].caption && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="absolute bottom-4 left-4 right-4 z-10"
                >
                  <p className="text-white text-sm md:text-base font-medium drop-shadow-lg">
                    {photos[currentIndex].caption}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <motion.button
                onClick={goToPrevious}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                aria-label="Previous photo"
              >
                <FaChevronLeft className="w-4 h-4" />
              </motion.button>

              <motion.button
                onClick={goToNext}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                aria-label="Next photo"
              >
                <FaChevronRight className="w-4 h-4" />
              </motion.button>
            </>
          )}

          {/* Fullscreen Button */}
          <motion.button
            onClick={openFullscreen}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-3 right-3 p-3 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
            aria-label="View fullscreen"
          >
            <FaExpand className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Thumbnail Navigation */}
        {photos.length > 1 && photos.length <= 8 && (
          <div className="p-4 bg-neutral-900/30 backdrop-blur-md border-t border-neutral-600/20">
            <div className="flex gap-3 justify-center overflow-x-auto scrollbar-hide">
              {photos.map((photo, index) => (
                <motion.button
                  key={index}
                  onClick={() => goToSlide(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex-shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    index === currentIndex
                      ? "border-accent shadow-lg shadow-accent/25 scale-105"
                      : "border-neutral-600/30 hover:border-neutral-400/50"
                  }`}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                  />
                  {index === currentIndex && (
                    <div className="absolute inset-0 bg-accent/10" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Progress Indicators */}
        {photos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-2">
            {photos.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-accent scale-125 shadow-lg shadow-accent/50"
                    : "bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to photo ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center"
            onClick={closeFullscreen}
          >
            {/* Modal Content */}
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full h-full flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Main Image */}
              <div className="relative max-w-[95vw] max-h-[90vh] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="relative"
                  >
                    <Image
                      src={photos[currentIndex].src}
                      alt={photos[currentIndex].alt}
                      width={1200}
                      height={800}
                      className="object-contain max-h-[90vh] w-auto rounded-lg shadow-2xl"
                      onLoad={() => setImageLoaded(true)}
                    />

                    {/* Loading indicator */}
                    {!imageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm rounded-lg">
                        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Top Controls */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-black/40 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm font-medium">
                    {currentIndex + 1} / {photos.length}
                  </div>
                  {photos[currentIndex].caption && (
                    <div className="bg-black/40 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm max-w-md truncate">
                      {photos[currentIndex].caption}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={downloadImage}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-all duration-200"
                    aria-label="Download image"
                  >
                    <FaDownload className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    ref={closeButtonRef}
                    onClick={closeFullscreen}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-all duration-200"
                    aria-label="Close fullscreen"
                  >
                    <FaTimes className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Navigation Arrows */}
              {photos.length > 1 && (
                <>
                  <motion.button
                    onClick={goToPrevious}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-all duration-200 z-10"
                    aria-label="Previous photo"
                  >
                    <FaChevronLeft className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    onClick={goToNext}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-all duration-200 z-10"
                    aria-label="Next photo"
                  >
                    <FaChevronRight className="w-5 h-5" />
                  </motion.button>
                </>
              )}

              {/* Bottom Thumbnail Strip */}
              {photos.length > 1 && photos.length <= 10 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md rounded-2xl p-3">
                  <div className="flex gap-2 max-w-[80vw] overflow-x-auto scrollbar-hide">
                    {photos.map((photo, index) => (
                      <motion.button
                        key={index}
                        onClick={() => goToSlide(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`relative flex-shrink-0 w-12 h-8 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          index === currentIndex
                            ? "border-accent shadow-lg shadow-accent/50"
                            : "border-white/30 hover:border-white/60"
                        }`}
                      >
                        <Image
                          src={photo.src}
                          alt={photo.alt}
                          fill
                          className="object-cover"
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Indicators for many photos */}
              {photos.length > 10 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md rounded-full px-4 py-2">
                  <div className="flex gap-1">
                    {photos.map((_, index) => (
                      <motion.button
                        key={index}
                        onClick={() => goToSlide(index)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                          index === currentIndex
                            ? "bg-accent scale-125"
                            : "bg-white/40 hover:bg-white/70"
                        }`}
                        aria-label={`Go to photo ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
