import { LinkItem } from "@/types/types";
import UgIcon from "@/components/icons/UgIcon";

export const links: LinkItem[] = [
  {
    title: "GitHub",
    url: "https://github.com/zenatron",
    description: "My code, projects, and contributions.",
    icon: "FaGithub",
    featured: true,
  },
  {
    title: "LinkedIn",
    url: "https://www.linkedin.com/in/philipvishnevsky/",
    description: "My professional network and career profile.",
    icon: "FaLinkedin",
    featured: true,
  },
  {
    title: "Website",
    url: "https://pvi.sh",
    description: "Read my blog, see my projects, and more. (You're here!)",
    icon: "FaGlobe",
    featured: true,
  },
  {
    title: "Underscore Games",
    url: "https://underscore.games",
    description: "Games & tools for game developers.",
    icon: UgIcon,
    featured: true,
  },
  {
    title: "Let's Talk!",
    url: "https://z3n.me/phil/call",
    description: "Schedule a call with me via my calendar.",
    icon: "FaCalendarAlt",
  },
  {
    title: "Bluesky",
    url: "https://bsky.app/profile/zenatron.bsky.social",
    description: "My social media presence.",
    icon: "FaBluesky",
  },
];
