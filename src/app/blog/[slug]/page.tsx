import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

const blogDirectory = path.join(process.cwd(), 'src/content/blog');

export async function generateStaticParams() {
  const filenames = fs.readdirSync(blogDirectory);

  return filenames.map((filename) => ({
    slug: filename.replace('.md', ''),
  }));
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const filePath = path.join(blogDirectory, `${params.slug}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContents);

  return (
    <div className="min-h-screen flex flex-col bg-primary text-white">
      <Header />
      <main className="flex-1 px-6 py-10">
        <h1 className="text-4xl font-bold mb-4">{data.title}</h1>
        <p className="text-gray-400 mb-8">{data.date}</p>
        <article className="prose prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
      </main>
      <Footer />
    </div>
  );
}
