import fs from 'fs';
import path from 'path';
import projectMetadata from '../content/projects/metadata.json';

// Add this type assertion
const metadata: Record<string, ProjectMetadata> = projectMetadata;

const projectsDirectory = path.join(process.cwd(), 'src/content/projects');

export interface ProjectMetadata {
  title: string;
  date?: string;
  description?: string;
  downloads?: {
    label: string;
    filename: string;
    type: string;
  }[];
}

export type Project = {
  title: string;
  description: string;
  type: 'web' | 'data' | 'game' | 'app';
  tags: string[];
  links: {
    live?: string;
    github?: string;
    notebook?: string;
  };
  downloads?: {
    label: string;
    filename: string;
    type: string;
  }[];
  image?: string;
  featured?: boolean;
  slug?: string;
}

export type LegacyProject = {
  slug: string;
  content: string;
  metadata: ProjectMetadata;
}

function createDefaultMetadata(slug: string): ProjectMetadata {
  // Convert slug to title case (e.g., "my_project" -> "My Project")
  const title = slug
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title,
    date: new Date().toISOString().split('T')[0], // Today's date
    description: `Description for ${title}`
  };
}

export async function getProjectBySlug(slug: string): Promise<LegacyProject | null> {
  try {
    const fullPath = path.join(projectsDirectory, `${slug}.html`);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    return {
      slug,
      content,
      metadata: metadata[slug] || createDefaultMetadata(slug)
    };
  } catch (error) {
    console.error(`Failed to load project ${slug}:`, error);
    return null;
  }
}

export async function getAllProjects(): Promise<LegacyProject[]> {
  const files = fs.readdirSync(projectsDirectory);
  
  return files
    .filter(file => file.endsWith('.html'))
    .map(file => {
      const slug = file.replace(/\.html$/, '');
      const fullPath = path.join(projectsDirectory, file);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      return {
        slug,
        content,
        metadata: metadata[slug] || createDefaultMetadata(slug)
      };
    });
}

export async function generateStaticParams() {
  const files = fs.readdirSync(projectsDirectory);
  
  return files
    .filter(file => file.endsWith('.html'))
    .map(file => ({
      slug: file.replace(/\.html$/, ''),
    }));
}