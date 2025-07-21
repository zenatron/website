"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  SiReact,
  SiTypescript,
  SiJavascript,
  SiPython,
  SiNextdotjs,
  SiTailwindcss,
  SiNodedotjs,
  SiGit,
  SiDocker,
  SiPostgresql,
  SiMongodb,
  SiAmazon,
  SiGooglecloud,
  SiKubernetes,
  SiRedis,
  SiGraphql,
  SiPrisma,
} from "react-icons/si";
import { FaDatabase, FaServer, FaMobile, FaCloud } from "react-icons/fa";

interface Skill {
  name: string;
  icon: React.ElementType;
  level: number; // 1-5 scale
  category: "frontend" | "backend" | "database" | "devops" | "mobile" | "ai";
  description: string;
}

const skills: Skill[] = [
  // Frontend
  { name: "React", icon: SiReact, level: 5, category: "frontend", description: "Building dynamic user interfaces" },
  { name: "TypeScript", icon: SiTypescript, level: 5, category: "frontend", description: "Type-safe JavaScript development" },
  { name: "Next.js", icon: SiNextdotjs, level: 5, category: "frontend", description: "Full-stack React framework" },
  { name: "Tailwind CSS", icon: SiTailwindcss, level: 5, category: "frontend", description: "Utility-first CSS framework" },
  { name: "JavaScript", icon: SiJavascript, level: 5, category: "frontend", description: "Core web development language" },
  
  // Backend
  { name: "Node.js", icon: SiNodedotjs, level: 4, category: "backend", description: "Server-side JavaScript runtime" },
  { name: "Python", icon: SiPython, level: 4, category: "backend", description: "Versatile programming language" },
  { name: "GraphQL", icon: SiGraphql, level: 3, category: "backend", description: "Query language for APIs" },
  { name: "Prisma", icon: SiPrisma, level: 4, category: "backend", description: "Next-generation ORM" },
  
  // Database
  { name: "PostgreSQL", icon: SiPostgresql, level: 4, category: "database", description: "Advanced relational database" },
  { name: "MongoDB", icon: SiMongodb, level: 3, category: "database", description: "NoSQL document database" },
  { name: "Redis", icon: SiRedis, level: 3, category: "database", description: "In-memory data structure store" },
  
  // DevOps
  { name: "Docker", icon: SiDocker, level: 4, category: "devops", description: "Containerization platform" },
  { name: "AWS", icon: SiAmazon, level: 3, category: "devops", description: "Cloud computing services" },
  { name: "Google Cloud", icon: SiGooglecloud, level: 3, category: "devops", description: "Cloud platform and services" },
  { name: "Kubernetes", icon: SiKubernetes, level: 2, category: "devops", description: "Container orchestration" },
  { name: "Git", icon: SiGit, level: 5, category: "devops", description: "Version control system" },
];

const categoryColors = {
  frontend: "rgba(59, 130, 246, 0.15)", // Blue
  backend: "rgba(16, 185, 129, 0.15)", // Green
  database: "rgba(245, 158, 11, 0.15)", // Orange
  devops: "rgba(139, 92, 246, 0.15)", // Purple
  mobile: "rgba(236, 72, 153, 0.15)", // Pink
  ai: "rgba(239, 68, 68, 0.15)", // Red
};

const categoryIcons = {
  frontend: SiReact,
  backend: FaServer,
  database: FaDatabase,
  devops: FaCloud,
  mobile: FaMobile,
  ai: SiPython,
};

export default function SkillsSection() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const categories = Array.from(new Set(skills.map(skill => skill.category)));
  const filteredSkills = selectedCategory 
    ? skills.filter(skill => skill.category === selectedCategory)
    : skills;

  const renderStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <motion.div
        key={i}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: i * 0.1, duration: 0.3 }}
        className={`w-3 h-3 rounded-full ${
          i < level ? "bg-accent" : "bg-neutral-600"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full border transition-all duration-200 ${
            selectedCategory === null
              ? "bg-accent text-white border-accent"
              : "bg-neutral-800/50 text-muted-text border-neutral-600/30 hover:border-accent/50"
          }`}
        >
          All Skills
        </motion.button>
        
        {categories.map((category) => {
          const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
          return (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full border transition-all duration-200 flex items-center gap-2 ${
                selectedCategory === category
                  ? "bg-accent text-white border-accent"
                  : "bg-neutral-800/50 text-muted-text border-neutral-600/30 hover:border-accent/50"
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </motion.button>
          );
        })}
      </div>

      {/* Skills Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredSkills.map((skill, index) => (
          <motion.div
            key={skill.name}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.02, y: -2 }}
            onHoverStart={() => setHoveredSkill(skill.name)}
            onHoverEnd={() => setHoveredSkill(null)}
            className="relative p-4 bg-neutral-800/25 backdrop-blur-md border border-neutral-600/30 rounded-2xl shadow-lg hover:border-accent/30 transition-all duration-300 cursor-pointer"
            style={{
              background: hoveredSkill === skill.name 
                ? `linear-gradient(135deg, ${categoryColors[skill.category]}, rgba(0,0,0,0.1))`
                : undefined
            }}
          >
            {/* Skill Icon and Name */}
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="text-2xl text-accent"
              >
                <skill.icon />
              </motion.div>
              <div>
                <h3 className="font-semibold text-primary-text">{skill.name}</h3>
                <p className="text-xs text-muted-text capitalize">{skill.category}</p>
              </div>
            </div>

            {/* Skill Level */}
            <div className="flex items-center gap-1 mb-2">
              {renderStars(skill.level)}
              <span className="ml-2 text-sm text-muted-text">
                {skill.level}/5
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-text leading-relaxed">
              {skill.description}
            </p>

            {/* Hover Effect Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredSkill === skill.name ? 0.1 : 0 }}
              className="absolute inset-0 bg-accent rounded-2xl pointer-events-none"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Skills Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center p-6 bg-neutral-800/25 backdrop-blur-md border border-neutral-600/30 rounded-2xl"
      >
        <h3 className="text-lg font-semibold mb-2 text-primary-text">
          Continuous Learning
        </h3>
        <p className="text-muted-text leading-relaxed">
          I'm passionate about staying current with the latest technologies and best practices. 
          Always exploring new tools and frameworks to deliver the best solutions.
        </p>
      </motion.div>
    </div>
  );
}
