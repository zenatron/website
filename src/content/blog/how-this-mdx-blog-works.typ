#metadata((
  title: "How I Built My MDX Blog System (and Why It's Fast Enough)",
  date: "2025-02-21",
  readingTime: "22min",
  excerpt: "A behind‑the‑scenes look at how my MDX pipeline works, how I render posts, and where performance really matters.",
  tags: ("mdx", "nextjs", "performance", "web-dev"),
))<frontmatter>
#import "_components.typ": callout

I wanted a blog that felt like *#link("https://en.wikipedia.org/wiki/Markdown")[Markdown]*, but could still render React components, callouts, and embeds without turning into a templating mess. *#link("https://mdxjs.com/")[MDX]* hit the sweet spot.

#html.elem("img", attrs: (src: "/images/blog/how-this-mdx-blog-works/mdx-pipeline.svg", alt: "MDX pipeline diagram", style: "border-radius: 0.5rem; margin: 1.5rem auto; max-width: 100%; height: auto;"))
#html.elem("img", attrs: (src: "/images/blog/how-this-mdx-blog-works/compile-flow.svg", alt: "MDX compilation flow diagram", style: "border-radius: 0.5rem; margin: 1.5rem auto; max-width: 100%; height: auto;"))

= Why MDX (not just Markdown)

Markdown is simple and portable. The downside: you're stuck with plain content. MDX gives you the ability to *import React components* right inside a post, which means you can drop in things like callouts, counters, or custom embeds. Under the hood, MDX turns your content into a structured syntax tree (think *#link("https://en.wikipedia.org/wiki/Abstract_syntax_tree")[AST]*) before it becomes React.

If you've used a static site generator before, MDX feels like "Markdown with superpowers" — but it's still readable in plain text, which keeps the writing workflow fast.

Example:

```mdx
import Callout from '@/components/mdx/Callout';

<Callout type="info" title="Quick tip">
  This is an MDX component rendered inside your post.
</Callout>
```

= The pipeline: files → frontmatter → compiled content

At a high level, my posts live in `src/content/blog/*.mdx`. When a blog page is requested, the site:

+ *Reads the file* from disk
+ *Parses #link("https://en.wikipedia.org/wiki/YAML#Front_matter")[front matter]* with #link("https://github.com/jonschlinkert/gray-matter")[gray-matter]
+ *Compiles MDX* using #link("https://github.com/hashicorp/next-mdx-remote")[next-mdx-remote]
+ *Runs a remark/rehype pipeline* (Markdown → HTML) for math, tables, syntax highlighting, and heading slugs

This happens in the `getBlogPostBySlug` function and `getAllBlogPosts` list builder.

The key point: the MDX compilation happens on the server, not in the browser. That means visitors aren't shipping a Markdown parser to render your content — they get clean HTML.

Here's the actual code that loads a post:

```typescript
export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  // Try MDX file first, then fall back to MD
  let fullPath = path.join(blogDirectory, `${slug}.mdx`);

  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(blogDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) {
      return null;
    }
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  // Extract plain text for searching
  const searchableContent = extractPlainText(content);

  // Extract headings from the raw content
  const headings = extractHeadings(content);

  const { content: compiledContent } = await compileMDX({
    source: content,
    components,
    options: {
      parseFrontmatter: false, // We already parsed it with gray-matter
      mdxOptions: {
        remarkPlugins: [remarkMath, remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          rehypeKatex,
          [rehypeHighlight, rehypeHighlightOptions],
        ],
        development: process.env.NODE_ENV === "development",
      },
    },
  });

  return {
    slug,
    content: compiledContent,
    searchableContent,
    headings,
    metadata: { /* ... */ },
  };
}
```

= Deep dive: the remark/rehype plugin pipeline

Here's where things get interesting. MDX doesn't just parse Markdown — it runs your content through a *#link("https://unifiedjs.com/")[unified]* pipeline with two processing stages:

+ *#link("https://github.com/remarkjs/remark")[Remark]* — operates on the Markdown AST (#link("https://github.com/syntax-tree/mdast")[mdast])
+ *#link("https://github.com/rehypejs/rehype")[Rehype]* — operates on the HTML AST (#link("https://github.com/syntax-tree/hast")[hast])

The flow looks like this:

```
MDX Source
    ↓
Parse to mdast (Markdown AST)
    ↓
Remark plugins transform mdast
    ↓
Convert to hast (HTML AST)
    ↓
Rehype plugins transform hast
    ↓
Stringify to JSX/React components
```

== My plugin stack

Here's exactly what I'm using and why:

```typescript
mdxOptions: {
  remarkPlugins: [remarkMath, remarkGfm],
  rehypePlugins: [
    rehypeSlug,      // Add IDs to headings
    rehypeKatex,     // Render LaTeX math
    [rehypeHighlight, rehypeHighlightOptions],
  ],
}
```

