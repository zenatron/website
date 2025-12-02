"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Achievement type
type Achievement = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

// Escalating messages based on how long they've been here
const getMessageForTime = (seconds: number): string => {
  if (seconds < 5) return "This page doesn't exist. But you do. That's nice.";
  if (seconds < 10) return "Still here? The page isn't coming back, I promise.";
  if (seconds < 20) return "Okay, you're committed. I respect that.";
  if (seconds < 30) return "At this point you're just seeing what happens next, aren't you?";
  if (seconds < 45) return "Fun fact: The average person leaves a 404 page in under 5 seconds. You're built different.";
  if (seconds < 60) return "One minute of your life, spent here. No refunds.";
  if (seconds < 90) return "You could've made a sandwich by now. Just saying.";
  if (seconds < 120) return "I'm genuinely impressed. And slightly concerned.";
  if (seconds < 180) return "Almost 3 minutes. You're in the top 0.01% of 404 page visitors.";
  if (seconds < 300) return "At five minutes, I'll tell you a secret...";
  if (seconds < 301) return "The secret is: there is no secret. Go outside.";
  return "You've been here for " + Math.floor(seconds / 60) + " minutes. We should probably both move on.";
};

// Easter egg: different 404 "error codes"
const errorCodes = [
  "404",
  "4️⃣0️⃣4️⃣",
  "0x194",
  "ENOENT",
  "¯\\_(ツ)_/¯",
  "NULL",
  "undefined",
  "NaN",
];

export default function NotFoundPage() {
  const [seconds, setSeconds] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [errorIndex, setErrorIndex] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());

  // Unlock an achievement (only once)
  const unlockAchievement = (achievement: Achievement) => {
    if (!unlockedIds.has(achievement.id)) {
      setUnlockedIds((prev) => new Set(prev).add(achievement.id));
      setAchievements((prev) => [...prev, achievement]);
    }
  };

  // Dismiss an achievement toast
  const dismissAchievement = (id: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Swap favicon to skull emoji on 404 page
  useEffect(() => {
    const originalFavicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const originalHref = originalFavicon?.href;
    
    // Create emoji favicon
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = '28px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💀', 16, 18);
      
      const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]') || document.createElement('link');
      link.rel = 'icon';
      link.href = canvas.toDataURL();
      if (!document.querySelector('link[rel="icon"]')) {
        document.head.appendChild(link);
      }
    }
    
    // Restore original on unmount
    return () => {
      if (originalFavicon && originalHref) {
        originalFavicon.href = originalHref;
      }
    };
  }, []);

  // Check for time-based achievement
  useEffect(() => {
    if (seconds >= 120) {
      unlockAchievement({
        id: "time-enthusiast",
        icon: "🏆",
        title: "404 Enthusiast",
        description: "Spent 2 minutes on a page that doesn't exist",
      });
    }
  }, [seconds]);

  // Check for click-based achievement
  useEffect(() => {
    if (clicks >= 100) {
      unlockAchievement({
        id: "button-masher",
        icon: "🖱️",
        title: "Button Masher",
        description: "Clicked the 404 text 100 times",
      });
    }
  }, [clicks]);

  const message = useMemo(() => getMessageForTime(seconds), [seconds]);

  const handleErrorClick = () => {
    setClicks((c) => c + 1);
    setErrorIndex((i) => (i + 1) % errorCodes.length);
  };

  // After 10 clicks, show a special message
  const clickMessage = clicks >= 10 
    ? "You clicked it " + clicks + " times. It's not a button. Well, technically it is, but..." 
    : clicks >= 5 
    ? "(" + clicks + " clicks... keep going?)" 
    : null;

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />

      {/* Achievement Toasts */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative flex items-center gap-3 px-4 py-3 bg-primary-bg border border-accent/30 rounded-lg shadow-lg shadow-accent/10 min-w-[280px]"
            >
              <span className="text-2xl">{achievement.icon}</span>
              <div className="flex-1">
                <p className="text-xs text-accent font-medium uppercase tracking-wider">Achievement Unlocked</p>
                <p className="text-sm text-primary-text font-semibold">{achievement.title}</p>
                <p className="text-xs text-muted-text">{achievement.description}</p>
              </div>
              <button
                onClick={() => dismissAchievement(achievement.id)}
                className="absolute top-2 right-2 text-muted-text hover:text-primary-text transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 space-y-6">
        {/* Clickable 404 that cycles through error codes */}
        <motion.h1 
          className="text-8xl font-extrabold cursor-pointer select-none"
          onClick={handleErrorClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, rotate: [0, -5, 5, 0] }}
          animate={{ 
            color: seconds > 60 ? ["#7c8aff", "#ff7c8a", "#7c8aff"] : "#7c8aff",
          }}
          transition={{ 
            color: { duration: 2, repeat: Infinity },
          }}
        >
          {errorCodes[errorIndex]}
        </motion.h1>

        {clickMessage && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-accent"
          >
            {clickMessage}
          </motion.p>
        )}

        {/* Escalating message */}
        <motion.p 
          key={message}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg md:text-xl text-muted-text max-w-md"
        >
          {message}
        </motion.p>

        {/* Time counter */}
        <div className="text-sm text-muted-text space-y-1">
          <p>
            Time on this page: <span className="tabular-nums text-accent font-mono">{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</span>
          </p>
          {seconds >= 30 && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-muted-text/60"
            >
              (That&apos;s {seconds.toLocaleString()} seconds you&apos;ll never get back)
            </motion.p>
          )}
        </div>

        {/* Call to Action - grows over time */}
        <motion.div
          animate={{ 
            scale: 1 + (seconds * 0.01),
          }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <Link 
            href="/" 
            className="btn btn-primary inline-block"
          >
            {seconds < 30 ? "Go Back Home" : seconds < 60 ? "Please Go Home" : "I'm Begging You"}
          </Link>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
