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
   * The artwork is drawn in white for dark backgrounds, so it needs a dark
   * tile or it renders invisible.
   */
  darkTile?: boolean;
  /**
   * The artwork already carries its own backplate, so it reads as a macOS
   * app icon on its own. Glyphs on transparency get a tile behind them
   * instead. Measured from alpha coverage; override by hand if a logo is
   * ever replaced.
   */
  appIcon?: boolean;
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
    name: "cmux",
    logo: "cmux.webp",
    appIcon: true,
    description: "cool terminal",
    url: "https://cmux.com",
    category: "tools",
  },

  // Productivity & Organization
  {
    name: "Claude",
    logo: "claude.svg",
    description: "my daily ai",
    url: "https://claude.ai",
    category: "apps",
  },
  {
    name: "Tinycast",
    logo: "tinycast.svg",
    description: "better spotlight for macOS",
    url: "https://github.com/abue-ammar/tinycast",
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
    appIcon: true,
    description: "how i get sh*t done",
    url: "https://todoist.com",
    category: "apps",
  },
  {
    name: "Vivaldi",
    logo: "vivaldi.svg",
    appIcon: true,
    description: "function-first browser",
    url: "https://vivaldi.com",
    category: "apps",
  },
  {
    name: "Fantastical",
    logo: "fantastical.webp",
    appIcon: true,
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
    appIcon: true,
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
    appIcon: true,
    description: "you know this one",
    url: "https://spotify.com",
    category: "apps",
  },
  {
    name: "Steam",
    logo: "steam.svg",
    appIcon: true,
    description: "games besides minecraft",
    url: "https://store.steampowered.com",
    category: "apps",
  },
  {
    name: "CurseForge",
    logo: "curseforge-dark.svg",
    darkTile: true,
    description: "modded minecraft",
    url: "https://curseforge.com",
    category: "apps",
  },
  {
    name: "OBS Studio",
    logo: "obsstudio.svg",
    appIcon: true,
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
    appIcon: true,
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
    appIcon: true,
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
    appIcon: true,
    description: "auth server",
    url: "https://tinyauth.app",
    category: "tools",
  },
  {
    name: "Pocket ID",
    logo: "pocket-id.svg",
    appIcon: true,
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
    appIcon: true,
    description: "security engine",
    url: "https://crowdsec.net",
    category: "tools",
  },
  {
    name: "Proton VPN",
    logo: "proton-vpn.svg",
    description: "vpn",
    url: "https://protonvpn.com",
    category: "tools",
  },
  {
    name: "Mattermost",
    logo: "mattermost-blue.svg",
    description: "team collaboration",
    url: "https://mattermost.com",
    category: "tools",
  },
  {
    name: "Caddy",
    logo: "caddy.svg",
    description: "anything with a custom domain",
    url: "https://caddyserver.com",
    category: "tools",
  },
  {
    name: "Docker",
    logo: "docker.svg",
    description: "every service in the homelab",
    url: "https://www.docker.com",
    category: "tools",
  },
  {
    name: "AdGuard Home",
    logo: "adguard-home.svg",
    description: "no ads, on anything on the network",
    url: "https://adguard.com/en/adguard-home/overview.html",
    category: "tools",
  },
  {
    name: "Proton Mail",
    logo: "proton-mail.svg",
    description: "where phil@pvi.sh lands",
    url: "https://proton.me/mail",
    category: "apps",
  },

  // The stack: what the machines run and what the projects are made of.
  // Appended rather than slotted in above, because the first sixteen
  // logos are the homepage's hero grid.
  {
    name: "Neovim",
    logo: "neovim.svg",
    description: "the other editor",
    url: "https://neovim.io",
    category: "tools",
  },
  {
    name: "Homebrew",
    logo: "homebrew.svg",
    description: "packages on the mac",
    url: "https://brew.sh",
    category: "tools",
  },
  {
    name: "CachyOS",
    logo: "cachyos.svg",
    description: "arch, btw",
    url: "https://cachyos.org",
    category: "tools",
  },
  {
    name: "Unraid",
    logo: "unraid.svg",
    description: "what the homelab runs",
    url: "https://unraid.net",
    category: "tools",
  },
  {
    name: "Astro",
    logo: "astro.svg",
    description: "this site",
    url: "https://astro.build",
    category: "tools",
  },
  {
    name: "Svelte",
    logo: "svelte.svg",
    description: "ledger's front end",
    url: "https://svelte.dev",
    category: "tools",
  },
  {
    name: "Bun",
    logo: "bun.svg",
    description: "ledger's runtime",
    url: "https://bun.sh",
    category: "tools",
  },
  {
    name: "PostgreSQL",
    logo: "postgresql.svg",
    description: "ledger's database",
    url: "https://www.postgresql.org",
    category: "tools",
  },
  {
    name: "SQLite",
    logo: "sqlite.svg",
    description: "preamble's library index",
    url: "https://sqlite.org",
    category: "tools",
  },
  {
    name: "Rust",
    logo: "rust.svg",
    description: "preamble and πCompress",
    url: "https://www.rust-lang.org",
    category: "tools",
  },
  {
    name: "Python",
    logo: "python.svg",
    description: "the data mining coursework",
    url: "https://www.python.org",
    category: "tools",
  },
  {
    name: "Jupyter",
    logo: "jupyter.svg",
    description: "where that coursework lives",
    url: "https://jupyter.org",
    category: "tools",
  },
  {
    name: "FluidVoice",
    logo: "fluidvoice.webp",
    appIcon: true,
    description: "dictation, all on-device",
    url: "https://github.com/altic-dev/FluidVoice",
    category: "apps",
  },
  {
    name: "LM Studio",
    logo: "lmstudio.webp",
    appIcon: true,
    description: "local models",
    url: "https://lmstudio.ai",
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
