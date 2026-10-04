/** Everything about the author that isn't in a content collection. */

export const SITE = {
  name: "Phil Vishnevsky",
  url: "https://pvi.sh",
  user: "phil",
  host: "pvish",
  timezone: "America/New_York",
  city: "Hartford",
  repo: "https://github.com/zenatron/website",
  resume: "/downloads/Resume_Phil_Vishnevsky.pdf",
  email: "phil@pvi.sh",
  github: "https://github.com/zenatron",
  kofi: "https://ko-fi.com/zenatron",
} as const;

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

/** Quips the dock's fortune window deals out. This is where the deleted ~/fortune block went. */
export const FORTUNES: { text: string; by: string }[] = [
  { text: "The best code is the code you don’t have to think about at 2am.", by: "me, mass apply reject era" },
  { text: "Ship it. Fix it later. Unless it’s auth. Don’t ship broken auth.", by: "me, learning from others’ mistakes" },
  { text: "The goal isn’t to write clever code. It’s to write code the next person can delete.", by: "me, after inheriting spaghetti" },
  { text: "Good tools disappear. You only notice the bad ones.", by: "me, after switching IDEs" },
  { text: "Keep your friends rich and your enemies rich, and wait to find out which is which.", by: "Ultron" },
  { text: "Every expert was once a beginner who refused to quit.", by: "probably a poster somewhere" },
  { text: "Make it work, make it right, make it fast. In that order.", by: "Kent Beck (paraphrased)" },
];

/**
 * The site's top-level pages, as the explorer lists them. `aliases` are
 * the names someone might type instead — old URLs and the obvious guesses
 * — which the 404 matches against so they still find their way.
 */
export const PAGES: {
  name: string;
  href: string;
  hue: "violet" | "orange" | "blue" | "green";
  glyph: "person" | "dock" | "camera" | "bubble";
  aliases?: string[];
  /** One line on what's there, from the page's own description. */
  blurb: string;
}[] = [
  { name: "about", href: "/about/", hue: "violet", glyph: "person", aliases: ["me", "bio", "resume", "cv"], blurb: "The story so far" },
  { name: "dock", href: "/dock/", hue: "orange", glyph: "dock", aliases: ["desk", "stack", "uses", "apps", "tools", "setup"], blurb: "The apps I actually use" },
  { name: "photos", href: "/photos/", hue: "green", glyph: "camera", aliases: ["photo", "photography", "pictures", "gallery", "camera", "shots"], blurb: "Shot on iPhone, edited on iPhone & Mac" },
  { name: "say hi", href: "/say-hi/", hue: "blue", glyph: "bubble", aliases: ["elsewhere", "links", "contact", "email", "socials"], blurb: "Email, book a call, or find me elsewhere" },
];
