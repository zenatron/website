'use client';

import GradientText from './bits/GradientText';
import VariableProximity from './bits/VariableProximity';
import { useRef } from 'react';

export default function ProjectsHeader() {
  const containerRef = useRef(null);

  return (
    <section className="flex flex-col items-center justify-center text-center animate-fade-in mb-10">
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
            label="Projects"
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
        {"Exploring software engineering through personal projects, technical writing, and open-source contributions."}
      </p>
    </section>
  );
} 