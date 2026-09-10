/**
 * The desk: a macOS Desktop of real objects.
 *
 * `file` is the name shown under the icon — the object's identity in the
 * metaphor. `src` is the basename under /images/desk/, served as AVIF
 * with a WebP fallback.
 *
 * The images are placeholders at the correct dimensions. Replacing them
 * is a drop-in: keep the filename and the width/height, and the layout,
 * the Preview window and the metadata row all follow.
 */
export interface DeskObject {
  file: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  note: string;
  /** Starting position as a percentage of the pane, before any dragging. */
  x: number;
  y: number;
}

export const DESK: DeskObject[] = [
  {
    file: "thinkpad-t480.png",
    src: "thinkpad-t480",
    width: 800, height: 600,
    alt: "A ThinkPad T480 laptop",
    note: "Coreboot, 32GB, two batteries. The one that refuses to die.",
    x: 4, y: 6,
  },
  {
    file: "proxmox-cluster.jpg",
    src: "proxmox-cluster",
    width: 800, height: 533,
    alt: "A three-node Proxmox cluster in a rack",
    note: "Three nodes, more uptime than my sleep schedule.",
    x: 26, y: 14,
  },
  {
    file: "unraid-array.png",
    src: "unraid-array",
    width: 800, height: 600,
    alt: "An Unraid disk array",
    note: "Where the FLAC library lives, and occasionally rebuilds.",
    x: 50, y: 4,
  },
  {
    file: "caddy-sticker.png",
    src: "caddy-sticker",
    width: 600, height: 600,
    alt: "A Caddy server sticker",
    note: "Automatic HTTPS deserves a laptop lid slot.",
    x: 70, y: 20,
  },
  {
    file: "ghostty-config.png",
    src: "ghostty-config",
    width: 800, height: 500,
    alt: "A Ghostty terminal configuration",
    note: "The terminal this whole site is impersonating.",
    x: 12, y: 44,
  },
  {
    file: "keyboard.jpg",
    src: "keyboard",
    width: 800, height: 450,
    alt: "A mechanical keyboard",
    note: "Tactile, not clicky. I do have colleagues.",
    x: 44, y: 52,
  },
];

/*
 * TODO — replace the placeholders in public/images/desk/ with real photos.
 *
 * Each object needs an .avif and a .webp at the exact width/height above,
 * longest edge 800px. Nothing else changes: the filename, the note, the
 * layout, the Preview window and the metadata row all read from here.
 *
 *   thinkpad-t480     800x600   the T480 itself
 *   proxmox-cluster   800x533   the three nodes / the rack
 *   unraid-array      800x600   the array, or its dashboard
 *   caddy-sticker     600x600   the sticker, square crop
 *   ghostty-config    800x500   a Ghostty window
 *   keyboard          800x450   the board, top-down
 *
 * If an object changes, update `width`/`height` here to match the file —
 * they are what reserves layout space and what the Preview row reports.
 */
