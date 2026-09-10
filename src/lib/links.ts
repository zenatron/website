export interface LinkItem {
  title: string;
  url: string;
  description?: string;
  icon?: string;
}

export const links: LinkItem[] = [
  {
    title: "GitHub",
    url: "https://github.com/zenatron",
    description: "My code, projects, and contributions",
  },
  {
    title: "LinkedIn",
    url: "https://www.linkedin.com/in/philvishnevsky/",
    description: "My professional network and profile",
  },
  {
    title: "Website",
    url: "/",
    description: "Blog, projects, and more (You're here!)",
  },
  {
    title: "Underscore Games",
    url: "https://underscore.games",
    description: "Games & tools for game developers",
  },
  {
    title: "Calendar",
    // url: "https://z3n.me/phil/call",
    url: "https://fantastical.app/philv",
    description: "Schedule a call!",
  },
  {
    title: "Bluesky",
    url: "https://bsky.app/profile/zenatron.bsky.social",
    description: "My social media presence",
  },
];
