/**
 * The machines drawn on the home page's mesh, by network.
 *
 * Devices with the same `site` sit behind that site's router and reach each
 * other over the LAN; between sites, traffic crosses the internet (directly,
 * or through the DERP relay when it can't). Services run on a `host`, most
 * of them behind Caddy (`proxied`). The edge is Cloudflare, where public
 * visitors come in. Offline devices are drawn dim, with when they were last
 * seen.
 */
export type Hue = "violet" | "blue" | "green" | "orange" | "ember" | "rose" | "teal";

export interface Peer {
  name: string;
  /** What it runs, or for a service what it does; shown on hover. */
  os: string;
  kind?: "peer" | "router" | "relay" | "service" | "edge";
  /** Which network it's on. Routers name the network they serve. */
  site?: string;
  exitNode?: boolean;
  /** Offline devices: when they were last seen. */
  offline?: string;
  /** Services: the machine they run on, and whether Caddy fronts them. */
  host?: string;
  proxied?: boolean;
  /** A service's public address, when it has one. */
  publicName?: string;
  hue?: Hue;
}

export const PEERS: Peer[] = [
  // Home: one router, the Apple devices, the desktop and the Pi behind it.
  { name: "home-router", os: "router", kind: "router", site: "home" },
  { name: "macbook", os: "macOS", site: "home" },
  { name: "iphone", os: "iOS", site: "home" },
  { name: "ipad", os: "iPadOS", site: "home" },
  { name: "apple-tv", os: "tvOS", site: "home", exitNode: true },
  { name: "desktop", os: "CachyOS", site: "home" },
  { name: "pi", os: "linux", site: "home" },
  { name: "qpc", os: "Windows", site: "home", offline: "328d ago" },

  // The lab: a separate network with the server and everything running on it.
  { name: "lab-router", os: "router", kind: "router", site: "lab" },
  { name: "homelab", os: "Unraid", site: "lab", exitNode: true },
  { name: "caddy", os: "reverse proxy", kind: "service", host: "homelab", hue: "teal" },
  { name: "adguard", os: "dns", kind: "service", host: "homelab", hue: "green" },
  { name: "jellyfin", os: "media", kind: "service", host: "homelab", proxied: true, hue: "violet" },
  { name: "nextcloud", os: "files", kind: "service", host: "homelab", proxied: true, hue: "blue" },
  { name: "openwebui", os: "local ai", kind: "service", host: "homelab", proxied: true, hue: "rose" },
  { name: "karakeep", os: "bookmarks", kind: "service", host: "homelab", proxied: true, hue: "orange" },
  { name: "n8n", os: "workflows", kind: "service", host: "homelab", proxied: true, hue: "ember" },
  { name: "pocket-id", os: "sign-in", kind: "service", host: "homelab", proxied: true, hue: "green" },
  { name: "mattermost", os: "chat", kind: "service", host: "homelab", proxied: true, hue: "blue" },
  { name: "ledger", os: "budget", kind: "service", host: "homelab", proxied: true, publicName: "ledger.pvi.sh", hue: "ember" },

  // Out on the internet: Tailscale's relay, and the edge public visitors come through.
  { name: "derp-nyc", os: "relay", kind: "relay" },
  { name: "cloudflare", os: "edge", kind: "edge" },
];
