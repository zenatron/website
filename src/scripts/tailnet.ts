/**
 * The home page's mesh: the tailnet, drawn on a grid of square cells.
 *
 * Machines sit on networks. Behind a site's router they reach each other over
 * the LAN; between sites a packet crosses both routers, directly or by way of
 * the DERP relay. The server runs a cluster of services, most behind Caddy,
 * and public visitors reach the public ones through Cloudflare.
 *
 * Traffic happens on its own: pings between devices, requests to services,
 * DNS lookups, and visitors from outside. Each leaves a trail of lit cells
 * that fades, and a line in the log the way `tailscale ping` or an access log
 * would say it. Hovering a machine says how its last exchange went.
 *
 * Clicking empty ground joins a short-lived guest peer; clicking a machine
 * pings everyone from it (a router, its own network; a service gets visited).
 * Anything can be dragged to a new spot; a router brings its network along,
 * and the server its services.
 *
 * Anything marked [data-mesh-frost] gets no node placed or dragged onto it,
 * but the mesh still runs behind it (it wears a frosted panel). Anything
 * marked [data-mesh-avoid] is kept clear: no node is placed there and no cell
 * is lit over it, so the text stays legible.
 */
import type { Hue, Peer } from "@/data/tailnet";

const PITCH = 8; // css px from one cell to the next
const BLOCK = 6; // a cell's lit square
const SPEED = 260; // px per second a packet travels
const DECAY = 0.9; // a trail cell keeps this much of its light each frame
const MAX_GUESTS = 5;
const GUEST_LIFE = 24_000; // ms
const HUES: Hue[] = ["violet", "blue", "green", "orange", "ember", "rose", "teal"];

type Kind = "peer" | "router" | "relay" | "service" | "edge";
type Node = {
  name: string;
  os: string;
  kind: Kind;
  site?: string;
  exit: boolean;
  offline?: string;
  host?: string;
  proxied: boolean;
  publicName?: string;
  hue?: Hue;
  guest: boolean;
  /** How its last exchange went, for the hover label. */
  last?: { how: string; ms: number };
  /** A relay's packets carried; a service's requests served. */
  count: number;
  ax: number; // anchor, px
  ay: number;
  x: number;
  y: number;
  phase: number;
  born: number;
  /** 0..1, lit when a packet lands, then fades. */
  flash: number;
};
type Packet = {
  hops: Node[];
  leg: number;
  t: number; // 0..1 along the current leg
  reply: boolean;
  onArrive?: () => void;
};
type Ripple = { x: number; y: number; r: number; max: number; reply: boolean };
type Route = { hops: Node[]; how: string; relay?: Node };

