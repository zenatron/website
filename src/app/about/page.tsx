'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { FiCode, FiCommand } from 'react-icons/fi';
import { TypeAnimation } from 'react-type-animation';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-primary-bg text-primary-text">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, ease: 'linear' }}
            className="absolute w-full h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="z-10 max-w-3xl w-full"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-8 relative inline-flex items-center justify-center gap-4">
            <FiCode />
            {"About Me"}
            <FiCommand />
        </h2>
          <div className="space-y-6">
            <p className="text-lg md:text-xl text-muted-text leading-relaxed">
              {"Hi, I'm Philip Vishnevsky, a passionate software developer and tech enthusiast."}
            </p>
            <TypeAnimation
              sequence={[
                'I love exploring cutting-edge technologies...',
                2000,
                '...and applying them to solve real-world problems.',
                2000,
              ]}
              wrapper="p"
              cursor={true}
              repeat={Infinity}
              className="text-lg md:text-xl text-muted-text leading-relaxed mb-6"
            />
            <p className="text-lg md:text-xl text-muted-text leading-relaxed">
              {"Beyond coding, I enjoy tinkering with computers, working out, and exploring creative hobbies. My goal is to constantly learn, grow, and share my knowledge with others."}
            </p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}