'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FaCode, FaBlog } from 'react-icons/fa';
import { MdPerson } from 'react-icons/md';
import { useRef } from 'react';
import VariableProximity from '@/components/bits/VariableProximity';
import GradientText from '@/components/bits/GradientText';
import LetterGlitch from '@/components/bits/LetterGlitch';
import GlassCard from '@/components/GlassCard';

export default function HomePage() {
  
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen flex flex-col bg-primary-bg text-primary-text">
      {/* Wrapper div to contain the fixed background */}
      <div className="fixed inset-0 w-screen h-screen">
        <LetterGlitch
          glitchColors={['#1a1a1a', '#4a4a4a', '#808080']}
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
        />
      </div>

      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black/50" />

      {/* Scrollable content */}
      <div className="relative z-20 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
          {/* Hero Section */}
          <section className="max-w-4xl animate-fade-in py-12">
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
                transparent={true}
              >
                <VariableProximity
                  label="Hi, I'm Phil!"
                  className="text-6xl md:text-7xl font-bold"
                  fromFontVariationSettings="'wght' 100, 'opsz' 8"
                  toFontVariationSettings="'wght' 900, 'opsz' 48"
                  containerRef={containerRef as unknown as React.RefObject<HTMLElement>}
                  radius={100}
                  falloff="linear"
                />
              </GradientText>
            </div>
            <p className="text-lg md:text-xl text-muted-text leading-relaxed">
              {"I like to make stuff."}
            </p>
          </section>

          {/* Icon Section */}
          <section className="mt-12 grid gap-4 md:gap-6 grid-cols-3 mx-auto max-w-2xl">
            <GlassCard href="/projects" className="p-4 md:p-10 h-full">
              <div className="group flex flex-col items-center justify-center h-full">
                <FaCode className="text-3xl md:text-4xl text-accent mb-2 group-hover:animate-bounce" />
                <h3 className="text-md md:text-lg font-bold">Projects</h3>
              </div>
            </GlassCard>
            <GlassCard href="/blog" className="p-4 md:p-10 h-full">
              <div className="group flex flex-col items-center justify-center h-full">
                <FaBlog className="text-3xl md:text-4xl text-accent mb-2 group-hover:animate-bounce" />
                <h3 className="text-md md:text-lg font-bold">Blog</h3>
              </div>
            </GlassCard>
            <GlassCard href="/about" className="p-4 md:p-10 h-full">
              <div className="group flex flex-col items-center justify-center h-full">
                  <MdPerson className="text-3xl md:text-4xl text-accent mb-2 group-hover:animate-bounce" />
                  <h3 className="text-md md:text-lg font-bold">About</h3>
                </div>
            </GlassCard>
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}