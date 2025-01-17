import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BlogPost } from '../components/BlogClient';

const blogDirectory = path.join(process.cwd(), 'src/content/blog');

// Fetch a single post by its slug
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(blogDirectory, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContents);

  return {
    slug,
    metadata: {
      title: data.title || 'Untitled',
      date: data.date || '1970-01-01',
      excerpt: data.excerpt || '',
    },
    content,
  };
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const filenames = fs.readdirSync(blogDirectory);

  return filenames.map((filename) => {
    const filePath = path.join(blogDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContents);

    return {
      slug: filename.replace('.md', ''),
      metadata: {
        title: data.title || 'Untitled',
        date: data.date || '1970-01-01',
        excerpt: data.excerpt || '',
      },
      content,
    };
  });
}