export interface BlogPost {
    slug: string;
    metadata: {
      title: string;
      date: string;
      excerpt: string;
    };
    content: string;
  }
  