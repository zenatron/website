'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import Squares from '@/components/bits/Squares';
import InfiniteMenu from '@/components/bits/InfiniteMenu';
import { techItems } from '@/lib/techItems';
import GradientText from '@/components/bits/GradientText';
import VariableProximity from '@/components/bits/VariableProximity';
import { useRef } from 'react';


export default function AboutPage() {
  const containerRef = useRef(null);

  return (
    <div className="min-h-screen flex flex-col bg-primary-bg text-primary-text">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        <section className="flex flex-col items-center justify-center text-center animate-fade-in mb-10 z-10">
          <div
            ref={containerRef}
            style={{ 
              position: 'relative',
              minHeight: '100px',
              width: '100%',
              padding: '10px'
            }}
          >
            <GradientText
              animationSpeed={24}
            >
              <VariableProximity
                label="About"
                className="text-6xl md:text-6xl font-bold"
                fromFontVariationSettings="'wght' 100, 'opsz' 8"
                toFontVariationSettings="'wght' 900, 'opsz' 48"
                containerRef={containerRef as unknown as React.RefObject<HTMLElement>}
                radius={100}
                falloff="linear"
              />
            </GradientText>
          </div>
          <p className="text-lg md:text-xl text-muted-text leading-relaxed">
            {"Learn more about me and my work."}
          </p>
        </section>
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
          className="z-10 w-full max-w-4xl space-y-8"
        >
          <div className="w-[400px] md:w-[600px] mx-auto border border-gray-600/50 rounded-xl overflow-hidden">
            <section className="w-full h-full relative">
              <InfiniteMenu items={techItems} />
            </section>
          </div>

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