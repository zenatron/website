import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const blogDirectory = path.join(process.cwd(), 'src/content/blog');

export function getAllPosts() {
  const filenames = fs.readdirSync(blogDirectory);

  return filenames.map((filename) => {
    const filePath = path.join(blogDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContents);

    return {
      slug: filename.replace('.md', ''),
      metadata: data,
      content,
    };
  });
}