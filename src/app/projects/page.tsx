import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ProjectsIndex() {
  const projects = [
    { slug: 'Python_Exercise', title: 'Python Exercises' },
    { slug: 'Pandas_Numpy_Exercise', title: 'Pandas & Numpy Exercises' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-primary-bg text-primary-text">
      <Header />
      <main className="flex-1 px-6 py-10">
        <h1 className="text-4xl font-bold mb-8">Projects</h1>
        <ul className="space-y-4">
          {projects.map((project) => (
            <li key={project.slug}>
              <Link
                href={`/projects/${project.slug}`}
                className="text-accent hover:underline"
              >
                {project.title}
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}