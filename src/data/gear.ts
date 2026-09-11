/**
 * The desk on /about: the physical things, as the about page's Setup.
 *
 * Positions and sizes are in scene units — percent of the scene's width —
 * so the whole desk scales as one picture. Sizes are roughly to scale,
 * compressed at the ends so the AirPods don't vanish beside a 27″ monitor.
 *
 * `source` says where each picture came from: "photo" is Phil's own, cut
 * out of the background; anything else is the maker's product image, for a
 * thing that can't easily be photographed where it lives (on a VESA arm,
 * under a desk).
 */
import { MACHINES } from "@/data/about";

export interface GearLayer {
  img: string;
  /** Position and width within the item's box, in percent of its width. */
  x: number;
  y: number;
  w: number;
  rot?: number;
}

export interface Gear {
  id: string;
  name: string;
  maker: string;
  kind: string;
  img: string;
  /** Image width ÷ height. */
  aspect: number;
  /** "back": standing along the back of the desk, seen from the front.
      "mat": lying on the desk mat, seen from above. */
  row: "back" | "mat";
  x: number;
  y: number;
  w: number;
  rot?: number;
  /** Things drawn with it, behind the main image: Cubicle's cards. */
  layers?: GearLayer[];
  facts: [string, string][];
  /** Its neofetch, for the machines that have one. */
  machine?: (typeof MACHINES)[number]["name"];
  href?: string;
  /** "photo" is Phil's own, "drawn" is drawn for this page. */
  source: "photo" | "drawn" | { by: string; url: string };
}

export const GEAR: Gear[] = [
  {
    id: "north",
    name: "North",
    maker: "Fractal Design",
    kind: "PC case",
    img: "/images/desk/north.webp",
    aspect: 759 / 1000,
    row: "back",
    x: 3,
    y: 12.3,
    w: 16,
    facts: [
      ["Model", "North, Momentum Edition"],
      ["Color", "Black, blackened oak front"],
      ["Inside", "The desktop"],
    ],
    machine: "desktop",
    source: { by: "Fractal Design", url: "https://www.fractal-design.com/products/cases/north-series/north-momentum-edition/north-momentum-edition/" },
  },
  {
    id: "monitor",
    name: "UltraGear 27″",
    maker: "LG",
    kind: "Monitor",
    img: "/images/desk/monitor.webp",
    aspect: 861 / 760,
    row: "back",
    x: 33,
    y: 3.4,
    w: 34,
    facts: [
      ["Size", "27″, and there are two"],
      ["Resolution", "2560 × 1440 (QHD)"],
      ["Refresh", "144Hz"],
      ["Panel", "IPS"],
    ],
    source: { by: "LG, a representative model", url: "https://www.lg.com/us/monitors/lg-27gl83a-b-gaming-monitor" },
  },
  {
    id: "a1mini",
    name: "A1 mini",
    maker: "Bambu Lab",
    kind: "3D printer",
    img: "/images/desk/a1mini.webp",
    aspect: 711 / 1000,
    row: "back",
    x: 20,
    y: 15.8,
    w: 12,
    facts: [
      ["Build volume", "180 × 180 × 180 mm"],
      ["Type", "Bed-slinger, FDM"],
    ],
    source: { by: "Bambu Lab", url: "https://us.store.bambulab.com/products/a1-mini" },
  },
  {
    id: "node804",
    name: "Node 804",
    maker: "Fractal Design",
    kind: "PC case",
    img: "/images/desk/node804.webp",
    aspect: 1400 / 963,
    row: "back",
    x: 73,
    y: 19.3,
    w: 20,
    facts: [
      ["Model", "Node 804"],
      ["Color", "Black"],
      ["Inside", "The homelab"],
    ],
    machine: "homelab",
    source: { by: "Fractal Design", url: "https://www.fractal-design.com/products/cases/node-series/node-804/node-804/" },
  },
  {
    id: "ipad",
    name: "iPad Pro",
    maker: "Apple",
    kind: "Tablet",
    img: "/images/desk/ipad.webp",
    aspect: 820 / 1100,
    row: "mat",
    x: 10.5,
    y: 38.5,
    w: 11,
    rot: -7,
    facts: [
      ["Chip", "Apple M5"],
      ["Memory", "12GB"],
      ["Storage", "256GB"],
      ["Color", "Space Black"],
      ["With", "Apple Pencil Pro"],
    ],
    source: "photo",
  },
  {
    id: "macbook",
    name: "MacBook Pro 14″",
    maker: "Apple",
    kind: "Laptop",
    img: "/images/desk/macbook.webp",
    aspect: 1800 / 1273,
    row: "mat",
    x: 22,
    y: 51.4,
    w: 23,
    facts: [
      ["Chip", "Apple M5 Max"],
      ["Color", "Space Black"],
      ["Lid", "The hobbies, as stickers"],
    ],
    machine: "macbook",
    source: "photo",
  },
  {
    id: "keyboard",
    name: "V1 Max",
    maker: "Keychron",
    kind: "Keyboard",
    img: "/images/desk/keyboard.webp",
    aspect: 1500 / 681,
    row: "mat",
    x: 38,
    y: 38.6,
    w: 24,
    facts: [
      ["Layout", "75%, with a knob"],
      ["Color", "Carbon Black"],
      ["Switches", "Gateron Milky Yellow Pro, swapped in"],
      ["Connection", "2.4 GHz, Bluetooth, or wired"],
    ],
    source: { by: "Keychron", url: "https://www.keychron.com/products/keychron-v1-max-qmk-via-wireless-custom-mechanical-keyboard" },
  },
  {
    id: "mouse",
    name: "G502 X Lightspeed",
    maker: "Logitech G",
    kind: "Mouse",
    img: "/images/desk/mouse.webp",
    aspect: 416 / 700,
    row: "mat",
    x: 64.4,
    y: 39.4,
    w: 5,
    rot: 9,
    facts: [
      ["Connection", "Wireless, Lightspeed"],
      ["Sensor", "HERO 25K"],
    ],
    source: { by: "Logitech", url: "https://www.logitechg.com/en-us/shop/p/g502-x-wireless-lightforce" },
  },
  {
    id: "screwdriver",
    name: "LTT Screwdriver",
    maker: "LTT Store",
    kind: "Screwdriver",
    img: "/images/desk/screwdriver.webp",
    aspect: 182 / 1100,
    row: "mat",
    x: 72,
    y: 38.3,
    w: 2.1,
    rot: -22,
    facts: [
      ["Model", "Prismagic Transparent Screwdriver"],
      ["Color", "Molten Orange"],
      ["Handle", "Ratcheting, with the bits stored inside"],
    ],
    source: { by: "LTT Store", url: "https://global.lttstore.com/products/prismagic-transparent-screwdriver?variant=44438564798509" },
  },
  {
    id: "airpods",
    name: "AirPods Pro 3",
    maker: "Apple",
    kind: "Earbuds",
    img: "/images/desk/airpods.webp",
    aspect: 677 / 743,
    row: "mat",
    x: 48,
    y: 55.5,
    w: 6,
    rot: -8,
    facts: [["Model", "AirPods Pro 3"]],
    source: { by: "Apple", url: "https://www.apple.com/airpods-pro/" },
  },
  {
    id: "mug",
    name: "tea",
    maker: "A mug of",
    kind: "Mug",
    img: "/images/desk/mug.svg",
    aspect: 124 / 100,
    row: "mat",
    x: 71,
    y: 53,
    w: 8.5,
    rot: -10,
    facts: [
      ["Hobby", "Tea brewing"],
      ["The plan", "Every tea in the world"],
    ],
    source: "drawn",
  },
  {
    id: "cubicle",
    name: "Cubicle",
    maker: "Underscore Games",
    kind: "Card game",
    img: "/images/desk/cubicle-box.webp",
    aspect: 738 / 900,
    row: "mat",
    x: 58,
    y: 55.5,
    w: 8,
    rot: 4,
    // Two cards, one from each deck, fanned up out of the box.
    layers: [
      { img: "/images/desk/card-excuse.webp", x: -14, y: -34, w: 62, rot: -13 },
      { img: "/images/desk/card-team-building.webp", x: 46, y: -30, w: 62, rot: 11 },
    ],
    facts: [
      ["Made by", "Phil, through Underscore Games"],
      ["On the box", "The Improv Office Party in a Box"],
      ["Players", "4–10"],
      ["Time", "30–60 minutes"],
      ["Ages", "14+"],
      ["Decks", "Incentives (blue), Directives (orange)"],
    ],
    href: "https://underscore.games",
    source: "photo",
  },
];

