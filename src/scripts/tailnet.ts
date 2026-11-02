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
 * Peers can be dragged to a new spot (a click without moving still pings).
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

type Node = {
  name: string;
  os: string;
  relay: boolean;
  guest: boolean;
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

  /** Scatters the peers over open ground, spread apart, relays near an edge. */
  function placePeers() {
    const fixed = nodes.filter((n) => !n.guest);
    const margin = Math.min(80, w * 0.08);
    const minGap = Math.min(w, h) / 4;
    const placed: Node[] = [];
    // Seeded, so the layout is the same on every visit at a given size.
    let seed = 7;
    const rand = () => ((seed = Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x9e3779b9) >>> 0) / 4294967296;
    for (const n of fixed) {
      let best = { x: w / 2, y: h / 2, score: -Infinity };
      for (let tries = 0; tries < 80; tries++) {
        const x = margin + rand() * (w - margin * 2);
        const y = margin + 40 + rand() * (h - margin * 2 - 40);
        // The peer and the name that runs to its right both stay off the text.
        if (inAvoid(x, y, 48) || inAvoid(x + 80, y, 24)) continue;
        const near = Math.min(...placed.map((p) => Math.hypot(p.ax - x, p.ay - y)), Infinity);
        // Relays prefer the far edges; everyone else prefers room.
        const edge = n.relay ? -Math.min(x, w - x) * 0.6 : 0;
        const score = Math.min(near, minGap * 1.6) + edge + rand() * 10;
        if (score > best.score) best = { x, y, score };
      }
      n.ax = n.x = best.x;
      n.ay = n.y = best.y;
      placed.push(n);
    }
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

  // ── Events ─────────────────────────────────────────────────
  function log(line: string) {
    if (!logEl) return;
    const row = document.createElement("div");
    row.textContent = line;
    logEl.append(row);
    while (logEl.children.length > 4) logEl.firstElementChild!.remove();
  }
  const ms = (a: Node, b: Node, relay: boolean) =>
    Math.max(1, Math.round(2 + Math.hypot(a.x - b.x, a.y - b.y) / 45 + (relay ? 28 : 0) + Math.random() * 3));

  function send(from: Node, to: Node, opts: { viaRelay?: boolean; reply?: boolean; quiet?: boolean } = {}) {
    const relay = opts.viaRelay ? nodes.find((n) => n.relay && n !== from && n !== to) : undefined;
    const hops = relay ? [from, relay, to] : [from, to];
    sent++;
    if (packetsEl) {
      packetsEl.textContent = sent.toLocaleString();
      packetsEl.animate?.([{ opacity: 1 }, { opacity: 0.35 }], { duration: 600, easing: "ease-out" });
    }
    const p: Packet = {
      hops,
      leg: 0,
      t: 0,
      len: 1,
      reply: !!opts.reply,
      start: performance.now(),
    };
    if (!opts.reply) {
      p.onArrive = () => {
        // Every ping gets its pong, back the way it came.
        const back = send(to, from, { viaRelay: !!relay, reply: true, quiet: true });
        back.onArrive = () => {
          if (opts.quiet) return;
          const via = relay ? `DERP(${relay.name.replace(/^derp-/, "")})` : "direct";
          log(`pong from ${to.name} via ${via} in ${ms(from, to, !!relay)}ms`);
        };
      };
    }
    packets.push(p);
    return p;
  }

  function peersOnline() {
    if (peersEl) peersEl.textContent = String(nodes.filter((n) => !n.relay).length);
  }

  function joinGuest(x: number, y: number) {
    const guests = nodes.filter((n) => n.guest);
    if (guests.length >= MAX_GUESTS) nodes.splice(nodes.indexOf(guests[0]), 1);
    const name = `guest-${Math.random().toString(16).slice(2, 6)}`;
    const g: Node = {
      name,
      os: "browser",
      relay: false,
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
      .filter((n) => n !== g && !n.relay)
      .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))
      .slice(0, 3)
      .forEach((n, i) => setTimeout(() => send(g, n, { quiet: i > 0 }), i * 120));
  }

  function pingAll(from: Node) {
    from.flash = 1;
    ripples.push({ x: from.x, y: from.y, r: 0, max: 70, reply: false });
    nodes
      .filter((n) => n !== from && !n.relay)
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
          dragging.ax = x;
          dragging.ay = y;
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
      const real = nodes.filter((n) => !n.relay);
      if (real.length > 1) {
        const a = real[Math.floor(Math.random() * real.length)];
        let b = a;
        while (b === a) b = real[Math.floor(Math.random() * real.length)];
        send(a, b, { viaRelay: Math.random() < 0.15, quiet: Math.random() < 0.6 });
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

  function drawLink(a: Node, b: Node, alpha: number) {
    // Every other cell along the line, so links read as dotted wire.
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
      if (s % 2) continue;
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
    if (n.relay) {
      // A hollow square: a relay forwards, it doesn't host.
      ctx.globalAlpha = (0.35 + lit * 0.4) * fade;
      for (let di = -1; di <= 1; di++)
        for (let dj = -1; dj <= 1; dj++) if (di || dj) cell(i + di, j + dj);
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
    // Name, and on hover its address like `tailscale status` lists it.
    ctx.globalAlpha = (0.42 + lit * 0.5 + n.flash * 0.3) * fade;
    ctx.fillStyle = fg;
    ctx.font = "11px 'Atkinson Hyperlegible Mono', ui-monospace, monospace";
    ctx.textBaseline = "middle";
    // Hovered: what it runs and how it's reached. No addresses, real or made up.
    const how = n.relay ? "relay" : n.guest ? "guest" : n === dragging ? "moving" : "direct";
    const label = n === hovered || n === dragging ? `${n.name} · ${n.os} · ${how}` : n.name;
    ctx.fillText(label, (i + 2.5) * PITCH, j * PITCH + BLOCK / 2);
  }

  function draw(now: number) {
    ctx.clearRect(0, 0, w, h);
    drawGround(now);

    // Each peer's two nearest links stay faintly drawn; the hovered peer
    // shows all of its links.
    ctx.fillStyle = fg;
    const drawn = new Set<string>();
    for (const a of nodes) {
      const near = nodes
        .filter((b) => b !== a)
        .sort((p, q) => Math.hypot(p.x - a.x, p.y - a.y) - Math.hypot(q.x - a.x, q.y - a.y))
        .slice(0, a === hovered ? nodes.length : 2);
      for (const b of near) {
        const key = a.name < b.name ? a.name + b.name : b.name + a.name;
        if (drawn.has(key)) continue;
        drawn.add(key);
        drawLink(a, b, a === hovered || b === hovered ? 0.4 : 0.14);
      }
    }

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
      relay: !!p.relay,
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
