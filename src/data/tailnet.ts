/**
 * The peers drawn on the home page's mesh. Placeholder names: swap in the
 * real machines on the tailnet (and drop any that would say too much).
 * `relay` draws the peer as a hollow DERP relay, parked near an edge,
 * that some packets detour through.
 */
export interface Peer {
  name: string;
  /** What `tailscale status` would say it runs; shown next to the name on hover. */
  os: string;
  relay?: boolean;
}

export const PEERS: Peer[] = [
  { name: "macbook", os: "macOS" },
  { name: "cachyos", os: "linux" },
  { name: "iphone", os: "iOS" },
  { name: "homelab", os: "linux" },
  { name: "nas", os: "linux" },
  { name: "pi", os: "linux" },
  { name: "proxy", os: "linux" },
  { name: "derp-nyc", os: "relay", relay: true },
];
