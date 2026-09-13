/**
 * The desk. Objects are laid out by CSS grid with a seeded per-item
 * jitter, so there is nothing to position here — this only opens the
 * windows behind the file objects. Their contents ship rendered and
 * hidden inside the dialog; a click just shows the matching one, so
 * everything the windows say is in the static HTML too.
 */

function init() {
  const dialog = document.querySelector<HTMLDialogElement>("[data-win]");
  if (!dialog || dialog.dataset.wired) return;
  dialog.dataset.wired = "1";
  let lastInvoker: HTMLElement | null = null;

  const variants = new Map<string, HTMLElement>();
  for (const v of dialog.querySelectorAll<HTMLElement>("[data-win-variant]"))
    variants.set(v.dataset.winVariant!, v);

  for (const btn of document.querySelectorAll<HTMLButtonElement>(
    "[data-open-file]"
  )) {
    if (btn.dataset.wired) continue;
    btn.dataset.wired = "1";
    btn.addEventListener("click", () => {
      const kind = btn.dataset.openFile!;

      // `link` objects navigate rather than opening a window.
      if (kind === "link") return;

      const box = variants.get(kind);
      if (!box) return;

      // A fortune is chosen per opening, from the rendered pile.
      if (kind === "fortune") {
        const quotes = [...box.children] as HTMLElement[];
        const pick = quotes[Math.floor(Math.random() * quotes.length)];
        for (const q of quotes) q.hidden = q !== pick;
      }
      for (const v of variants.values()) v.hidden = v !== box;

      lastInvoker = btn;
      dialog.querySelector("[data-win-name]")!.textContent =
        btn.dataset.fileName ?? "";
      dialog.querySelector("[data-win-foot]")!.textContent =
        btn.dataset.fileNote ?? "";
      dialog.setAttribute("aria-label", btn.dataset.fileName ?? "");
      dialog.showModal();
    });
  }

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => lastInvoker?.focus());
}

document.addEventListener("astro:page-load", init);
init();
