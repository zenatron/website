import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import DOMPurify from 'dompurify'; // Import DOMPurify
import { JSDOM } from 'jsdom'; // Required for DOMPurify in Node.js
import { BlogPost } from '@/types/types';

// Initialize DOMPurify with a DOM environment (only needed in Node.js)
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Define the blog directory
const blogDirectory = path.join(process.cwd(), 'src/content/blog');

// Utility function to convert and sanitize Markdown content
function convertMarkdownToHtml(markdown: string): string {
  const rawHtml = marked(markdown); // Convert Markdown to HTML
  return purify.sanitize(rawHtml as string); // Sanitize the resulting HTML
}

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
    content: convertMarkdownToHtml(content), // Convert and sanitize the content
    //content: marked(content) as string, // DO NOT SANITIZE CONTENT YET
  };
}

// Fetch all posts (for generating paths or displaying lists)
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
      content: convertMarkdownToHtml(content), // Convert and sanitize the content
    };
  });
}