import { getProjectBySlug } from '../../../lib/projects';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Link from 'next/link';
import { FaArrowLeft, FaDownload, FaFileCode, FaFilePdf } from 'react-icons/fa';

type Props = {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const params = await import('../../../lib/projects').then((mod) => mod.generateStaticParams());
  return params;
}

function getFileIcon(type: string) {
  switch (type) {
    case 'notebook':
      return <FaFileCode className="mr-2" />;
    case 'pdf':
      return <FaFilePdf className="mr-2" />;
    default:
      return <FaDownload className="mr-2" />;
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col bg-primary-bg text-primary-text">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-6xl font-bold">404</h1>
          <p className="text-lg mt-4 text-muted-text">
            The project you&#39;re looking for doesn&#39;t exist.
          </p>
          <Link href="/projects" className="btn btn-primary mt-6">
            Back to Projects
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-primary-bg text-primary-text">
      <Header />
      <main className="flex-1 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Link
              href="/projects"
              className="inline-flex items-center btn-nav"
            >
              <FaArrowLeft className="mr-2 text-lg" />
              Back to Projects
            </Link>

            {project.metadata.downloads && (
              <div className="flex gap-4">
                {project.metadata.downloads.map((download, index) => (
                  <a
                    key={index}
                    href={`/downloads/${download.filename}`}
                    download
                    className="btn btn-secondary inline-flex items-center"
                  >
                    {getFileIcon(download.type)}
                    {download.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <iframe
              srcDoc={project.content}
              className="w-full h-[800px] border-0"
              title={project.metadata?.title || 'Project Content'}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}