/** Every card photographed, for Cubicle's Info window. */
export const CUBICLE_CARDS = [
  { img: "/images/desk/card-excuse.webp", name: "Excuse", deck: "incentives" },
  { img: "/images/desk/card-supply.webp", name: "Supply", deck: "incentives" },
  { img: "/images/desk/card-team-building.webp", name: "Team Building", deck: "directives" },
  { img: "/images/desk/card-review.webp", name: "Review", deck: "directives" },
];

/**
 * The A1 mini's toolhead, cut out of its photo so it can travel the X axis
 * while you hover, with the arm behind it rebuilt. The filament tube is
 * redrawn as a path so it stays in the head wherever the head goes. In the
 * photo's own pixels.
 */
export const PRINTER_RIG = {
  box: [711, 1000],
  base: "/images/desk/a1mini-base.webp",
  head: { img: "/images/desk/a1mini-head.webp", x: 214, y: 207, w: 137 },
  /** How far the head can go either way along the arm. */
  travel: [-160, 115],
} as const;

/** The tube, from the top of the head to its clip on the Z tower, with the head `dx` along. */
export function tubePath(dx: number): string {
  const f = (n: number) => n.toFixed(1);
  return `M${f(281 + dx)} 207 C${f(285.5 + dx * 0.8)} 115.6, 341.4 12.5, 440 5 C618.2 10.9, 634.8 220, 636.5 356`;
}

/**
 * The keys that spell "hello world" on the V1 Max, where they are in
 * keyboard.webp (1500 × 681): each key's center, and a cap's size. The
 * space bar carries its own width.
 */
export const KEYBOARD_KEYS = {
  box: [1500, 681],
  cap: 86,
  keys: {
    h: [677, 391],
    e: [394, 304],
    l: [936, 391],
    o: [915, 304],
    w: [307, 304],
    r: [481, 304],
    d: [416, 391],
    " ": [637, 566, 530],
  } as Record<string, readonly [number, number, number?]>,
  text: "hello world",
} as const;

