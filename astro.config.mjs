import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import { typst } from "astro-typst";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";

export default defineConfig({
  site: "https://philvishnevsky.com",
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    mdx(),
    typst({
      options: {
        remPx: 16,
      },
      target: () => "html",
    }),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [remarkMath, remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeKatex],
  },
  redirects: {
    "/principles": "/blog/principles",
  },
  vite: {
    ssr: {
      external: ["@myriaddreamin/typst-ts-node-compiler"],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("framer-motion")) return "framer-motion";
            if (id.includes("react-icons")) return "react-icons";
            if (id.includes("katex")) return "katex";
          },
        },
      },
    },
  },
});
