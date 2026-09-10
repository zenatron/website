import type { Config } from "tailwindcss";

/**
 * Every value resolves to a token in src/styles/tokens.css.
 * Tailwind's default colors, radii, shadows and durations are REPLACED,
 * not extended — leaving `bg-slate-800` or `rounded-lg` reachable
 * guarantees they end up in the codebase.
 */
const config: Config = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",
      void: "var(--c-void)",
      chrome: "var(--c-chrome)",
      raised: "var(--c-raised)",
      hairline: "var(--c-hairline)",
      text: "var(--c-text)",
      muted: "var(--c-muted)",
      dim: "var(--c-dim)",
      amber: "var(--c-amber)",
      mint: "var(--c-mint)",
      red: "var(--c-red)",
      trafficlight: "var(--c-trafficlight)",
      scrim: "var(--c-scrim)",
    },
    // Radius is a real scale now; forms are soft rather than square.
    borderRadius: {
      none: "0",
      sm: "var(--radius-sm)",
      card: "var(--radius-card)",
      window: "var(--radius-window)",
      pill: "var(--radius-pill)",
    },
    // Depth comes from surface value and hairlines.
    boxShadow: { none: "none" },
    fontWeight: { normal: "400", medium: "500", semibold: "600", bold: "700" },
    fontFamily: {
      mono: "var(--font-mono)",
      sans: "var(--font-sans)",
    },
    fontSize: {
      "mono-xs": "var(--t-mono-xs)",
      "mono-sm": "var(--t-mono-sm)",
      "mono-md": "var(--t-mono-md)",
      "sans-xs": "var(--t-sans-xs)",
      "sans-sm": "var(--t-sans-sm)",
      "sans-md": "var(--t-sans-md)",
      "sans-lg": "var(--t-sans-lg)",
      "sans-xl": "var(--t-sans-xl)",
      "sans-2xl": "var(--t-sans-2xl)",
      "sans-3xl": "var(--t-sans-3xl)",
    },
    spacing: {
      0: "0",
      1: "var(--s-1)",
      2: "var(--s-2)",
      3: "var(--s-3)",
      4: "var(--s-4)",
      5: "var(--s-5)",
      6: "var(--s-6)",
      7: "var(--s-7)",
      8: "var(--s-8)",
      px: "1px",
      full: "100%",
    },
    transitionDuration: {
      state: "var(--dur-state)",
      pane: "var(--dur-pane)",
    },
    transitionTimingFunction: { DEFAULT: "var(--ease)" },
    extend: {
      borderWidth: { 2: "2px" },
      maxWidth: {
        content: "var(--w-content)",
        prose: "68ch",
      },
      height: {
        titlebar: "var(--h-titlebar)",
        statusbar: "var(--h-statusbar)",
      },
      width: { sidebar: "var(--w-sidebar)" },
      lineHeight: {
        head: "1.2",
        prose: "1.65",
        tree: "2.1",
        term: "1.6",
      },
    },
  },
  plugins: [],
};

export default config;
