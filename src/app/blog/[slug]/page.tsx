import { getBlogPostBySlug } from '@/lib/blog';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FaArrowLeft, FaHashtag } from 'react-icons/fa';

type Props = {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const params = await import('@/lib/blog').then((mod) => mod.generateStaticParams());
  return params;
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-primary-bg text-primary-text">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-6xl font-bold">404</h1>
          <p className="text-lg mt-4 text-muted-text">
            {"The blog post you're looking for doesn't exist."}
          </p>
          <Link href="/blog" className="btn btn-primary mt-6">
            Back to Blog
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-primary-bg text-primary-text">
      <Header />
      <main className="flex-1 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/blog"
            className="inline-flex items-center text-accent hover:text-accent/80 mb-8"
          >
            <FaArrowLeft className="mr-2" />
            Back to Blog
          </Link>
          
          <article className="flex flex-col items-center">
            <h1 className="text-4xl font-bold mb-4 text-center w-full">{post.metadata.title}</h1>
            
            <div className="flex flex-col items-center gap-4 mb-8 text-muted-text w-full">
              {post.metadata.tags && post.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {post.metadata.tags.map((tag, index) => (
                    <Link 
                      key={index}
                      href={`/blog?tag=${tag}`}
                      className="tag-bubble"
                    >
                      <FaHashtag className="mr-1 text-xs opacity-70" />
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
              
              <time className="text-sm">{new Date(post.metadata.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</time>
            </div>

            <div className="prose dark:prose-invert 
              prose-a:text-accent hover:prose-a:text-btnPrimaryHover
              dark:prose-a:text-accent dark:hover:prose-a:text-btnPrimaryHover
              dark:prose-strong:text-primary-text
              dark:prose-code:text-primary-text
              dark:prose-pre:bg-code-bg
              dark:prose-pre:text-code-text
              prose-img:rounded-lg
              prose-img:mx-auto
              [&>*]:mx-auto [&>*]:max-w-3xl
              [&>pre]:max-w-4xl
              [&>img]:max-w-4xl
              w-full"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}