import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Initialize DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window);

const blogDirectory = path.join(process.cwd(), 'src/content/blog');

export interface BlogMetadata {
  title: string;
  date: string;
  excerpt?: string;
}

export interface BlogPost {
  slug: string;
  content: string;
  metadata: BlogMetadata;
}

async function convertMarkdownToHtml(markdown: string): Promise<string> {
  const rawHtml = await marked(markdown);
  return purify.sanitize(rawHtml);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(blogDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    return {
      slug,
      content: await convertMarkdownToHtml(content),
      metadata: {
        title: data.title || 'Untitled',
        date: data.date || '1970-01-01',
        excerpt: data.excerpt || '',
      },
    };
  } catch (error) {
    console.error(`Failed to load blog post ${slug}:`, error);
    return null;
  }
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const files = fs.readdirSync(blogDirectory);
  
  const posts = await Promise.all(files
    .filter(file => file.endsWith('.md'))
    .map(async file => {
      const slug = file.replace(/\.md$/, '');
      const fullPath = path.join(blogDirectory, file);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);
      
      return {
        slug,
        content: await convertMarkdownToHtml(content),
        metadata: {
          title: data.title || 'Untitled',
          date: data.date || '1970-01-01',
          excerpt: data.excerpt || '',
        },
      };
    }));

  return posts.sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());
}

export async function generateStaticParams() {
  const files = fs.readdirSync(blogDirectory);
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => ({
      slug: file.replace(/\.md$/, ''),
    }));
}