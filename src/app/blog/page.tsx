import { getAllBlogPosts } from "@/lib/blog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogLayout from "@/components/layouts/BlogLayout";
import BackToTopButton from "@/components/BackToTopButton";
import { Suspense } from "react";
import ClientSkeletonLoader from "@/components/ui/ClientSkeletonLoader";

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Header />
      <div className="pt-20">
        <Suspense fallback={<ClientSkeletonLoader layout="list" />}>
          <BlogLayout posts={posts} />
        </Suspense>
      </div>
      <Footer />
      <BackToTopButton />
    </div>
  );
}
