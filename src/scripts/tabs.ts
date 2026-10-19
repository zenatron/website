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
  // The Dock puts a dot under every app with a tab open.
  document.dispatchEvent(new CustomEvent("tabs:change"));
}

/** The sidebar's row for a path, if it has one. */
function rowFor(href: string): HTMLElement | null {
  // Matched by path: the sidebar's links end in a slash and a tab's href
  // doesn't, so an exact attribute match found nothing.
  return [...document.querySelectorAll<HTMLAnchorElement>("#sidebar .row a[data-nav]")]
    .find((a) => (new URL(a.href).pathname.replace(/\/+$/, "") || "/") === href)
    ?.closest<HTMLElement>(".row") ?? null;
}

/**
 * The same name the sidebar shows: a post's or project's title, a page's
 * name. Worked out at render rather than stored, so tabs opened before a
 * rename — or under the old filename labels — come back right.
 */
function labelFor(pathname: string): string {
  const path = pathname.replace(/\/+$/, "") || "/";
  const names: Record<string, string> = { "/": "Home", "/blog": "Writing", "/projects": "Projects" };
  if (names[path]) return names[path];
  const row = rowFor(path);
  const title = row?.dataset.title ?? row?.querySelector("a")?.textContent?.trim();
  if (title) return title[0].toUpperCase() + title.slice(1);
  return path.split("/").filter(Boolean).pop() ?? path;
}

function currentHref(): string {
  return location.pathname.replace(/\/+$/, "") || "/";
}

/**
 * A tab's icon, as the titlebar's: a page's tile, a file's dot, or the
 * site's mark for home. Read from the explorer rather than stored, so a
 * tab can't disagree with its row.
 */
function iconFor(href: string): HTMLElement {
  const row = rowFor(href);
  const tile = row?.querySelector<HTMLElement>(".tile");
  const file = row?.querySelector<HTMLElement>(".ficon");
  let icon: HTMLElement;
  if (tile) {
    icon = document.createElement("span");
    icon.className = "ticon";
    icon.append(...[...tile.childNodes].map((n) => n.cloneNode(true)));
  } else if (file) {
    // A project's app icon, or a post's document, as the sidebar shows it.
    icon = document.createElement("span");
    icon.className = "ficon";
    icon.append(...[...file.childNodes].map((n) => n.cloneNode(true)));
  } else if (row) {
    icon = document.createElement("span");
    icon.className = "dot";
    if (!row.style.getPropertyValue("--h")) icon.dataset.plain = "";
  } else {
    const img = document.createElement("img");
    img.src = "/favicon.svg";
    img.alt = "";
    img.width = img.height = 14;
    img.className = "mark";
    icon = img;
  }
  for (const v of ["--h", "--t"]) {
    const val = row?.style.getPropertyValue(v);
    if (val) icon.style.setProperty(v, val);
  }
  icon.setAttribute("aria-hidden", "true");
  return icon;
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
    // Every page is served at its trailing-slash URL; link there directly.
    a.href = tab.href === "/" ? "/" : `${tab.href}/`;
    const name = labelFor(tab.href);
    a.title = name;
    a.append(iconFor(tab.href));
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = name;
    a.append(label);
    if (tab.href === here) a.setAttribute("aria-current", "page");

    const close = document.createElement("button");
    close.type = "button";
    close.innerHTML = '<svg aria-hidden="true" viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
    close.setAttribute("aria-label", `Close ${name}`);
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
  // Closing the file you're in moves you to its neighbor, like an editor.
  const next = remaining[index] ?? remaining[index - 1];
  render();
  navigate(next && next.href !== "/" ? `${next.href}/` : "/");
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
