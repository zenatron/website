/**
 * The photo window on /photos. Every photo's slide ships rendered and
 * hidden inside the dialog; this shows one, steps between them with the
 * arrows (buttons, keys, or a swipe), and keeps the open photo in the
 * URL's hash so a link to one opens it.
 *
 * The thumbnails are real links to the full-size image, so without this
 * nothing is lost but the window.
 */

function init() {
  const dialog = document.querySelector<HTMLDialogElement>("[data-viewer]");
  if (!dialog || dialog.dataset.wired) return;
  dialog.dataset.wired = "1";

  const slides = [...dialog.querySelectorAll<HTMLElement>("[data-slide]")];
  const ids = slides.map((s) => s.dataset.slide!);
  const name = dialog.querySelector<HTMLElement>("[data-viewer-name]")!;
  const count = dialog.querySelector<HTMLElement>("[data-viewer-count]")!;
  const [prev, next] = [...dialog.querySelectorAll<HTMLButtonElement>("[data-viewer-step]")];
  let current = -1;
  let invoker: HTMLElement | null = null;

  /** Replaces the hash in place, keeping the router's own history state. */
  const setHash = (id?: string) => {
    const url = id ? `#${id}` : location.pathname + location.search;
    history.replaceState(history.state, "", url);
  };

  const show = (i: number) => {
    if (i < 0 || i >= slides.length) return;
    current = i;
    slides.forEach((s, j) => (s.hidden = j !== i));
    name.textContent = `${ids[i]}.jpg`;
    count.textContent = `${i + 1} of ${slides.length}`;
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1;
    // Hidden images with loading="eager" still fetch, so the neighbors are
    // ready by the time you step to them.
    for (const j of [i - 1, i + 1]) {
      const img = slides[j]?.querySelector("img");
      if (img) img.loading = "eager";
    }
    // The grid's thumbnail, already in cache, holds the frame while the
    // full-size one loads.
    const thumb = document.querySelector<HTMLImageElement>(`[data-photo="${ids[i]}"] img`)?.currentSrc;
    const frame = slides[i].querySelector<HTMLElement>(".frame");
    if (thumb && frame) frame.style.setProperty("--thumb", `url("${thumb}")`);
    setHash(ids[i]);
  };

  const open = (id: string, from?: HTMLElement) => {
    const i = ids.indexOf(id);
    if (i < 0) return;
    invoker = from ?? document.querySelector<HTMLElement>(`[data-photo="${id}"]`);
    show(i);
    if (!dialog.open) dialog.showModal();
  };

  for (const a of document.querySelectorAll<HTMLAnchorElement>("[data-photo]")) {
    a.addEventListener("click", (e) => {
      // A modified click still opens the image itself, in a new tab.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      open(a.dataset.photo!, a);
    });
  }

  prev.addEventListener("click", () => show(current - 1));
  next.addEventListener("click", () => show(current + 1));
  dialog.querySelector("[data-viewer-close]")!.addEventListener("click", () => dialog.close());

  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); show(current - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); show(current + 1); }
  });

  // A click on the backdrop closes, as the dock's windows do.
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  // Back to the thumbnail of the photo you ended on, not the one you
  // opened, as Photos returns you to where you are in the library.
  dialog.addEventListener("close", () => {
    setHash();
    const here = document.querySelector<HTMLElement>(`[data-photo="${ids[current]}"]`);
    (here ?? invoker)?.focus();
  });

  // A horizontal swipe steps; anything mostly vertical is left to scroll.
  const stage = dialog.querySelector<HTMLElement>("[data-viewer-stage]")!;
  let start: { x: number; y: number } | null = null;
  stage.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") start = { x: e.clientX, y: e.clientY };
  });
  stage.addEventListener("pointerup", (e) => {
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    start = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
  });
  stage.addEventListener("pointercancel", () => (start = null));

  // Arriving on a link to one photo opens it.
  const hashed = decodeURIComponent(location.hash.slice(1));
  if (ids.includes(hashed)) open(hashed);
}

document.addEventListener("astro:page-load", init);
init();
