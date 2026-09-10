/** Everything about the author that isn't in a content collection. */

export const SITE = {
  name: "Phil Vishnevsky",
  user: "phil",
  host: "pvish",
  timezone: "America/New_York",
  city: "Hartford",
  repo: "https://github.com/zenatron/website",
  resume: "/downloads/Resume_Phil_Vishnevsky.pdf",
  email: "phil@pvi.sh",
  github: "https://github.com/zenatron",
} as const;

/** The homepage headline paragraph. Author's voice, so: sans. */
export const INTRO =
  "Full-stack engineer focused on developer experience. I build servers, performant web apps, explore creative projects, and occasionally ship things that don't break in production.";

/** One fact about the author, not a data table. Rendered as a single line. */
export const FACTS = ["Hartford, CT", "SWE, AI, games", "open to opportunities"];

/** Answers `whoami` in the terminal. This is where the deleted `$ whoami` block went. */
export const WHOAMI = [
  "Phil Vishnevsky — full-stack engineer in Hartford, CT.",
  "Servers, developer tooling, web apps, and indie games.",
  "Currently open to opportunities.",
];

/** Answers `fortune`. This is where the deleted ~/fortune block went. */
export const FORTUNES = [
  "The best code is the code you don't have to think about at 2am. — me, mass apply reject era",
  "Ship it. Fix it later. Unless it's auth. Don't ship broken auth. — me, learning from others' mistakes",
  "The goal isn't to write clever code. It's to write code the next person can delete. — me, after inheriting spaghetti",
  "Good tools disappear. You only notice the bad ones. — me, after switching IDEs",
  "Keep your friends rich and your enemies rich, and wait to find out which is which. — Ultron",
  "Every expert was once a beginner who refused to quit. — probably a poster somewhere",
  "Make it work, make it right, make it fast. In that order. — Kent Beck (paraphrased)",
];

/**
 * Click-to-cycle contact label. Sentence case, because these are now
 * the author's voice rather than paths.
 */
export const CONTACT_LABELS = [
  "Get in touch",
  "Reach out",
  "Say hello",
  "Shoot your shot",
  "Let's talk",
  "Slide into my DMs",
  "Make my day",
];

export const SOCIALS = [
  { label: "GitHub", url: "https://github.com/zenatron" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/philvishnevsky/" },
  { label: "Bluesky", url: "https://bsky.app/profile/zenatron.bsky.social" },
  { label: "Underscore Games", url: "https://underscore.games" },
  { label: "Calendar", url: "https://fantastical.app/philv" },
];
