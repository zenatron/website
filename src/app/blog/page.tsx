import { getAllPosts } from '../../lib/blog';
import BlogClient from '../../components/BlogClient';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default async function BlogPage() {
  // Fetch all blog posts server-side
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen flex flex-col bg-primary text-white">
      <Header />
      <main className="flex-1 px-6 py-10">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>
        <BlogClient posts={posts} />
      </main>
      <Footer />
    </div>
  );
}