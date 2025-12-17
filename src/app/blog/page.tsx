import { getAllBlogPosts } from "@/lib/blog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogLayout from "@/components/layouts/BlogLayout";
import BackToTopButton from "@/components/ui/BackToTopButton";
import { Suspense } from "react";
import ClientSkeletonLoader from "@/components/ui/ClientSkeletonLoader";

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <Suspense fallback={<ClientSkeletonLoader layout="list" />}>
        <BlogLayout posts={posts} />
      </Suspense>
      <Footer />
      <BackToTopButton />
    </div>
  );
}
