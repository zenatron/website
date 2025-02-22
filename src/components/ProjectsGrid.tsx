'use client';

import { FaGithub, FaUnity, FaReact } from 'react-icons/fa';
import { SiJupyter } from 'react-icons/si';
import { ProjectCard as ProjectCardType } from '@/types/types';
import ProjectCard from './ProjectCard';

export default function ProjectsGrid({ projects }: { projects: ProjectCardType[] }) {
  const githubProjects = projects.filter(p => p.links.github && !p.featured);
  const nonGithubProjects = projects.filter(p => !p.links.github || p.featured);

  // Randomly select 3 projects for featuring
  const featuredProjects = [...projects]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  // Helper function to identify data science projects
  const isDataProject = (project: ProjectCardType) => 
    project.metadata.type === 'data' || 
    project.downloads?.some(d => d.type === 'notebook') ||
    project.metadata.tags?.some(tag => ['python', 'jupyter', 'data-science', 'machine-learning'].includes(tag.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto">
      {/* Featured Projects */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Featured Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredProjects.map((project) => (
            <ProjectCard 
              key={project.metadata.title} 
              project={project}
            />
          ))}
        </div>
      </section>

      {/* Main Project Categories */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Data Science Projects */}
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <SiJupyter className="text-accent" />
              {"Data Science"}
            </h3>
            <div className="space-y-4">
              {nonGithubProjects.filter(isDataProject).map((project) => (
                <ProjectCard key={project.metadata.title} project={project} />
              ))}
            </div>
          </div>

          {/* Web Projects */}
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaReact className="text-accent" />
              {"Web Development"}
            </h3>
            <div className="space-y-4">
              {nonGithubProjects.filter(p => p.metadata.type === 'web').map((project) => (
                <ProjectCard key={project.metadata.title} project={project} />
              ))}
            </div>
          </div>

          {/* Game Projects */}
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaUnity className="text-accent" />
              {"Game Development"}
            </h3>
            <div className="space-y-4">
              {nonGithubProjects.filter(p => p.metadata.type === 'game').map((project) => (
                <ProjectCard key={project.metadata.title} project={project} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GitHub Projects */}
      {githubProjects.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
            <FaGithub className="text-accent" />
            {"GitHub Projects"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {githubProjects.map((project) => (
              <ProjectCard key={project.metadata.title} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}