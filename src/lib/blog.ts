import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked, Tokens } from 'marked';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import katex from 'katex';
import { BlogPost } from '@/types/types';

// Initialize DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window);

const blogDirectory = path.join(process.cwd(), 'src/content/blog');

async function convertMarkdownToHtml(markdown: string): Promise<string> {
  marked.use({
    extensions: [
      {
        name: 'math',
        level: 'block',
        start(src: string) { return src.match(/\$\$/)?.index; },
        tokenizer(src: string) {
          const match = src.match(/^\$\$([\s\S]*?)\$\$/);
          if (match) {
            return {
              type: 'math',
              raw: match[0],
              text: match[1].trim(),
              tokens: []
            };
          }
        },
        renderer(token: Tokens.Generic) {
          try {
            const rendered = katex.renderToString(token.text, {
              displayMode: true,
              throwOnError: false
            });
            return `<div class="math math-display">${rendered}</div>`;
          } catch (error) {
            console.error('KaTeX error:', error);
            return `<div class="math math-display error">${token.text}</div>`;
          }
        }
      },
      {
        name: 'inlineMath',
        level: 'inline',
        start(src: string) { 
          const match = src.match(/(?<!\\)\$/);
          return match?.index;
        },
        tokenizer(src: string) {
          const match = src.match(/^(?<!\\)\$((?:\\.|[^\$\\])+?)\$/);
          if (match) {
            return {
              type: 'inlineMath',
              raw: match[0],
              text: match[1].trim(),
              tokens: []
            };
          }
        },
        renderer(token: Tokens.Generic) {
          try {
            const rendered = katex.renderToString(token.text!, {
              displayMode: false,
              throwOnError: false
            });
            return `<span class="math math-inline">${rendered}</span>`;
          } catch (error) {
            console.error('KaTeX error:', error);
            return `<span class="math math-inline error">${token.text}</span>`;
          }
        }
      }
    ]
  });

  const rawHtml = await marked(markdown);
  return purify.sanitize(rawHtml, {
    ADD_TAGS: ['math', 'annotation', 'semantics', 'mrow', 'mn', 'mo', 'mi', 'msup'],
    ADD_ATTR: ['xmlns', 'xmlns:xlink', 'version', 'space', 'style']
  });
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
        readingTime: data.readingTime,
        excerpt: data.excerpt || '',
        tags: data.tags || [],
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
          readingTime: data.readingTime,
          excerpt: data.excerpt || '',
          tags: data.tags || [],
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