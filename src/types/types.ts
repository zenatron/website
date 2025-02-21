export interface BlogMetadata {
  title: string;
  date: string;
  excerpt?: string;
  tags?: string[];
}

export interface BlogPost {
  slug: string;
  content: string;
  metadata: BlogMetadata;
}
  