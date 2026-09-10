/**
 * The palette, in TypeScript.
 *
 * Mirrors src/styles/tokens.css and exists for one reason: Satori (which
 * renders the OG images and the card covers) resolves no CSS custom
 * properties, so it needs literal values. Change these together.
 */
export const LIGHT = {
  bg: "#FDFCF9",
  chrome: "#F6F3ED",
  raised: "#EFEBE2",
  sunken: "#F2EFE8",
  hairline: "#E4DFD4",
  text: "#35312A",
  muted: "#635D52",
  dim: "#6C665B",
  accent: "#935D0F",
  link: "#1E7657",
  danger: "#B93A28",
  violet: "#6A4BC4",
  orange: "#A44F1D",
  blue: "#24688F",
  green: "#397430",
  tintAccent: "#FBF0D8",
  tintLink: "#DCF0E6",
  tintViolet: "#ECE6FB",
  tintOrange: "#FCE8DA",
  tintBlue: "#DDECF6",
  tintGreen: "#E4F2DE",
  trafficlight: "#D8D2C6",
} as const;

export const DARK = {
  bg: "#14130F",
  chrome: "#1C1A16",
  raised: "#26231D",
  sunken: "#100F0C",
  hairline: "#332F27",
  text: "#EDE7DA",
  muted: "#A69E8D",
  dim: "#948B7C",
  accent: "#FFB454",
  link: "#7FD1B9",
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
