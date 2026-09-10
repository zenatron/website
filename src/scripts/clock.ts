/**
 * The status bar clock. This is the one exception to the no-timers rule:
 * it is a clock, and a clock that does not tick is broken.
 *
 * Width is reserved in CSS, so filling it in cannot shift the layout.
 */
import { SITE } from "@/data/site";

function render() {
  const el = document.querySelector<HTMLElement>("[data-clock]");
  if (!el) return;
  const time = new Date().toLocaleTimeString("en-US", {
    timeZone: SITE.timezone,
    hour: "numeric",
    minute: "2-digit",
  });
  el.textContent = `${SITE.city} ${time}`;
}

// Hydrate after paint; never block render.
requestAnimationFrame(render);
setInterval(render, 30_000);
document.addEventListener("astro:page-load", render);
