"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

const QUOTES = [
  {
    text: "The best code is the code you don't have to think about at 2am.",
    attribution: "me, mass apply reject era",
  },
  {
    text: "Ship it. Fix it later. Unless it's auth. Don't ship broken auth.",
    attribution: "me, learning the hard way",
  },
  {
    text: "The goal isn't to write clever code. It's to write code the next person can delete.",
    attribution: "me, after inheriting spaghetti",
  },
  {
    text: "Good tools disappear. You only notice the bad ones.",
    attribution: "me, after switching IDEs",
  },
  {
    text: "Keep your friends rich and your enemies rich, and wait to find out which is which.",
    attribution: "Ultron",
  },
  {
    text: "Every expert was once a beginner who refused to quit.",
    attribution: "probably a poster somewhere",
  },
  {
    text: "Make it work, make it right, make it fast. In that order.",
    attribution: "Kent Beck (paraphrased)",
  },
];

export default function QuoteCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoPlay = () => {
    if (isPaused) return;
    setProgress(0);
    
    // Update progress every 60ms for smooth animation
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + (100 / (6000 / 60)); // 6000ms total, update every 60ms
      });
    }, 60);
    
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % QUOTES.length);
      setProgress(0);
    }, 6000);
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  useEffect(() => {
    if (!isPaused) {
      startAutoPlay();
    }
    return () => stopAutoPlay();
  }, [isPaused]);

  // Pause on hover/focus for accessibility
  const handleMouseEnter = () => {
    setIsPaused(true);
    stopAutoPlay();
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const goToIndex = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setProgress(0);
    // Reset autoplay timer
    stopAutoPlay();
    if (!isPaused) startAutoPlay();
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      // Swiped left - go next
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % QUOTES.length);
      setProgress(0);
      stopAutoPlay();
      if (!isPaused) startAutoPlay();
    } else if (info.offset.x > threshold) {
      // Swiped right - go prev
      setDirection(-1);
      setCurrentIndex((prev) => (prev - 1 + QUOTES.length) % QUOTES.length);
      setProgress(0);
      stopAutoPlay();
      if (!isPaused) startAutoPlay();
    }
  };

  const currentQuote = QUOTES[currentIndex];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div
      className="relative touch-pan-y flex flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      <div className="min-h-[160px] md:min-h-[140px] flex items-start">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.blockquote
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="relative cursor-grab active:cursor-grabbing w-full"
          >
            <span className="absolute -top-4 left-0 text-6xl leading-none text-accent/20">
              &ldquo;
            </span>
            <p className="text-2xl font-medium leading-relaxed tracking-tight text-primary-text md:text-3xl select-none">
              {currentQuote.text}
            </p>
            <footer className="mt-6 text-sm text-muted-text select-none">
              — {currentQuote.attribution}
            </footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>

      {/* Dots indicator */}
      <div className="mt-6 flex justify-center gap-2">
        {QUOTES.map((_, index) => (
          <div
            key={index}
            className="relative h-1.5 rounded-full transition-all duration-300 overflow-hidden"
            style={{
              width: index === currentIndex ? "24px" : "6px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            }}
            aria-label={`Quote ${index + 1}`}
          >
            {index === currentIndex && (
              <div
                className="absolute inset-0 bg-accent rounded-full transition-all duration-75 ease-linear"
                style={{
                  width: `${progress}%`,
                  transformOrigin: "left",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
