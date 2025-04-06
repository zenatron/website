import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { BlogPost } from '@/types/types';
import Counter from '@/components/mdx/Counter';
import Callout from '@/components/mdx/Callout';
import { createElement } from 'react';

const blogDirectory = path.join(process.cwd(), 'src/content/blog');

// Define components that can be imported in MDX files
const components = {
  Counter,
  Callout,
};

// Configure rehype-highlight options
const rehypeHighlightOptions = {
  detect: true,  // Auto-detect language if not specified
  ignoreMissing: true,  // Don't throw on missing language
  subset: false,  // Use all languages
};

// Extract plain text from MDX content for searching
function extractPlainText(content: string): string {
  // Remove import statements
  let plainText = content.replace(/import\s+.*?from\s+['"].*?['"]/g, '');
  
  // Remove JSX/HTML tags
  plainText = plainText.replace(/<[^>]*>/g, ' ');
  
  // Remove code blocks
  plainText = plainText.replace(/```[\s\S]*?```/g, '');
  
  // Remove inline code
  plainText = plainText.replace(/`.*?`/g, '');
  
  // Remove Markdown formatting
  plainText = plainText
    .replace(/#{1,6}\s+/g, '') // Headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1') // Italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
    .replace(/!\[(.*?)\]\(.*?\)/g, '$1') // Images
    .replace(/\n>/g, '\n') // Blockquotes
    
  // Remove extra whitespace
  plainText = plainText.replace(/\s+/g, ' ').trim();
  
  return plainText;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    // Try MDX file first, then fall back to MD
    let fullPath = path.join(blogDirectory, `${slug}.mdx`);
    
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(blogDirectory, `${slug}.md`);
      
      if (!fs.existsSync(fullPath)) {
        return null;
      }
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    // Extract plain text for searching
    const searchableContent = extractPlainText(content);
    
    try {
      const { content: compiledContent } = await compileMDX({
        source: content,
        components,
        options: {
          parseFrontmatter: false, // We already parsed it with gray-matter
          mdxOptions: {
            remarkPlugins: [remarkMath, remarkGfm],
            rehypePlugins: [rehypeKatex, [rehypeHighlight, rehypeHighlightOptions]],
            development: process.env.NODE_ENV === 'development',
          },
        },
      });
      
      return {
        slug,
        content: compiledContent,
        searchableContent,
        metadata: {
          title: data.title || 'Untitled',
          date: data.date || '1970-01-01',
          readingTime: data.readingTime,
          excerpt: data.excerpt || '',
          tags: data.tags || [],
        },
      };
    } catch (error: unknown) {
      console.error(`Failed to compile MDX for ${slug}:`, error);
      // Return a placeholder for failed compilations
      return {
        slug,
        content: createElement('div', {}, `Error loading content: ${error instanceof Error ? error.message : 'Unknown error'}`),
        searchableContent,
        metadata: {
          title: data.title || 'Untitled',
          date: data.date || '1970-01-01',
          readingTime: data.readingTime,
          excerpt: data.excerpt || '',
          tags: data.tags || [],
        },
      };
    }
  } catch (error) {
    console.error(`Failed to load blog post ${slug}:`, error);
    return null;
  }
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const files = fs.readdirSync(blogDirectory);
  
  // Process files in batches to avoid overwhelming the system
  const validPosts: BlogPost[] = [];
  
  for (const file of files) {
    if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
    
    try {
      const slug = file.replace(/\.(md|mdx)$/, '');
      const fullPath = path.join(blogDirectory, file);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);
      
      // Extract plain text for searching
      const searchableContent = extractPlainText(content);
      
      try {
        const { content: compiledContent } = await compileMDX({
          source: content,
          components,
          options: {
            parseFrontmatter: false, // We already parsed it with gray-matter
            mdxOptions: {
              remarkPlugins: [remarkMath, remarkGfm],
              rehypePlugins: [rehypeKatex, [rehypeHighlight, rehypeHighlightOptions]],
              development: process.env.NODE_ENV === 'development',
            },
          },
        });
        
        validPosts.push({
          slug,
          content: compiledContent,
          searchableContent,
          metadata: {
            title: data.title || 'Untitled',
            date: data.date || '1970-01-01',
            readingTime: data.readingTime,
            excerpt: data.excerpt || '',
            tags: data.tags || [],
          },
        });
      } catch (error: unknown) {
        console.error(`Failed to compile content for ${slug}:`, error);
        // Add a placeholder for failed compilations
        validPosts.push({
          slug,
          content: createElement('div', {}, `Error loading content: ${error instanceof Error ? error.message : 'Unknown error'}`),
          searchableContent,
          metadata: {
            title: data.title || 'Untitled',
            date: data.date || '1970-01-01',
            readingTime: data.readingTime,
            excerpt: data.excerpt || '',
            tags: data.tags || [],
          },
        });
      }
    } catch (error) {
      console.error(`Failed to process file ${file}:`, error);
      // Skip this file and continue with others
    }
  }

  return validPosts.sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());
}

export async function generateStaticParams() {
  const files = fs.readdirSync(blogDirectory);
  return files
    .filter(file => file.endsWith('.md') || file.endsWith('.mdx'))
    .map(file => ({
      slug: file.replace(/\.(md|mdx)$/, ''),
    }));
}