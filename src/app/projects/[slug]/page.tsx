import { getProjectBySlug } from '../../../lib/projects';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export async function generateStaticParams() {
  const params = await import('../../../lib/projects').then((mod) => mod.generateStaticParams());
  return params;
}

export default async function ProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
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
        <div className="mb-6">
          <Link
            href="/projects"
            className="inline-flex items-center text-accent hover:text-btnPrimaryHover font-medium"
          >
            <FaArrowLeft className="mr-2 text-lg" />
            Back to Projects
          </Link>
        </div>

        <article 
          className="prose prose-lg dark:prose-invert max-w-4xl mx-auto
            prose-headings:text-primary-text
            prose-p:text-primary-text
            prose-a:text-accent hover:prose-a:text-btnPrimaryHover
            prose-strong:text-primary-text
            prose-code:text-primary-text
            prose-pre:bg-code-bg
            prose-pre:text-code-text
            dark:prose-headings:text-primary-text
            dark:prose-p:text-primary-text
            dark:prose-a:text-accent dark:hover:prose-a:text-btnPrimaryHover
            dark:prose-strong:text-primary-text
            dark:prose-code:text-primary-text
            dark:prose-pre:bg-code-bg
            dark:prose-pre:text-code-text
            prose-img:rounded-lg
            prose-img:mx-auto
            [&>*]:mx-auto [&>*]:max-w-3xl
            [&>pre]:max-w-4xl
            [&>img]:max-w-4xl"
          dangerouslySetInnerHTML={{ __html: project.content }}
        />
      </main>
      <Footer />
    </div>
  );
}