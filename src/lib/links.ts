export interface LinkItem {
  title: string;
  url: string;
  /** The handle or address, shown in mono — the thing you'd actually type. */
  handle?: string;
  description?: string;
  /** Filename under /public/logos. */
  logo: string;
  /** The artwork carries its own backplate. Same meaning as on FAVORITES. */
  appIcon?: boolean;
  /**
   * A way to reach Phil, rather than somewhere he has a profile. These lead
   * the page: for someone deciding whether to get in touch, they're the
   * point of it.
   */
  reach?: boolean;
  /** What it runs on, when that's worth saying: "Proton Mail". */
  via?: string;
  /** The handle is worth copying rather than following — an address. */
  copy?: boolean;
}

/**
 * Where to find Phil — distinct from /dock, which is what he uses.
 */
export const links: LinkItem[] = [
  {
    title: "Email",
    url: "mailto:phil@pvi.sh",
    handle: "phil@pvi.sh",
    description: "The reliable way to reach me",
    logo: "proton-mail.svg",
    via: "Proton Mail",
    reach: true,
    copy: true,
  },
  {
    title: "Calendar",
    url: "https://fantastical.app/philv",
    handle: "fantastical.app/philv",
    description: "Book a call",
    logo: "fantastical.webp",
    appIcon: true,
    via: "Fantastical",
    reach: true,
  },
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
    appIcon: true,
  },
  {
    title: "Bluesky",
    url: "https://bsky.app/profile/zenatron.bsky.social",
    handle: "@zenatron.bsky.social",
    description: "Where I actually post",
    logo: "bluesky.svg",
  },
  {
    title: "Underscore Games",
    url: "https://underscore.games",
    handle: "underscore.games",
    description: "Games and tools for game developers",
    logo: "underscore-games.svg",
  },
];
