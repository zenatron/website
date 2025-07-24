"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  FaGamepad,
  FaBook,
  FaHiking,
  FaCoffee,
  FaPlane,
  FaExternalLinkAlt,
  FaNetworkWired,
  FaServer
} from "react-icons/fa";
import { MdFitnessCenter } from "react-icons/md";
import Link from "next/link";

// Define different types of items I love
interface FavoriteItem {
  name: string;
  icon: React.ElementType | string; // Can be React icon component or image URL
  description?: string;
  url?: string;
  category: "apps" | "games" | "hobbies" | "tools" | "entertainment" | "lifestyle";
  color?: string; // Optional - only needed for React icon components
  invertIcon?: boolean; // Whether to invert the icon colors for dark backgrounds
}

// My actual favorite things - apps, tools, and hobbies
const favoriteItems: FavoriteItem[] = [
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
    color: "#22C55E"
  },
  {
    name: "Travel",
    icon: FaPlane,
    description: "exploring the world",
    category: "hobbies",
    color: "#0EA5E9"
  }
];

const categoryLabels = {
  apps: "Apps",
  games: "Games",
  hobbies: "Hobbies",
  tools: "Tools",
  entertainment: "Entertainment",
  lifestyle: "Lifestyle"
};

export default function HobbiesSection() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(favoriteItems.map(item => item.category)));
  const filteredItems = selectedCategory
    ? favoriteItems.filter(item => item.category === selectedCategory)
    : favoriteItems;

  return (
    <div className="space-y-8">

      {/* Category Filter */}
      <div className="flex justify-center">
        <div className="inline-flex flex-wrap gap-1.5 p-1.5 bg-neutral-900/50 backdrop-blur-sm border border-neutral-700/50 rounded-lg">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              selectedCategory === null
                ? "bg-accent text-white shadow-lg"
                : "text-muted-text hover:text-primary-text hover:bg-neutral-800/50"
            }`}
          >
            All
          </motion.button>

          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? "bg-accent text-white shadow-lg"
                  : "text-muted-text hover:text-primary-text hover:bg-neutral-800/50"
              }`}
            >
              {categoryLabels[category as keyof typeof categoryLabels]}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="max-w-xl mx-auto">
        <motion.div
          layout
          className="space-y-0.5"
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.name}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
            >
              {item.url ? (
                <Link href={item.url} target="_blank" rel="noopener noreferrer">
                  <FavoriteItemRow item={item} />
                </Link>
              ) : (
                <FavoriteItemRow item={item} />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>

    </div>
  );
}

// Individual item row component
interface FavoriteItemRowProps {
  item: FavoriteItem;
}

function FavoriteItemRow({ item }: FavoriteItemRowProps) {
  // Check if icon is a string (image URL) or React component
  const isImageIcon = typeof item.icon === 'string';
  const IconComponent = !isImageIcon ? item.icon as React.ElementType : null;

  return (
    <motion.div
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className="flex gap-3 py-2 px-3 rounded-md transition-all duration-200 cursor-pointer group hover:bg-neutral-900/20"
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center mt-0.5 md:mt-0">
        {isImageIcon ? (
          <img
            src={item.icon as string}
            alt={item.name}
            className="w-4 h-4 object-contain"
            style={{
              filter: item.invertIcon ? 'invert(1)' : 'none'
            }}
          />
        ) : IconComponent ? (
          <IconComponent
            className="w-4 h-4"
            style={{ color: item.color }}
          />
        ) : (
          <div className="w-4 h-4 bg-gray-400 rounded" />
        )}
      </div>

      {/* Content - Responsive Layout */}
      <div className="flex-grow min-w-0">
        {/* Desktop/Tablet Layout - Single Line */}
        <div className="hidden md:flex items-center gap-2">
          <h4 className="font-medium text-primary-text group-hover:text-accent transition-colors">
            {item.name}
          </h4>
          {item.description && (
            <span className="text-sm text-muted-text">
              — {item.description}
            </span>
          )}
          {item.url && (
            <FaExternalLinkAlt className="w-3 h-3 text-muted-text opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          )}
        </div>

        {/* Mobile Layout - Stacked */}
        <div className="md:hidden">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-primary-text group-hover:text-accent transition-colors">
              {item.name}
            </h4>
            {item.url && (
              <FaExternalLinkAlt className="w-3 h-3 text-muted-text opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            )}
          </div>
          {item.description && (
            <p className="text-xs text-muted-text mt-0.5 leading-tight">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
