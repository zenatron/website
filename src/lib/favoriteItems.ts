import {
  FaGamepad,
  FaBook,
  FaHiking,
  FaCoffee,
  FaPlane,
  FaNetworkWired,
  FaServer
} from "react-icons/fa";
import { MdFitnessCenter } from "react-icons/md";

export interface FavoriteItem {
  name: string;
  icon: React.ElementType | string; // Can be React icon component or image URL
  description?: string;
  url?: string;
  category: "apps" | "games" | "hobbies" | "tools" | "entertainment" | "lifestyle";
  color?: string;
  invertIcon?: boolean; // Whether to invert the icon colors for dark backgrounds
}

export const favoriteItems: FavoriteItem[] = [
  // Development & Code
  {
    name: "GitHub",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
    description: "all my code",
    url: "https://github.com/zenatron",
    category: "tools",
    invertIcon: true
  },
  {
    name: "VS Code",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/visual-studio-code.svg",
    description: "preferred text editor",
    url: "https://code.visualstudio.com/",
    category: "tools"
  },
  {
    name: "Unity",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/unity/unity-original.svg",
    description: "game engine of choice",
    url: "https://unity.com",
    category: "tools"
  },
  {
    name: "Ghostty",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/ghostty.svg",
    description: "cool terminal",
    url: "https://ghostty.org",
    category: "tools"
  },
  
  // Productivity & Organization
  {
    name: "Raycast",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/raycast.svg",
    description: "better spotlight for macOS",
    url: "https://raycast.com",
    category: "apps"
  },
  {
    name: "Obsidian",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/obsidian.svg",
    description: "second brain",
    url: "https://obsidian.md",
    category: "apps"
  },
  {
    name: "Todoist",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/todoist.svg",
    description: "how i get sh*t done",
    url: "https://todoist.com",
    category: "apps"
  },
  {
    name: "Vivaldi",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/vivaldi.svg",
    description: "function-first browser",
    url: "https://vivaldi.com",
    category: "apps"
  },
  {
    name: "Fantastical",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/fantastical.png",
    description: "the best calendar",
    url: "https://flexibits.com/fantastical",
    category: "apps"
  },
  {
    name: "Cal.com",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/cal-com-dark.svg",
    description: "book a call!",
    url: "https://cal.com",
    category: "apps"
  },
  
  // Communication & Social
  {
    name: "Discord",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/discord.svg",
    description: "gaming & dev communities",
    url: "https://discord.com",
    category: "apps"
  },
  {
    name: "LinkedIn",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/linkedin.svg",
    description: "\"professional\" networking",
    url: "https://linkedin.com/in/philvishnevsky",
    category: "apps"
  },
  {
    name: "Bluesky",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/bluesky.svg",
    description: "decentralized social network",
    url: "https://bsky.app",
    category: "apps"
  },
  
  // Entertainment & Media
  {
    name: "Spotify",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/spotify.svg",
    description: "you know this one",
    url: "https://spotify.com",
    category: "entertainment"
  },
  {
    name: "Steam",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/steam.svg",
    description: "games besides minecraft",
    url: "https://store.steampowered.com",
    category: "games"
  },
  {
    name: "CurseForge",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/curseforge-dark.svg",
    description: "modded minecraft",
    url: "https://curseforge.com",
    category: "games"
  },
  {
    name: "OBS Studio",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/obsstudio.svg",
    description: "streaming & recording",
    url: "https://obsproject.com",
    category: "tools"
  },
  
  // Self-hosted & Infrastructure
  {
    name: "Tailscale",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/tailscale.svg",
    description: "how i connect stuff",
    url: "https://tailscale.com",
    category: "tools",
    invertIcon: true
  },
  {
    name: "OpenWebUI",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/open-webui.svg",
    description: "altman\'s worst nightmare",
    url: "https://github.com/open-webui/open-webui",
    category: "tools"
  },
  {
    name: "Jellyfin",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/jellyfin.svg",
    description: "media server",
    url: "https://jellyfin.org",
    category: "entertainment"
  },
  {
    name: "Nextcloud",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/nextcloud.svg",
    description: "cloud storage",
    url: "https://nextcloud.com",
    category: "tools"
  },
  {
    name: "karakeep",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/hoarder.svg",
    description: "bookmark manager",
    url: "https://github.com/karakeep-app/karakeep",
    category: "tools",
    invertIcon: true
  },
  {
    name: "n8n",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/n8n.svg",
    description: "powerful workflows",
    url: "https://n8n.io",
    category: "tools"
  },
  {
    name: "Authelia",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/authelia.svg",
    description: "auth server",
    url: "https://authelia.com",
    category: "tools"
  },
  {
    name: "Cloudflare",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/cloudflare.svg",
    description: "keeps the bad guys away",
    url: "https://cloudflare.com",
    category: "tools"
  },
  {
    name: "CrowdSec",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/crowdsec.svg",
    description: "security engine",
    url: "https://crowdsec.net",
    category: "tools"
  },
  {
    name: "Private Internet Access",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/privateinternetaccess.svg",
    description: "vpn",
    url: "https://privateinternetaccess.com",
    category: "tools"
  },
  {
    name: "Mattermost",
    icon: "https://raw.githubusercontent.com/zenatron/zenatron/refs/heads/main/logos/mattermost-blue.svg",
    description: "team collaboration",
    url: "https://mattermost.com",
    category: "apps"
  },

  // Hobbies & Interests
  {
    name: "Homelabbing",
    icon: FaServer,
    description: "building servers at home",
    category: "hobbies",
    color: "#6366F1"
  },
  {
    name: "Game Dev",
    icon: FaGamepad,
    description: "did not work at blizzard",
    category: "hobbies",
    color: "#6366F1"
  },
  {
    name: "Networking",
    icon: FaNetworkWired,
    description: "connecting computers",
    category: "hobbies",
    color: "#6366F1"
  },
  {
    name: "Reading",
    icon: FaBook,
    description: "sci-fi, tech, and self-improvement",
    category: "hobbies",
    color: "#22C55E"
  },
  {
    name: "Hiking",
    icon: FaHiking,
    description: "touching grass",
    category: "hobbies",
    color: "#22C55E"
  },
  {
    name: "Tea Brewing",
    icon: FaCoffee,
    description: "trying every tea in the world",
    category: "hobbies",
    color: "#A16207"
  },
  {
    name: "Weightlifting",
    icon: MdFitnessCenter,
    description: "building strength and discipline",
    category: "hobbies",
    color: "#EF4444"
  },
  {
    name: "Travel",
    icon: FaPlane,
    description: "exploring the world",
    category: "hobbies",
    color: "#0EA5E9"
  }
];

export const categoryLabels = {
  apps: "Apps",
  games: "Games",
  hobbies: "Hobbies",
  tools: "Tools",
  entertainment: "Entertainment",
  lifestyle: "Lifestyle"
};
