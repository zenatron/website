"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  FaGamepad,
  FaBook,
  FaHiking,
  FaCoffee,
  FaPlane,
} from "react-icons/fa";
import { MdOutlineSportsGymnastics } from "react-icons/md";
import Link from "next/link";

interface Hobby {
  name: string;
  icon: React.ElementType;
  description: string;
  category: "creative" | "active" | "intellectual" | "social";
  color: string;
  details: string[];
}

const hobbies: Hobby[] = [
  {
    name: "Game Development",
    icon: FaGamepad,
    description: "Creating interactive experiences and exploring game mechanics",
    category: "creative",
    color: "rgba(59, 130, 246, 0.2)",
    details: ["Unity & Unreal Engine", "Indie game prototypes", "Game jam participant"]
  },
  {
    name: "Reading",
    icon: FaBook,
    description: "Diving deep into sci-fi, tech, and philosophy books",
    category: "intellectual",
    color: "rgba(16, 185, 129, 0.2)",
    details: ["Sci-fi novels", "Tech biographies", "Philosophy & ethics"]
  },
  {
    name: "Hiking",
    icon: FaHiking,
    description: "Exploring nature trails and mountain peaks",
    category: "active",
    color: "rgba(34, 197, 94, 0.2)",
    details: ["Backpacking", "Weekend trail hikes", "Mountain climbing"]
  },
  {
    name: "Tea Brewing",
    icon: FaCoffee,
    description: "Trying every tea in the world!",
    category: "creative",
    color: "rgba(161, 98, 7, 0.2)",
    details: ["Jasmine", "Earl Grey", "Oolong", "Pu-erh", "Matcha"]
  },
  {
    name: "Weightlifting",
    icon: MdOutlineSportsGymnastics,
    description: "Building muscle and staying healthy!",
    category: "active",
    color: "rgba(99, 102, 241, 0.2)",
    details: ["Strength training", "Running", "Calisthenics"]
  },
  {
    name: "Travel",
    icon: FaPlane,
    description: "Exploring new cultures and places around the world!",
    category: "social",
    color: "rgba(14, 165, 233, 0.2)",
    details: ["Cultural exploration", "Food adventures", "Local experiences"]
  }
];

const categoryLabels = {
  creative: "Creative",
  active: "Active",
  intellectual: "Intellectual", 
  social: "Social"
};

export default function HobbiesSection() {
  const [selectedHobby, setSelectedHobby] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(hobbies.map(hobby => hobby.category)));
  const filteredHobbies = filterCategory 
    ? hobbies.filter(hobby => hobby.category === filterCategory)
    : hobbies;

  return (
    <div className="space-y-8">
      {/* Category Filter - Glass Card */}
      <div className="flex justify-center">
        <div className="inline-flex flex-wrap gap-2 p-3 bg-neutral-800/25 backdrop-blur-md border border-neutral-600/30 rounded-2xl shadow-lg">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilterCategory(null)}
            className={`px-4 py-2 rounded-xl border transition-all duration-200 ${
              filterCategory === null
                ? "bg-accent text-white border-accent shadow-lg"
                : "bg-neutral-800/40 backdrop-blur-sm text-muted-text border-neutral-600/40 hover:border-accent/50 hover:bg-neutral-700/50"
            }`}
          >
            All Hobbies
          </motion.button>

          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterCategory(category)}
              className={`px-4 py-2 rounded-xl border transition-all duration-200 ${
                filterCategory === category
                  ? "bg-accent text-white border-accent shadow-lg"
                  : "bg-neutral-800/40 backdrop-blur-sm text-muted-text border-neutral-600/40 hover:border-accent/50 hover:bg-neutral-700/50"
              }`}
            >
              {categoryLabels[category as keyof typeof categoryLabels]}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Hobbies Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredHobbies.map((hobby, index) => (
          <motion.div
            key={hobby.name}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.03, y: -5 }}
            onClick={() => setSelectedHobby(selectedHobby === hobby.name ? null : hobby.name)}
            className="relative p-6 bg-neutral-800/25 backdrop-blur-md border border-neutral-600/30 rounded-3xl shadow-lg hover:border-accent/40 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
          >
            {/* Background Gradient */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `linear-gradient(135deg, ${hobby.color}, transparent 60%)`
              }}
            />

            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50" />

            {/* Content */}
            <div className="relative z-10">
              {/* Icon and Title */}
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl text-accent"
                >
                  <hobby.icon />
                </motion.div>
                <div>
                  <h3 className="font-bold text-lg text-primary-text">{hobby.name}</h3>
                  <span className="text-xs text-muted-text capitalize bg-neutral-700/50 px-2 py-1 rounded-full">
                    {hobby.category}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-text leading-relaxed mb-4">
                {hobby.description}
              </p>

              {/* Expandable Details */}
              <motion.div
                initial={false}
                animate={{
                  height: selectedHobby === hobby.name ? "auto" : 0,
                  opacity: selectedHobby === hobby.name ? 1 : 0
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-4 bg-neutral-800/30 backdrop-blur-sm border border-neutral-600/20 rounded-2xl">
                  <h4 className="text-sm font-semibold text-accent mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    What I Love About It
                  </h4>
                  <ul className="space-y-2">
                    {hobby.details.map((detail, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="text-sm text-muted-text flex items-center gap-3 p-2 bg-neutral-700/20 rounded-lg"
                      >
                        <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                        {detail}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Expand Indicator */}
              <motion.div
                animate={{ rotate: selectedHobby === hobby.name ? 180 : 0 }}
                className="absolute bottom-4 right-4 text-muted-text"
              >
                ▼
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Life Philosophy - Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative p-8 bg-neutral-800/25 backdrop-blur-md border border-neutral-600/30 rounded-3xl shadow-lg overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-purple-500/5 to-transparent" />

        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50" />

        <div className="relative z-10 text-center">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-xl font-semibold mb-6 text-primary-text flex items-center justify-center gap-3"
          >
            <div className="w-2 h-2 bg-accent rounded-full" />
            Life Philosophy
            <div className="w-2 h-2 bg-accent rounded-full" />
          </motion.h3>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col items-center gap-6"
          >
            <blockquote className="text-muted-text leading-relaxed text-lg italic max-w-3xl">
              "The best way to predict the future is to create it. Whether through code, art, or adventure, I believe in building experiences that matter and inspire others to do the same."
            </blockquote>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/principles"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent/10 hover:bg-accent/20 border border-accent/30 hover:border-accent/50 rounded-xl text-accent font-medium transition-all duration-200 backdrop-blur-sm"
              >
                Read My Principles
                <div className="w-1.5 h-1.5 bg-accent rounded-full" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
