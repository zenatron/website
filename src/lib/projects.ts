import fs from 'fs';
import path from 'path';

const projectsDirectory = path.join(process.cwd(), 'src/content/projects');

export async function getProjectBySlug(slug: string): Promise<string | null> {
  const filePath = path.join(projectsDirectory, `${slug}.html`);
  if (!fs.existsSync(filePath)) return null;

  const fileContents = fs.readFileSync(filePath, 'utf-8');
  return fileContents;
}

export async function generateStaticParams() {
    const filenames = fs.readdirSync(projectsDirectory);
    return filenames.map((filename) => ({
        slug: filename.replace('.html', ''),
    }));
}