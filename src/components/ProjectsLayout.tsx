'use client';

import Squares from '@/components/bits/Squares';
import ProjectsClient from '@/components/ProjectsClient';
import { ProjectCard } from '@/types/types';

export default function ProjectsLayout({ projects }: { projects: ProjectCard[] }) {
  return (
    <main className="flex-1 relative overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <Squares
          direction="diagonal"
          speed={0.2}
          squareSize={96}
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 px-6 py-10">
        <ProjectsClient projects={projects} />
      </div>
    </main>
  );
} 