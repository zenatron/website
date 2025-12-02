"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % QUOTES.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const currentQuote = QUOTES[currentIndex];

  return (
    <div className="relative min-h-[180px] md:min-h-[160px]">
      <AnimatePresence mode="wait">
        <motion.blockquote
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <span className="absolute -top-4 left-0 text-6xl leading-none text-accent/20">
            &ldquo;
          </span>
          <p className="text-2xl font-medium leading-relaxed tracking-tight text-primary-text md:text-3xl">
            {currentQuote.text}
          </p>
          <footer className="mt-6 text-sm text-muted-text">
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
            onClick={() => setCurrentIndex(index)}
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
