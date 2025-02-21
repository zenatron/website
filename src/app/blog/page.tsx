import { getAllBlogPosts } from '@/lib/blog';
import BlogClient from '@/components/BlogClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function BlogPage() {
  // Fetch all blog posts server-side
  const posts = await getAllBlogPosts();

  return (
    <div className="min-h-screen flex flex-col bg-primary-bg text-primary-text">
      <Header />
      <main className="flex-1 px-6 py-10">
        <BlogClient posts={posts} />
      </main>
      <Footer />
    </div>
  );
}