/**
 * Theme: system -> light -> dark -> system.
 *
 * The initial value is applied by a blocking inline script in <head>, so
 * there is no flash; this only handles the toggle and the label.
 */
const KEY = "theme";
type Mode = "system" | "light" | "dark";

function read(): Mode {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function apply(mode: Mode) {
  const root = document.documentElement;
  // Suppress transitions for the swap itself, or every surface animates.
  root.classList.add("theming");
  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
  try {
    mode === "system" ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, mode);
  } catch {
    /* private browsing — the choice just won't persist */
  }
  for (const btn of document.querySelectorAll<HTMLElement>("[data-theme-toggle]")) {
    btn.dataset.mode = mode;
    btn.setAttribute(
      "aria-label",
      mode === "system" ? "Theme: follow system" : `Theme: ${mode}`
    );
  }
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theming")));
}

const NEXT: Record<Mode, Mode> = { system: "light", light: "dark", dark: "system" };

function wire() {
  for (const btn of document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]")) {
    if (btn.dataset.wired) continue;
    btn.dataset.wired = "1";
    btn.addEventListener("click", () => apply(NEXT[read()]));
  }
  apply(read());
}

document.addEventListener("astro:page-load", wire);
wire();
