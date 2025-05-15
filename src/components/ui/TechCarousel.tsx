"use client";

import { motion, useAnimationControls } from "framer-motion";
import {
  SiReact,
  SiTypescript,
  SiPython,
  SiJavascript,
  SiNextdotjs,
  SiTailwindcss,
  SiGit,
  SiDocker,
  SiNodedotjs,
  SiPostgresql,
  SiMongodb,
} from "react-icons/si";

const technologies = [
  { icon: SiReact, name: "React", color: "#61DAFB" },
  { icon: SiTypescript, name: "TypeScript", color: "#3178C6" },
  { icon: SiPython, name: "Python", color: "#3776AB" },
  { icon: SiJavascript, name: "JavaScript", color: "#F7DF1E" },
  { icon: SiNextdotjs, name: "Next.js", color: "#000000" },
  { icon: SiTailwindcss, name: "Tailwind", color: "#06B6D4" },
  { icon: SiGit, name: "Git", color: "#F05032" },
  { icon: SiDocker, name: "Docker", color: "#2496ED" },
  { icon: SiNodedotjs, name: "Node.js", color: "#339933" },
  { icon: SiPostgresql, name: "PostgreSQL", color: "#4169E1" },
  { icon: SiMongodb, name: "MongoDB", color: "#47A248" },
];

export default function TechCarousel() {
  const controls = useAnimationControls();

  return (
    <div
      className="w-full overflow-hidden py-8"
      onMouseEnter={() => controls.stop()}
      onMouseLeave={() => controls.start({ x: [0, -1920] })}
    >
      <motion.div
        animate={controls}
        initial={{ x: 0 }}
        transition={{
          x: {
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          },
        }}
        className="flex gap-12"
      >
        {[...technologies, ...technologies].map((tech, index) => (
          <div key={index} className="flex flex-col items-center group">
            <tech.icon
              className="w-12 h-12 transition-transform duration-300 group-hover:scale-110"
              style={{ color: tech.color }}
            />
            <span className="mt-2 text-sm text-muted-text group-hover:text-primary-text">
              {tech.name}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
