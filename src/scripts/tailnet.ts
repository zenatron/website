/**
 * The home page's mesh: the tailnet, drawn on a grid of square cells.
 *
 * Peers sit at fixed anchors and breathe a little. Packets cross between
 * them on their own (and now and then detour through a DERP relay),
 * leaving a trail of lit cells that fades. Clicking empty ground joins a
 * short-lived guest peer, which handshakes with its nearest neighbours;
 * clicking a peer pings everyone from it. A small log in the corner
 * prints what happened the way `tailscale ping` would.
 *
 * Machines sit on networks: behind a site's router they reach each other
 * over the LAN; between sites a packet crosses both routers, directly or by
 * way of the DERP relay. Hovering a machine says how its last ping went.
 *
 * Peers can be dragged to a new spot (a click without moving still pings);
 * dragging a router brings its network along.
 *
 * Anything marked [data-mesh-frost] gets no peer placed or dragged onto
 * it, but the mesh still runs behind it (it wears a frosted panel).
 * Anything marked [data-mesh-avoid] is kept clear: no peer is placed
 * there and no cell is lit over it, so the text stays legible.
 */
import type { Peer } from "@/data/tailnet";

const PITCH = 8; // css px from one cell to the next
const BLOCK = 6; // a cell's lit square
const SPEED = 260; // px per second a packet travels
const DECAY = 0.9; // a trail cell keeps this much of its light each frame
const MAX_GUESTS = 5;
const GUEST_LIFE = 24_000; // ms

type Kind = "peer" | "router" | "relay";
type Node = {
  name: string;
  os: string;
  kind: Kind;
  site?: string;
  exit: boolean;
  guest: boolean;
  /** How its last ping went, for the hover label. */
  last?: { how: string; ms: number };
  /** For a relay: how many packets it has carried. */
  relayed: number;
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
  hops: Node[]; // from, (relay,) to
  leg: number;
  t: number; // 0..1 along the current leg
  len: number;
  reply: boolean;
  start: number;
  onArrive?: () => void;
};
type Ripple = { x: number; y: number; r: number; max: number; reply: boolean };

