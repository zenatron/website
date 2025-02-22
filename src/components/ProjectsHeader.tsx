'use client';

import { motion } from 'framer-motion';

export default function ProjectsHeader() {
  return (
    <>
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-center bg-gradient-to-r from-accent via-purple-500 to-pink-500 text-transparent bg-clip-text p-2"
      >
        {"Projects"}
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center text-muted-text text-lg max-w-2xl mx-auto mb-12"
      >
        {"A collection of my work across web dev, data science, and game dev."}
      </motion.p>
    </>
  );
} 