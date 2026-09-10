/**
 * The desk. Dragging is a pointer-only enhancement layered on top of a
 * grid of buttons that already works with the keyboard alone — and, on
 * mobile, on top of a static grid that never moves.
 *
 * Transform-only, no library, no animation: the icon tracks the pointer
 * 1:1 because anything else feels like lag.
 */

interface DeskObject {
  file: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  note: string;
  x: number;
  y: number;
}

const KEY = "desk-positions";

function load(): Record<string, { x: number; y: number }> {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}
function save(positions: Record<string, { x: number; y: number }>) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(positions));
  } catch {
    /* private browsing — positions just won't persist */
  }
}

function init() {
  const desk = document.querySelector<HTMLElement>("[data-desk]");
  const raw = document.querySelector<HTMLScriptElement>("[data-desk-data]")?.textContent;
  if (!desk || !raw || desk.dataset.wired) return;
  desk.dataset.wired = "1";

  const objects: DeskObject[] = JSON.parse(raw);
  const dialog = document.querySelector<HTMLDialogElement>("[data-preview]")!;
  const icons = [...desk.querySelectorAll<HTMLElement>("[data-object]")];

  const canDrag = () => window.matchMedia("(min-width: 901px)").matches;

  /* ── restore positions ─────────────────────────────────────── */
  const positions = load();
  for (const icon of icons) {
    const saved = positions[icon.dataset.object!];
    if (saved && canDrag()) {
      icon.style.setProperty("--x", `${saved.x}%`);
      icon.style.setProperty("--y", `${saved.y}%`);
    }
  }

  /* ── selection ─────────────────────────────────────────────── */
  function select(icon: HTMLElement | null) {
    for (const i of icons) i.removeAttribute("data-selected");
    icon?.setAttribute("data-selected", "");
  }
  desk.addEventListener("pointerdown", (e) => {
    if (e.target === desk) select(null);
  });

  /* ── preview ───────────────────────────────────────────────── */
  let lastInvoker: HTMLElement | null = null;

  function openPreview(index: number, invoker: HTMLElement) {
    const o = objects[index];
    lastInvoker = invoker;
    dialog.querySelector("[data-pv-name]")!.textContent = o.file;
    const img = dialog.querySelector<HTMLImageElement>("[data-pv-img]")!;
    img.src = `/images/desk/${o.src}.webp`;
    img.alt = o.alt;
    img.width = o.width;
    img.height = o.height;
    dialog.querySelector("[data-pv-dims]")!.textContent = `${o.width} × ${o.height}`;
    dialog.querySelector("[data-pv-note]")!.textContent = o.note;
    // The filename is the dialog's accessible name.
    dialog.setAttribute("aria-label", o.file);
    dialog.showModal();
  }

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => lastInvoker?.focus());

  /* ── drag ──────────────────────────────────────────────────── */
  let dragging: HTMLElement | null = null;
  let moved = false;
  let originX = 0;
  let originY = 0;
  let startLeft = 0;
  let startTop = 0;

  for (const icon of icons) {
    const index = Number(icon.dataset.object);

    // Keyboard and assistive tech get the object without any dragging.
    icon.addEventListener("click", () => {
      if (moved) return; // the pointerup that ends a drag is not a click
      select(icon);
    });
    icon.addEventListener("dblclick", () => openPreview(index, icon));
    icon.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select(icon);
        openPreview(index, icon);
      }
    });

    icon.addEventListener("pointerdown", (e) => {
      if (!canDrag() || e.button !== 0) return;
      dragging = icon;
      moved = false;
      originX = e.clientX;
      originY = e.clientY;
      const deskRect = desk.getBoundingClientRect();
      const iconRect = icon.getBoundingClientRect();
      startLeft = iconRect.left - deskRect.left;
      startTop = iconRect.top - deskRect.top;
      icon.setPointerCapture(e.pointerId);
      select(icon);
    });

    icon.addEventListener("pointermove", (e) => {
      if (dragging !== icon) return;
      const dx = e.clientX - originX;
      const dy = e.clientY - originY;
      if (!moved && Math.hypot(dx, dy) < 3) return;
      moved = true;
      const deskRect = desk.getBoundingClientRect();
      const maxX = deskRect.width - icon.offsetWidth;
      const maxY = deskRect.height - icon.offsetHeight;
      const x = Math.min(Math.max(startLeft + dx, 0), Math.max(maxX, 0));
      const y = Math.min(Math.max(startTop + dy, 0), Math.max(maxY, 0));
      icon.style.setProperty("--x", `${(x / deskRect.width) * 100}%`);
      icon.style.setProperty("--y", `${(y / deskRect.height) * 100}%`);
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
      // Let the click handler see `moved`, then reset it.
      setTimeout(() => (moved = false), 0);
    };
    icon.addEventListener("pointerup", end);
    icon.addEventListener("pointercancel", end);
  }
}

document.addEventListener("astro:page-load", init);
init();
