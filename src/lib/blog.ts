import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BlogPost } from '@/components/BlogClient';

const blogDirectory = path.join(process.cwd(), 'src/content/blog');

export function getAllPosts(): BlogPost[] {
  const filenames = fs.readdirSync(blogDirectory);

  return filenames.map((filename) => {
    const filePath = path.join(blogDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContents);

    if (!data.title || !data.date || !data.excerpt) {
      throw new Error(`Missing required fields in ${filename}`);
    }

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