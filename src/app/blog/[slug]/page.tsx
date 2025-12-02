import { getBlogPostBySlug } from "@/lib/blog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import dateFormatter from "@/utils/dateFormatter";
import BackToTopButton from "@/components/BackToTopButton";
import TableOfContents from "@/components/blog/TableOfContents";
import KatexStyles from "@/components/KatexStyles";

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
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6">
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
    <div className="relative flex min-h-screen flex-col">
      <KatexStyles />
      <Header />

      <main className="px-4 py-10 pt-20 sm:px-6">
        {/* Back to Blog Link */}
        <div className="max-w-5xl mx-auto mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-text hover:text-foreground text-sm"
            title="Back to Blog"
          >
            <FaArrowLeft />
            Back to Blog
          </Link>
        </div>

        {/* Main Layout Container */}
        <div className="max-w-5xl mx-auto">
          <div className="lg:flex lg:gap-8 lg:items-start">
            {/* Desktop Table of Contents - Sidebar */}
            <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0 lg:sticky lg:top-24">
              {post.headings && (
                <TableOfContents
                  headings={post.headings}
                  className="desktop-only"
                />
              )}
            </aside>

            {/* Main Content */}
            <article className="w-full max-w-4xl mx-auto lg:mx-0 lg:flex-1">
              <div className="flex flex-col items-center">
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
                          #{tag}
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
                        <span className="ml-2">
                          {post.metadata.readingTime}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Mobile Table of Contents - Positioned after title/meta */}
                {post.headings && (
                  <TableOfContents
                    headings={post.headings}
                    className="mobile-only"
                  />
                )}

                <div className="mdx-content w-full max-w-3xl">
                  {post.content}
                </div>
              </div>
            </article>
          </div>
        </div>
      </main>
      <Footer />
      <BackToTopButton />
    </div>
  );
}
