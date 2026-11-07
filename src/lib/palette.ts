/**
 * The palette, in TypeScript.
 *
 * The dark theme from src/styles/tokens.css, as literal values: Satori
 * (which renders the OG images) resolves no CSS custom properties. Change
 * these together.
 */
export const DARK = {
  bg: "#14130F",
  chrome: "#1C1A16",
  raised: "#26231D",
  sunken: "#100F0C",
  hairline: "#332F27",
  text: "#EDE7DA",
  muted: "#A69E8D",
  dim: "#948B7C",
  accent: "#6CB4FF",
  link: "#6CB4FF",
  danger: "#F2695E",
  violet: "#BCA4FF",
  orange: "#FFA06B",
  blue: "#7FBDE8",
  green: "#9BD68A",
  tintAccent: "#3A2E19",
  tintLink: "#17352C",
  tintViolet: "#2A2340",
  tintOrange: "#3A2418",
  tintBlue: "#162A38",
  tintGreen: "#1E2E18",
  trafficlight: "#454036",
} as const;

/** OG cards render on the dark ground; it reads better as a link preview. */
export const PALETTE = DARK;
