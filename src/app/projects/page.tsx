import { getAllProjects } from '../../lib/projects';
import ProjectClient from '../../components/ProjectClient';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default async function ProjectsPage() {
  const projects = await getAllProjects();
  
  // Sort projects by date before passing to client component
  const sortedProjects = [...projects].sort((a, b) => {
    const dateA = new Date(a.metadata.date || '').getTime();
    const dateB = new Date(b.metadata.date || '').getTime();
    return dateB - dateA;
  });

  return (
    <div className="min-h-screen flex flex-col bg-primary-bg text-primary-text">
      <Header />
      <main className="flex-1 px-6 py-10">
        <ProjectClient projects={sortedProjects} />
      </main>
      <Footer />
    </div>
  );
}