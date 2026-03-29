import { useState } from "react";
import { T, tA } from "@/components/ui/TerminalWindow";

interface NerdCornerProps {
  title?: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function NerdCorner({
  title = "Deep Dive",
  subtitle,
  defaultOpen = false,
  children,
}: NerdCornerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className="my-8 rounded-lg border overflow-hidden font-mono"
      style={{
        borderColor: T.gutter,
        backgroundColor: tA(T.bg, "cc"),
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-3 sm:px-4 py-2 border-b"
        style={{ borderColor: T.gutter }}
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="h-2.5 w-2.5 rounded-full opacity-80"
            style={{ backgroundColor: T.red }}
          />
          <span
            className="h-2.5 w-2.5 rounded-full opacity-80"
            style={{ backgroundColor: T.yellow }}
          />
          <span
            className="h-2.5 w-2.5 rounded-full opacity-80"
            style={{ backgroundColor: T.green }}
          />
        </div>
        <span
          className="flex-1 text-center text-[11px] sm:text-xs truncate px-2"
          style={{ color: T.comment }}
        >
          :optional-reading
        </span>
      </div>

      {/* Command bar — clickable to toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm cursor-pointer transition-colors duration-150 text-left"
        style={{
          borderBottom: isOpen ? `1px solid ${T.gutter}` : "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = tA(T.cursor, "0a");
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <span style={{ color: T.green }}>$</span>
        <span style={{ color: T.fg }}>cat</span>
        <span style={{ color: T.blue }}>{title}</span>
        {!isOpen && subtitle && (
          <span
            className="hidden sm:inline truncate"
            style={{ color: T.comment }}
          >
            # {subtitle}
          </span>
        )}
        <span className="ml-auto shrink-0" style={{ color: T.comment }}>
          {isOpen ? "[-]" : "[+]"}
        </span>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-3 sm:px-4 md:px-5 py-4">
          <div className="nerd-corner-content font-sans">{children}</div>
        </div>
      )}
    </div>
  );
}
