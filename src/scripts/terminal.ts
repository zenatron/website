/**
 * The terminal. It resolves real paths and navigates real routes — which
 * is what earns the aesthetic, and what makes every decorative `$`
 * elsewhere on the site redundant.
 *
 * No fake latency, no spinners, no filesystem beyond the site's routes.
 */
import { navigate } from "astro:transitions/client";

interface Node {
  name: string;
  href: string;
  title?: string;
  date?: string;
  desc?: string;
}
interface Dir {
  dirs: string[];
  files: Node[];
}
interface Payload {
  fs: Record<string, Dir>;
  whoami: string[];
  fortunes: string[];
  resume: string;
  github: string;
  email: string;
}

const HISTORY_KEY = "term-history";
const SCROLLBACK_KEY = "term-scrollback";
const HISTORY_CAP = 50;

let data: Payload;
let cwd = "~";
let history: string[] = [];
let historyIndex = -1;
let draft = "";
let lastInvoker: HTMLElement | null = null;

const $ = <T extends Element>(sel: string) => document.querySelector<T>(sel);

/* storage */

function load<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private browsing — the session just won't be remembered */
  }
}

/* output */

type Line = { text: string; cls?: string };

function scrollback(): HTMLElement {
  return $<HTMLElement>("[data-scrollback]")!;
}

function render(lines: Line[]) {
  const box = scrollback();
  box.textContent = "";
  for (const line of lines) {
    const el = document.createElement("div");
    if (line.cls) el.className = line.cls;
    el.textContent = line.text;
    box.append(el);
  }
  box.scrollTop = box.scrollHeight;
}

let lines: Line[] = [];
function print(text: string, cls?: string) {
  lines.push({ text, cls });
}
function flush() {
  save(SCROLLBACK_KEY, lines);
  render(lines);
}

/* path resolution */

function dirAt(path: string): Dir | null {
  return data.fs[path] ?? null;
}

function parent(path: string): string {
  const parts = path.split("/");
  return parts.length <= 1 ? "~" : parts.slice(0, -1).join("/");
}

/** Do the needle's characters appear in order? `blg` matches `blog`. */
function subsequence(needle: string, hay: string): boolean {
  let i = 0;
  for (const ch of hay) if (ch === needle[i]) i += 1;
  return i === needle.length;
}

