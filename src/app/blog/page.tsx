import { getAllPosts } from '../../lib/blog';
import BlogClient from '../../components/BlogClient';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default async function BlogPage() {
  const posts = getAllPosts(); // Server-side fetching

  return (
    <div className="min-h-screen flex flex-col bg-primary text-white">
      <Header />
      <BlogClient posts={posts} />
      <Footer />
    </div>
  );
}