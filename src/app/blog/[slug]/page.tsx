import { getBlogPostBySlug } from "@/lib/blog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { FaHashtag, FaArrowLeft } from "react-icons/fa";
import dateFormatter from "@/utils/dateFormatter";
import BackToTopButton from "@/components/BackToTopButton";

export async function generateStaticParams() {
  const params = await import("@/lib/blog").then((mod) =>
    mod.generateStaticParams()
  );
  return params;
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-transparent">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-6xl font-bold">404</h1>
          <p className="text-lg mt-4 text-muted-text">
            {"The blog post you're looking for doesn't exist."}
          </p>
          <Link
            href="/blog"
            className="btn btn-primary mt-6"
            title="Back to Blog"
          >
            Back to Blog
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent relative">
      <Header />
      <main className="flex-1 px-6 py-10 pt-20">
        <div className="max-w-xl md:max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-text hover:text-foreground mb-6 text-sm"
            title="Back to Blog"
          >
            <FaArrowLeft />
            Back to Blog
          </Link>

          <article className="flex flex-col items-center">
            <h1 className="text-4xl font-bold mb-4 text-center w-full">
              {post.metadata.title}
            </h1>

            <div className="flex flex-col items-center gap-4 mb-8 text-muted-text w-full">
              {post.metadata.tags && post.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {post.metadata.tags.map((tag, index) => (
                    <Link
                      key={index}
                      href={`/blog?tag=${tag}`}
                      className="tag-bubble"
                      title={`View posts with tag: ${tag}`}
                    >
                      <FaHashtag className="mr-1 text-xs opacity-70" />
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
              <div className="flex flex-row items-center text-muted-text mb-2">
                <time>
                  {dateFormatter({
                    date: post.metadata.date,
                    formatStyle: "full",
                  })}
                </time>
                {post.metadata.readingTime && (
                  <>
                    <span className="ml-2">{"•"}</span>
                    <span className="ml-2">{post.metadata.readingTime}</span>
                  </>
                )}
              </div>
            </div>

            <div className="mdx-content max-w-full">{post.content}</div>
          </article>
        </div>
      </main>
      <Footer />
      <BackToTopButton />
    </div>
  );
}
