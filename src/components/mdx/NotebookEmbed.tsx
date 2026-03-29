import { T, tA } from "@/components/ui/TerminalWindow";

interface NotebookEmbedProps {
  notebookHtml: string;
  title?: string;
}

export default function NotebookEmbed({
  notebookHtml,
  title = "View Full Jupyter Notebook",
}: NotebookEmbedProps) {
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
          {notebookHtml}.ipynb
        </span>
      </div>

      {/* Open link */}
      <a
        href={`/downloads/${notebookHtml}.html`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm transition-colors duration-150 group"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = tA(T.cursor, "0a");
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <span style={{ color: T.green }}>$</span>
        <span style={{ color: T.fg }}>open</span>
        <span style={{ color: T.blue }}>{title}</span>
        <span
          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: T.purple }}
        >
          {"\u21B5"}
        </span>
      </a>
    </div>
  );
}