#table(
  columns: 3,
  table.header([*Plugin*], [*Stage*], [*Purpose*]),
  [#link("https://github.com/remarkjs/remark-math")[remark-math]], [Remark], [Parses `$inline$` and `$$block$$` math syntax],
  [#link("https://github.com/remarkjs/remark-gfm")[remark-gfm]], [Remark], [Enables GitHub Flavored Markdown (tables, strikethrough, autolinks)],
  [#link("https://github.com/rehypejs/rehype-slug")[rehype-slug]], [Rehype], [Auto-generates `id` attributes on headings for anchor links],
  [#link("https://github.com/remarkjs/remark-math/tree/main/packages/rehype-katex")[rehype-katex]], [Rehype], [Renders math expressions using #link("https://katex.org/")[KaTeX]],
  [#link("https://github.com/rehypejs/rehype-highlight")[rehype-highlight]], [Rehype], [Syntax highlighting via #link("https://highlightjs.org/")[highlight.js]],
)

#callout("tip", title: "Plugin order matters")[Remark plugins run first (on Markdown), then Rehype plugins run on the resulting HTML. Within each stage, plugins run in array order. Put `rehypeSlug` before anything that depends on heading IDs.]

== Syntax highlighting configuration

I configure `rehype-highlight` with auto-detection so I don't have to specify every language:

```typescript
const rehypeHighlightOptions = {
  detect: true,      // Auto-detect language if not specified
  ignoreMissing: true, // Don't throw on missing language
  subset: false,     // Use all languages
};
```

The `ignoreMissing: true` is key — it prevents the build from exploding if I use a language that highlight.js doesn't recognize.

= Table of contents + searchability

I wanted a TOC on every post and quick search on the blog index. So I added two features:

- *Heading extraction* for a table of contents (I parse raw Markdown headings so the TOC is stable and predictable)
- *Plain‑text extraction* for search (strip imports, JSX, code blocks, then index the result)

The TOC uses `rehype-slug` to ensure headings have predictable IDs, which is why the anchor links stay stable across builds.

Here's the heading extraction logic:

```typescript
export function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const usedIds = new Set<string>();

  // Regular expression to match markdown headings (# ## ### etc.)
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();

    // Generate unique ID
    const baseId = generateSlug(text);
    let id = baseId;
    let counter = 1;

    // Ensure ID is unique
    while (usedIds.has(id)) {
      id = `${baseId}-${counter}`;
      counter++;
    }

    usedIds.add(id);
    headings.push({ id, text, level });
  }

  return headings;
}
```

#callout("note", title: "Tiny performance win")[Doing those extra passes once during compilation keeps the client UI lightweight.]

== Plain text extraction for search

The search index strips away all the MDX noise to get searchable content:

`````typescript
function extractPlainText(content: string): string {
  // Remove import statements
  let plainText = content.replace(/import\s+.*?from\s+['"].*?['"]/g, "");

  // Remove JSX/HTML tags
  plainText = plainText.replace(/<[^>]*>/g, " ");

  // Remove code blocks
  plainText = plainText.replace(/```[\s\S]*?```/g, "");

  // Remove inline code
  plainText = plainText.replace(/`.*?`/g, "");

  // Remove Markdown formatting
  plainText = plainText
    .replace(/#{1,6}\s+/g, "")     // Headers
    .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
    .replace(/\*(.*?)\*/g, "$1")   // Italic
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Links
    .replace(/!\[(.*?)\]\(.*?\)/g, "$1") // Images
    .replace(/\n>/g, "\n");        // Blockquotes

  // Remove extra whitespace
  plainText = plainText.replace(/\s+/g, " ").trim();

  return plainText;
}
`````

This gives me instant client-side filtering without needing a full-text search engine.

= Creating custom MDX components

Want to add a new component? Here's the pattern I use:

== Step 1: Create the component

```tsx
// src/components/mdx/MyComponent.tsx
import React from "react";

interface MyComponentProps {
  title: string;
  children: React.ReactNode;
}

export default function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div className="my-4 p-4 border border-accent/30 rounded-lg">
      <h4 className="font-bold mb-2">{title}</h4>
      <div>{children}</div>
    </div>
  );
}
```

== Step 2: Register it in the MDX components map

In `src/lib/blog.ts`, add your component to the registry:

```typescript
import Counter from "@/components/mdx/Counter";
import Callout from "@/components/mdx/Callout";
import MyComponent from "@/components/mdx/MyComponent";

const components = {
  Counter,
  Callout,
  MyComponent, // Add it here
};
```

== Step 3: Use it in your MDX

```mdx
import MyComponent from '@/components/mdx/MyComponent';

<MyComponent title="Hello">
  This content renders inside the component.
</MyComponent>
```

#callout("warning", title: "Client components need 'use client'")[If your component uses hooks like `useState` or `useEffect`, add `"use client"` at the top. Server components can't use React state.]

== Current component inventory

Here's what I've got available:

#table(
  columns: 3,
  table.header([*Component*], [*Type*], [*Purpose*]),
  [`Callout`], [Server], [Tips, warnings, notes with styled boxes],
  [`Counter`], [Client], [Interactive counter demo (uses useState)],
  [`NotebookEmbed`], [Client], [Lazy-loads Jupyter notebook HTML with collapsible UI],
)

The constraint is intentional: fewer components means fewer ways for content to break over time.

= Styling: a focused MDX layer

All post content is wrapped in `.mdx-content`, with typography and media styles in `src/app/markdown.css`. That means:

- Code blocks look good without extra wrappers
- Tables are readable
- Images and iframes are responsive by default

Because the styles are centralized in a single file, I can tweak typography without editing every post. That's a small thing that pays off over time.

The CSS uses CSS custom properties for theming:

```css
.mdx-content {
  color: var(--primary-text);
  font-family: "Atkinson Hyperlegible", system-ui, sans-serif;
}

.mdx-content code:not(pre code) {
  background-color: var(--code-bg);
  color: var(--code-text);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.mdx-content pre {
  background-color: var(--code-bg);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}
```

= The build process: what actually happens

When you run `next build`, here's the flow:

+ *#link("https://nextjs.org/docs/app/api-reference/functions/generate-static-params")[generateStaticParams]* scans `src/content/blog/` for all `.mdx` and `.md` files
+ For each slug, Next.js calls the page component at build time
+ `getBlogPostBySlug` reads, parses, and compiles each post
+ The compiled React components get serialized into the static output
+ At runtime, the server returns pre-rendered HTML — no MDX compilation needed

```typescript
export async function generateStaticParams() {
  const files = fs.readdirSync(blogDirectory);
  return files
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => ({
      slug: file.replace(/\.(md|mdx)$/, ""),
    }));
}
```

This is #link("https://nextjs.org/docs/pages/building-your-application/rendering/static-site-generation")[Static Site Generation (SSG)] — pages are built once and served as static HTML.

= SEO considerations

MDX plays nicely with SEO because the output is clean HTML. Here's what I'm doing:

== Semantic HTML structure

- One `<h1>` per page (the post title)
- Proper heading hierarchy (`h2` → `h3` → `h4`)
- `<time>` elements for dates
- `<article>` wrapper for the main content

== Meta tags and Open Graph

Next.js 13+ uses the #link("https://nextjs.org/docs/app/building-your-application/optimizing/metadata")[Metadata API]. You can generate these from frontmatter:

```typescript
export async function generateMetadata({ params }) {
  const post = await getBlogPostBySlug(params.slug);
  return {
    title: post.metadata.title,
    description: post.metadata.excerpt,
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.excerpt,
      type: 'article',
      publishedTime: post.metadata.date,
    },
  };
}
```

== Structured data

For blog posts, you can add #link("https://json-ld.org/")[JSON-LD] structured data:

```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.metadata.title,
  datePublished: post.metadata.date,
  author: { '@type': 'Person', name: 'Your Name' },
};
```

#callout("tip", title: "Test your structured data")[Use #link("https://search.google.com/test/rich-results")[Google's Rich Results Test] to validate your JSON-LD before deploying.]

== URL structure

Clean URLs like `/blog/my-post-slug` are better than query strings. The file-based routing handles this automatically — `my-post.mdx` becomes `/blog/my-post`.

= Performance: where it matters (and where it doesn't)

The two main performance costs are:

+ *Compilation time* – MDX compilation is expensive compared to plain Markdown.
+ *List page aggregation* – the blog index compiles every post so it can render excerpts, tags, and searchable text.
+ *Syntax highlighting* – code highlighting adds overhead, but it keeps posts readable for technical content.

== Actual metrics from my site

#table(
  columns: 3,
  table.header([*Metric*], [*Value*], [*Notes*]),
  [Build time (10 posts)], [~8-12s], [Includes full MDX compilation],
  [Per-post compile time], [~200-400ms], [Varies with code blocks and math],
  [Page weight (typical post)], [~80-120KB], [Gzipped, includes fonts],
  [First Contentful Paint], [~0.8-1.2s], [Static HTML helps a lot],
  [Largest Contentful Paint], [~1.0-1.5s], [Usually the hero image],
)

If I ever hit scaling issues, the next step would be *pre‑compiling* MDX into cached artifacts at build time and only re‑compiling changed posts.

In practice, this is fine for a small‑to‑mid sized blog. If I were scaling to hundreds of posts, I'd pre‑compile content or cache compiled output.

= Performance optimization tips

== 1. Lazy load heavy components

The `NotebookEmbed` component only fetches HTML when expanded:

```tsx
useEffect(() => {
  // Only load HTML when expanded
  if (isOpen && !htmlContent) {
    setLoading(true);
    fetch(`/downloads/${notebookHtml}.html`)
      .then((res) => res.text())
      .then((content) => {
        setHtmlContent(content);
        setLoading(false);
      });
  }
}, [isOpen, notebookHtml, htmlContent]);
```

== 2. Use Next.js Image optimization

For images in MDX, consider using Next.js `<Image>` instead of raw `<img>`:

```mdx
import Image from 'next/image';

<Image
  src="/images/blog/my-image.png"
  alt="Description"
  width={800}
  height={400}
  priority={false}
/>
```

This gets you automatic WebP conversion, lazy loading, and responsive sizing.

== 3. Minimize client-side JavaScript

Keep components server-rendered when possible. Only add `"use client"` when you need interactivity. My `Callout` component is a server component — it renders to static HTML with zero JavaScript.

== 4. Code splitting for syntax highlighting

If you're using a lot of languages, consider #link("https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading")[dynamic imports] for highlight.js languages:

```typescript
const rehypeHighlightOptions = {
  detect: true,
  ignoreMissing: true,
  subset: false, // Use subset: ['javascript', 'python', 'bash'] for smaller bundles
};
```

= Rendering model (why the page still feels snappy)

The heavy lifting happens on the server. By the time the browser gets the page, the MDX is already rendered into HTML and styled by the `.mdx-content` layer. That's classic *#link("https://en.wikipedia.org/wiki/Server-side_scripting")[server‑side rendering]*: the client only needs to display the result, not compile it.

With Next.js 13+ and the App Router, you get the benefits of #link("https://nextjs.org/docs/app/building-your-application/rendering/server-components")[React Server Components] — most of the page is static HTML with no client-side React hydration needed.

= The parts I don't want to compromise on

- *Readable source files* (writing should feel like writing, not coding).
- *Composable components* (callouts, embeds, and custom UI).
- *Plain SEO‑friendly HTML* on the other side.

MDX checks all three boxes for me.

= Measuring performance (lightweight but honest)

I keep an eye on:

- Build time (does compiling all posts start to drag?)
- Page load on mobile (do embeds slow things down?)
- Core Web Vitals for individual posts

If any of those start to slip, I'll adjust the pipeline rather than throwing more JS at the browser.

#callout("info", title: "Why I'm okay with it")[For my current post volume, build‑time compilation is a trade‑off I'm happy with: simpler code, fewer moving parts, and no extra build pipeline.]

= What I'd improve next

- *Incremental compilation* (only rebuild changed posts) — #link("https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#revalidating-data")[Next.js ISR] could help here
- *Prebuilt search index* for faster client filtering — consider #link("https://fusejs.io/")[Fuse.js] or #link("https://github.com/nextapps-de/flexsearch")[FlexSearch]
- *Image optimization* with metadata (width/height) for layout stability
- *RSS feed generation* from the post metadata

= A note on images and embeds

Images live in `public/images/blog/...`, which keeps paths stable and makes them easy to reference from MDX. For videos, I use responsive `<iframe>` embeds that inherit the `.mdx-content` styling so they don't overflow the layout on small screens.

= A quick video that inspired the approach

#html.elem("iframe", attrs: (src: "https://www.youtube.com/embed/1B0d9QwCw1o", title: "MDX in Next.js", style: "width: 100%; aspect-ratio: 16/9; border: 0; border-radius: 0.5rem; margin: 1.5rem 0;", allowfullscreen: "true"))

= Further reading

- #link("https://mdxjs.com/")[MDX Official Documentation] — the definitive guide
- #link("https://github.com/hashicorp/next-mdx-remote")[next-mdx-remote GitHub] — the library I use
- #link("https://unifiedjs.com/")[Unified.js ecosystem] — the parser that powers remark/rehype
- #link("https://nextjs.org/docs/app")[Next.js App Router docs] — how routing and rendering work
- #link("https://web.dev/vitals/")[Core Web Vitals] — what to measure for performance

= Examples you can read next

- #link("/blog/what-is-a-vpn")[What Is a VPN?]
- #link("/blog/tailscale-explained")[Tailscale Explained]
- #link("/blog/self-hosting-with-tailscale")[Self‑Hosting With Tailscale]

If you're building your own MDX pipeline and want to compare notes, I'm happy to share more details.
