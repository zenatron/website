/**
 * schema.org nodes, one builder per page kind. The graph is tied together
 * with stable @id anchors — `/#person` and `/#website` — so a BlogPosting's
 * author reference resolves to the same Person the homepage describes.
 */
import { SITE } from "@/data/site";
import { links } from "@/lib/links";

const URL_ = SITE.url.replace(/\/+$/, "");

/** Profiles that are the same person as the site's author. */
const sameAs = links
  .filter((l) =>
    ["GitHub", "LinkedIn", "Bluesky", "Ko-fi", "Underscore Games"].includes(
      l.title
    )
  )
  .map((l) => l.url);

/** Frontmatter dates are "YYYY-MM-DD" strings; only emit ones that parse. */
export function isoDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${URL_}/#person`,
    name: SITE.name,
    givenName: "Phil",
    familyName: "Vishnevsky",
    url: `${URL_}/`,
    image: `${URL_}/og/about.png`,
    jobTitle: "Software Engineer",
    description:
      "Full-stack engineer in Hartford, CT building servers, web apps, and games.",
    email: `mailto:${SITE.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hartford",
      addressRegion: "CT",
      addressCountry: "US",
    },
    sameAs,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${URL_}/#website`,
    name: SITE.name,
    url: `${URL_}/`,
    inLanguage: "en",
    author: { "@id": `${URL_}/#person` },
    publisher: { "@id": `${URL_}/#person` },
  };
}

export function profilePageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${URL_}/about/#profilepage`,
    url: `${URL_}/about/`,
    mainEntity: personSchema(),
    inLanguage: "en",
  };
}

export function blogPostingSchema({
  title,
  description,
  path,
  published,
  modified,
  image,
  tags,
}: {
  title: string;
  description?: string;
  path: string;
  published?: string;
  modified?: string;
  image: string;
  tags?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${URL_}${path}#blogposting`,
    headline: title,
    ...(description ? { description } : {}),
    url: `${URL_}${path}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${URL_}${path}` },
    image: [image],
    ...(published ? { datePublished: published } : {}),
    ...(modified ? { dateModified: modified } : {}),
    author: {
      "@id": `${URL_}/#person`,
      name: SITE.name,
      url: `${URL_}/about/`,
    },
    publisher: { "@id": `${URL_}/#person` },
    isPartOf: { "@id": `${URL_}/#website` },
    ...(tags?.length ? { keywords: tags.join(", ") } : {}),
    inLanguage: "en",
  };
}

export function creativeWorkSchema({
  name,
  description,
  path,
  date,
  image,
  tags,
  repo,
  live,
}: {
  name: string;
  description?: string;
  path: string;
  date?: string;
  image: string;
  tags?: string[];
  repo?: string;
  live?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${URL_}${path}#creativework`,
    name,
    ...(description ? { description } : {}),
    url: `${URL_}${path}`,
    ...(date ? { dateCreated: date } : {}),
    image: [image],
    author: {
      "@id": `${URL_}/#person`,
      name: SITE.name,
      url: `${URL_}/about/`,
    },
    ...(repo ? { codeRepository: repo } : {}),
    ...(live && live !== repo ? { contentUrl: live } : {}),
    ...(tags?.length ? { keywords: tags.join(", ") } : {}),
    inLanguage: "en",
  };
}
