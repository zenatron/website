import { getProjectBySlug } from '@/lib/projects';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FaArrowLeft, FaDownload, FaFileCode, FaFilePdf } from 'react-icons/fa';
import { isDataScienceProject } from '@/types/types';
import fs from 'fs';
import path from 'path';

type Props = {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const params = await import('@/lib/projects').then((mod) => mod.generateStaticParams());
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

// Add this function to read HTML content
async function getProjectHTML(slug: string): Promise<string> {
  try {
    const htmlPath = path.join(process.cwd(), 'src/content/projects', `${slug}.html`);
    const content = fs.readFileSync(htmlPath, 'utf8');
    return content;
  } catch (error) {
    console.error(`Error reading HTML for ${slug}:`, error);
    return '<p>Error loading project content</p>';
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

  if (isDataScienceProject(project)) {
    // Get HTML content for data science project
    const htmlContent = await getProjectHTML(project.metadata.slug);

    return (
      <div className="min-h-screen flex flex-col bg-primary-bg text-primary-text">
        <Header />
        <main className="flex-1 px-6 py-10">
          <div className="max-w-4xl mx-auto h-[85vh]">
            <div className="flex justify-between items-center mb-6">
              <Link
                href="/projects"
                className="inline-flex items-center btn-nav text-sm md:text-base"
              >
                <FaArrowLeft className="mr-1 md:mr-2 text-base md:text-lg" />
                Back to Projects
              </Link>

              {project.downloads && (
                <div className="flex gap-2 md:gap-4">
                  {project.downloads.map((download, index) => (
                    <a
                      key={index}
                      href={`/downloads/${download.filename}`}
                      download
                      className="btn-secondary text-xs md:text-sm inline-flex items-center px-2 md:px-4 py-1.5"
                    >
                      {getFileIcon(download.type)}
                      <span className="hidden sm:inline">{download.label}</span>
                      <span className="sm:hidden">Download</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[calc(100%-4rem)]">
              <iframe
                srcDoc={htmlContent}
                className="w-full h-full border-0"
                title={project.metadata.title || 'Project Content'}
              />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Handle other project types...

  return (
    <div className="min-h-screen flex flex-col bg-primary-bg text-primary-text">
      <Header />
      <main className="flex-1 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Link
              href="/projects"
              className="inline-flex items-center btn-nav text-sm md:text-base"
            >
              <FaArrowLeft className="mr-1 md:mr-2 text-base md:text-lg" />
              Back to Projects
            </Link>

            {project.downloads && (
              <div className="flex gap-2 md:gap-4">
                {project.downloads.map((download, index) => (
                  <a
                    key={index}
                    href={`/downloads/${download.filename}`}
                    download
                    className="btn-secondary text-xs md:text-sm inline-flex items-center px-2 md:px-4 py-1.5"
                  >
                    {getFileIcon(download.type)}
                    <span className="hidden sm:inline">{download.label}</span>
                    <span className="sm:hidden">Download</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <iframe
              srcDoc={project.metadata.description}
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