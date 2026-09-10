import satori from "satori";
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PALETTE as P } from "@/lib/palette";

/**
 * OG cards are the site's window, drawn at 1200x630: titlebar with the
 * path in mono, a sans headline, a shared-edge tag row. Satori resolves
 * no CSS custom properties, so the palette arrives from lib/palette.ts.
 */

const W = 1200;
const H = 630;

function font(file: string) {
  return readFileSync(join(process.cwd(), "src", "assets", "fonts", file));
}

/**
 * Static instances, not the variable originals — Satori's opentype parser
 * cannot read an `fvar` table.
 */
let cached: { mono: Buffer; sans: Buffer; sansMedium: Buffer } | null = null;
function fonts() {
  if (!cached) {
    cached = {
      mono: font("AtkinsonHyperlegibleMono-Regular.ttf"),
      sans: font("AtkinsonHyperlegibleNext-Regular.ttf"),
      sansMedium: font("AtkinsonHyperlegibleNext-SemiBold.ttf"),
    };
  }
  return cached;
}

const MONO = "Atkinson Hyperlegible Mono";
const SANS = "Atkinson Hyperlegible Next";

interface OGOptions {
  title: string;
  subtitle?: string;
  type?: string;
  tags?: string[];
  variant?: "default" | "about";
}

/** `~`, `~/blog/some-post` — the same path the real titlebar shows. */
function pathFor(type: string | undefined, title: string): string {
  if (type === "blog") return "~/blog";
  if (type === "project") return "~/projects";
  return title.toLowerCase() === "phil vishnevsky" ? "~" : `~/${title.toLowerCase()}`;
}

export async function generateOGImage({
  title,
  subtitle = "",
  type = "page",
  tags = [],
}: OGOptions): Promise<Buffer> {
  const { mono, sans, sansMedium } = fonts();
  const path = pathFor(type, title);

  const markup = {
    type: "div",
    props: {
      style: {
        width: W,
        height: H,
        display: "flex",
        flexDirection: "column",
        backgroundColor: P.bg,
        border: `1px solid ${P.hairline}`,
        fontFamily: SANS,
      },
      children: [
        /* Titlebar */
        {
          type: "div",
          props: {
            style: {
              height: 64,
              display: "flex",
              alignItems: "center",
              paddingLeft: 28,
              paddingRight: 28,
              backgroundColor: P.chrome,
              borderBottom: `1px solid ${P.hairline}`,
            },
            children: [
              ...[0, 1, 2].map((i) => ({
                type: "div",
                props: {
                  style: {
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    marginRight: i === 2 ? 0 : 10,
                    backgroundColor: P.trafficlight,
                  },
                },
              })),
              {
                type: "div",
                props: {
                  style: {
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    fontFamily: MONO,
                    fontSize: 20,
                    color: P.muted,
                  },
                  children: `phil@pvish — ${path}`,
                },
              },
            ],
          },
        },

        /* Content pane */
        {
          type: "div",
          props: {
            style: {
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingLeft: 64,
              paddingRight: 64,
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: 62,
                    fontWeight: 600,
                    lineHeight: 1.15,
                    color: P.text,
                    // Satori has no line clamp; the pane is sized to fit ~3 lines.
                    display: "flex",
                  },
                  children: title,
                },
              },
              subtitle && {
                type: "div",
                props: {
                  style: {
                    marginTop: 24,
                    fontSize: 28,
                    lineHeight: 1.5,
                    color: P.muted,
                    display: "flex",
                  },
                  children:
                    subtitle.length > 130 ? `${subtitle.slice(0, 127)}…` : subtitle,
                },
              },
              tags.length > 0 && {
                type: "div",
                props: {
                  style: { marginTop: 36, display: "flex" },
                  children: tags.slice(0, 4).map((tag, i) => ({
                    type: "div",
                    props: {
                      style: {
                        fontFamily: MONO,
                        fontSize: 20,
                        color: P.link,
                        padding: "6px 14px",
                        border: `1px solid ${P.hairline}`,
                        // Shared edge: neighbours collapse their borders.
                        borderLeftWidth: i === 0 ? 1 : 0,
                      },
                      children: tag,
                    },
                  })),
                },
              },
            ].filter(Boolean),
          },
        },

        /* Status bar */
        {
          type: "div",
          props: {
            style: {
              height: 48,
              display: "flex",
              alignItems: "center",
              paddingLeft: 28,
              paddingRight: 28,
              backgroundColor: P.chrome,
              borderTop: `1px solid ${P.hairline}`,
              fontFamily: MONO,
              fontSize: 18,
              color: P.dim,
            },
            children: [
              { type: "div", props: { style: { color: P.accent }, children: "main" } },
              { type: "div", props: { style: { marginLeft: 24 }, children: "UTF-8" } },
              { type: "div", props: { style: { flex: 1 } } },
              { type: "div", props: { children: "pvi.sh" } },
            ],
          },
        },
      ],
    },
  } as any;

  const svg = await satori(markup, {
    width: W,
    height: H,
    fonts: [
      { name: SANS, data: sans, weight: 400, style: "normal" },
      { name: SANS, data: sansMedium, weight: 600, style: "normal" },
      { name: MONO, data: mono, weight: 400, style: "normal" },
    ],
  });

  return sharp(Buffer.from(svg)).png().toBuffer();
}
