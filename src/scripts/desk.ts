/**
 * The desk. Objects are laid out by CSS grid with a seeded per-item
 * jitter, so there is nothing to position here — this only opens the
 * windows behind the file objects.
 */
interface Windows {
  neofetch: { name: string; fields: [string, string][] }[];
  now: { heading: string; items: { name: string; status: string }[] }[];
  principles: string[];
  fortunes: string[];
}

function el<T extends HTMLElement>(tag: string, cls?: string, text?: string): T {
  const n = document.createElement(tag) as T;
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

function init() {
  const raw = document.querySelector<HTMLScriptElement>("[data-desk-windows]")?.textContent;
  const dialog = document.querySelector<HTMLDialogElement>("[data-win]");
  if (!raw || !dialog || dialog.dataset.wired) return;
  dialog.dataset.wired = "1";

  const W: Windows = JSON.parse(raw);
  let lastInvoker: HTMLElement | null = null;

  function render(kind: string): HTMLElement {
    const box = el<HTMLDivElement>("div");

    if (kind === "neofetch") {
      for (const m of W.neofetch) {
        box.append(el("p", "host", `phil@${m.name}`));
        const dl = el<HTMLDListElement>("dl", "spec");
        for (const [k, v] of m.fields) dl.append(el("dt", undefined, k), el("dd", undefined, v));
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

  for (const btn of document.querySelectorAll<HTMLButtonElement>("[data-open-file]")) {
    if (btn.dataset.wired) continue;
    btn.dataset.wired = "1";
    btn.addEventListener("click", () => {
      const kind = btn.dataset.openFile!;
      const name = btn.dataset.fileName ?? "";

      // `link` objects navigate rather than opening a window.
      if (kind === "link") return;

      lastInvoker = btn;
      dialog.querySelector("[data-win-name]")!.textContent = name;
      const body = dialog.querySelector<HTMLElement>("[data-win-body]")!;
      body.textContent = "";
      body.append(render(kind));
      dialog.querySelector("[data-win-foot]")!.textContent = btn.dataset.fileNote ?? "";
      dialog.setAttribute("aria-label", name);
      dialog.showModal();
    });
  }

  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => lastInvoker?.focus());
}

document.addEventListener("astro:page-load", init);
init();
