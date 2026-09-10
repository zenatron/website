/**
 * Category filtering for /stack. Progressive: with JS off every tile is
 * already in the document and visible, and the filter row simply does
 * nothing rather than hiding anything.
 */
function init() {
  const wall = document.querySelector<HTMLElement>("[data-wall]");
  if (!wall || wall.dataset.wired) return;
  wall.dataset.wired = "1";

  const buttons = [...document.querySelectorAll<HTMLButtonElement>("[data-filter]")];
  const tiles = [...wall.querySelectorAll<HTMLElement>(".tile")];
  const empty = document.querySelector<HTMLElement>("[data-empty]");

  function apply(filter: string) {
    let shown = 0;
    for (const tile of tiles) {
      const match = filter === "all" || tile.dataset.category === filter;
      tile.hidden = !match;
      if (match) shown += 1;
    }
    for (const b of buttons) {
      b.setAttribute("aria-pressed", String(b.dataset.filter === filter));
    }
    if (empty) empty.hidden = shown > 0;
  }

  for (const b of buttons) {
    b.addEventListener("click", () => apply(b.dataset.filter!));
  }
}

document.addEventListener("astro:page-load", init);
init();
