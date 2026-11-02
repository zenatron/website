/**
 * The machines drawn on the home page's mesh, by network. Devices with the
 * same `site` sit behind that site's router and reach each other over the
 * LAN; between sites, traffic crosses the internet (directly, or through the
 * DERP relay when it can't). `exitNode` marks a machine others can send all
 * their traffic through.
 */
export interface Peer {
  name: string;
  /** What it runs; shown on hover. */
  os: string;
  kind?: "peer" | "router" | "relay";
  /** Which network it's on. Routers name the network they serve. */
  site?: string;
  exitNode?: boolean;
}

export const PEERS: Peer[] = [
  // Home: one router, the Apple devices and the desktop behind it.
  { name: "home-router", os: "router", kind: "router", site: "home" },
  { name: "macbook", os: "macOS", site: "home" },
  { name: "iphone", os: "iOS", site: "home" },
  { name: "ipad", os: "iPadOS", site: "home" },
  { name: "apple-tv", os: "tvOS", site: "home", exitNode: true },
  { name: "desktop", os: "CachyOS", site: "home" },
  // The lab: a separate network with the server on it.
  { name: "lab-router", os: "router", kind: "router", site: "lab" },
  { name: "homelab", os: "Unraid", site: "lab", exitNode: true },
  // Tailscale's relay, for when two networks can't reach each other directly.
  { name: "derp-nyc", os: "relay", kind: "relay" },
];
