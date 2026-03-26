import { FaCalendarAlt, FaGithub, FaLinkedin } from "react-icons/fa";
import { FaBluesky } from "react-icons/fa6";
import CalendarPopup from "@/components/ui/Calendar";
import { T } from "@/components/ui/TerminalWindow";
import UgLogo from "@/components/icons/UgIcon";

const NAV_LINKS = [
  { href: "/projects", label: "~/projects" },
  { href: "/blog", label: "~/blog" },
  { href: "/about", label: "~/about" },
];

const SOCIAL_LINKS = [
  { href: "https://github.com/zenatron", icon: FaGithub, label: "GitHub" },
  {
    href: "https://linkedin.com/in/philvishnevsky",
    icon: FaLinkedin,
    label: "LinkedIn",
  },
  {
    href: "https://bsky.app/profile/zenatron.bsky.social",
    icon: FaBluesky,
    label: "Bluesky",
  },
  {
    href: "https://underscore.games",
    icon: UgLogo,
    label: "Underscore Games",
  },
  {
    href: "https://fantastical.app/philv",
    icon: FaCalendarAlt,
    label: "Calendar",
  }
];

export default function Footer() {
  return (
    <footer
      className="mt-auto border-t font-mono"
      style={{ backgroundColor: T.bg, borderColor: T.gutter }}
    >
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-6">
          {/* Copyright */}
          <span className="text-xs" style={{ color: T.comment }}>
            <span style={{ color: T.purple }}>//</span> ©{" "}
            {new Date().getFullYear()} phil vishnevsky
          </span>

          {/* Navigation */}
          <nav className="flex items-center gap-4 sm:gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs transition-colors duration-150"
                style={{ color: T.comment }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = T.purple;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = T.comment;
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Social Icons + Calendar */}
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-150"
                style={{ color: T.comment }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = T.purple;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = T.comment;
                }}
                aria-label={social.label}
              >
                <social.icon className="h-3.5 w-3.5" />
              </a>
            ))}
            {/* <CalendarPopup /> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
