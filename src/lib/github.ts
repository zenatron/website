async function getReadmeDescription(repo: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/zenatron/${repo}/main/README.md`
    );
    if (!response.ok) return null;

    const readme = await response.text();
    // Get first paragraph after any headers
    const description = readme
      .split("\n")
      .find((line) => line.trim() && !line.startsWith("#"));

    return description?.trim() || null;
  } catch {
    return null;
  }
}

export async function getGithubRepos() {
  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    };
    
    // Add GitHub token if available (for higher rate limits)
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    
    const response = await fetch("https://api.github.com/users/zenatron/repos", {
      headers,
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch GitHub repos: ${response.status} ${response.statusText}`);
      return [];
    }
    const repos = await response.json();

  // Exclude specific repositories
  const excludedRepos = ["zenatron"];

  const reposWithDescriptions = await Promise.all(
    repos
      .filter((repo: { name: string }) => !excludedRepos.includes(repo.name))
      .map(
        async (repo: {
          name: string;
          description: string | null;
          language: string;
          homepage: string | null;
          html_url: string;
          stargazers_count: number;
          topics: string[];
        }) => {
          const description =
            repo.description ||
            (await getReadmeDescription(repo.name)) ||
            "No description available";

          // Combine languages and topics for tags, filter out null/undefined values, and deduplicate
          const tagsSet = new Set<string>();

          // Fetch all languages for this repository
          try {
            const languageHeaders: HeadersInit = {
              Accept: "application/vnd.github.v3+json",
            };
            if (process.env.GITHUB_TOKEN) {
              languageHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
            }
            
            const languagesResponse = await fetch(
              `https://api.github.com/repos/zenatron/${repo.name}/languages`,
              { headers: languageHeaders }
            );
            if (languagesResponse.ok) {
              const languages = await languagesResponse.json();
              // Add all languages to tags
              Object.keys(languages).forEach((language) => {
                tagsSet.add(language.toLowerCase().replace(/\s+/g, "-"));
              });
            } else if (repo.language) {
              // Fallback to primary language if languages API fails
              tagsSet.add(repo.language.toLowerCase().replace(/\s+/g, "-"));
            }
          } catch {
            // Fallback to primary language if request fails
            if (repo.language) {
              tagsSet.add(repo.language.toLowerCase().replace(/\s+/g, "-"));
            }
          }

          // Add topics if they exist
          if (repo.topics && repo.topics.length > 0) {
            repo.topics.forEach((topic) => {
              tagsSet.add(topic.toLowerCase().replace(/\s+/g, "-"));
            });
          }

          // Convert Set back to array
          const tags = Array.from(tagsSet);

          // Generate slug from repo name
          const slug = `github-${repo.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

          return {
            metadata: {
              title: repo.name,
              description,
              type: "web" as const,
              slug,
              tags,
              contentSource: "github" as const,
              githubRepo: `zenatron/${repo.name}`,
            },
            links: {
              live: repo.homepage,
              github: repo.html_url,
            },
            featured: repo.stargazers_count > 0,
          };
        }
      )
  );

  return reposWithDescriptions;
  } catch (error) {
    console.error("Error fetching GitHub repos:", error);
    return [];
  }
}
