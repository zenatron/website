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
      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setFilterCategory(null)}
          className={`px-4 py-2 rounded-full border transition-all duration-200 ${
            filterCategory === null
              ? "bg-accent text-white border-accent"
              : "bg-neutral-800/50 text-muted-text border-neutral-600/30 hover:border-accent/50"
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
            className={`px-4 py-2 rounded-full border transition-all duration-200 ${
              filterCategory === category
                ? "bg-accent text-white border-accent"
                : "bg-neutral-800/50 text-muted-text border-neutral-600/30 hover:border-accent/50"
            }`}
          >
            {categoryLabels[category as keyof typeof categoryLabels]}
          </motion.button>
        ))}
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
            className="relative p-6 bg-neutral-800/40 backdrop-blur-sm border border-neutral-600/40 rounded-2xl shadow-md hover:border-accent/40 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            {/* Background Gradient */}
            <div 
              className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `linear-gradient(135deg, ${hobby.color}, transparent 70%)`
              }}
            />

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
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="border-t border-neutral-600/30 pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-accent mb-2">Details:</h4>
                  <ul className="space-y-1">
                    {hobby.details.map((detail, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="text-sm text-muted-text flex items-center gap-2"
                      >
                        <div className="w-1.5 h-1.5 bg-accent rounded-full" />
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

      {/* Fun Fact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center p-6 bg-gradient-to-r from-accent/5 to-purple-500/5 backdrop-blur-sm border border-accent/10 rounded-2xl"
      >
        <h3 className="text-lg font-semibold mb-2 text-primary-text">
          Life Philosophy
        </h3>
        <div className="text-center flex flex-col items-center gap-4">
          <p className="text-muted-text leading-relaxed">
            {"\"The best way to predict the future is to create it. Whether through code, art, or adventure, I believe in building experiences that matter and inspire others to do the same.\""}
          </p>
          <Link
            href={"/principles"}
            className="btn btn-primary inline-block"
          >
            {"Read My Principles"}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
