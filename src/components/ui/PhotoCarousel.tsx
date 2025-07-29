"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
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
  const containerRef = useRef<HTMLDivElement>(null);

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

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setImageLoaded(false);
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setImageLoaded(false);
  }, [photos.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setImageLoaded(false);
  }, []);

  // Handle swipe gestures for mobile
  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const swipeThreshold = 50;
    const swipeVelocityThreshold = 500;

    if (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > swipeVelocityThreshold) {
      if (info.offset.x > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }
  }, [goToPrevious, goToNext]);

  const handleDragStart = useCallback(() => {
    // Drag started - could be used for future enhancements
  }, []);

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
      <div
        ref={containerRef}
        className={`relative overflow-hidden bg-neutral-800/25 backdrop-blur-md border border-neutral-600/30 rounded-3xl shadow-lg ${className}`}
      >
        {/* Main Image Display */}
        <div className="relative aspect-[4/3] md:aspect-[16/9] group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              whileDrag={{ scale: 0.98 }}
            >
              <Image
                src={photos[currentIndex].src}
                alt={photos[currentIndex].alt}
                fill
                className="object-cover pointer-events-none"
                priority={currentIndex === 0}
                onLoad={() => setImageLoaded(true)}
              />

              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

              {/* Caption */}
              {photos[currentIndex].caption && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="absolute bottom-2 left-2 right-2 md:bottom-4 md:left-4 md:right-4 z-10 pointer-events-none"
                >
                  <p className="text-white text-xs md:text-sm lg:text-base font-medium drop-shadow-lg">
                    {photos[currentIndex].caption}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows - Mobile Optimized */}
          {photos.length > 1 && (
            <>
              <motion.button
                onClick={goToPrevious}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-all duration-200 opacity-70 md:opacity-0 md:group-hover:opacity-100 z-20 touch-manipulation"
                aria-label="Previous photo"
              >
                <FaChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
              </motion.button>

              <motion.button
                onClick={goToNext}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-all duration-200 opacity-70 md:opacity-0 md:group-hover:opacity-100 z-20 touch-manipulation"
                aria-label="Next photo"
              >
                <FaChevronRight className="w-3 h-3 md:w-4 md:h-4" />
              </motion.button>
            </>
          )}

          {/* Fullscreen Button - Mobile Optimized */}
          <motion.button
            onClick={openFullscreen}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-2 md:top-3 right-2 md:right-3 p-2 md:p-3 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-all duration-200 opacity-70 md:opacity-0 md:group-hover:opacity-100 z-20 touch-manipulation"
            aria-label="View fullscreen"
          >
            <FaExpand className="w-3 h-3 md:w-4 md:h-4" />
          </motion.button>
        </div>

        {/* Thumbnail Navigation - Mobile Optimized */}
        {photos.length > 1 && photos.length <= 8 && (
          <div className="p-3 md:p-4 bg-neutral-900/30 backdrop-blur-md border-t border-neutral-600/20">
            <div className="flex gap-2 md:gap-3 justify-start md:justify-center overflow-x-auto scrollbar-hide pb-1">
              {photos.map((photo, index) => (
                <motion.button
                  key={index}
                  onClick={() => goToSlide(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex-shrink-0 w-12 h-9 md:w-16 md:h-12 rounded-lg md:rounded-xl overflow-hidden border-2 transition-all duration-300 touch-manipulation ${
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
                    sizes="(max-width: 768px) 48px, 64px"
                  />
                  {index === currentIndex && (
                    <div className="absolute inset-0 bg-accent/10" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Progress Indicators - Mobile Optimized */}
        {photos.length > 1 && photos.length > 8 && (
          <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 bg-black/30 backdrop-blur-sm rounded-full px-2 md:px-3 py-1.5 md:py-2">
            {photos.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300 touch-manipulation ${
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

      {/* Enhanced Fullscreen Modal - Mobile Optimized */}
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
              className="relative w-full h-full flex items-center justify-center p-2 md:p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Main Image */}
              <div className="relative max-w-[98vw] md:max-w-[95vw] max-h-[85vh] md:max-h-[90vh] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="relative cursor-grab active:cursor-grabbing"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    whileDrag={{ scale: 0.98 }}
                  >
                    <Image
                      src={photos[currentIndex].src}
                      alt={photos[currentIndex].alt}
                      width={1200}
                      height={800}
                      className="object-contain max-h-[85vh] md:max-h-[90vh] w-auto rounded-lg shadow-2xl pointer-events-none"
                      onLoad={() => setImageLoaded(true)}
                    />

                    {/* Loading indicator */}
                    {!imageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm rounded-lg">
                        <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Top Controls - Mobile Optimized */}
              <div className="absolute top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 flex justify-between items-start z-10">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                  <div className="bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 md:px-4 md:py-2 text-white text-xs md:text-sm font-medium">
                    {currentIndex + 1} / {photos.length}
                  </div>
                  {photos[currentIndex].caption && (
                    <div className="bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 md:px-4 md:py-2 text-white text-xs md:text-sm max-w-[200px] md:max-w-md truncate">
                      {photos[currentIndex].caption}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 md:gap-2">
                  <motion.button
                    onClick={downloadImage}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 md:p-3 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-all duration-200 touch-manipulation"
                    aria-label="Download image"
                  >
                    <FaDownload className="w-3 h-3 md:w-4 md:h-4" />
                  </motion.button>

                  <motion.button
                    ref={closeButtonRef}
                    onClick={closeFullscreen}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 md:p-3 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-all duration-200 touch-manipulation"
                    aria-label="Close fullscreen"
                  >
                    <FaTimes className="w-3 h-3 md:w-4 md:h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Navigation Arrows - Mobile Optimized */}
              {photos.length > 1 && (
                <>
                  <motion.button
                    onClick={goToPrevious}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-all duration-200 z-10 touch-manipulation"
                    aria-label="Previous photo"
                  >
                    <FaChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.button>

                  <motion.button
                    onClick={goToNext}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-all duration-200 z-10 touch-manipulation"
                    aria-label="Next photo"
                  >
                    <FaChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.button>
                </>
              )}

              {/* Bottom Thumbnail Strip - Mobile Optimized */}
              {photos.length > 1 && photos.length <= 10 && (
                <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md rounded-xl md:rounded-2xl p-2 md:p-3">
                  <div className="flex gap-1.5 md:gap-2 max-w-[90vw] md:max-w-[80vw] overflow-x-auto scrollbar-hide">
                    {photos.map((photo, index) => (
                      <motion.button
                        key={index}
                        onClick={() => goToSlide(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`relative flex-shrink-0 w-10 h-7 md:w-12 md:h-8 rounded-md md:rounded-lg overflow-hidden border-2 transition-all duration-200 touch-manipulation ${
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
                          sizes="(max-width: 768px) 40px, 48px"
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Indicators for many photos - Mobile Optimized */}
              {photos.length > 10 && (
                <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 md:px-4 md:py-2">
                  <div className="flex gap-1 max-w-[90vw] overflow-x-auto scrollbar-hide">
                    {photos.map((_, index) => (
                      <motion.button
                        key={index}
                        onClick={() => goToSlide(index)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full transition-all duration-200 flex-shrink-0 touch-manipulation ${
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
