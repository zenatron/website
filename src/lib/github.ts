async function getReadmeDescription(repo: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/zenatron/${repo}/main/README.md`
    );
    if (!response.ok) return null;
    
    const readme = await response.text();
    // Get first paragraph after any headers
    const description = readme
      .split('\n')
      .find(line => line.trim() && !line.startsWith('#'));
      
    return description?.trim() || null;
  } catch {
    return null;
  }
}

export async function getGithubRepos() {
  const response = await fetch('https://api.github.com/users/zenatron/repos', {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
    },
    next: { revalidate: 3600 }
  });

  if (!response.ok) throw new Error('Failed to fetch GitHub repos');
  const repos = await response.json();
  
  // Exclude specific repositories
  const excludedRepos = ['zenatron'];
  
  const reposWithDescriptions = await Promise.all(
    repos
      .filter((repo: { name: string }) => !excludedRepos.includes(repo.name))
      .map(async (repo: { 
        name: string;
        description: string | null;
        language: string;
        homepage: string | null;
        html_url: string;
        stargazers_count: number;
        topics: string[];
      }) => {
        const description = repo.description || await getReadmeDescription(repo.name) || 'No description available';
        
        // Combine language and topics for tags, filter out null/undefined values
        const tags = [repo.language, ...(repo.topics || [])]
          .filter(Boolean)
          .map(tag => tag.toLowerCase());
        
        return {
          metadata: {
            title: repo.name,
            description,
            type: 'web' as const,
            tags,
          },
          links: {
            live: repo.homepage,
            github: repo.html_url,
          },
          featured: repo.stargazers_count > 0,
        };
      })
  );

  return reposWithDescriptions;
} 