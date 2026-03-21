/* ── Reusable TUI window chrome ── */

/* Terminal palette — references CSS custom properties so themes can swap them */
const T = {
  bg: "var(--t-bg)",
  fg: "var(--t-fg)",
  purple: "var(--t-purple)",
  blue: "var(--t-blue)",
  green: "var(--t-green)",
  yellow: "var(--t-yellow)",
  red: "var(--t-red)",
  comment: "var(--t-comment)",
  white: "var(--t-white)",
  gutter: "var(--t-gutter)",
  cursor: "var(--t-cursor)",
};

/**
 * Apply alpha to a CSS variable color using color-mix().
 * Pass the hex alpha string (e.g. "18", "44", "80") — same values
 * that were previously concatenated to hex colors.
 */
function tA(cssVar: string, hexAlpha: string): string {
  const pct = Math.round((parseInt(hexAlpha, 16) / 255) * 100);
  return `color-mix(in srgb, ${cssVar} ${pct}%, transparent)`;
}

/* Theme definitions */
const THEMES: Record<string, Record<string, string>> = {
  "atom-one-dark": {
    bg: "#282c34", fg: "#abb2bf", purple: "#c678dd", blue: "#61afef",
    green: "#98c379", yellow: "#e5c07b", red: "#e06c75", comment: "#5c6370",
    white: "#e6e6e6", gutter: "#3e4451", cursor: "#528bff",
  },
  dracula: {
    bg: "#282a36", fg: "#f8f8f2", purple: "#bd93f9", blue: "#8be9fd",
    green: "#50fa7b", yellow: "#f1fa8c", red: "#ff5555", comment: "#6272a4",
    white: "#f8f8f2", gutter: "#44475a", cursor: "#f8f8f2",
  },
  gruvbox: {
    bg: "#282828", fg: "#ebdbb2", purple: "#d3869b", blue: "#83a598",
    green: "#b8bb26", yellow: "#fabd2f", red: "#fb4934", comment: "#928374",
    white: "#fbf1c7", gutter: "#3c3836", cursor: "#ebdbb2",
  },
  nord: {
    bg: "#2e3440", fg: "#d8dee9", purple: "#b48ead", blue: "#81a1c1",
    green: "#a3be8c", yellow: "#ebcb8b", red: "#bf616a", comment: "#4c566a",
    white: "#eceff4", gutter: "#3b4252", cursor: "#d8dee9",
  },
  catppuccin: {
    bg: "#1e1e2e", fg: "#cdd6f4", purple: "#cba6f7", blue: "#89b4fa",
    green: "#a6e3a1", yellow: "#f9e2af", red: "#f38ba8", comment: "#585b70",
    white: "#cdd6f4", gutter: "#313244", cursor: "#f5e0dc",
  },
  "high-contrast": {
    bg: "#0a0a0a", fg: "#f5f5f5", purple: "#e78bf9", blue: "#6cb6ff",
    green: "#56d364", yellow: "#e3b341", red: "#f47067", comment: "#9e9e9e",
    white: "#ffffff", gutter: "#3d3d3d", cursor: "#ffffff",
  },
  "tokyo-night": {
    bg: "#1a1b26", fg: "#a9b1d6", purple: "#bb9af7", blue: "#7aa2f7",
    green: "#9ece6a", yellow: "#e0af68", red: "#f7768e", comment: "#565f89",
    white: "#c0caf5", gutter: "#292e42", cursor: "#c0caf5",
  },
  "solarized-dark": {
    bg: "#002b36", fg: "#839496", purple: "#d33682", blue: "#268bd2",
    green: "#859900", yellow: "#b58900", red: "#dc322f", comment: "#586e75",
    white: "#fdf6e3", gutter: "#073642", cursor: "#839496",
  },
  monokai: {
    bg: "#272822", fg: "#f8f8f2", purple: "#ae81ff", blue: "#66d9ef",
    green: "#a6e22e", yellow: "#e6db74", red: "#f92672", comment: "#75715e",
    white: "#f8f8f0", gutter: "#3e3d32", cursor: "#f8f8f0",
  },
};

const THEME_NAMES = Object.keys(THEMES);

interface TerminalWindowProps {
  title: string;
  children: React.ReactNode;
  statusBar?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

export default function TerminalWindow({
  title,
  children,
  statusBar,
  className = "",
  bodyClassName = "",
  noPadding = false,
}: TerminalWindowProps) {
  return (
    <div
      className={`overflow-hidden rounded-lg border ${className}`}
      style={{ backgroundColor: T.bg, borderColor: T.gutter }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-b"
        style={{ borderColor: T.gutter }}
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full opacity-80"
            style={{ backgroundColor: T.red }}
          />
          <span
            className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full opacity-80"
            style={{ backgroundColor: T.yellow }}
          />
          <span
            className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full opacity-80"
            style={{ backgroundColor: T.green }}
          />
        </div>
        <span
          className="flex-1 text-center font-mono text-[11px] sm:text-xs md:text-sm truncate px-2"
          style={{ color: T.comment }}
        >
          {title}
        </span>
        {/* Spacer to balance dots — hidden on mobile */}
        <div className="hidden sm:block w-[52px] shrink-0" />
      </div>

      {/* Body */}
      <div
        className={
          noPadding
            ? bodyClassName
            : `p-3 sm:p-4 md:p-5 ${bodyClassName}`
        }
      >
        {children}
      </div>

      {/* Optional status bar */}
      {statusBar && (
        <div
          className="px-3 sm:px-4 py-1.5 sm:py-2 border-t font-mono text-[11px] sm:text-xs md:text-sm"
          style={{ borderColor: T.gutter, color: T.comment }}
        >
          {statusBar}
        </div>
      )}
    </div>
  );
}

export { T, tA, THEMES, THEME_NAMES };
