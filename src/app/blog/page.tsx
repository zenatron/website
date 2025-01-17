import Link from 'next/link';
import { getAllPosts } from '../../lib/blog';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen flex flex-col bg-primary text-white">
      <Header />
      <main className="flex-1 px-6 py-10">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div key={post.slug} className="bg-secondary p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-2">{post.metadata.title}</h2>
              <p className="text-gray-400 text-sm mb-4">{post.metadata.date}</p>
              <p className="text-gray-300">{post.metadata.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="text-accent hover:underline mt-4 block">
                Read More →
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}