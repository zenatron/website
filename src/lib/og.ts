/**
 * Dynamic OG image generator using satori + sharp.
 * Renders an Atom One Dark terminal-style card as a 1200×630 PNG.
 */
import satori from "satori";
import sharp from "sharp";

/* Atom One Dark palette (hardcoded — OG runs at build time, not in browser) */
const OG = {
  bg: "#282c34",
  fg: "#abb2bf",
  purple: "#c678dd",
  blue: "#61afef",
  green: "#98c379",
  yellow: "#e5c07b",
  red: "#e06c75",
  comment: "#5c6370",
  gutter: "#3e4451",
};

async function loadFont(): Promise<ArrayBuffer> {
  // Satori requires TTF/OTF, not woff2. Use JetBrains Mono TTF from GitHub.
  const res = await fetch(
    "https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/fonts/ttf/JetBrainsMono-Regular.ttf"
  );
  if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`);
  return res.arrayBuffer();
}

let fontCache: ArrayBuffer | null = null;
async function getFont(): Promise<ArrayBuffer> {
  if (!fontCache) fontCache = await loadFont();
  return fontCache;
}

interface OGOptions {
  title: string;
  subtitle?: string;
  tags?: string[];
  type?: string; // "blog" | "project" | "page"
}

export async function generateOGImage(options: OGOptions): Promise<Buffer> {
  const { title, subtitle, tags = [], type = "page" } = options;
  const font = await getFont();

  const commandPrefix = type === "blog"
    ? "cat ~/blog/"
    : type === "project"
      ? "ls ~/projects/"
      : "cd ~/";

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0f1012",
          fontFamily: "JetBrains Mono",
          padding: "0",
        },
        children: [
          // Terminal window
          {
            type: "div",
            props: {
              style: {
                margin: "40px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                borderRadius: "12px",
                border: `2px solid ${OG.gutter}`,
                backgroundColor: OG.bg,
                overflow: "hidden",
              },
              children: [
                // Title bar
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "16px 20px",
                      borderBottom: `1px solid ${OG.gutter}`,
                    },
                    children: [
                      // Traffic lights
                      {
                        type: "div",
                        props: {
                          style: { display: "flex", gap: "8px" },
                          children: [
                            { type: "div", props: { style: { width: 14, height: 14, borderRadius: "50%", backgroundColor: OG.red } } },
                            { type: "div", props: { style: { width: 14, height: 14, borderRadius: "50%", backgroundColor: OG.yellow } } },
                            { type: "div", props: { style: { width: 14, height: 14, borderRadius: "50%", backgroundColor: OG.green } } },
                          ],
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: { flex: 1, textAlign: "center", color: OG.comment, fontSize: "16px" },
                          children: "philvishnevsky.com",
                        },
                      },
                      { type: "div", props: { style: { width: "62px" } } },
                    ],
                  },
                },
                // Body
                {
                  type: "div",
                  props: {
                    style: {
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      padding: "40px 48px",
                      gap: "20px",
                    },
                    children: [
                      // Command line
                      {
                        type: "div",
                        props: {
                          style: { display: "flex", gap: "8px", fontSize: "18px" },
                          children: [
                            { type: "span", props: { style: { color: OG.green }, children: "$" } },
                            { type: "span", props: { style: { color: OG.fg }, children: commandPrefix } },
                          ],
                        },
                      },
                      // Title
                      {
                        type: "div",
                        props: {
                          style: {
                            color: OG.fg,
                            fontSize: title.length > 40 ? "36px" : "44px",
                            fontWeight: 700,
                            lineHeight: 1.2,
                            letterSpacing: "-0.02em",
                          },
                          children: title,
                        },
                      },
                      // Subtitle
                      ...(subtitle
                        ? [{
                            type: "div" as const,
                            props: {
                              style: { color: OG.comment, fontSize: "20px", lineHeight: 1.4 },
                              children: subtitle,
                            },
                          }]
                        : []),
                      // Tags
                      ...(tags.length > 0
                        ? [{
                            type: "div" as const,
                            props: {
                              style: { display: "flex", gap: "10px", flexWrap: "wrap" as const, marginTop: "8px" },
                              children: tags.slice(0, 5).map((tag) => ({
                                type: "span" as const,
                                props: {
                                  style: {
                                    color: OG.blue,
                                    fontSize: "16px",
                                  },
                                  children: `[${tag}]`,
                                },
                              })),
                            },
                          }]
                        : []),
                    ],
                  },
                },
                // Status bar
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px 20px",
                      borderTop: `1px solid ${OG.gutter}`,
                      color: OG.comment,
                      fontSize: "14px",
                    },
                    children: [
                      { type: "span", props: { children: "Phil Vishnevsky" } },
                      { type: "span", props: { style: { color: OG.purple }, children: type.toUpperCase() } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "JetBrains Mono",
          data: font,
          weight: 400,
          style: "normal",
        },
        {
          name: "JetBrains Mono",
          data: font,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return png;
}