export function mountTailnet(root: HTMLElement, peers: Peer[]) {
  const canvas = root.querySelector("canvas")!;
  const ctx = canvas.getContext("2d")!;
  const logEl = root.querySelector<HTMLElement>("[data-mesh-log]");
  const peersEl = root.querySelector<HTMLElement>("[data-mesh-peers]");
  const servicesEl = root.querySelector<HTMLElement>("[data-mesh-services]");
  const packetsEl = root.querySelector<HTMLElement>("[data-mesh-packets]");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w = 0,
    h = 0,
    cols = 0,
    rows = 0,
    dpr = 1;
  let heat = new Float32Array(0); // accent: requests going out
  let echo = new Float32Array(0); // green: replies coming back
  let mask = new Uint8Array(0); // 1 where a cell is kept clear
  let avoid: DOMRect[] = [];
  let frost: DOMRect[] = [];
  const nodes: Node[] = [];
  const packets: Packet[] = [];
  const ripples: Ripple[] = [];
  const pointer = { x: -1e4, y: -1e4 };
  let hovered: Node | null = null;
  /** The node being dragged, where the drag started, and whether it has moved enough to count. */
  let dragging: Node | null = null;
  let dragFrom = { x: 0, y: 0 };
  let dragMoved = false;
  let swallowClick = false;
  let sent = 0;
  let nextAuto = 0;
  let raf = 0;
  let last = performance.now();
  /**
   * On a phone the mesh is simpler: just the networks and their devices, the
   * relay and the edge. Services fold into their server (requests still go
   * there, and the log still names them) and offline machines aren't drawn.
   */
  let compact = false;
  const hidden = (n: Node) => compact && (n.kind === "service" || !!n.offline);
  /** Whether a node's name is always shown, or only when lit. */
  const named = (n: Node) => n.kind !== "service";

  // ── Colors, re-read when the theme changes ─────────────────
  let fg = "#000",
    accent = "#00f",
    green = "#0a0";
  const hue: Record<string, string> = {};
  const readColors = () => {
    const s = getComputedStyle(document.documentElement);
    fg = s.getPropertyValue("--c-text").trim() || fg;
    accent = s.getPropertyValue("--c-accent").trim() || accent;
    green = s.getPropertyValue("--c-hue-green").trim() || green;
    for (const n of HUES) hue[n] = s.getPropertyValue(`--c-hue-${n}`).trim();
  };

  // ── Who's who ──────────────────────────────────────────────
  const byName = (name?: string) => (name ? nodes.find((n) => n.name === name) : undefined);
  const online = (n: Node) => !n.offline;
  /** The router a node sits behind: its own site's, or for a service its host's. */
  const routerOf = (n: Node): Node | undefined => {
    if (n.kind === "service") {
      const host = byName(n.host);
      return host ? routerOf(host) : undefined;
    }
    return n.site ? nodes.find((r) => r.kind === "router" && r.site === n.site && r !== n) : undefined;
  };
  const members = (r: Node) => nodes.filter((n) => n.kind === "peer" && n.site === r.site && !n.guest);
  const servicesOn = (host: Node) => nodes.filter((n) => n.kind === "service" && n.host === host.name);
  const relayNode = () => nodes.find((n) => n.kind === "relay");
  const edgeNode = () => nodes.find((n) => n.kind === "edge");
  const caddy = () => nodes.find((n) => n.kind === "service" && n.name === "caddy");
  const devices = () => nodes.filter((n) => n.kind === "peer" && online(n));

  // ── Layout ─────────────────────────────────────────────────
  const inRects = (rects: DOMRect[], x: number, y: number, pad: number) =>
    rects.some((r) => x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad);
  /** Somewhere no node may sit: clear areas and frosted panels alike. */
  const inAvoid = (x: number, y: number, pad = 0) => inRects(avoid, x, y, pad) || inRects(frost, x, y, pad);

  function measure() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = root.clientWidth;
    h = root.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(w / PITCH);
    rows = Math.ceil(h / PITCH);
    compact = w < 640;
    heat = new Float32Array(cols * rows);
    echo = new Float32Array(cols * rows);
    const base = root.getBoundingClientRect();
    const rects = (sel: string) =>
      [...document.querySelectorAll<HTMLElement>(sel)].map((el) => {
        const r = el.getBoundingClientRect();
        return new DOMRect(r.left - base.left, r.top - base.top, r.width, r.height);
      });
    avoid = rects("[data-mesh-avoid]");
    frost = rects("[data-mesh-frost]");
    // Only the clear areas are masked; frosted panels let the mesh run behind them.
    mask = new Uint8Array(cols * rows);
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) if (inRects(avoid, i * PITCH, j * PITCH, PITCH * 2)) mask[j * cols + i] = 1;
    placeNodes();
  }

  /**
   * A planned layout rather than a scatter, so everything has room to be seen:
   * each network gets a spot (the lab on one side, home on the other, both
   * above the text), its machines evenly around its router, the server's
   * services in a ring around it, and the relay and the edge out toward the
   * sides. Phones (taller than wide) get their own plan. Any spot that lands
   * on text, or on another node's name, moves to the nearest free one.
   */
  function placeNodes() {
    const portrait = h > w * 1.1;
    const short = Math.min(w, h);
    // On a phone the text fills the bottom half: plan inside the band above it.
    const top = 76;
    const textTop = Math.min(h, ...[...avoid, ...frost].filter((r) => r.top > h * 0.25).map((r) => r.top));
    const band = Math.max(160, textTop - top - 16);
    // How far a network's machines sit from its router, and services from their host.
    const R = portrait
      ? Math.max(48, Math.min(w * 0.25, band * 0.3))
      : Math.max(72, Math.min(250, short * 0.23));
    const rs = portrait ? Math.max(30, Math.min(w * 0.09, band * 0.16)) : Math.max(40, Math.min(104, short * 0.095));
    // Fractions of the width, and of the band (phones) or the height (wider screens).
    const plan: Record<string, [number, number]> = portrait
      ? // Stacked: home in the upper part of the band, the lab and its services below it.
        { lab: [0.18, 0.76], home: [0.64, 0.28], relay: [0.94, 0.96], edge: [0.08, 0.08] }
      : { lab: [0.12, 0.36], home: [0.68, 0.32], relay: [0.94, 0.64], edge: [0.06, 0.68] };
    const at = ([fx, fy]: [number, number]): [number, number] => [fx * w, portrait ? top + fy * band : fy * h];
    const placed: Node[] = [];
    const clear = (x: number, y: number, n: Node) => {
      if (x < 24 || x > w - 24 || y < 76 || y > h - 24) return false;
      const svc = n.kind === "service";
      const labelled = named(n);
      if (inAvoid(x, y, svc ? 22 : compact ? 28 : 40) || (labelled && inAvoid(x + 70, y, 20))) return false;
      // A name that would run off the right edge would have to flip onto its
      // neighbours: place it where it fits instead.
      if (labelled && x + n.name.length * 6.8 + 28 > w - 8) return false;
      for (const p of placed) {
        const d = Math.hypot(p.ax - x, p.ay - y);
        if (d < (svc || p.kind === "service" ? 22 : compact ? 30 : 46)) return false;
        // Names run to the right of their nodes: keep each off the other, by their real lengths.
        const span = (m: Node) => m.name.length * 6.8 + 28;
        if (labelled && named(p) && Math.abs(p.ay - y) < 18 && x - p.ax > -span(n) && x - p.ax < span(p)) return false;
      }
      return true;
    };
    /** The planned spot if it's clear, otherwise the nearest clear one around it. */
    const put = (n: Node, x: number, y: number) => {
      let at: [number, number] = [x, y];
      search: for (let r = 0; r < 320; r += 8) {
        const steps = r === 0 ? 1 : Math.max(8, Math.round(r / 6));
        for (let k = 0; k < steps; k++) {
          const a = (k / steps) * Math.PI * 2;
          const cx = x + Math.cos(a) * r,
            cy = y + Math.sin(a) * r;
          if (clear(cx, cy, n)) {
            at = [cx, cy];
            break search;
          }
        }
      }
      n.ax = n.x = at[0];
      n.ay = n.y = at[1];
      placed.push(n);
    };
    const fixed = nodes.filter((n) => !n.guest && !hidden(n));
    const routers = fixed.filter((n) => n.kind === "router");
    for (const r of routers) {
      put(r, ...at(plan[r.site ?? ""] ?? [0.5, 0.3]));
    }
    for (const n of fixed.filter((n) => n.kind === "relay" || n.kind === "edge")) {
      put(n, ...at(plan[n.kind]));
    }
    // Each network's machines around its router: a server with services sits a
    // little out on its own, the rest evenly spaced around a circle.
    for (const r of routers) {
      const ms = members(r).filter((m) => !hidden(m));
      const hosts = ms.filter((m) => servicesOn(m).length);
      const rest = ms.filter((m) => !servicesOn(m).length);
      // Servers sit out to the side of their router, with room for their ring of services.
      const tilt = portrait ? 0 : -0.35;
      hosts.forEach((m, i) => put(m, r.ax + (R + rs) * Math.cos(tilt + i), r.ay + (R + rs) * 0.6 * Math.sin(tilt + i)));
      rest.forEach((m, i) => {
        const a = -Math.PI / 2 + ((i + 0.5) / rest.length) * Math.PI * 2;
        put(m, r.ax + Math.cos(a) * R, r.ay + Math.sin(a) * R * 0.85);
      });
      // Then each server's services, in a ring around it.
      for (const host of hosts) {
        const svcs = servicesOn(host).filter((sv) => !hidden(sv));
        svcs.forEach((sv, i) => {
          const a = -Math.PI / 2 + (i / svcs.length) * Math.PI * 2;
          put(sv, host.ax + Math.cos(a) * rs, host.ay + Math.sin(a) * rs);
        });
      }
    }
    // Anything left (a device with no network) goes wherever there's room.
    for (const n of fixed) if (!placed.includes(n)) put(n, w * 0.5, h * 0.3);
  }

  // ── Grid helpers ───────────────────────────────────────────
  const cellAt = (x: number, y: number) => {
    const i = Math.floor(x / PITCH),
      j = Math.floor(y / PITCH);
    return i < 0 || j < 0 || i >= cols || j >= rows ? -1 : j * cols + i;
  };
  const deposit = (grid: Float32Array, x: number, y: number, v: number) => {
    const k = cellAt(x, y);
    if (k >= 0 && !mask[k]) grid[k] = Math.min(1, grid[k] + v);
  };

  // ── Routes and traffic ─────────────────────────────────────
  function log(line: string) {
    if (!logEl) return;
    const row = document.createElement("div");
    row.textContent = line;
    logEl.append(row);
    while (logEl.children.length > 4) logEl.firstElementChild!.remove();
  }

  /**
   * The way a packet goes from a to b. On one network: over the LAN, through
   * its router. Between networks: out through a's router, across (directly,
   * or through the relay), in through b's. A service is reached through its
   * host, and through Caddy when it's behind it. A visitor arrives at the
   * edge, which goes straight to the lab's router.
   */
  function route(a: Node, b: Node, viaRelay: boolean): Route {
    const target = b.kind === "service" ? (byName(b.host) ?? b) : b;
    const tail: Node[] = [];
    if (b.kind === "service") {
      const proxy = caddy();
      if (b.proxied && proxy && proxy !== b) tail.push(proxy);
      tail.push(b);
    }
    const ra = a.kind === "router" || a.kind === "edge" ? undefined : routerOf(a);
    const rb = target.kind === "router" ? undefined : routerOf(target);
    let hops: Node[];
    let how: string;
    let relay: Node | undefined;
    if (ra && ra === rb) {
      hops = [a, ra, target];
      how = "lan";
    } else {
      relay = viaRelay && a.kind !== "edge" ? relayNode() : undefined;
      hops = [a, ra, relay, rb, target].filter((n): n is Node => !!n);
      how = relay ? `via ${relay.name.replace(/^derp-/, "")}` : a.kind === "edge" ? "edge" : "direct";
    }
    // On a phone the services are folded into their server, so the trip ends there.
    if (b.kind === "service" && !compact) hops.push(...tail);
    // A service on the asker's own host, or any doubled hop: drop the repeats.
    hops = hops.filter((n, i) => i === 0 || n !== hops[i - 1]);
    return { hops, how, relay };
  }

  /** Round-trip time for that route: made up, but in proportion. */
  const ms = (a: Node, b: Node, how: string) =>
    how === "lan"
      ? 1 + Math.floor(Math.random() * 4)
      : Math.round(
          6 +
            Math.hypot(a.x - b.x, a.y - b.y) / 60 +
            Math.random() * 6 +
            (how.startsWith("via") ? 24 + Math.random() * 14 : 0) +
            (how === "edge" ? 20 + Math.random() * 20 : 0),
        );

  function bump() {
    sent++;
    if (packetsEl) {
      packetsEl.textContent = sent.toLocaleString();
      packetsEl.animate?.([{ opacity: 1 }, { opacity: 0.35 }], { duration: 600, easing: "ease-out" });
    }
  }

  /**
   * Sends a packet along a route, and the answer back the same way. `say`
   * turns the round trip into a log line (or nothing, to stay quiet).
   */
  function exchange(
    from: Node,
    to: Node,
    opts: { viaRelay?: boolean; say?: (time: number, r: Route) => string | null } = {},
  ) {
    if (!online(from) || !online(to)) return;
    const r = route(from, to, !!opts.viaRelay);
    if (r.hops.length < 2) return;
    bump();
    if (r.relay) r.relay.count++;
    const out: Packet = { hops: r.hops, leg: 0, t: 0, reply: false };
    out.onArrive = () => {
      if (to.kind === "service") to.count++;
      bump();
      if (r.relay) r.relay.count++;
      const back: Packet = { hops: [...r.hops].reverse(), leg: 0, t: 0, reply: true };
      back.onArrive = () => {
        const time = ms(from, to, r.how);
        // Both ends remember how it went, for their hover labels.
        for (const n of [from, to]) if (n.kind === "peer" || n.kind === "service") n.last = { how: r.how, ms: time };
        const line = opts.say?.(time, r);
        if (line) log(line);
      };
      packets.push(back);
    };
    packets.push(out);
  }

  const via = (r: Route) => (r.relay ? `DERP(${r.relay.name.replace(/^derp-/, "")})` : r.how);
  const ping = (a: Node, b: Node, quiet: boolean, viaRelay = false) =>
    exchange(a, b, { viaRelay, say: quiet ? undefined : (t, r) => `pong from ${b.name} via ${via(r)} in ${t}ms` });
  const visit = (a: Node, svc: Node, quiet: boolean, viaRelay = false) =>
    exchange(a, svc, {
      viaRelay,
      say: quiet
        ? undefined
        : (t) => (svc.name === "adguard" ? `${a.name} → adguard: dns in ${t}ms` : `${a.name} → ${svc.name} 200 in ${t}ms`),
    });
  const visitor = (svc: Node) => {
    const edge = edgeNode();
    if (edge) exchange(edge, svc, { say: (t) => `visitor → ${svc.publicName ?? svc.name} via cloudflare 200 in ${t}ms` });
  };

  function counts() {
    if (peersEl) peersEl.textContent = String(nodes.filter((n) => n.kind === "peer" && online(n)).length);
    if (servicesEl) servicesEl.textContent = String(nodes.filter((n) => n.kind === "service").length);
  }

  function joinGuest(x: number, y: number) {
    const guests = nodes.filter((n) => n.guest);
    if (guests.length >= MAX_GUESTS) nodes.splice(nodes.indexOf(guests[0]), 1);
    const name = `guest-${Math.random().toString(16).slice(2, 6)}`;
    const g = makeNode({ name, os: "browser" });
    Object.assign(g, { guest: true, ax: x, ay: y, x, y, born: performance.now(), flash: 1 });
    nodes.push(g);
    ripples.push({ x, y, r: 0, max: 90, reply: false });
    log(`${name} joined the tailnet`);
    counts();
    // Handshake with the three nearest devices.
    devices()
      .filter((n) => n !== g)
      .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))
      .slice(0, 3)
      .forEach((n, i) => setTimeout(() => ping(g, n, i > 0), i * 120));
  }

  /**
   * A click on a node: a device pings everyone, a router its own network,
   * the server visits its services, a service gets a few visitors, the edge
   * sends the public ones a visitor each.
   */
  function poke(from: Node) {
    from.flash = 1;
    ripples.push({ x: from.x, y: from.y, r: 0, max: 70, reply: false });
    if (from.offline) return log(`${from.name} is offline, last seen ${from.offline}`);
    if (from.kind === "router")
      return members(from)
        .filter(online)
        .forEach((n, i) => setTimeout(() => ping(from, n, i > 0), i * 90));
    if (from.kind === "service")
      return devices()
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .forEach((n, i) => setTimeout(() => visit(n, from, i > 0), i * 120));
    if (from.kind === "edge")
      return nodes.filter((n) => n.publicName).forEach((s, i) => setTimeout(() => visitor(s), i * 150));
    if (from.kind === "relay") return;
    const own = servicesOn(from);
    if (own.length) return own.forEach((s, i) => setTimeout(() => visit(from, s, i > 0), i * 70));
    devices()
      .filter((n) => n !== from)
      .forEach((n, i) => setTimeout(() => ping(from, n, i > 0, Math.random() < 0.2), i * 90));
  }

  const nodeAt = (x: number, y: number) =>
    nodes.find((n) => !hidden(n) && Math.hypot(n.x - x, n.y - y) < PITCH * (n.kind === "service" ? 1.6 : 3)) ?? null;

  // ── Pointer ────────────────────────────────────────────────
  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0 || (e.target as Element).closest("a, button, [data-mesh-ignore]")) return;
    const r = root.getBoundingClientRect();
    const hit = nodeAt(e.clientX - r.left, e.clientY - r.top);
    if (!hit) return;
    dragging = hit;
    dragFrom = { x: e.clientX, y: e.clientY };
    dragMoved = false;
    root.setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  const fits = (x: number, y: number, n: Node) =>
    !inAvoid(x, y, 20) && (n.kind === "service" || !inAvoid(x + 70, y, 12));

  function onPointerMove(e: PointerEvent) {
    const r = root.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
    if (dragging) {
      if (!dragMoved && Math.hypot(e.clientX - dragFrom.x, e.clientY - dragFrom.y) > 4) dragMoved = true;
      if (dragMoved) {
        // Kept on the canvas, below the nav, and off the text: past an edge it stops there.
        const x = Math.max(24, Math.min(w - 120, pointer.x));
        const y = Math.max(72, Math.min(h - 24, pointer.y));
        if (fits(x, y, dragging)) {
          const dx = x - dragging.ax,
            dy = y - dragging.ay;
          dragging.ax = x;
          dragging.ay = y;
          // A router brings its network along, and a server its services, each as far as it can go.
          const followers =
            dragging.kind === "router"
              ? members(dragging).flatMap((m) => [m, ...servicesOn(m)])
              : dragging.kind === "peer"
                ? servicesOn(dragging)
                : [];
          for (const m of followers) {
            const mx = Math.max(24, Math.min(w - 120, m.ax + dx)),
              my = Math.max(72, Math.min(h - 24, m.ay + dy));
            if (fits(mx, my, m)) {
              m.ax = mx;
              m.ay = my;
            }
          }
        }
        dragging.flash = Math.max(dragging.flash, 0.4);
      }
      root.style.cursor = "grabbing";
    } else {
      hovered = nodeAt(pointer.x, pointer.y);
      root.style.cursor = hovered ? "grab" : "crosshair";
    }
    if (still) draw(performance.now());
  }

  function onPointerUp(e: PointerEvent) {
    if (!dragging) return;
    // A drag isn't a click: don't ping as the button comes up.
    swallowClick = dragMoved;
    if (dragMoved) log(`${dragging.name} moved`);
    dragging = null;
    if (root.hasPointerCapture(e.pointerId)) root.releasePointerCapture(e.pointerId);
    root.style.cursor = "grab";
  }
  function onPointerLeave() {
    pointer.x = pointer.y = -1e4;
    hovered = null;
  }
  function onClick(e: MouseEvent) {
    if (swallowClick) {
      swallowClick = false;
      return;
    }
    // Links and buttons above the canvas keep their clicks.
    if ((e.target as Element).closest("a, button, [data-mesh-ignore]")) return;
    const r = root.getBoundingClientRect();
    const x = e.clientX - r.left,
      y = e.clientY - r.top;
    const hit = nodeAt(x, y);
    if (hit) poke(hit);
    else if (!inAvoid(x, y, 8)) joinGuest(x, y);
  }

  // ── Simulation ─────────────────────────────────────────────
  /** The network goes about its day: pings, service requests, DNS, and the odd visitor. */
  function chatter() {
    const devs = devices();
    const services = nodes.filter((n) => n.kind === "service" && n.name !== "caddy" && n.name !== "adguard");
    const dns = byName("adguard");
    const pub = nodes.filter((n) => n.publicName);
    const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
    const roll = Math.random();
    const quiet = Math.random() < 0.55;
    if (roll < 0.34 && devs.length > 1) {
      const a = pick(devs);
      let b = a;
      while (b === a) b = pick(devs);
      ping(a, b, quiet, Math.random() < 0.22);
    } else if (roll < 0.72 && services.length && devs.length) {
      visit(pick(devs), pick(services), quiet, Math.random() < 0.18);
    } else if (roll < 0.88 && dns && devs.length) {
      visit(pick(devs), dns, quiet);
    } else if (pub.length) {
      visitor(pick(pub));
    }
  }

  function step(now: number, dt: number) {
    const s = dt / 1000;
    for (const n of nodes) {
      // A slow breath around the anchor; guests drift a little more, services barely.
      const amp = n === dragging ? 0 : n.guest ? 10 : n.kind === "service" ? 2 : 5;
      n.x = n.ax + Math.sin(now / 2300 + n.phase) * amp;
      n.y = n.ay + Math.cos(now / 2900 + n.phase * 1.3) * amp;
      n.flash *= 0.94;
    }
    // Guests leave.
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if (n.guest && now - n.born > GUEST_LIFE) {
        nodes.splice(i, 1);
        log(`${n.name} went offline`);
        counts();
      }
    }

    if (now > nextAuto) {
      chatter();
      nextAuto = now + 450 + Math.random() * 1100;
    }

    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      const a = p.hops[p.leg],
        b = p.hops[p.leg + 1];
      if (!a || !b || !nodes.includes(b)) {
        packets.splice(i, 1);
        continue;
      }
      const len = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
      const t0 = p.t;
      p.t = Math.min(1, p.t + (SPEED * s) / len);
      // Light every cell the packet passed this frame, not just where it landed.
      const grid = p.reply ? echo : heat;
      for (let d = t0; d <= p.t; d += PITCH / len / 2)
        deposit(grid, a.x + (b.x - a.x) * d, a.y + (b.y - a.y) * d, 0.5);
      if (p.t >= 1) {
        b.flash = 1;
        if (p.leg + 2 < p.hops.length) {
          p.leg++;
          p.t = 0;
        } else {
          packets.splice(i, 1);
          ripples.push({ x: b.x, y: b.y, r: 0, max: b.kind === "service" ? 16 : p.reply ? 18 : 30, reply: p.reply });
          p.onArrive?.();
        }
      }
    }

    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      const r0 = r.r;
      r.r += 70 * s;
      // Only light the ring when it crosses into a new cell, so it reads as a ring and not a filled disc.
      if (Math.floor(r.r / PITCH) === Math.floor(r0 / PITCH) && r0 > 0) {
        if (r.r >= r.max) ripples.splice(i, 1);
        continue;
      }
      const grid = r.reply ? echo : heat;
      const strength = 0.45 * (1 - r.r / r.max);
      const n = Math.max(8, Math.floor((Math.PI * 2 * r.r) / PITCH));
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        deposit(grid, r.x + Math.cos(a) * r.r, r.y + Math.sin(a) * r.r, strength);
      }
      if (r.r >= r.max) ripples.splice(i, 1);
    }

    for (let k = 0; k < heat.length; k++) {
      heat[k] *= DECAY;
      echo[k] *= DECAY;
    }
  }

  // ── Drawing ────────────────────────────────────────────────
  const cell = (i: number, j: number) => ctx.fillRect(i * PITCH, j * PITCH, BLOCK, BLOCK);

  function drawGround(now: number) {
    // A faint dot field with slow weather moving through it, brighter around the pointer.
    ctx.fillStyle = fg;
    const t = now / 1000;
    const pr = 90;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        if (mask[k]) continue;
        const cloud =
          Math.sin(i * 0.045 + t * 0.12) + Math.sin(j * 0.06 - t * 0.09 + Math.sin(i * 0.02 + t * 0.05) * 2);
        let a = 0.025 + Math.max(0, cloud) * 0.022;
        const dx = i * PITCH - pointer.x,
          dy = j * PITCH - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < pr * pr) a += 0.1 * (1 - Math.sqrt(d2) / pr);
        if (a < 0.03 && (i + j) % 2) continue; // thin the darkest weather to a checker
        ctx.globalAlpha = a;
        ctx.fillRect(i * PITCH + 2, j * PITCH + 2, 2, 2);
      }
    }
  }

  /** A link as dots, one every `every` cells: 1 for a wire, more for the internet. */
  function drawLink(a: Node, b: Node, alpha: number, every = 2, color = fg) {
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const n = Math.floor(len / PITCH);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    let lastK = -1;
    for (let s = 0; s <= n; s++) {
      const x = a.x + ((b.x - a.x) * s) / n,
        y = a.y + ((b.y - a.y) * s) / n;
      const k = cellAt(x, y);
      if (k < 0 || k === lastK || mask[k]) continue;
      lastK = k;
      if (s % every) continue;
      ctx.fillRect((k % cols) * PITCH + 2, Math.floor(k / cols) * PITCH + 2, 2, 2);
    }
  }

  function drawGrid(grid: Float32Array, color: string) {
    ctx.fillStyle = color;
    for (let k = 0; k < grid.length; k++) {
      const v = grid[k];
      if (v < 0.03) continue;
      ctx.globalAlpha = Math.min(1, v * 1.4);
      cell(k % cols, Math.floor(k / cols));
    }
  }

  /** What hovering a node says about it, the way `tailscale status` might. No addresses, real or made up. */
  function label(n: Node) {
    if (n === dragging) return `${n.name} · moving`;
    if (n.offline) return `${n.name} · ${n.os} · offline, last seen ${n.offline}`;
    switch (n.kind) {
      case "router": {
        const m = members(n).filter(online).length;
        return `${n.name} · ${m} ${m === 1 ? "device" : "devices"}`;
      }
      case "relay":
        return `${n.name} · relay · ${n.count} relayed`;
      case "edge":
        return `${n.name} · edge · public traffic in`;
      case "service":
        return `${n.name} · ${n.os} · ${n.count} ${n.count === 1 ? "request" : "requests"}${n.publicName ? ` · ${n.publicName}` : ""}`;
      default: {
        const svcs = servicesOn(n).length;
        const how = n.last ? `${n.last.how} ${n.last.ms}ms` : "idle";
        return `${n.name} · ${n.guest ? "guest" : n.os} · ${how}${n.exit ? " · exit node" : ""}${svcs ? ` · ${svcs} services` : ""}`;
      }
    }
  }

  function drawNode(n: Node, now: number) {
    const i = Math.floor(n.x / PITCH),
      j = Math.floor(n.y / PITCH);
    const fade = n.guest ? Math.min(1, (GUEST_LIFE - (now - n.born)) / 3000) : 1;
    const lit = n === hovered || n === dragging ? 1 : 0;
    const dim = n.offline ? 0.4 : 1;
    ctx.fillStyle = fg;
    if (n.kind === "relay") {
      // A hollow square: a relay forwards, it doesn't host.
      ctx.globalAlpha = (0.35 + lit * 0.4 + n.flash * 0.3) * fade;
      for (let di = -1; di <= 1; di++)
        for (let dj = -1; dj <= 1; dj++) if (di || dj) cell(i + di, j + dj);
    } else if (n.kind === "router") {
      // A solid block with an antenna: the box everything on the network goes through.
      ctx.globalAlpha = (0.32 + n.flash * 0.4 + lit * 0.3) * fade;
      for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) cell(i + di, j + dj);
      ctx.globalAlpha = (0.7 + n.flash * 0.3) * fade;
      cell(i, j);
      ctx.globalAlpha = (0.35 + lit * 0.3) * fade;
      cell(i + 1, j - 2);
    } else if (n.kind === "edge") {
      // A little cloud of cells, in the edge's orange.
      ctx.fillStyle = hue.orange || fg;
      ctx.globalAlpha = (0.45 + n.flash * 0.4 + lit * 0.3) * fade;
      for (const [di, dj] of [
        [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0],
        [-1, -1], [0, -1], [1, -1],
        [0, -2],
      ])
        cell(i + di, j + dj);
    } else if (n.kind === "service") {
      // A single cell in the service's colour.
      ctx.fillStyle = (n.hue && hue[n.hue]) || fg;
      ctx.globalAlpha = (0.55 + n.flash * 0.45 + lit * 0.3) * fade;
      cell(i, j);
    } else if (servicesOn(n).length && !n.offline) {
      // A server rack: three shelves, each with a status light that blinks on
      // its own and all of them at once when traffic arrives.
      for (const k of [-1, 0, 1]) {
        const row = j + k * 2;
        ctx.fillStyle = fg;
        ctx.globalAlpha = (0.38 + n.flash * 0.35 + lit * 0.3) * fade;
        cell(i - 1, row);
        cell(i, row);
        ctx.globalAlpha = (0.18 + lit * 0.2) * fade;
        cell(i + 1, row);
        // The light sits in the shelf's last cell.
        const on = n.flash > 0.3 || Math.sin(now / 260 + k * 2.1 + n.phase) > 0.2;
        ctx.fillStyle = green;
        ctx.globalAlpha = (on ? 1 : 0.3) * fade;
        ctx.fillRect((i + 1) * PITCH + 1, row * PITCH + 1, 4, 4);
      }
    } else if (n.offline) {
      // Hollow and dim: still on the tailnet, just not here.
      ctx.globalAlpha = (0.16 + lit * 0.3) * fade;
      cell(i - 1, j);
      cell(i + 1, j);
      cell(i, j - 1);
      cell(i, j + 1);
    } else {
      // A plus of cells, the centre brightest.
      ctx.globalAlpha = (0.55 + n.flash * 0.45 + lit * 0.3) * fade;
      cell(i, j);
      ctx.globalAlpha = (0.3 + n.flash * 0.5 + lit * 0.3) * fade;
      cell(i - 1, j);
      cell(i + 1, j);
      cell(i, j - 1);
      cell(i, j + 1);
      if (n.guest) {
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.6 * fade;
        cell(i, j);
      }
    }
    // An exit node wears a small green cell at its shoulder (above the rack, for a server).
    if (n.exit) {
      const rack = servicesOn(n).length > 0 && !n.offline;
      ctx.fillStyle = green;
      ctx.globalAlpha = 0.85 * fade;
      ctx.fillRect((i + (rack ? 2 : 1)) * PITCH + 2, (j - (rack ? 2 : 1)) * PITCH - 3, 4, 4);
    }
    // Services (and on a phone, most devices) only show their names when something reaches them, or on hover.
    const always = named(n);
    if (!always && !lit && n.flash < 0.25) return;
    ctx.globalAlpha =
      (always ? (0.42 + lit * 0.5 + n.flash * 0.3) * dim : Math.max(lit, n.flash) * 0.8) * fade;
    ctx.fillStyle = fg;
    ctx.font = `${n.kind === "service" ? 10 : 11}px 'Atkinson Hyperlegible Mono', ui-monospace, monospace`;
    ctx.textBaseline = "middle";
    const text = lit ? label(n) : n.name;
    // Near the right edge the name goes on the left of the node instead of off the page.
    const width = ctx.measureText(text).width;
    const gap = n.kind === "service" ? 1.5 : 2.5;
    const right = (i + gap) * PITCH;
    if (right + width > w - 8) {
      ctx.textAlign = "right";
      ctx.fillText(text, (i - gap + 0.5) * PITCH, j * PITCH + BLOCK / 2);
      ctx.textAlign = "left";
    } else ctx.fillText(text, right, j * PITCH + BLOCK / 2);
  }

  function draw(now: number) {
    ctx.clearRect(0, 0, w, h);
    drawGround(now);

    // The wiring: each machine to its router (solid, it's the LAN), each
    // service to its host (or to Caddy in front of it), the routers to each
    // other (dotted, it's the internet), and the relay and the edge faintly
    // to the routers. Everything touching the hovered node is brighter.
    const touch = (a: Node, b: Node) => a === hovered || b === hovered || a === dragging || b === dragging;
    const routers = nodes.filter((n) => n.kind === "router");
    for (const n of nodes) {
      if (hidden(n)) continue;
      if (n.kind === "peer" && !n.offline) {
        const r = n.guest ? null : routerOf(n);
        if (r) drawLink(n, r, touch(n, r) ? 0.45 : 0.17, 1);
        else {
          // A guest is out on the internet: a faint line to the nearest router.
          const nearest = [...routers].sort(
            (p, q) => Math.hypot(p.x - n.x, p.y - n.y) - Math.hypot(q.x - n.x, q.y - n.y),
          )[0];
          if (nearest) drawLink(n, nearest, 0.1, 2);
        }
      } else if (n.kind === "service") {
        const proxy = caddy();
        const up = n.proxied && proxy && proxy !== n ? proxy : byName(n.host);
        if (up) drawLink(n, up, touch(n, up) ? 0.5 : 0.2, 1, (n.hue && hue[n.hue]) || fg);
      }
    }
    for (let a = 0; a < routers.length; a++)
      for (let b = a + 1; b < routers.length; b++)
        drawLink(routers[a], routers[b], touch(routers[a], routers[b]) ? 0.4 : 0.14, 2);
    const relay = relayNode();
    if (relay) for (const r of routers) drawLink(relay, r, touch(relay, r) ? 0.35 : 0.07, 3);
    const edge = edgeNode();
    const host = nodes.find((n) => n.kind === "peer" && servicesOn(n).length);
    const lab = host && routerOf(host);
    if (edge && lab) drawLink(edge, lab, touch(edge, lab) ? 0.4 : 0.1, 3, hue.orange || fg);

    drawGrid(heat, accent);
    drawGrid(echo, green);

    // Packets in flight: one bright cell at the head.
    for (const p of packets) {
      const a = p.hops[p.leg],
        b = p.hops[p.leg + 1];
      if (!a || !b) continue;
      const k = cellAt(a.x + (b.x - a.x) * p.t, a.y + (b.y - a.y) * p.t);
      if (k < 0 || mask[k]) continue;
      ctx.fillStyle = p.reply ? green : accent;
      ctx.globalAlpha = 1;
      cell(k % cols, Math.floor(k / cols));
    }

    for (const n of nodes) if (!hidden(n)) drawNode(n, now);
    ctx.globalAlpha = 1;
  }

  function frame(now: number) {
    const dt = Math.min(64, now - last);
    last = now;
    step(now, dt);
    draw(now);
    raf = requestAnimationFrame(frame);
  }

  // ── Wiring ─────────────────────────────────────────────────
  function makeNode(p: Peer): Node {
    return {
      name: p.name,
      os: p.os,
      kind: p.kind ?? "peer",
      site: p.site,
      exit: !!p.exitNode,
      offline: p.offline,
      host: p.host,
      proxied: !!p.proxied,
      publicName: p.publicName,
      hue: p.hue,
      guest: false,
      count: 0,
      ax: 0,
      ay: 0,
      x: 0,
      y: 0,
      phase: Math.random() * 6,
      born: 0,
      flash: 0,
    };
  }
  for (const p of peers) nodes.push(makeNode(p));
  readColors();
  measure();
  counts();
  log("# click anywhere to join the tailnet");

  const ro = new ResizeObserver(() => {
    measure();
    if (still) draw(performance.now());
  });
  ro.observe(root);
  const themeObs = new MutationObserver(() => {
    readColors();
    if (still) draw(performance.now());
  });
  themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", readColors);
  root.addEventListener("pointerdown", onPointerDown);
  root.addEventListener("pointermove", onPointerMove);
  root.addEventListener("pointerup", onPointerUp);
  root.addEventListener("pointercancel", onPointerUp);
  root.addEventListener("pointerleave", onPointerLeave);
  root.addEventListener("click", onClick);
  // Fonts land after the first frame; redraw the labels in the right face.
  document.fonts?.ready.then(() => still && draw(performance.now()));

  if (still) {
    draw(performance.now());
    return;
  }
  raf = requestAnimationFrame(frame);
  document.addEventListener("visibilitychange", () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  });
}
