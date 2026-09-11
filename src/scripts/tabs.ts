/**
 * Open files.
 *
 * Visiting a page opens a tab; the strip is session state, so it survives
 * navigation but not a new visit. The list is capped so it can't grow
 * without bound on a long browse.
 */
import { navigate } from "astro:transitions/client";

const KEY = "open-tabs";
const CAP = 8;

interface Tab { href: string; label: string; }

function read(): Tab[] {
  try {
    const raw = JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((t) => t && t.href && t.label) : [];
  } catch {
    return [];
  }
}
function write(tabs: Tab[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(tabs));
  } catch {
    /* private browsing — tabs just won't persist */
  }
}

/** The same name the explorer shows, derived from the route. */
function labelFor(pathname: string): string {
  const path = pathname.replace(/\/+$/, "");
  if (path === "") return "home";
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 1) {
    return parts[0] === "say-hi" ? "say hi" : parts[0];
  }
  return `${parts[parts.length - 1]}.mdx`;
}

function currentHref(): string {
  return location.pathname.replace(/\/+$/, "") || "/";
}

function render() {
  const strip = document.querySelector<HTMLElement>("[data-tabs]");
  const list = document.querySelector<HTMLUListElement>("[data-tablist]");
  if (!strip || !list) return;

  const tabs = read();
  const here = currentHref();

  strip.hidden = tabs.length === 0;
  list.textContent = "";

  for (const tab of tabs) {
    const li = document.createElement("li");
    if (tab.href === here) li.setAttribute("data-active", "");

    const a = document.createElement("a");
    a.href = tab.href;
    // The file's dot, in the colour the explorer gives it — read from the
    // explorer rather than stored, so a tab can't disagree with its row.
    const row = document.querySelector<HTMLElement>(`#sidebar a[data-nav][href="${CSS.escape(tab.href)}"]`)?.closest<HTMLElement>(".row");
    if (row) {
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.setAttribute("aria-hidden", "true");
      const hue = row.style.getPropertyValue("--h");
      if (hue) dot.style.setProperty("--h", hue);
      else dot.dataset.plain = "";
      a.append(dot);
    }
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = tab.label;
    a.append(label);
    if (tab.href === here) a.setAttribute("aria-current", "page");

    const close = document.createElement("button");
    close.type = "button";
    close.innerHTML = "&times;";
    close.setAttribute("aria-label", `Close ${tab.label}`);
    close.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeTab(tab.href);
    });

    li.append(a, close);
    list.append(li);
  }

  // Keep the file you're looking at in view.
  list.querySelector("[data-active]")?.scrollIntoView({ block: "nearest", inline: "nearest" });
}

function closeTab(href: string) {
  const tabs = read();
  const index = tabs.findIndex((t) => t.href === href);
  if (index === -1) return;
  const wasActive = href === currentHref();
  const remaining = tabs.filter((t) => t.href !== href);
  write(remaining);

  if (!wasActive) {
    render();
    return;
  }
  // Closing the file you're in moves you to its neighbour, like an editor.
  const next = remaining[index] ?? remaining[index - 1];
  render();
  navigate(next ? next.href : "/");
}

function open() {
  const here = currentHref();
  // The 404 is not a file; don't let it take a tab.
  if (document.querySelector("[data-404]")) {
    render();
    return;
  }
  const tabs = read();
  if (!tabs.some((t) => t.href === here)) {
    tabs.push({ href: here, label: labelFor(here) });
    while (tabs.length > CAP) tabs.shift();
    write(tabs);
  }
  render();
}

// The close light in the titlebar closes the tab you're on.
document.addEventListener("tabs:close-current", () => closeTab(currentHref()));

document.addEventListener("astro:page-load", open);
open();
