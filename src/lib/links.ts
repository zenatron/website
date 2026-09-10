export interface LinkItem {
  title: string;
  url: string;
  /** The handle or address, shown in mono — the thing you'd actually type. */
  handle?: string;
  description?: string;
  /** Filename under /public/logos, when there is a mark for it. */
  logo?: string;
  flat?: boolean;
}

/**
 * Where to find Phil — distinct from /desk, which is what he uses.
 */
export const links: LinkItem[] = [
  {
    title: "GitHub",
    url: "https://github.com/zenatron",
    handle: "@zenatron",
    description: "Code, projects, and contributions",
    logo: "github.svg",
  },
  {
    title: "LinkedIn",
    url: "https://www.linkedin.com/in/philvishnevsky/",
    handle: "in/philvishnevsky",
    description: "The professional one",
    logo: "linkedin.svg",
    flat: true,
  },
  {
    title: "Bluesky",
    url: "https://bsky.app/profile/zenatron.bsky.social",
    handle: "@zenatron.bsky.social",
    description: "Where I actually post",
    logo: "bluesky.svg",
  },
  {
    title: "Email",
    url: "mailto:phil@pvi.sh",
    handle: "phil@pvi.sh",
    description: "The reliable way to reach me",
  },
  {
    title: "Calendar",
    url: "https://fantastical.app/philv",
    handle: "fantastical.app/philv",
    description: "Book a call",
    logo: "fantastical.webp",
    flat: true,
  },
  {
    title: "Underscore Games",
    url: "https://underscore.games",
    handle: "underscore.games",
    description: "Games and tools for game developers",
  },
];
