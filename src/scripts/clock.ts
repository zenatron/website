/**
 * The menu bar clock. This is the one exception to the no-timers rule:
 * it is a clock, and a clock that does not tick is broken.
 *
 * Set the way macOS sets its own — "Sun Oct 18 9:23 PM" — but in the
 * author's time zone, and saying whose: "Hartford · Sun Oct 18 9:23 PM".
 * Width is reserved in CSS, so filling it in cannot shift the layout.
 */
import { SITE } from "@/data/site";

function render() {
  const el = document.querySelector<HTMLElement>("[data-clock]");
  if (!el) return;
  const now = new Date();
  const opts = { timeZone: SITE.timezone } as const;
  const day = now.toLocaleDateString("en-US", { ...opts, weekday: "short", month: "short", day: "numeric" });
  const time = now.toLocaleTimeString("en-US", { ...opts, hour: "numeric", minute: "2-digit" });
  el.textContent = `${SITE.city} · ${day.replace(",", "")} ${time}`;
}

// Hydrate after paint; never block render.
requestAnimationFrame(render);
setInterval(render, 30_000);
document.addEventListener("astro:page-load", render);
