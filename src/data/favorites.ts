/**
 * Things Phil likes. Preserved verbatim from the previous site's
 * favoriteItems.ts. Logos are vendored under /public/logos rather than
 * hot-linked from raw.githubusercontent, which sends no useful cache
 * headers, rate-limits, and leaks visitor IPs to GitHub.
 */
export interface Favorite {
  name: string;
  description?: string;
  url?: string;
  category: "apps" | "hobbies" | "tools" | "fun" | "lifestyle";
  /** Filename under /public/logos. Absent for the hobbies, which aren't brands. */
  logo?: string;
  /**
   * The artwork is a solid backplate with the identity knocked out in
   * white, so masking it yields a blob. Those get a grayscale treatment
   * at rest instead. Seeded by measuring alpha coverage and white
   * knockout; override by hand if a logo is ever replaced.
   */
  flat?: boolean;
}

export const FAVORITES: Favorite[] = [
  // Development & Code
  {
    name: "GitHub",
    logo: "github.svg",
    description: "all my code",
    url: "https://github.com/zenatron",
    category: "tools",
  },
  {
    name: "VS Code",
    logo: "visual-studio-code.svg",
    description: "preferred text editor",
    url: "https://code.visualstudio.com/",
    category: "tools",
  },
  {
    name: "Unity",
    logo: "unity.svg",
    description: "game engine of choice",
    url: "https://unity.com",
    category: "tools",
  },
  {
    name: "Ghostty",
    logo: "ghostty.svg",
    description: "cool terminal",
    url: "https://ghostty.org",
    category: "tools",
  },

  // Productivity & Organization
  {
    name: "Raycast",
    logo: "raycast.svg",
    description: "better spotlight for macOS",
    url: "https://raycast.com",
    category: "apps",
  },
  {
    name: "Obsidian",
    logo: "obsidian.svg",
    description: "second brain",
    url: "https://obsidian.md",
    category: "apps",
  },
  {
    name: "Todoist",
    logo: "todoist.svg",
    flat: true,
    description: "how i get sh*t done",
    url: "https://todoist.com",
    category: "apps",
  },
  {
    name: "Vivaldi",
    logo: "vivaldi.svg",
    flat: true,
    description: "function-first browser",
    url: "https://vivaldi.com",
    category: "apps",
  },
  {
    name: "Fantastical",
    logo: "fantastical.webp",
    flat: true,
    description: "book a call!",
    url: "https://fantastical.app/philv",
    category: "apps",
  },
  // {
  //   name: "Cal.com",
  //   icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/cal-com-dark.svg",
  //   description: "book a call!",
  //   // url: "https://z3n.me/phil/call",
  //   url: "https://fantastical.app/philv",
  //   category: "apps",
  // },

  // Communication & Social
  {
    name: "Discord",
    logo: "discord.svg",
    description: "gaming & dev communities",
    url: "https://discord.com",
    category: "apps",
  },
  {
    name: "LinkedIn",
    logo: "linkedin.svg",
    flat: true,
    description: '"professional" networking',
    url: "https://www.linkedin.com/in/philvishnevsky/",
    category: "apps",
  },
  {
    name: "Bluesky",
    logo: "bluesky.svg",
    description: "decentralized social network",
    url: "https://bsky.app",
    category: "apps",
  },

  // Entertainment & Media
  {
    name: "Spotify",
    logo: "spotify.svg",
    description: "you know this one",
    url: "https://spotify.com",
    category: "apps",
  },
  {
    name: "Steam",
    logo: "steam.svg",
    flat: true,
    description: "games besides minecraft",
    url: "https://store.steampowered.com",
    category: "apps",
  },
  {
    name: "CurseForge",
    logo: "curseforge-dark.svg",
    description: "modded minecraft",
    url: "https://curseforge.com",
    category: "apps",
  },
  {
    name: "OBS Studio",
    logo: "obsstudio.svg",
    flat: true,
    description: "streaming & recording",
    url: "https://obsproject.com",
    category: "tools",
  },

  // Self-hosted & Infrastructure
  {
    name: "Tailscale",
    logo: "tailscale.svg",
    description: "how i connect stuff",
    url: "https://tailscale.com",
    category: "tools",
  },
  {
    name: "OpenWebUI",
    logo: "open-webui.svg",
    flat: true,
    description: "altman\'s worst nightmare",
    url: "https://github.com/open-webui/open-webui",
    category: "tools",
  },
  {
    name: "Jellyfin",
    logo: "jellyfin.svg",
    description: "media server",
    url: "https://jellyfin.org",
    category: "apps",
  },
  {
    name: "Nextcloud",
    logo: "nextcloud.svg",
    description: "cloud storage",
    url: "https://nextcloud.com",
    category: "tools",
  },
  {
    name: "Karakeep",
    logo: "hoarder.svg",
    description: "bookmark manager",
    url: "https://github.com/karakeep-app/karakeep",
    category: "tools",
  },
  {
    name: "n8n",
    logo: "n8n.svg",
    description: "powerful workflows",
    url: "https://n8n.io",
    category: "tools",
  },
  {
    name: "Tinyauth",
    logo: "tinyauth.svg",
    description: "auth server",
    url: "https://tinyauth.app",
    category: "tools",
  },
  {
    name: "Pocket ID",
    logo: "pocket-id.svg",
    flat: true,
    description: "oidc provider",
    url: "https://pocket-id.org",
    category: "tools",
  },
  {
    name: "Cloudflare",
    logo: "cloudflare.svg",
    description: "keeps the bad guys away",
    url: "https://cloudflare.com",
    category: "tools",
  },
  {
    name: "CrowdSec",
    logo: "crowdsec.svg",
    description: "security engine",
    url: "https://crowdsec.net",
    category: "tools",
  },
  {
    name: "Private Internet Access",
    logo: "privateinternetaccess.svg",
    description: "vpn",
    url: "https://privateinternetaccess.com",
    category: "tools",
  },
  {
    name: "Mattermost",
    logo: "mattermost-blue.svg",
    description: "team collaboration",
    url: "https://mattermost.com",
    category: "tools",
  },

  // Hobbies & Interests
  {
    name: "Homelabbing",
    description: "building servers at home",
    category: "hobbies",
  },
  {
    name: "Game Dev",
    description: "did not work at blizzard",
    category: "hobbies",
  },
  {
    name: "Networking",
    description: "connecting computers",
    category: "hobbies",
  },
  {
    name: "Reading",
    description: "sci-fi, tech, and self-improvement",
    category: "hobbies",
  },
  {
    name: "Hiking",
    description: "touching grass",
    category: "hobbies",
  },
  {
    name: "Tea Brewing",
    description: "trying every tea in the world",
    category: "hobbies",
  },
  {
    name: "Weightlifting",
    description: "building strength and discipline",
    category: "hobbies",
  },
  {
    name: "Travel",
    description: "exploring the world",
    category: "hobbies",
  },
];

export const CATEGORY_LABELS: Record<Favorite["category"], string> = {
  apps: "Apps",
  hobbies: "Hobbies",
  tools: "Tools",
  fun: "Fun",
  lifestyle: "Lifestyle",
};
