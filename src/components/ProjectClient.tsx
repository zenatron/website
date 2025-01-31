import Link from 'next/link';
import { Project } from '../lib/projects';

export default function ProjectClient({ projects }: { projects: Project[] }) {
  // Helper function to format date consistently
  const formatDate = (dateString: string) => {
    // Create date in UTC to avoid timezone issues
    const date = new Date(dateString + 'T00:00:00Z');
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Projects</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group bg-secondary-bg p-6 rounded-lg shadow-md 
              hover:shadow-lg hover:scale-105 transition-all transform relative"
          >
            {/* Spotlight effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent 
              via-accent/10 to-accent/20 opacity-0 group-hover:opacity-100 
              transition-opacity rounded-lg pointer-events-none">
            </div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2 text-primary-text 
                group-hover:text-accent transition-colors">
                {project.metadata.title}
              </h2>
              {project.metadata.date && (
                <p className="text-muted-text text-sm mb-4">
                  {formatDate(project.metadata.date)}
                </p>
              )}
              {project.metadata.description && (
                <p className="text-muted-text line-clamp-3">
                  {project.metadata.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 