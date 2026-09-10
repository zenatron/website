import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import { execSync } from "node:child_process";

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

export default defineConfig({
  site: "https://pvi.sh",
  integrations: [tailwind({ applyBaseStyles: false }), mdx(), sitemap()],
  markdown: {
    remarkPlugins: [remarkMath, remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeKatex],
    // Shiki mapped onto the palette. Shipping github-dark or dracula would
    // drop a dozen off-palette colors into the most prominent element on
    // the site — see src/lib/shiki-theme.js.
    shikiConfig: {
      themes: {
        light: (await import("./src/lib/shiki-theme.js")).pvishLight,
        dark: (await import("./src/lib/shiki-theme.js")).pvishDark,
      },
      // Shiki has no Caddyfile grammar and 15 blocks were falling back to
      // plaintext. nginx is close enough to colour directives and braces.
      langAlias: { caddyfile: "nginx", Caddyfile: "nginx" },
    },
  },
  redirects: {
    "/principles": "/blog/principles",
    "/resume": "/downloads/Resume_Phil_Vishnevsky.pdf",
  },
  vite: {
    server: { allowedHosts: ["cachyos"] },
    define: {
      __GIT_BRANCH__: JSON.stringify(gitBranch()),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
  },
});
