/**
 * What a code block's language is called on its tab. Shiki reports the
 * grammar it resolved; this is what the author meant. Read at build time
 * by src/lib/shiki-transformers.js.
 */
export const LABELS = {
  caddyfile: "Caddyfile",
  bash: "shell",
  sh: "shell",
  shell: "shell",
  zsh: "shell",
  dockerfile: "Dockerfile",
  yaml: "YAML",
  yml: "YAML",
  json: "JSON",
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TSX",
  jsx: "JSX",
  css: "CSS",
  html: "HTML",
  astro: "Astro",
  mdx: "MDX",
  markdown: "Markdown",
  md: "Markdown",
  toml: "TOML",
  ini: "INI",
  "ssh-config": "ssh config",
  rust: "Rust",
  python: "Python",
  py: "Python",
  c: "C",
  sql: "SQL",
  nginx: "nginx",
  // No language, no tab: a plain block is text, not a file.
  plaintext: "",
  text: "",
  txt: "",
};

export const labelFor = (lang = "") => LABELS[lang.toLowerCase()] ?? lang;
