/**
 * Liquid glass (Hyalite) for the small pills that sit over a photo: the
 * photos' captions and the projects' "view project". Each pill gets its
 * glass the first time its host is hovered or focused, so a page of photos
 * isn't running a filter per pill before anyone looks at one.
 * Where the browser can't refract, Hyalite writes nothing and the pill's
 * own frost stays.
 */
import "@/vendor/hyalite/hyalite.js";
import type { HyaliteOptions } from "@/vendor/hyalite/hyalite";

/** A pill is a thin slab: a narrow bevel, and not much glass to bend through. */
const PILL: HyaliteOptions = { bevel: 16, thickness: 30, slope: 1.6, blur: 0.5, dispersion: 2, sat: 1.2, edge: 0.6 };

/** Whether to bother: a browser that can refract, for someone who hasn't asked for less transparency. */
const wanted = () =>
  !!window.Hyalite?.supported() && !matchMedia("(prefers-reduced-transparency: reduce)").matches;

export function glassOnHover(hosts: string, pill: string, opts: HyaliteOptions = PILL) {
  if (!wanted()) return;
  const { Hyalite } = window;
  for (const host of document.querySelectorAll<HTMLElement>(hosts)) {
    const el = host.querySelector<HTMLElement>(pill);
    if (!el) continue;
    // Hidden pills have no size to build a lens for; try again on the next hover.
    const build = () => {
      if (!el.offsetWidth) return;
      Hyalite.attach(el, opts);
      host.removeEventListener("pointerenter", build);
      host.removeEventListener("focusin", build);
    };
    host.addEventListener("pointerenter", build);
    host.addEventListener("focusin", build);
  }
}
