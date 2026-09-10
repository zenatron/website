/**
 * Code block chrome: a language label and a copy button.
 *
 * Added client-side, but overlaid rather than inserted into the flow —
 * the wrapper is the same box as the <pre> it replaces, so nothing moves
 * when this runs and CLS stays at zero.
 */

/** Shiki reports the resolved grammar; show what the author meant. */
const LABELS: Record<string, string> = {
  caddyfile: "Caddyfile",
  bash: "shell",
  sh: "shell",
  zsh: "shell",
  dockerfile: "Dockerfile",
  yaml: "YAML",
  json: "JSON",
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TSX",
  jsx: "JSX",
  css: "CSS",
  html: "HTML",
  mdx: "MDX",
  markdown: "Markdown",
  md: "Markdown",
  toml: "TOML",
  rust: "Rust",
  python: "Python",
  c: "C",
  plaintext: "",
};

function label(lang: string): string {
  return LABELS[lang] ?? lang;
}

function enhance(pre: HTMLElement) {
  if (pre.dataset.enhanced) return;
  pre.dataset.enhanced = "1";

  const lang = pre.getAttribute("data-language") ?? "";
  const wrap = document.createElement("div");
  wrap.className = "codewrap";
  pre.parentNode?.insertBefore(wrap, pre);
  wrap.append(pre);

  const bar = document.createElement("div");
  bar.className = "codebar";

  const name = document.createElement("span");
  name.className = "codelang";
  name.textContent = label(lang);
  bar.append(name);

  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "codecopy";
  copy.textContent = "copy";
  copy.setAttribute("aria-label", "Copy code to clipboard");

  copy.addEventListener("click", async () => {
    const text = pre.querySelector("code")?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      copy.textContent = "copied";
      copy.dataset.done = "";
    } catch {
      copy.textContent = "press ⌘C";
    }
    setTimeout(() => {
      copy.textContent = "copy";
      delete copy.dataset.done;
    }, 1600);
  });

  bar.append(copy);
  wrap.append(bar);
}

function init() {
  document
    .querySelectorAll<HTMLElement>(".prose pre.astro-code")
    .forEach(enhance);
}

document.addEventListener("astro:page-load", init);
init();
