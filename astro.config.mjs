import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

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
  integrations: [tailwind({ applyBaseStyles: false }), mdx(), sitemap()],
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
