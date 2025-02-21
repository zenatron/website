import ProjectsGrid from '@/components/ProjectsGrid';
import ProjectsHeader from '@/components/ProjectsHeader';
import { getGithubRepos } from '@/lib/github';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import projectMetadata from '@/content/projects/metadata.json';
import { Project } from '@/lib/projects';

export default async function ProjectsPage() {
  const githubProjects = await getGithubRepos();

  // Convert metadata.json projects to Project type
  const jupyterProjects: Project[] = Object.entries(projectMetadata).map(([slug, data]) => ({
    title: data.title,
    description: data.description || '',
    type: 'data',
    tags: ['jupyter', 'python', 'data-science'],
    links: {},
    downloads: data.downloads,
    slug: slug,
  }));

  const allProjects = [...jupyterProjects, ...githubProjects];

  return (
    <div className="min-h-screen flex flex-col bg-primary-bg text-primary-text">
      <Header />
      <main className="flex-1 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <ProjectsHeader />
          <ProjectsGrid projects={allProjects} />
        </div>
      </main>
      <Footer />
    </div>
  );
}