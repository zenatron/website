import fs from 'fs';
import path from 'path';
import { ProjectCard, DataScienceProject } from '@/types/types';
import projectMetadata from '@/content/projects/metadata.json';

const projectsDirectory = path.join(process.cwd(), 'src/content/projects');

// Add this function to transform metadata.json entries to ProjectCards
function transformMetadataToProjects(): DataScienceProject[] {
  //console.log('\n=== Data Science Projects Slugs ===');
  
  const projects = Object.entries(projectMetadata).map(([key, data]) => {
    const slug = key;
    
    //console.log(`Project: "${data.title}"`);
    //console.log(`  Key: ${key}`);
    //console.log(`  Slug: ${slug}`);
    //console.log(`  Notebook: ${data.downloads?.[0]?.filename}`);
    //console.log('---');

    return {
      metadata: {
        title: data.title,
        description: data.description,
        type: 'data' as const,
        slug,
        date: data.date,
        tags: ['python', 'jupyter-notebook', 'data-science']
      },
      links: {},
      downloads: [
        {
          filename: data.downloads[0].filename,
        }
      ],
      featured: false
    };
  });

  //console.log('================================\n');
  return projects as DataScienceProject[];
}

export async function getAllProjects(): Promise<ProjectCard[]> {
  // Get projects from metadata.json
  const dataProjects = transformMetadataToProjects();
  return [...dataProjects];
}

export async function generateStaticParams() {
  // Include both metadata.json slugs and markdown files
  const metadataSlugs = Object.keys(projectMetadata).map(slug => ({ slug }));
  const files = fs.readdirSync(projectsDirectory);
  const markdownSlugs = files
    .filter(file => file.endsWith('.md'))
    .map(file => ({
      slug: file.replace(/\.md$/, ''),
    }));

  return [...metadataSlugs, ...markdownSlugs];
}