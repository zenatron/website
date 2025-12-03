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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoPlay = () => {
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % QUOTES.length);
    }, 6000);
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, []);

  const goToIndex = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    // Reset autoplay timer
    stopAutoPlay();
    startAutoPlay();
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      // Swiped left - go next
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % QUOTES.length);
      stopAutoPlay();
      startAutoPlay();
    } else if (info.offset.x > threshold) {
      // Swiped right - go prev
      setDirection(-1);
      setCurrentIndex((prev) => (prev - 1 + QUOTES.length) % QUOTES.length);
      stopAutoPlay();
      startAutoPlay();
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
    <div className="relative min-h-[180px] md:min-h-[160px] touch-pan-y">
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
          className="relative cursor-grab active:cursor-grabbing"
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

      {/* Dots indicator */}
      <div className="mt-8 flex justify-center gap-2">
        {QUOTES.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goToIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-6 bg-accent"
                : "w-1.5 bg-white/20 hover:bg-white/40"
            }`}
            aria-label={`Go to quote ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
