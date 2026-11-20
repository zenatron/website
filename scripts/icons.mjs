/**
 * The site's mark, drawn once and written out at every size it's needed.
 *
 *   public/favicon.svg            the tab icon; follows the OS light/dark
 *   public/favicon.ico            16, 32 and 48, for anything that won't take SVG
 *   public/apple-touch-icon.png   180, full bleed: iOS cuts its own corners
 *   public/icons/icon-192.png     rounded tile, transparent corners
 *   public/icons/icon-512.png
 *   public/icons/maskable-512.png full bleed, art inside the 80% safe zone
 *
 * The mark is the home page's mesh, cut down to one exchange: two peers,
 * drawn the way scripts/tailnet.ts draws a peer (a plus of cells, the
 * centre brightest), and a packet crossing from one to the other as a lit
 * trail in the accent, brightest at the head. Same grid as the mesh: a
 * cell is 3/4 of the pitch (the mesh's 6 on 8). The 16px icon drops the
 * margin and the gaps so every cell lands on whole pixels.
 *
 * Colors are tokens.css's, as literals, since a favicon can't read CSS
 * variables. Run `bun run icons` after changing it.
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const pub = (p) => fileURLToPath(new URL(`../public/${p}`, import.meta.url));

/** tokens.css, both themes: the page ground, its hairline, the text and the accent. */
const LIGHT = {
  ground: "#FDFCF9",
  line: "#E4DFD4",
  ink: "#35312A",
  accent: "#1A66CC",
};
const DARK = {
  ground: "#14130F",
  line: "#332F27",
  ink: "#EDE7DA",
  accent: "#6CB4FF",
};

const N = 8; // cells the drawing spans
/** A peer: centre, then its four arms. [col, row, role] */
const peer = (c, r) => [
  [c, r, "core"],
  [c - 1, r, "arm"],
  [c + 1, r, "arm"],
  [c, r - 1, "arm"],
  [c, r + 1, "arm"],
];
const CELLS = [
  ...peer(1, 6), // the one that sent it
  ...peer(6, 1), // the one it's for
  // The packet, midway: its trail fading behind it, a clear cell either
  // side so at 16px it still reads as something crossing, not a bridge.
  [3, 4, "tail"],
  [4, 3, "head"],
];
/** How lit each role is, the way the mesh weights them. */
const ALPHA = { core: 1, arm: 0.6, tail: 0.42, head: 1 };

/**
 * @param {object} o
 * @param {"auto"|"dark"} o.scheme  auto: a media query picks light or dark (SVG only)
 * @param {boolean} o.rounded  round the tile's corners, or fill the square
 * @param {number}  o.art      how much of the side the grid may span
 * @param {boolean} o.tight    16px: no margin and no gaps, so each cell is exactly 2×2 pixels
 */
function mark({
  scheme = "auto",
  rounded = true,
  art = 1,
  tight = false,
} = {}) {
  const S = 32;
  // A cell's worth of margin keeps the arms off the tile's edge and corners.
  const margin = tight ? 0 : 1;
  const pitch = (S * art) / (N + 2 * margin);
  const block = tight ? pitch : pitch * 0.75;
  const o = (S - pitch * N) / 2 + (pitch - block) / 2;
  const at = (c, r) => [o + c * pitch, o + r * pitch];

  const cells = CELLS.map(([c, r, role]) => {
    const [x, y] = at(c, r);
    const cls = role === "head" || role === "tail" ? "a" : "i";
    return `<rect class="${cls}" x="${x}" y="${y}" width="${block}" height="${block}" opacity="${ALPHA[role]}"/>`;
  });
  const rx = rounded ? 5 : 0;
  const colors = (p) =>
    `.g{fill:${p.ground};stroke:${p.line}}.i{fill:${p.ink}}.a{fill:${p.accent}}`;
  const style =
    scheme === "auto"
      ? `${colors(LIGHT)}@media (prefers-color-scheme:dark){${colors(DARK)}}`
      : colors(DARK);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}">
<style>${style}</style>
<rect class="g" x="0.5" y="0.5" width="${S - 1}" height="${S - 1}" rx="${rx}" stroke-width="${rounded && !tight ? 1 : 0}"/>
${cells.join("\n")}
</svg>
`;
}

const render = (svg, size) =>
  sharp(Buffer.from(svg), { density: (72 * size) / 32 })
    .resize(size, size)
    .png()
    .toBuffer();

/** An .ico is a directory of PNGs; every browser that reads .ico reads PNG entries. */
function ico(pngs) {
  const head = Buffer.alloc(6 + 16 * pngs.length);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(pngs.length, 4);
  let offset = head.length;
  pngs.forEach(({ size, data }, k) => {
    const e = 6 + 16 * k;
    head.writeUInt8(size >= 256 ? 0 : size, e);
    head.writeUInt8(size >= 256 ? 0 : size, e + 1);
    head.writeUInt16LE(1, e + 4); // planes
    head.writeUInt16LE(32, e + 6); // bits per pixel
    head.writeUInt32LE(data.length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([head, ...pngs.map((p) => p.data)]);
}

await writeFile(pub("favicon.svg"), mark());

const dark = { scheme: "dark" };
const icoSizes = [
  { size: 16, svg: mark({ ...dark, tight: true }) },
  { size: 32, svg: mark(dark) },
  { size: 48, svg: mark(dark) },
];
const icoPngs = await Promise.all(
  icoSizes.map(async ({ size, svg }) => ({
    size,
    data: await render(svg, size),
  }))
);
await writeFile(pub("favicon.ico"), ico(icoPngs));

const out = async (svg, size, file) =>
  writeFile(pub(file), await render(svg, size));
await Promise.all([
  out(mark({ ...dark, rounded: false }), 180, "apple-touch-icon.png"),
  out(mark(dark), 192, "icons/icon-192.png"),
  out(mark(dark), 512, "icons/icon-512.png"),
  out(
    mark({ ...dark, rounded: false, art: 0.8 }),
    512,
    "icons/maskable-512.png"
  ),
]);
console.log(
  "icons: favicon.svg, favicon.ico, apple-touch-icon.png, icon-192/512, maskable-512"
);
