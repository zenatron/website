'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { FiCode } from 'react-icons/fi';
import Squares from '@/components/bits/Squares';
import InfiniteMenu from '@/components/bits/InfiniteMenu';
import { techItems } from '@/lib/techItems';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-primary-bg text-primary-text">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Squares
            direction="diagonal"
            speed={0.5}
            borderColor="#333"
            squareSize={40}
            hoverFillColor="#222"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 w-full max-w-4xl space-y-12"
        >
          <section className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold flex items-center justify-center gap-4">
              <FiCode className="text-accent" />
              About Me
            </h1>
            <p className="text-xl md:text-2xl text-muted-text">
              Software Developer & Tech Enthusiast
            </p>
          </section>
          
          <section className="h-[600px] relative">
            <InfiniteMenu items={techItems} />
          </section>

          <section className="space-y-8 max-w-2xl mx-auto">
            <p className="text-lg md:text-xl text-muted-text leading-relaxed">
              {"Hi, I'm Philip Vishnevsky, a passionate software developer and tech enthusiast. I love exploring cutting-edge technologies and applying them to solve real-world problems."}
            </p>
            <p className="text-lg md:text-xl text-muted-text leading-relaxed">
              {"Beyond coding, I enjoy tinkering with computers, working out, and exploring creative hobbies. My goal is to constantly learn, grow, and share my knowledge with others."}
            </p>
          </section>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}