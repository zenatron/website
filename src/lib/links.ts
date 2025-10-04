import { LinkItem } from "@/types/types";
import UgIcon from "@/components/icons/UgIcon";

export const links: LinkItem[] = [
  {
    title: "GitHub",
    url: "https://github.com/zenatron",
    description: "My code, projects, and contributions",
    icon: "FaGithub",
  },
  {
    title: "LinkedIn",
    url: "https://www.linkedin.com/in/philipvishnevsky/",
    description: "My professional network and profile",
    icon: "FaLinkedin",
  },
  {
    title: "Website",
    url: "/",
    description: "Blog, projects, and more (You're here!)",
    icon: "FaGlobe",
  },
  {
    title: "Underscore Games",
    url: "https://underscore.games",
    description: "Games & tools for game developers",
    icon: UgIcon,
  },
  {
    title: "Calendar",
    url: "https://z3n.me/phil/call",
    description: "Schedule a call!",
    icon: "FaCalendarAlt",
  },
  {
    title: "Bluesky",
    url: "https://bsky.app/profile/zenatron.bsky.social",
    description: "My social media presence",
    icon: "FaBluesky",
  },
];
