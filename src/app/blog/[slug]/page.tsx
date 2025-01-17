import { getAllPosts } from '../../../lib/blog';
import ReactMarkdown from 'react-markdown';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

// Generate static paths for all posts
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

// Blog post page component
export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const posts = getAllPosts();
  const post = posts.find((p) => p.slug === params.slug);

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