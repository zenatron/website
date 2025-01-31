import fs from 'fs';
import path from 'path';

const projectsDirectory = path.join(process.cwd(), 'src/content/projects');

export interface Project {
  slug: string;
  content: string;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const fullPath = path.join(projectsDirectory, `${slug}.html`);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    return {
      slug,
      content,
    };
  } catch (e) {
    return null;
  }
}

export async function getAllProjects(): Promise<Project[]> {
  const files = fs.readdirSync(projectsDirectory);
  
  const projects = files
    .filter(file => file.endsWith('.html'))
    .map(file => {
      const slug = file.replace(/\.html$/, '');
      const fullPath = path.join(projectsDirectory, file);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      return {
        slug,
        content,
      };
    });

  return projects;
}

export async function generateStaticParams() {
  const files = fs.readdirSync(projectsDirectory);
  
  return files
    .filter(file => file.endsWith('.html'))
    .map(file => ({
      slug: file.replace(/\.html$/, ''),
    }));
}