export function mountTailnet(root: HTMLElement, peers: Peer[]) {
  const canvas = root.querySelector("canvas")!;
  const ctx = canvas.getContext("2d")!;
  const logEl = root.querySelector<HTMLElement>("[data-mesh-log]");
  const peersEl = root.querySelector<HTMLElement>("[data-mesh-peers]");
  const packetsEl = root.querySelector<HTMLElement>("[data-mesh-packets]");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w = 0,
    h = 0,
    cols = 0,
    rows = 0,
    dpr = 1;
  let heat = new Float32Array(0); // accent: outbound packets
  let echo = new Float32Array(0); // green: replies
  let mask = new Uint8Array(0); // 1 where a cell is kept clear
  let avoid: DOMRect[] = [];
  let frost: DOMRect[] = [];
  const nodes: Node[] = [];
  const packets: Packet[] = [];
  const ripples: Ripple[] = [];
  const pointer = { x: -1e4, y: -1e4 };
  let hovered: Node | null = null;
  /** The peer being dragged, where the drag started, and whether it has moved enough to count. */
  let dragging: Node | null = null;
  let dragFrom = { x: 0, y: 0 };
  let dragMoved = false;
  let swallowClick = false;
  let sent = 0;
  let nextAuto = 0;
  let raf = 0;
  let last = performance.now();

  // ── Colors, re-read when the theme changes ─────────────────
  let fg = "#000",
    accent = "#00f",
    green = "#0a0";
  const readColors = () => {
    const s = getComputedStyle(document.documentElement);
    fg = s.getPropertyValue("--c-text").trim() || fg;
    accent = s.getPropertyValue("--c-accent").trim() || accent;
    green = s.getPropertyValue("--c-hue-green").trim() || green;
  };

  // ── Layout ─────────────────────────────────────────────────
  const inRects = (rects: DOMRect[], x: number, y: number, pad: number) =>
    rects.some((r) => x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad);
  /** Somewhere no peer may sit: clear areas and frosted panels alike. */
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
    placePeers();
  }

  /**
   * Routers first, far apart; the relay near an edge; then each network's
   * machines in a loose ring around their router. Seeded, so the layout is
   * the same on every visit at a given size.
   */
  function placePeers() {
    const fixed = nodes.filter((n) => !n.guest);
    const margin = Math.min(80, w * 0.08);
    const placed: Node[] = [];
    let seed = 7;
    const rand = () => ((seed = Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x9e3779b9) >>> 0) / 4294967296;
    const order: Kind[] = ["router", "relay", "peer"];
    const sorted = [...fixed].sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
    const reach = Math.max(110, Math.min(210, Math.min(w, h) * 0.24));
    for (const n of sorted) {
      const router = n.kind === "peer" ? routerOf(n) : undefined;
      let best = { x: w / 2, y: h / 2, score: -Infinity };
      for (let tries = 0; tries < 160; tries++) {
        const x = margin + rand() * (w - margin * 2);
        const y = margin + 40 + rand() * (h - margin * 2 - 40);
        // The machine and the name that runs to its right both stay off the text.
        if (inAvoid(x, y, 48) || inAvoid(x + 80, y, 24)) continue;
        const near = Math.min(...placed.map((p) => Math.hypot(p.ax - x, p.ay - y)), Infinity);
        // Names run about 100px to the right: keep them from landing on each other.
        if (placed.some((p) => Math.abs(p.ay - y) < 22 && x - p.ax > -110 && x - p.ax < 120)) continue;
        if (near < 64) continue;
        let score: number;
        if (n.kind === "router") {
          // Networks spread out across the page.
          score = Math.min(near, w * 0.6) + rand() * 20;
        } else if (n.kind === "relay") {
          // Out toward an edge, away from both networks.
          score = Math.min(near, 300) - Math.min(x, w - x) * 0.6 + rand() * 10;
        } else if (router) {
          // Around its router, not too close to anyone.
          const d = Math.hypot(router.ax - x, router.ay - y);
          if (d < 90 || d > reach * (tries > 120 ? 1.6 : 1)) continue;
          score = Math.min(near, 110) + rand() * 10;
        } else {
          score = Math.min(near, 200) + rand() * 10;
        }
        if (score > best.score) best = { x, y, score };
      }
      n.ax = n.x = best.x;
      n.ay = n.y = best.y;
      placed.push(n);
    }
  }

  const routerOf = (n: Node) =>
    n.site ? nodes.find((r) => r.kind === "router" && r.site === n.site && r !== n) : undefined;
  const members = (r: Node) => nodes.filter((n) => n.kind === "peer" && n.site === r.site && !n.guest);
  const relayNode = () => nodes.find((n) => n.kind === "relay");

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

  // ── Events ─────────────────────────────────────────────────
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
   * or through the relay), and in through b's.
   */
  function route(a: Node, b: Node, viaRelay: boolean) {
    const ra = a.kind === "router" ? undefined : routerOf(a);
    const rb = b.kind === "router" ? undefined : routerOf(b);
    if (ra && ra === rb) return { hops: [a, ra, b], how: "lan", relay: undefined };
    const relay = viaRelay ? relayNode() : undefined;
    const hops = [a, ra, relay, rb, b].filter((n): n is Node => !!n && n !== a && n !== b);
    return {
      hops: [a, ...hops, b],
      how: relay ? `via ${relay.name.replace(/^derp-/, "")}` : "direct",
      relay,
    };
  }
  /** Round-trip time for that route, made up but in proportion. */
  const ms = (a: Node, b: Node, how: string) =>
    how === "lan"
      ? 1 + Math.floor(Math.random() * 4)
      : Math.round(
          6 + Math.hypot(a.x - b.x, a.y - b.y) / 60 + Math.random() * 6 + (how.startsWith("via") ? 24 + Math.random() * 14 : 0),
        );

  function send(from: Node, to: Node, opts: { viaRelay?: boolean; reply?: boolean; quiet?: boolean; hops?: Node[] } = {}) {
    const r = opts.hops ? { hops: opts.hops, how: "", relay: undefined } : route(from, to, !!opts.viaRelay);
    sent++;
    if (packetsEl) {
      packetsEl.textContent = sent.toLocaleString();
      packetsEl.animate?.([{ opacity: 1 }, { opacity: 0.35 }], { duration: 600, easing: "ease-out" });
    }
    if (r.relay) r.relay.relayed++;
    const p: Packet = {
      hops: r.hops,
      leg: 0,
      t: 0,
      len: 1,
      reply: !!opts.reply,
      start: performance.now(),
    };
    if (!opts.reply) {
      p.onArrive = () => {
        // Every ping gets its pong, back the way it came.
        const back = send(to, from, { reply: true, quiet: true, hops: [...r.hops].reverse() });
        if (r.relay) r.relay.relayed++;
        back.onArrive = () => {
          const time = ms(from, to, r.how);
          // Both ends remember how it went, for their hover labels.
          if (from.kind === "peer") from.last = { how: r.how, ms: time };
          if (to.kind === "peer") to.last = { how: r.how, ms: time };
          if (opts.quiet) return;
          const via = r.relay ? `DERP(${r.relay.name.replace(/^derp-/, "")})` : r.how;
          log(`pong from ${to.name} via ${via} in ${time}ms`);
        };
      };
    }
    packets.push(p);
    return p;
  }

  function peersOnline() {
    if (peersEl) peersEl.textContent = String(nodes.filter((n) => n.kind === "peer").length);
  }

  function joinGuest(x: number, y: number) {
    const guests = nodes.filter((n) => n.guest);
    if (guests.length >= MAX_GUESTS) nodes.splice(nodes.indexOf(guests[0]), 1);
    const name = `guest-${Math.random().toString(16).slice(2, 6)}`;
    const g: Node = {
      name,
      os: "browser",
      kind: "peer",
      exit: false,
      relayed: 0,
      guest: true,
      ax: x,
      ay: y,
      x,
      y,
      phase: Math.random() * 6,
      born: performance.now(),
      flash: 1,
    };
    nodes.push(g);
    ripples.push({ x, y, r: 0, max: 90, reply: false });
    log(`${name} joined the tailnet`);
    peersOnline();
    // Handshake with the three nearest.
    nodes
      .filter((n) => n !== g && n.kind === "peer")
      .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))
      .slice(0, 3)
      .forEach((n, i) => setTimeout(() => send(g, n, { quiet: i > 0 }), i * 120));
  }

  /** A machine pings everyone; a router pings the machines on its network. */
  function pingAll(from: Node) {
    from.flash = 1;
    ripples.push({ x: from.x, y: from.y, r: 0, max: 70, reply: false });
    const targets = from.kind === "router" ? members(from) : nodes.filter((n) => n !== from && n.kind === "peer");
    targets
      .forEach((n, i) => setTimeout(() => send(from, n, { quiet: i > 0 }), i * 90));
  }

  const nodeAt = (x: number, y: number) =>
    nodes.find((n) => Math.hypot(n.x - x, n.y - y) < PITCH * 3) ?? null;

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
        // Its name runs to the right, so that has to stay clear of the text too.
        if (!inAvoid(x, y, 20) && !inAvoid(x + 70, y, 12)) {
          const dx = x - dragging.ax,
            dy = y - dragging.ay;
          dragging.ax = x;
          dragging.ay = y;
          // A router brings its network along, each machine as far as it can go.
          if (dragging.kind === "router")
            for (const m of members(dragging)) {
              const mx = Math.max(24, Math.min(w - 120, m.ax + dx)),
                my = Math.max(72, Math.min(h - 24, m.ay + dy));
              if (!inAvoid(mx, my, 20) && !inAvoid(mx + 70, my, 12)) {
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
    if (hit) pingAll(hit);
    else if (!inAvoid(x, y, 8)) joinGuest(x, y);
  }

  // ── Simulation ─────────────────────────────────────────────
  function step(now: number, dt: number) {
    const s = dt / 1000;
    for (const n of nodes) {
      // A slow breath around the anchor; guests drift a little more.
      const amp = n === dragging ? 0 : n.guest ? 10 : 5;
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
        peersOnline();
      }
    }

    // The tailnet chats on its own.
    if (now > nextAuto) {
      const real = nodes.filter((n) => n.kind === "peer");
      if (real.length > 1) {
        const a = real[Math.floor(Math.random() * real.length)];
        let b = a;
        while (b === a) b = real[Math.floor(Math.random() * real.length)];
        // Across networks, now and then the direct path fails and DERP carries it.
        send(a, b, { viaRelay: Math.random() < 0.22, quiet: Math.random() < 0.6 });
      }
      nextAuto = now + 700 + Math.random() * 1600;
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
          ripples.push({ x: b.x, y: b.y, r: 0, max: p.reply ? 18 : 30, reply: p.reply });
          p.onArrive?.();
        }
      }
    }

    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      const r0 = r.r;
      r.r += 70 * s;
      // Only light the ring when it crosses into a new cell, so it reads as
      // a ring and not a filled disc.
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
    // A faint dot field with slow weather moving through it, brighter
    // around the pointer.
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
  function drawLink(a: Node, b: Node, alpha: number, every = 2) {
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const n = Math.floor(len / PITCH);
    ctx.globalAlpha = alpha;
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

  function drawNode(n: Node, now: number) {
    const i = Math.floor(n.x / PITCH),
      j = Math.floor(n.y / PITCH);
    const fade = n.guest ? Math.min(1, (GUEST_LIFE - (now - n.born)) / 3000) : 1;
    const lit = n === hovered ? 1 : 0;
    ctx.fillStyle = n.flash > 0.05 ? (n.guest ? accent : fg) : fg;
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
    // An exit node wears a small green cell at its shoulder.
    if (n.exit) {
      ctx.fillStyle = green;
      ctx.globalAlpha = 0.85 * fade;
      ctx.fillRect((i + 1) * PITCH + 2, (j - 1) * PITCH - 3, 4, 4);
    }
    ctx.globalAlpha = (0.42 + lit * 0.5 + n.flash * 0.3) * fade;
    ctx.fillStyle = fg;
    ctx.font = "11px 'Atkinson Hyperlegible Mono', ui-monospace, monospace";
    ctx.textBaseline = "middle";
    // Hovered: what it is and how its last ping went, the way `tailscale status`
    // would say it. No addresses, real or made up.
    const detail =
      n === dragging
        ? "moving"
        : n.kind === "router"
          ? `${members(n).length} ${members(n).length === 1 ? "device" : "devices"}`
          : n.kind === "relay"
            ? `relay · ${n.relayed} relayed`
            : `${n.guest ? "guest" : n.os} · ${n.last ? `${n.last.how} ${n.last.ms}ms` : "idle"}${n.exit ? " · exit node" : ""}`;
    const label = n === hovered || n === dragging ? `${n.name} · ${detail}` : n.name;
    // Near the right edge the name goes on the left of the node instead of off the page.
    const width = ctx.measureText(label).width;
    const right = (i + 2.5) * PITCH;
    if (right + width > w - 8) {
      ctx.textAlign = "right";
      ctx.fillText(label, (i - 2) * PITCH, j * PITCH + BLOCK / 2);
      ctx.textAlign = "left";
    } else ctx.fillText(label, right, j * PITCH + BLOCK / 2);
  }

  function draw(now: number) {
    ctx.clearRect(0, 0, w, h);
    drawGround(now);

    // The wiring: each machine to its router (solid, it's the LAN), the routers
    // to each other (dotted, it's the internet), and the relay faintly to both.
    // Everything touching the hovered node is brighter.
    ctx.fillStyle = fg;
    const touch = (a: Node, b: Node) => a === hovered || b === hovered || a === dragging || b === dragging;
    const routers = nodes.filter((n) => n.kind === "router");
    for (const n of nodes) {
      if (n.kind !== "peer") continue;
      const r = n.guest ? null : routerOf(n);
      if (r) drawLink(n, r, touch(n, r) ? 0.45 : 0.17, 1);
      else {
        // A guest is out on the internet: a faint line to the nearest router.
        const nearest = routers.sort((p, q) => Math.hypot(p.x - n.x, p.y - n.y) - Math.hypot(q.x - n.x, q.y - n.y))[0];
        if (nearest) drawLink(n, nearest, 0.1, 2);
      }
    }
    for (let a = 0; a < routers.length; a++)
      for (let b = a + 1; b < routers.length; b++)
        drawLink(routers[a], routers[b], touch(routers[a], routers[b]) ? 0.4 : 0.14, 2);
    const relay = relayNode();
    if (relay) for (const r of routers) drawLink(relay, r, touch(relay, r) ? 0.35 : 0.07, 3);

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

    for (const n of nodes) drawNode(n, now);
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
  for (const p of peers) {
    nodes.push({
      name: p.name,
      os: p.os,
      kind: p.kind ?? "peer",
      site: p.site,
      exit: !!p.exitNode,
      relayed: 0,
      guest: false,
      ax: 0,
      ay: 0,
      x: 0,
      y: 0,
      phase: Math.random() * 6,
      born: 0,
      flash: 0,
    });
  }
  readColors();
  measure();
  peersOnline();
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
