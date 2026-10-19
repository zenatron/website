/**
 * The site's mark, drawn once and written out at every size it's needed.
 *
 *   public/favicon.svg            the tab icon, and the mark on the page
 *   public/apple-touch-icon.png   180, full bleed: iOS cuts its own corners
 *   public/icons/icon-192.png     the squircle, transparent corners
 *   public/icons/icon-512.png
 *   public/icons/maskable-512.png full bleed, art inside the 80% safe zone
 *
 * The mark is a prompt — a chevron and a cursor — on a graphite app icon,
 * wearing the same glass as every other icon on the site: lighter where
 * the light falls, a gloss across the top, a rim catching the top-left.
 * Run `bun run icons` after changing it.
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const pub = (p) => fileURLToPath(new URL(`../public/${p}`, import.meta.url));

/** The squircle's corner, as a fraction of the side. AppIcon's 22.5%. */
const R = 0.225;

/**
 * @param {object} o
 * @param {boolean} o.rounded  cut the squircle, or fill the square
 * @param {number}  o.art      how much of the side the prompt may span
 */
function mark({ rounded = true, art = 1 } = {}) {
  const S = 64;
  const rx = rounded ? S * R : 0;
  // The prompt, drawn for the full tile and scaled about the centre for
  // the maskable icon's safe zone.
  const t = `translate(32 32) scale(${art}) translate(-32 -32)`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}">
  <defs>
    <linearGradient id="plate" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3B3F47"/>
      <stop offset="1" stop-color="#17191D"/>
    </linearGradient>
    <radialGradient id="screen" cx="0.3" cy="0.25" r="0.9">
      <stop offset="0" stop-color="#7FD1B9" stop-opacity="0.16"/>
      <stop offset="0.6" stop-color="#7FD1B9" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.2"/>
      <stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0"/>
      <stop offset="0.7" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.16"/>
    </linearGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.6"/>
      <stop offset="0.35" stop-color="#FFFFFF" stop-opacity="0.08"/>
      <stop offset="0.7" stop-color="#FFFFFF" stop-opacity="0.04"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="chev" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#C3EC9C"/>
      <stop offset="1" stop-color="#7DC25A"/>
    </linearGradient>
    <linearGradient id="cursor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#EBB2FA"/>
      <stop offset="1" stop-color="#B566DC"/>
    </linearGradient>
    <filter id="lift" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="1.2" stdDeviation="1.1" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
  </defs>
  <rect width="${S}" height="${S}" rx="${rx}" fill="url(#plate)"/>
  <rect width="${S}" height="${S}" rx="${rx}" fill="url(#screen)"/>
  <g transform="${t}" filter="url(#lift)">
    <path d="M18.5 21.5 L30 32 L18.5 42.5" fill="none" stroke="url(#chev)" stroke-width="5.6" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="34.5" y="38.2" width="16" height="5.8" rx="2.2" fill="url(#cursor)"/>
  </g>
  <rect width="${S}" height="${S}" rx="${rx}" fill="url(#gloss)"/>
  ${rounded ? `<rect x="0.6" y="0.6" width="${S - 1.2}" height="${S - 1.2}" rx="${rx - 0.6}" fill="none" stroke="url(#rim)" stroke-width="1.2"/>` : ""}
</svg>
`;
}

const png = (svg, size, file) =>
  sharp(Buffer.from(svg), { density: (72 * size) / 64 }).resize(size, size).png().toFile(pub(file));

await writeFile(pub("favicon.svg"), mark());
await Promise.all([
  png(mark({ rounded: false }), 180, "apple-touch-icon.png"),
  png(mark(), 192, "icons/icon-192.png"),
  png(mark(), 512, "icons/icon-512.png"),
  png(mark({ rounded: false, art: 0.8 }), 512, "icons/maskable-512.png"),
]);
console.log("icons: favicon.svg, apple-touch-icon.png, icon-192/512, maskable-512");
