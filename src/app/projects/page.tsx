import { getAllProjects } from '../../lib/projects';
import ProjectClient from '../../components/ProjectClient';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="min-h-screen flex flex-col bg-primary-bg text-primary-text">
      <Header />
      <main className="flex-1 px-6 py-10">
        <ProjectClient projects={projects} />
      </main>
      <Footer />
    </div>
  );
}