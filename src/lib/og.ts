/**
 * Dynamic OG image generator using satori + sharp.
 * Renders an Atom One Dark terminal-style card as a 1200×630 PNG.
 *
 * Two scene variants:
 *   - "default" — single-pane title card (used by blog, projects, generic pages)
 *   - "about"   — richer two-pane layout for /about
 */
import satori from "satori";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/* Atom One Dark palette (hardcoded — OG runs at build time, not in browser) */
const OG = {
  bg: "#282c34",
  bgDeep: "#0f1012",
  fg: "#abb2bf",
  white: "#e6e6e6",
  purple: "#c678dd",
  blue: "#61afef",
  cyan: "#56b6c2",
  green: "#98c379",
  yellow: "#e5c07b",
  orange: "#d19a66",
  red: "#e06c75",
  comment: "#5c6370",
  gutter: "#3e4451",
};

/**
 * JetBrains Mono is vendored at src/assets/fonts. Satori needs TTF/OTF,
 * so we keep both the Regular and Bold cuts on disk and read them once.
 *
 * `process.cwd()` is the project root in both dev and build (Astro spawns
 * this process from there). `import.meta.url` would be unstable under the
 * bundler since og.ts gets relocated to dist/.
 */
async function loadFont(weight: 400 | 700): Promise<Buffer> {
  const filename =
    weight === 700 ? "JetBrainsMono-Bold.ttf" : "JetBrainsMono-Regular.ttf";
  const fontPath = join(process.cwd(), "src", "assets", "fonts", filename);
  return readFile(fontPath);
}

const fontCache: { regular?: Buffer; bold?: Buffer } = {};
async function getFonts(): Promise<{ regular: Buffer; bold: Buffer }> {
  if (!fontCache.regular) fontCache.regular = await loadFont(400);
  if (!fontCache.bold) fontCache.bold = await loadFont(700);
  return { regular: fontCache.regular, bold: fontCache.bold };
}

interface OGOptions {
  title: string;
  subtitle?: string;
  tags?: string[];
  type?: string; // "blog" | "project" | "page"
  /** Scene variant. "about" renders a richer two-pane layout. */
  variant?: "default" | "about";
}

/* ── Shared chrome ── */

function trafficLights() {
  return {
    type: "div" as const,
    props: {
      style: { display: "flex", gap: "8px" },
      children: [
        { type: "div" as const, props: { style: { width: 14, height: 14, borderRadius: "50%", backgroundColor: OG.red } } },
        { type: "div" as const, props: { style: { width: 14, height: 14, borderRadius: "50%", backgroundColor: OG.yellow } } },
        { type: "div" as const, props: { style: { width: 14, height: 14, borderRadius: "50%", backgroundColor: OG.green } } },
      ],
    },
  };
}

function titleBar(label: string) {
  return {
    type: "div" as const,
    props: {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "16px 20px",
        borderBottom: `1px solid ${OG.gutter}`,
      },
      children: [
        trafficLights(),
        { type: "div" as const, props: { style: { flex: 1, textAlign: "center", color: OG.comment, fontSize: "16px" }, children: label } },
        { type: "div" as const, props: { style: { width: "62px" } } },
      ],
    },
  };
}

function statusBar(left: string, right: string, rightColor = OG.purple) {
  return {
    type: "div" as const,
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
        { type: "span" as const, props: { children: left } },
        { type: "span" as const, props: { style: { color: rightColor }, children: right } },
      ],
    },
  };
}

/* ── About variant ── */

/**
 * Renders a colored "key": value JSON-style line for the right pane.
 */
function jsonLine(opts: {
  key: string;
  value: string;
  valueColor: string;
  /** Wrap the value in quotes (string literal). */
  quoted?: boolean;
  comma?: boolean;
  indent?: number;
}) {
  const { key, value, valueColor, quoted = true, comma = true, indent = 2 } = opts;
  return {
    type: "div" as const,
    props: {
      style: { display: "flex", whiteSpace: "pre" },
      children: [
        { type: "span" as const, props: { style: { color: OG.comment }, children: " ".repeat(indent) } },
        { type: "span" as const, props: { style: { color: OG.red }, children: `"${key}"` } },
        { type: "span" as const, props: { style: { color: OG.fg }, children: ": " } },
        { type: "span" as const, props: { style: { color: valueColor }, children: quoted ? `"${value}"` : value } },
        { type: "span" as const, props: { style: { color: OG.fg }, children: comma ? "," : "" } },
      ],
    },
  };
}

