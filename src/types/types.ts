import { ReactNode } from 'react';

export type BlogMetadata = {
  title: string;
  date: string;
  readingTime?: string;
  excerpt?: string;
  tags?: string[];
}

export type BlogPost = {
  slug: string;
  content: ReactNode;
  searchableContent: string; // Plain text version for searching
  metadata: BlogMetadata;
}

export type ProjectTypes = 'data' | 'web' | 'game' | 'other';

export type ProjectMetadata = {
  title: string;
  description: string;
  tags?: string[];
  type: ProjectTypes;
  slug?: string;
  date?: string;
}

export type ProjectCard = {
  metadata: ProjectMetadata;
  links: {
    github?: string;
    live?: string;
  };
  downloads?: {
    type: string;
    filename: string;
    label: string;
  }[];
  featured?: boolean;
  image?: string | null;
}

// Add this type for data science projects
export type DataScienceProject = ProjectCard & {
  metadata: {
    type: 'data';
    slug: string; // Required for DS projects
  };
  downloads: {
    filename: string;
  }[];
}