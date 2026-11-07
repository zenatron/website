/** Everything about the author that isn't in a content collection. */

export const SITE = {
  name: "Phil Vishnevsky",
  url: "https://pvi.sh",
  user: "phil",
  host: "pvish",
  timezone: "America/New_York",
  city: "Hartford",
  region: "CT",
  repo: "https://github.com/zenatron/website",
  resume: "/downloads/Resume_Phil_Vishnevsky.pdf",
  email: "phil@pvi.sh",
  github: "https://github.com/zenatron",
  kofi: "https://ko-fi.com/zenatron",
} as const;

/** Where Phil is, said one way everywhere: the home page, about, the schema graph and the share cards. */
export const LOCATION = `${SITE.city}, ${SITE.region}`;

/**
 * The copyright, derived from the deploy rather than typed: the year comes
 * from the build, so it's right the morning of January 1st without anyone
 * remembering it. The status bar, the feed and the schema graph all say it
 * from here, so they can't drift apart.
 */
export const COPYRIGHT_YEAR = new Date(__BUILD_TIME__).getFullYear();
export const COPYRIGHT = `© ${COPYRIGHT_YEAR} ${SITE.name}`;

/** The one line of availability the explorer carries onto every page. */
export const STATUS = "open to interesting projects";

/**
 * The site's top-level pages, for the 404's suggestions. `aliases` are
 * the names someone might type instead — old URLs and the obvious guesses
 * — which the 404 matches against so they still find their way.
 */
export const PAGES: {
  name: string;
  href: string;
  aliases?: string[];
  /** One line on what's there, from the page's own description. */
  blurb: string;
}[] = [
  { name: "about", href: "/about/", aliases: ["me", "bio", "resume", "cv"], blurb: "The story so far" },
  { name: "dock", href: "/dock/", aliases: ["desk", "stack", "uses", "apps", "tools", "setup"], blurb: "The stuff I actually use" },
  { name: "photos", href: "/photos/", aliases: ["photo", "photography", "pictures", "gallery", "camera", "shots"], blurb: "Shot on iPhone, edited on iPhone & Mac" },
  { name: "say hi", href: "/say-hi/", aliases: ["elsewhere", "links", "contact", "email", "socials"], blurb: "Email, book a call, or find me elsewhere" },
];
