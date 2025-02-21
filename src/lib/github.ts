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
      .filter((repo: any) => !excludedRepos.includes(repo.name))
      .map(async (repo: any) => {
        const description = repo.description || await getReadmeDescription(repo.name) || 'No description available';
        
        return {
          title: repo.name,
          description,
          type: 'web',
          tags: [repo.language].filter(Boolean),
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