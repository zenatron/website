import { useState, useEffect, useRef } from "react";
import { T, THEMES, THEME_NAMES } from "@/components/ui/TerminalWindow";
import { Palette } from "lucide-react";

const THEME_LABELS: Record<string, string> = {
  "atom-one-dark": "Atom One Dark",
  dracula: "Dracula",
  gruvbox: "Gruvbox",
  nord: "Nord",
  catppuccin: "Catppuccin",
  "high-contrast": "High Contrast",
  "tokyo-night": "Tokyo Night",
  "solarized-dark": "Solarized Dark",
  monokai: "Monokai",
  "i-hate-colors": "I Hate Colors",
};

function setTheme(name: string) {
  localStorage.setItem("terminal-theme", name);
  document.documentElement.setAttribute("data-theme", name);
}

function getTheme(): string {
  if (typeof window === "undefined") return "atom-one-dark";
  return localStorage.getItem("terminal-theme") || "atom-one-dark";
}

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("atom-one-dark");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrent(getTheme());
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const pick = (name: string) => {
    setTheme(name);
    setCurrent(name);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded border transition-all duration-150"
        style={{
          borderColor: T.gutter,
          backgroundColor: T.bg,
          color: T.comment,
        }}
        title="Switch terminal theme"
        aria-label="Switch terminal theme"
      >
        <Palette className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-lg border font-mono text-xs shadow-lg z-50"
          style={{ backgroundColor: T.bg, borderColor: T.gutter }}
        >
          {/* Header */}
          <div
            className="px-3 py-2 border-b"
            style={{ borderColor: T.gutter, color: T.comment }}
          >
            <span style={{ color: T.green }}>$</span>{" "}
            <span style={{ color: T.fg }}>theme</span>{" "}
            <span style={{ color: T.purple }}>--set</span>
          </div>

          {/* Theme list */}
          {THEME_NAMES.map((name) => {
            const colors = THEMES[name];
            const isActive = current === name;
            return (
              <button
                key={name}
                onClick={() => pick(name)}
                className="flex w-full items-center gap-2.5 px-3 py-2 transition-colors duration-100 text-left"
                style={{
                  color: isActive ? colors.purple : colors.fg,
                  backgroundColor: isActive
                    ? `color-mix(in srgb, ${colors.purple} 12%, transparent)`
                    : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor =
                    `color-mix(in srgb, ${colors.gutter} 50%, transparent)`;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {/* Color swatch */}
                <div className="flex gap-0.5 shrink-0">
                  {[colors.red, colors.orange, colors.yellow, colors.green, colors.cyan, colors.blue, colors.purple].map(
                    (c, i) => (
                      <span
                        key={i}
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ backgroundColor: c }}
                      />
                    )
                  )}
                </div>
                <span className="flex-1 truncate">{THEME_LABELS[name]}</span>
                {isActive && (
                  <span style={{ color: colors.green }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
