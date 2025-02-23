'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaCode, FaBlog } from 'react-icons/fa';
import { MdPerson } from 'react-icons/md';
import { useRef } from 'react';
import Link from 'next/link';
import VariableProximity from '@/components/bits/VariableProximity';
import GradientText from '@/components/bits/GradientText';

export default function HomePage() {
  
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen flex flex-col bg-primary-bg text-primary-text">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-6">
        {/* Hero Section */}
        <section className="space-y-2 max-w-3xl animate-fade-in">
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
                label="Welcome to My Portfolio!"
                className="text-4xl md:text-6xl font-bold"
                fromFontVariationSettings="'wght' 100, 'opsz' 8"
                toFontVariationSettings="'wght' 900, 'opsz' 48"
                containerRef={containerRef as unknown as React.RefObject<HTMLElement>}
                radius={100}
                falloff="linear"
              />
            </GradientText>
          </div>
          <p className="text-lg md:text-xl text-muted-text leading-relaxed">
              {"Showcasing my CS projects, blogs, and more."}
          </p>
        </section>


        {/* Icon Section */}
        <section className="mt-12 grid gap-6 sm:gap-8 sm:grid-cols-1 md:grid-cols-3 px-4 sm:px-8 lg:px-0">
          <Link href="/projects">
            <div className="group flex flex-col items-center p-4 sm:p-6 rounded-lg shadow-lg bg-secondary-bg hover:bg-primary-bg transition-all duration-300 transform hover:-translate-y-2 min-h-[10rem]">
              <FaCode className="text-3xl sm:text-4xl text-accent mb-3 sm:mb-4 group-hover:animate-bounce" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">Projects</h3>
              <p className="text-muted-text text-md text-center">
                {"Explore my SWE projects and case studies."}
              </p>
            </div>
          </Link>
          <Link href="/blog">
            <div className="group flex flex-col items-center p-4 sm:p-6 rounded-lg shadow-lg bg-secondary-bg hover:bg-primary-bg transition-all duration-300 transform hover:-translate-y-2 min-h-[10rem]">
              <FaBlog className="text-3xl sm:text-4xl text-accent mb-3 sm:mb-4 group-hover:animate-bounce" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">Blog</h3>
              <p className="text-muted-text text-md text-center">
                {"Read my thoughts on tech, programming, and more."}
              </p>
            </div>
          </Link>
          <Link href="/about">
            <div className="group flex flex-col items-center p-4 sm:p-6 rounded-lg shadow-lg bg-secondary-bg hover:bg-primary-bg transition-all duration-300 transform hover:-translate-y-2 min-h-[10rem]">
              <MdPerson className="text-3xl sm:text-4xl text-accent mb-3 sm:mb-4 group-hover:animate-bounce" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">About Me</h3>
              <p className="text-muted-text text-md text-center">
                {"Learn more about me, my background, and my goals."}
              </p>
            </div>
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}