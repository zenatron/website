'use client';

import { motion } from 'framer-motion';
import { FaGithub, FaGlobe, FaUnity, FaPython, FaReact } from 'react-icons/fa';
import { SiJupyter } from 'react-icons/si';
import Link from 'next/link';
import { Project } from '@/lib/projects';

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const githubProjects = projects.filter(p => p.links.github && !p.featured);
  const nonGithubProjects = projects.filter(p => !p.links.github || p.featured);

  // Helper function to identify data science projects
  const isDataProject = (project: Project) => 
    project.type === 'data' || 
    project.downloads?.some(d => d.type === 'notebook') ||
    project.tags.some(tag => ['python', 'jupyter', 'data-science', 'machine-learning'].includes(tag.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto">
      {/* Featured Projects */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Featured Projects</h2>
        <div className="grid grid-cols-1 gap-6">
          {projects.filter(p => p.featured).map((project, index) => (
            <FeaturedProjectCard key={project.title} project={project} index={index} />
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
              Data Science
            </h3>
            <div className="space-y-4">
              {nonGithubProjects.filter(isDataProject).map(project => (
                <ProjectCard key={project.title} project={project} />
              ))}
            </div>
          </div>

          {/* Web Projects */}
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaReact className="text-accent" />
              Web Development
            </h3>
            <div className="space-y-4">
              {nonGithubProjects.filter(p => p.type === 'web').map(project => (
                <ProjectCard key={project.title} project={project} />
              ))}
            </div>
          </div>

          {/* Game Projects */}
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaUnity className="text-accent" />
              Game Development
            </h3>
            <div className="space-y-4">
              {nonGithubProjects.filter(p => p.type === 'game').map(project => (
                <ProjectCard key={project.title} project={project} />
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
            Open Source Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {githubProjects.map(project => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const isNotebookProject = project.downloads?.some(d => d.type === 'notebook');

  const CardContent = () => (
    <>
      <h4 className="font-bold mb-2 group-hover:text-accent">{project.title}</h4>
      <p className="text-sm text-muted-text mb-3">{project.description}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {project.tags.map(tag => (
          <span key={tag} className="tag-bubble text-xs">{tag}</span>
        ))}
      </div>
      {!isNotebookProject && (
        <div className="flex gap-2">
          {project.links.live && (
            <a href={project.links.live} className="btn-nav text-xs">
              <FaGlobe className="mr-1" /> View
            </a>
          )}
          {project.links.github && (
            <a href={project.links.github} className="btn-nav text-xs">
              <FaGithub className="mr-1" /> Code
            </a>
          )}
        </div>
      )}
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {isNotebookProject && project.slug ? (
        <Link href={`/projects/${project.slug}`} className="bg-secondary-bg p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 block group">
          <CardContent />
        </Link>
      ) : (
        <div className="bg-secondary-bg p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
          <CardContent />
        </div>
      )}
    </motion.div>
  );
}

function FeaturedProjectCard({ project, index }: { project: Project, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-secondary-bg rounded-lg p-6 shadow-md 
        hover:shadow-lg transition-all duration-300"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {project.image && (
          <div className="relative w-full md:w-1/3 aspect-video md:aspect-square rounded-lg overflow-hidden">
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-2 group-hover:text-accent transition-colors">
            {project.title}
          </h3>
          <p className="text-muted-text mb-4">{project.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map(tag => (
              <span key={tag} className="tag-bubble">{tag}</span>
            ))}
          </div>
          <div className="flex gap-3">
            {project.links.live && (
              <a href={project.links.live} className="btn btn-primary btn-small">
                <FaGlobe /> View Live
              </a>
            )}
            {project.links.github && (
              <a href={project.links.github} className="btn btn-secondary btn-small">
                <FaGithub /> Source
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
} 