/** Generous on purpose: a half-remembered slug should still land. */
function resolveDir(arg: string): string | null {
  const raw = arg.trim();
  if (!raw || raw === "~" || raw === "/") return "~";
  if (raw === "..") return parent(cwd);
  if (raw === ".") return cwd;

  const candidates = [
    raw.startsWith("~") ? raw : null,
    cwd === "~" ? `~/${raw}` : `${cwd}/${raw}`,
    `~/${raw}`,
  ].filter(Boolean) as string[];

  for (const c of candidates) {
    const clean = c.replace(/\/+$/, "");
    if (dirAt(clean)) return clean;
  }

  // Fall back to a prefix/substring match on directory names.
  const needle = raw.replace(/^~\//, "").replace(/\/+$/, "").toLowerCase();
  const all = Object.keys(data.fs).filter((p) => p !== "~");
  const leaf = (p: string) => p.split("/").pop()!.toLowerCase();
  return (
    all.find((p) => leaf(p).startsWith(needle)) ??
    all.find((p) => leaf(p).includes(needle)) ??
    all.find((p) => subsequence(needle, leaf(p))) ??
    null
  );
}

/** Fuzzy-match a page: inside cwd first, then globally. */
function resolveFile(arg: string): Node | null {
  const needle = arg.trim().replace(/^~\//, "").replace(/\.mdx$/, "").toLowerCase();
  if (!needle) return null;

  const scopes = [cwd, ...Object.keys(data.fs).filter((p) => p !== cwd)];
  const match = (nodes: Node[]) =>
    nodes.find((n) => n.name.toLowerCase() === needle) ??
    nodes.find((n) => n.name.toLowerCase().startsWith(needle)) ??
    nodes.find((n) => n.name.toLowerCase().includes(needle)) ??
    nodes.find((n) => (n.title ?? "").toLowerCase().includes(needle)) ??
    nodes.find((n) => subsequence(needle, n.name.toLowerCase()));

  for (const scope of scopes) {
    const found = match(dirAt(scope)?.files ?? []);
    if (found) return found;
  }
  return null;
}

/* commands */

const COMMANDS: Record<string, { help: string; run: (arg: string) => void }> = {
  help: {
    help: "list available commands",
    run() {
      const width = Math.max(...Object.keys(COMMANDS).map((c) => c.length));
      for (const [name, cmd] of Object.entries(COMMANDS)) {
        print(`${name.padEnd(width + 2)}${cmd.help}`);
      }
    },
  },

  ls: {
    help: "list the contents of a path",
    run(arg) {
      const target = arg ? resolveDir(arg) : cwd;
      if (!target) return fail(`ls: no such file or directory: ${arg}`);
      const dir = dirAt(target)!;
      for (const d of dir.dirs) print(`${d}/`, "line-dir");
      for (const f of dir.files) print(f.name);
      if (!dir.dirs.length && !dir.files.length) print("", "line-dim");
    },
  },

  cd: {
    help: "change the working directory",
    run(arg) {
      const target = resolveDir(arg);
      if (!target) return fail(`cd: no such file or directory: ${arg}`);
      cwd = target;
      syncPrompt();
    },
  },

  open: {
    help: "open a page in the site",
    run(arg) {
      if (!arg) return fail("open: expected a page");
      // An exact directory or page name wins over a fuzzy file match,
      // so `open projects` lands on the index, not a post inside it.
      const node = staticPage(arg) ?? resolveFile(arg);
      if (!node) return fail(`open: no such file or directory: ${arg}`);
      print(`opening ${node.href}`, "line-dim");
      flush();
      close();
      navigate(node.href);
    },
  },

  cat: {
    help: "print a page's title, date and description",
    run(arg) {
      const node = resolveFile(arg);
      if (!node) return fail(`cat: no such file or directory: ${arg}`);
      print(node.title ?? node.name);
      if (node.date) print(formatDate(node.date), "line-dim");
      if (node.desc) print(node.desc);
      print(node.href, "line-dir");
    },
  },

  whoami: { help: "who is this", run: () => data.whoami.forEach((l) => print(l)) },

  pwd: { help: "print the working directory", run: () => print(cwd) },

  clear: {
    help: "clear the scrollback",
    run() {
      lines = [];
    },
  },

  fortune: {
    help: "print a fortune",
    run() {
      print(data.fortunes[Math.floor(Math.random() * data.fortunes.length)]);
    },
  },

  resume: {
    help: "open the resume PDF",
    run() {
      window.open(data.resume, "_blank", "noopener");
      print(`opening ${data.resume}`, "line-dim");
    },
  },

  gh: {
    help: "open the GitHub profile",
    run() {
      window.open(data.github, "_blank", "noopener");
      print(`opening ${data.github}`, "line-dim");
    },
  },

  email: {
    help: "compose an email",
    run() {
      location.href = `mailto:${data.email}`;
      print(`opening mailto:${data.email}`, "line-dim");
    },
  },

  exit: { help: "close the terminal", run: () => close() },
};

function staticPage(arg: string): Node | null {
  const needle = arg.trim().replace(/^~\//, "").toLowerCase();
  return (
    dirAt("~")!.files.find((f) => f.name === needle) ??
    (["projects", "blog"].includes(needle)
      ? { name: needle, href: `/${needle}` }
      : null)
  );
}

function formatDate(raw: string): string {
  const d = new Date(raw);
  return Number.isNaN(d.getTime())
    ? raw
    : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function fail(message: string) {
  print(message, "line-err");
}

/* tab completion */

function longestCommonPrefix(items: string[]): string {
  if (!items.length) return "";
  let prefix = items[0];
  for (const item of items) {
    while (!item.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

function complete(input: HTMLInputElement) {
  const value = input.value;
  const [head, ...rest] = value.split(/\s+/);
  const completingCommand = rest.length === 0 && !/\s$/.test(value);

  const pool = completingCommand
    ? Object.keys(COMMANDS)
    : [
        ...(dirAt(cwd)?.dirs ?? []),
        ...(dirAt(cwd)?.files ?? []).map((f) => f.name),
        ...(cwd === "~" ? [] : [".."]),
      ];

  const fragment = completingCommand ? head : (rest.at(-1) ?? "");
  const matches = pool.filter((c) => c.startsWith(fragment));
  if (!matches.length) return;

  const replaceWith = matches.length === 1 ? matches[0] : longestCommonPrefix(matches);
  const prefixParts = completingCommand ? [] : [head, ...rest.slice(0, -1)];
  input.value = [...prefixParts, replaceWith].join(" ") + (matches.length === 1 ? " " : "");

  if (matches.length > 1) {
    print(`${promptText()}${value}`);
    print(matches.join("  "));
    flush();
  }
  syncMirror();
}

/* prompt + mirror */

function promptText(): string {
  return `phil@pvish ${cwd} $ `;
}

function syncPrompt() {
  const el = $<HTMLElement>("[data-cwd]");
  if (el) el.textContent = cwd;
}

/** Draws the typed text and the block caret at the real cursor position. */
function syncMirror() {
  const input = $<HTMLInputElement>("[data-input]");
  const mirror = $<HTMLElement>("[data-mirror]");
  if (!input || !mirror) return;
  const pos = input.selectionStart ?? input.value.length;
  mirror.textContent = "";
  mirror.append(document.createTextNode(input.value.slice(0, pos)));
  const caret = document.createElement("i");
  caret.className = "caret";
  mirror.append(caret);
  mirror.append(document.createTextNode(input.value.slice(pos)));
}

/* run */

function submit(raw: string) {
  const value = raw.trim();
  print(`${promptText()}${value}`);

  if (value) {
    history = [...history.filter((h) => h !== value), value].slice(-HISTORY_CAP);
    save(HISTORY_KEY, history);
  }
  historyIndex = -1;

  const [name, ...rest] = value.split(/\s+/);
  const arg = rest.join(" ");

  if (!name) {
    /* bare enter */
  } else if (COMMANDS[name]) {
    COMMANDS[name].run(arg);
  } else {
    fail(`zsh: command not found: ${name}`);
  }
  flush();
}

/* open / close */

function dialog(): HTMLDialogElement | null {
  return $<HTMLDialogElement>("#terminal");
}

/**
 * Match the site window's box, so it reads as that window's own drawer.
 * Anchored below the titlebar rather than over it: the window should not
 * lose its identity — or its ⌘K affordance — while the terminal is open.
 */
function position() {
  const dlg = dialog();
  const win = document.querySelector<HTMLElement>(".window");
  const bar = document.querySelector<HTMLElement>(".titlebar");
  if (!dlg || !win) return;
  const r = win.getBoundingClientRect();
  const top = bar ? bar.getBoundingClientRect().bottom : r.top;
  dlg.style.left = `${r.left}px`;
  dlg.style.width = `${r.width}px`;
  dlg.style.top = `${Math.max(top, 0)}px`;
}

function open() {
  const dlg = dialog();
  if (!dlg || dlg.open) return;
  lastInvoker = document.activeElement as HTMLElement;
  position();
  dlg.showModal(); // top layer, focus trapped, Escape handled natively
  dlg.dataset.focused = "true";
  const input = $<HTMLInputElement>("[data-input]");
  input?.focus();
  syncMirror();
  render(lines);
}

function close() {
  const dlg = dialog();
  if (!dlg?.open) return;
  dlg.close();
  lastInvoker?.focus?.();
}

/* wiring */

function isTyping(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null;
  if (!node) return false;
  return (
    node.tagName === "INPUT" ||
    node.tagName === "TEXTAREA" ||
    node.isContentEditable === true
  );
}

function init() {
  const raw = $<HTMLScriptElement>("[data-term-fs]")?.textContent;
  if (!raw) return;
  data = JSON.parse(raw);

  history = load(HISTORY_KEY, []);
  lines = load<Line[]>(SCROLLBACK_KEY, []);

  const dlg = dialog()!;
  const input = $<HTMLInputElement>("[data-input]")!;
  const form = $<HTMLFormElement>("[data-form]")!;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submit(input.value);
    input.value = "";
    syncMirror();
  });

  input.addEventListener("input", syncMirror);
  input.addEventListener("keyup", syncMirror);
  input.addEventListener("click", syncMirror);
  input.addEventListener("focus", () => (dlg.dataset.focused = "true"));
  input.addEventListener("blur", () => (dlg.dataset.focused = "false"));

  input.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      complete(input);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      if (historyIndex === -1) draft = input.value;
      historyIndex = Math.min(historyIndex + 1, history.length - 1);
      input.value = history[history.length - 1 - historyIndex];
      syncMirror();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex <= 0) {
        historyIndex = -1;
        input.value = draft;
      } else {
        historyIndex -= 1;
        input.value = history[history.length - 1 - historyIndex];
      }
      syncMirror();
    }
  });

  // Clicking the backdrop closes; clicking inside does not.
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) close();
  });
  dlg.addEventListener("close", () => lastInvoker?.focus?.());

  // One binding. A second entry point would dilute the one being taught.
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      if (!dlg.open && isTyping(e.target)) return;
      e.preventDefault();
      dlg.open ? close() : open();
    }
  });

  // The titlebar keycap and anything else that wants to teach the terminal.
  for (const trigger of document.querySelectorAll<HTMLElement>("[data-open-terminal]")) {
    if (trigger.dataset.wired) continue;
    trigger.dataset.wired = "1";
    trigger.addEventListener("click", () => (dlg.open ? close() : open()));
  }

  window.addEventListener("resize", () => dlg.open && position());
  document.addEventListener("astro:page-load", () => {
    syncPrompt();
    if (dlg.open) position();
  });

  syncPrompt();
  syncMirror();
}

init();
