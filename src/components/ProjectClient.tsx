import Link from 'next/link';
import { Project } from '../lib/projects';

export default function ProjectClient({ projects }: { projects: Project[] }) {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Projects</h1>
      <div className="grid gap-6">
        {projects.map((project) => (
          <Link
            href={`/projects/${project.slug}`}
            key={project.slug}
            className="block p-6 rounded-lg bg-primary-bg border border-muted-text/20 
              hover:border-accent/50 transition-all duration-200
              shadow-sm hover:shadow-md"
          >
            <article>
              <h2 className="text-2xl font-semibold text-primary-text mb-2">
                {project.metadata.title}
              </h2>
              {project.metadata.date && (
                <p className="text-muted-text text-sm mb-3">
                  {new Date(project.metadata.date).toLocaleDateString()}
                </p>
              )}
              {project.metadata.description && (
                <p className="text-primary-text/80">
                  {project.metadata.description}
                </p>
              )}
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
} 