function treeLine(opts: { prefix: string; name: string; isHighlight?: boolean }) {
  const { prefix, name, isHighlight } = opts;
  return {
    type: "div" as const,
    props: {
      style: { display: "flex", whiteSpace: "pre", fontSize: "20px" },
      children: [
        { type: "span" as const, props: { style: { color: OG.gutter }, children: prefix } },
        { type: "span" as const, props: { style: { color: isHighlight ? OG.yellow : OG.fg }, children: name } },
      ],
    },
  };
}

function aboutBody() {
  return {
    type: "div" as const,
    props: {
      style: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "26px 40px 22px 40px",
        gap: "14px",
      },
      children: [
        // Command + name block
        {
          type: "div" as const,
          props: {
            style: { display: "flex", flexDirection: "column", gap: "6px" },
            children: [
              {
                type: "div" as const,
                props: {
                  style: { display: "flex", gap: "10px", fontSize: "18px" },
                  children: [
                    { type: "span" as const, props: { style: { color: OG.green }, children: "$" } },
                    { type: "span" as const, props: { style: { color: OG.fg }, children: "whoami" } },
                    { type: "span" as const, props: { style: { color: OG.purple }, children: "--verbose" } },
                  ],
                },
              },
              {
                type: "div" as const,
                props: {
                  style: {
                    color: OG.white,
                    fontSize: "52px",
                    fontWeight: 700,
                    lineHeight: 1.0,
                    letterSpacing: "-0.025em",
                  },
                  children: "Phil Vishnevsky",
                },
              },
              {
                type: "div" as const,
                props: {
                  style: { display: "flex", gap: "10px", fontSize: "18px", flexWrap: "wrap" },
                  children: [
                    { type: "span" as const, props: { style: { color: OG.cyan }, children: "Software Engineer" } },
                    { type: "span" as const, props: { style: { color: OG.gutter }, children: "·" } },
                    { type: "span" as const, props: { style: { color: OG.cyan }, children: "AI Tinkerer" } },
                    { type: "span" as const, props: { style: { color: OG.gutter }, children: "·" } },
                    { type: "span" as const, props: { style: { color: OG.cyan }, children: "Homelabber" } },
                    { type: "span" as const, props: { style: { color: OG.gutter, marginLeft: "8px" }, children: "→" } },
                    { type: "span" as const, props: { style: { color: OG.blue }, children: "pvi.sh/about" } },
                  ],
                },
              },
            ],
          },
        },

        // Two-pane split: tree (left) | profile JSON (right)
        {
          type: "div" as const,
          props: {
            style: { display: "flex", gap: "16px", flex: 1, minHeight: 0 },
            children: [
              // Left pane — file tree
              {
                type: "div" as const,
                props: {
                  style: {
                    width: "270px",
                    display: "flex",
                    flexDirection: "column",
                    padding: "14px 16px",
                    borderRadius: "10px",
                    border: `1px solid ${OG.gutter}`,
                    backgroundColor: "#21252b",
                    gap: "4px",
                  },
                  children: [
                    {
                      type: "div" as const,
                      props: {
                        style: { display: "flex", gap: "8px", fontSize: "15px", marginBottom: "4px" },
                        children: [
                          { type: "span" as const, props: { style: { color: OG.green }, children: "$" } },
                          { type: "span" as const, props: { style: { color: OG.fg }, children: "tree" } },
                          { type: "span" as const, props: { style: { color: OG.blue }, children: "~/about" } },
                        ],
                      },
                    },
                    treeLine({ prefix: "├─ ", name: "intro.md" }),
                    treeLine({ prefix: "├─ ", name: "experience/" }),
                    treeLine({ prefix: "├─ ", name: "now.json" }),
                    treeLine({ prefix: "├─ ", name: "principles.md" }),
                    treeLine({ prefix: "└─ ", name: "contact.sh", isHighlight: true }),
                    {
                      type: "div" as const,
                      props: {
                        style: { color: OG.comment, fontSize: "13px", marginTop: "6px" },
                        children: "// 5 chapters",
                      },
                    },
                  ],
                },
              },

              // Right pane — profile.json
              {
                type: "div" as const,
                props: {
                  style: {
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    padding: "14px 18px",
                    borderRadius: "10px",
                    border: `1px solid ${OG.gutter}`,
                    backgroundColor: "#21252b",
                    fontSize: "18px",
                    gap: "2px",
                  },
                  children: [
                    {
                      type: "div" as const,
                      props: {
                        style: { display: "flex", gap: "8px", fontSize: "15px", marginBottom: "4px" },
                        children: [
                          { type: "span" as const, props: { style: { color: OG.green }, children: "$" } },
                          { type: "span" as const, props: { style: { color: OG.fg }, children: "cat" } },
                          { type: "span" as const, props: { style: { color: OG.yellow }, children: "profile.json" } },
                        ],
                      },
                    },
                    { type: "div" as const, props: { style: { color: OG.fg }, children: "{" } },
                    jsonLine({ key: "name", value: "Phil Vishnevsky", valueColor: OG.green }),
                    jsonLine({ key: "role", value: "SWE · AI · Games", valueColor: OG.green }),
                    jsonLine({ key: "based", value: "Hartford, CT", valueColor: OG.green }),
                    jsonLine({ key: "since", value: "2019", valueColor: OG.orange, quoted: false }),
                    jsonLine({ key: "stack", value: '["TS", "Py", "Rust", "C++"]', valueColor: OG.blue, quoted: false }),
                    {
                      type: "div" as const,
                      props: {
                        style: { display: "flex", whiteSpace: "pre" },
                        children: [
                          { type: "span" as const, props: { style: { color: OG.comment }, children: "  " } },
                          { type: "span" as const, props: { style: { color: OG.red }, children: '"status"' } },
                          { type: "span" as const, props: { style: { color: OG.fg }, children: ": " } },
                          { type: "span" as const, props: { style: { color: OG.green }, children: "● " } },
                          { type: "span" as const, props: { style: { color: OG.green }, children: '"open to opportunities"' } },
                        ],
                      },
                    },
                    { type: "div" as const, props: { style: { color: OG.fg }, children: "}" } },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

/* ── Default variant body ── */

function defaultBody(opts: { title: string; subtitle?: string; tags: string[]; type: string }) {
  const { title, subtitle, tags, type } = opts;
  const commandPrefix = type === "blog"
    ? "cat ~/blog/"
    : type === "project"
      ? "ls ~/projects/"
      : "cd ~/";

  return {
    type: "div" as const,
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
        {
          type: "div" as const,
          props: {
            style: { display: "flex", gap: "8px", fontSize: "18px" },
            children: [
              { type: "span" as const, props: { style: { color: OG.green }, children: "$" } },
              { type: "span" as const, props: { style: { color: OG.fg }, children: commandPrefix } },
            ],
          },
        },
        {
          type: "div" as const,
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
        ...(subtitle
          ? [{
              type: "div" as const,
              props: {
                style: { color: OG.comment, fontSize: "20px", lineHeight: 1.4 },
                children: subtitle,
              },
            }]
          : []),
        ...(tags.length > 0
          ? [{
              type: "div" as const,
              props: {
                style: { display: "flex", gap: "10px", flexWrap: "wrap" as const, marginTop: "8px" },
                children: tags.slice(0, 5).map((tag) => ({
                  type: "span" as const,
                  props: {
                    style: { color: OG.blue, fontSize: "16px" },
                    children: `[${tag}]`,
                  },
                })),
              },
            }]
          : []),
      ],
    },
  };
}

export async function generateOGImage(options: OGOptions): Promise<Buffer> {
  const { title, subtitle, tags = [], type = "page", variant = "default" } = options;
  const fonts = await getFonts();

  const body =
    variant === "about"
      ? aboutBody()
      : defaultBody({ title, subtitle, tags, type });

  const status =
    variant === "about"
      ? statusBar("phil@pvi.sh", "ABOUT", OG.purple)
      : statusBar("Phil Vishnevsky", type.toUpperCase(), OG.purple);

  const titleBarLabel = variant === "about" ? "pvi.sh — about" : "pvi.sh";

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: OG.bgDeep,
          fontFamily: "JetBrains Mono",
          padding: "0",
        },
        children: [
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
              children: [titleBar(titleBarLabel), body, status],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "JetBrains Mono", data: fonts.regular, weight: 400, style: "normal" },
        { name: "JetBrains Mono", data: fonts.bold, weight: 700, style: "normal" },
      ],
    }
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return png;
}
