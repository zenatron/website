/**
 * The palette, in TypeScript.
 *
 * This mirrors src/styles/tokens.css exactly and exists for one reason:
 * Satori (which renders the OG images) resolves no CSS custom properties,
 * so it needs literal values. These two files must be changed together.
 */
export const PALETTE = {
  void: "#0E1013",
  chrome: "#16191E",
  raised: "#1E2228",
  hairline: "#2A2F37",
  text: "#E6E1D8",
  muted: "#8A9099",
  dim: "#5A6069",
  amber: "#FFB454",
  mint: "#7FD1B9",
  red: "#E5484D",
  trafficlight: "#3A3F47",
} as const;
