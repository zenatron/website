import ProjectsGrid from '@/components/ProjectsGrid';
import ProjectsHeader from '@/components/ProjectsHeader';
import { getGithubRepos } from '@/lib/github';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAllProjects } from '@/lib/projects';

export default async function ProjectsPage() {
  const githubProjects = await getGithubRepos();
  const dataProjects = await getAllProjects();

  console.log('Data projects loaded:', dataProjects.length);
  console.log('GitHub projects loaded:', githubProjects.length);

  const allProjects = [...dataProjects, ...githubProjects];

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