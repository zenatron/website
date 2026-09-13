import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import { execSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";

/**
 * Sitemap dates and series, read straight from frontmatter: the sitemap
 * integration runs before the content layer exists, so there is no
 * astro:content here. `updated` wins over `date` when a post was revised.
 */
function readContent(dir, prefix) {
  return readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const text = readFileSync(new URL(`./${dir}/${file}`, import.meta.url), "utf8");
      const fm = text.slice(0, text.indexOf("---", 3));
      const pick = (key) => fm.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]+)`, "m"))?.[1];
      return {
        // Astro slugifies filenames to lowercase; a frontmatter slug is used as-is.
        path: `${prefix}/${(pick("slug") ?? file.replace(/\.mdx$/, "")).toLowerCase()}/`,
        date: pick("updated") ?? pick("date"),
        series: pick("series"),
      };
    });
}

const content = [
  ...readContent("src/content/blog", "/blog"),
  ...readContent("src/content/projects", "/projects"),
];

/** Coursework stays live for the class, but leaves the index and sitemap. */
const coursework = new Set(content.filter((e) => e.series === "data-mining").map((e) => e.path));

const lastmod = new Map(
  content
    .filter((e) => e.date && !Number.isNaN(new Date(e.date).getTime()))
    .map((e) => [e.path, new Date(e.date).toISOString()])
);

/** The status bar shows the site's version, from package.json. */
const { version } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

/** The status bar shows the real branch. Read once, at build time. */
function gitBranch() {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "main";
  }
}

/**
 * Wraps every table in a `.table-wrap` scroll container, which prose.css
 * already styles, so a wide table scrolls inside itself on a phone instead
 * of being clipped by the window. No dependency: it's a tree walk.
 */
function rehypeWrapTables() {
  const walk = (node) => {
    if (!node.children) return;
    node.children = node.children.map((child) => {
      if (child.type === "element" && child.tagName === "table") {
        return {
          type: "element",
          tagName: "div",
          properties: { className: ["table-wrap"] },
          children: [child],
        };
      }
      walk(child);
      return child;
    });
  };
  return (tree) => walk(tree);
}

export default defineConfig({
  site: "https://pvi.sh",
  integrations: [
    tailwind({ applyBaseStyles: false }),
    mdx(),
    sitemap({
      filter: (page) => !coursework.has(new URL(page).pathname),
      serialize: (item) => {
        const date = lastmod.get(new URL(item.url).pathname);
        if (date) item.lastmod = date;
        return item;
      },
    }),
  ],
  markdown: {
    remarkPlugins: [remarkMath, remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeKatex, rehypeWrapTables],
    // Shiki mapped onto the palette. Shipping github-dark or dracula would
    // drop a dozen off-palette colors into the most prominent element on
    // the site — see src/lib/shiki-theme.js.
    shikiConfig: {
      themes: {
        light: (await import("./src/lib/shiki-theme.js")).pvishLight,
        dark: (await import("./src/lib/shiki-theme.js")).pvishDark,
      },
      // Shiki has no Caddyfile grammar and 15 blocks were falling back to
      // plaintext. nginx is close enough to color directives and braces.
      langAlias: { caddyfile: "nginx", Caddyfile: "nginx" },
    },
  },
  redirects: {
    // Renamed: the desk became the dock, elsewhere became say hi.
    "/stack": "/dock",
    "/desk": "/dock",
    "/links": "/say-hi",
    "/contact": "/say-hi",
    "/principles": "/blog/principles",
    "/resume": "/downloads/Resume_Phil_Vishnevsky.pdf",
  },
  vite: {
    server: { allowedHosts: ["cachyos"] },
    define: {
      __GIT_BRANCH__: JSON.stringify(gitBranch()),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __APP_VERSION__: JSON.stringify(version),
    },
  },
});
