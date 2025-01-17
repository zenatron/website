import { getPostBySlug } from '../../../lib/blog'; // Utility to fetch a post by slug
import ReactMarkdown from 'react-markdown';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

// Define the BlogPostPage component
export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  // Fetch the specific post by slug
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // Handle 404 case
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-primary text-white">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-6xl font-bold">404</h1>
          <p className="text-lg mt-4">The post you&#39;re looking for doesn&#39;t exist.</p>
          <Link href="/blog" className="btn btn-primary mt-6">
            Back to Blog
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-primary text-white">
      <Header />
      <main className="flex-1 px-6 py-10">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/blog" className="inline-flex items-center text-accent hover:text-blue-600 font-medium">
            <FaArrowLeft className="mr-2 text-lg" />
            Back to Blog
          </Link>
        </div>

        {/* Blog Content */}
        <article className="prose prose-invert max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">{post.metadata.title}</h1>
          <p className="text-gray-400 mb-8">{post.metadata.date}</p>
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>
      </main>
      <Footer />
    </div>
  );
}