import ProjectsLayout from '@/components/layouts/ProjectsLayout';
import { getGithubRepos } from '@/lib/github';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAllProjects } from '@/lib/projects';
import BackToTopButton from '@/components/BackToTopButton';
export default async function ProjectsPage() {
  const githubProjects = await getGithubRepos();
  const dataProjects = await getAllProjects();
  const allProjects = [...dataProjects, ...githubProjects];

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Header />
      <ProjectsLayout projects={allProjects} />
      <Footer />
      <BackToTopButton />
    </div>
  );
}