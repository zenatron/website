/* ── Reusable TUI window chrome ── */

/* Atom One Dark palette */
const T = {
  bg: "#282c34",
  fg: "#abb2bf",
  purple: "#c678dd",
  blue: "#61afef",
  green: "#98c379",
  yellow: "#e5c07b",
  red: "#e06c75",
  comment: "#5c6370",
  white: "#e6e6e6",
  gutter: "#3e4451",
  cursor: "#528bff",
};

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

export { T };
