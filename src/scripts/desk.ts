/**
 * The desk. Dragging is a pointer-only enhancement over a grid of buttons
 * that already works from the keyboard, and on mobile over a static grid
 * that never moves.
 *
 * Every window's contents come from the same data the rest of the site
 * renders, serialised into the page at build time.
 */
interface DeskItem {
  file: string;
  kind: "neofetch" | "text" | "list" | "fortune" | "link";
  href?: string;
  note?: string;
}
interface Windows {
  neofetch: { name: string; fields: [string, string][] }[];
  now: { heading: string; items: { name: string; status: string }[] }[];
  principles: string[];
  fortunes: string[];
}

const KEY = "desk-positions";

function load(): Record<string, { x: number; y: number }> {
  try { return JSON.parse(sessionStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
}
function save(v: unknown) {
  try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch { /* private browsing */ }
}

function el<T extends HTMLElement>(tag: string, cls?: string, text?: string): T {
  const n = document.createElement(tag) as T;
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

function init() {
  const desk = document.querySelector<HTMLElement>("[data-desk]");
  const itemsRaw = document.querySelector<HTMLScriptElement>("[data-desk-items]")?.textContent;
  const winsRaw = document.querySelector<HTMLScriptElement>("[data-desk-windows]")?.textContent;
  if (!desk || !itemsRaw || !winsRaw || desk.dataset.wired) return;
  desk.dataset.wired = "1";

  const items: DeskItem[] = JSON.parse(itemsRaw);
  const W: Windows = JSON.parse(winsRaw);
  const dialog = document.querySelector<HTMLDialogElement>("[data-win]")!;
  const icons = [...desk.querySelectorAll<HTMLElement>("[data-object]")];
  const canDrag = () => window.matchMedia("(min-width: 901px)").matches;

  const positions = load();
  for (const icon of icons) {
    const saved = positions[icon.dataset.object!];
    if (saved && canDrag()) {
      icon.style.setProperty("--x", `${saved.x}%`);
      icon.style.setProperty("--y", `${saved.y}%`);
    }
  }

  function select(icon: HTMLElement | null) {
    for (const i of icons) i.removeAttribute("data-selected");
    icon?.setAttribute("data-selected", "");
  }
  desk.addEventListener("pointerdown", (e) => { if (e.target === desk) select(null); });

  /* ── window contents ─────────────────────────────────────── */

  function render(kind: DeskItem["kind"]): HTMLElement {
    const box = el<HTMLDivElement>("div");

    if (kind === "neofetch") {
      for (const m of W.neofetch) {
        box.append(el("p", "host", `phil@${m.name}`));
        const dl = el<HTMLDListElement>("dl", "spec");
        for (const [k, v] of m.fields) {
          dl.append(el("dt", undefined, k), el("dd", undefined, v));
        }
        box.append(dl);
      }
    } else if (kind === "list") {
      for (const g of W.now) {
        const group = el("div", "group");
        group.append(el("p", "group-head", g.heading));
        for (const it of g.items) {
          const row = el("div", "row");
          row.append(el("span", undefined, it.name), el("span", undefined, it.status));
          group.append(row);
        }
        box.append(group);
      }
    } else if (kind === "text") {
      for (const line of W.principles) box.append(el("p", "line", line));
    } else if (kind === "fortune") {
      box.append(el("p", "quote", W.fortunes[Math.floor(Math.random() * W.fortunes.length)]));
    }
    return box;
  }

  let lastInvoker: HTMLElement | null = null;

  function open(index: number, invoker: HTMLElement) {
    const item = items[index];
    if (item.kind === "link" && item.href) {
      location.href = item.href;
      return;
    }
    lastInvoker = invoker;
    dialog.querySelector("[data-win-name]")!.textContent = item.file;
    const body = dialog.querySelector<HTMLElement>("[data-win-body]")!;
    body.textContent = "";
    body.append(render(item.kind));
    dialog.querySelector("[data-win-foot]")!.textContent = item.note ?? "";
    dialog.setAttribute("aria-label", item.file);
    dialog.showModal();
  }

  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => lastInvoker?.focus());

  /* ── drag ────────────────────────────────────────────────── */

  let dragging: HTMLElement | null = null;
  let moved = false;
  let ox = 0, oy = 0, sl = 0, st = 0;

  for (const icon of icons) {
    const index = Number(icon.dataset.object);

    icon.addEventListener("click", () => { if (!moved) select(icon); });
    icon.addEventListener("dblclick", () => open(index, icon));
    icon.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select(icon);
        open(index, icon);
      }
    });

    icon.addEventListener("pointerdown", (e) => {
      if (!canDrag() || e.button !== 0) return;
      dragging = icon; moved = false;
      ox = e.clientX; oy = e.clientY;
      const d = desk.getBoundingClientRect(), r = icon.getBoundingClientRect();
      sl = r.left - d.left; st = r.top - d.top;
      icon.setPointerCapture(e.pointerId);
      select(icon);
    });

    icon.addEventListener("pointermove", (e) => {
      if (dragging !== icon) return;
      const dx = e.clientX - ox, dy = e.clientY - oy;
      if (!moved && Math.hypot(dx, dy) < 3) return;
      moved = true;
      const d = desk.getBoundingClientRect();
      const x = Math.min(Math.max(sl + dx, 0), Math.max(d.width - icon.offsetWidth, 0));
      const y = Math.min(Math.max(st + dy, 0), Math.max(d.height - icon.offsetHeight, 0));
      icon.style.setProperty("--x", `${(x / d.width) * 100}%`);
      icon.style.setProperty("--y", `${(y / d.height) * 100}%`);
    });

    const end = (e: PointerEvent) => {
      if (dragging !== icon) return;
      dragging = null;
      icon.releasePointerCapture?.(e.pointerId);
      if (moved) {
        const all = load();
        all[String(index)] = {
          x: parseFloat(icon.style.getPropertyValue("--x")),
          y: parseFloat(icon.style.getPropertyValue("--y")),
        };
        save(all);
      }
      setTimeout(() => (moved = false), 0);
    };
    icon.addEventListener("pointerup", end);
    icon.addEventListener("pointercancel", end);
  }
}

document.addEventListener("astro:page-load", init);
init();
