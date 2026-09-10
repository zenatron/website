/**
 * Retheme the hand-authored post diagrams onto the site palette.
 *
 * The 12 SVGs were drawn against two unrelated palettes — a dark
 * GitHub-ish one and a light Excalidraw-ish one — so they clash with each
 * other and with both site themes. This rewrites their hardcoded hex to
 * CSS custom properties with the original value kept as the fallback, so
 * an inlined diagram follows the site theme and a standalone one still
 * renders on its own.
 *
 * Idempotent: colours already wrapped in var() are left alone.
 * Run with `bun run diagrams:retheme`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { globSync } from "node:fs";

/** hex -> [token, fallback]. Fallback is a sensible standalone value. */
const MAP = {
  // grounds
  "#0d1117": ["--c-sunken", "#100f0c"],
  "#0b0f1a": ["--c-sunken", "#100f0c"],
  "#ffffff": ["--c-sunken", "#f2efe8"],
  // raised surfaces / node fills
  "#161b22": ["--c-raised", "#26231d"],
  "#21262d": ["--c-raised", "#26231d"],
  "#1a1f2e": ["--c-raised", "#26231d"],
  "#e6e6e6": ["--c-hairline", "#e4dfd4"],
  // text
  "#f0f6fc": ["--c-text", "#ede7da"],
  "#1e1e1e": ["--c-text", "#35312a"],
  "#8b949e": ["--c-muted", "#a69e8d"],
  "#adb5bd": ["--c-muted", "#a69e8d"],
  // chroma
  "#6366f1": ["--c-hue-violet", "#bca4ff"],
  "#22c55e": ["--c-hue-green", "#9bd68a"],
  "#2f9e44": ["--c-hue-green", "#9bd68a"],
  "#b2f2bb": ["--c-tint-green", "#1e2e18"],
  "#38bdf8": ["--c-hue-blue", "#7fbde8"],
  "#1971c2": ["--c-hue-blue", "#7fbde8"],
  "#a5d8ff": ["--c-tint-blue", "#162a38"],
  "#f59e0b": ["--c-hue-orange", "#ffa06b"],
  "#e8590c": ["--c-hue-orange", "#ffa06b"],
  "#f08c00": ["--c-hue-orange", "#ffa06b"],
  "#ffd8a8": ["--c-tint-orange", "#3a2418"],
  "#ffec99": ["--c-tint-accent", "#3a2e19"],
  "#ef4444": ["--c-danger", "#f2695e"],
};

const files = globSync("public/images/blog/**/*.svg");
let touched = 0;
for (const file of files) {
  let svg = readFileSync(file, "utf8");
  const before = svg;

  // The full-canvas rect is the ground, whatever colour it was drawn in.
  const canvas = svg.match(/<svg[^>]*width="(\d+)"[^>]*height="(\d+)"/);
  if (canvas) {
    const [, w, h] = canvas;
    svg = svg.replace(
      new RegExp(`(<rect[^>]*width="${w}"[^>]*height="${h}"[^>]*fill=")(#[0-9a-fA-F]{6})(")`),
      (_m, a, _hex, b) => `${a}var(--c-sunken, #100f0c)${b}`
    );
  }

  svg = svg.replace(/(fill|stroke|stop-color)="(#[0-9a-fA-F]{3,6})"/g, (m, prop, hex) => {
    const entry = MAP[hex.toLowerCase()];
    return entry ? `${prop}="var(${entry[0]}, ${entry[1]})"` : m;
  });

  if (svg !== before) {
    writeFileSync(file, svg);
    touched++;
  }
}
console.log(`rethemed ${touched} of ${files.length} diagrams`);

const leftover = new Map();
for (const file of globSync("public/images/blog/**/*.svg")) {
  for (const m of readFileSync(file, "utf8").matchAll(/(?<!var\()(#[0-9a-fA-F]{6})/g)) {
    leftover.set(m[1].toLowerCase(), (leftover.get(m[1].toLowerCase()) ?? 0) + 1);
  }
}
const unmapped = [...leftover].filter(([hex]) => !Object.values(MAP).some(([, fb]) => fb === hex));
console.log(unmapped.length ? `unmapped colours remain: ${JSON.stringify(unmapped)}` : "every colour mapped");
