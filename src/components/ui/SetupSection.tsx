import TerminalWindow, { T, tA } from "@/components/ui/TerminalWindow";
import { FaApple } from "react-icons/fa";

/* Minimal CachyOS logo — geometric chevron with accent dots */
const CachyOSIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="-5 5 130 130" fill="currentColor" {...props}>
    {/* Main angular body */}
    <path d="M30.6 15.3H87.4L73 40.2H42.2L29.4 62.5 42.4 85h60.1L87.7 110.5H29.4L1.2 61.8 28.2 15.1Z" fillOpacity="0.25" />
    <path d="M28.2 15.1 73 40.2H42.2L29.4 62.5 42.4 85 29.4 110.5 1.2 61.8 28.2 15.1" />
    {/* Accent dots */}
    <circle cx="113.3" cy="74.8" r="9.7" />
    <circle cx="93" cy="52.2" r="7.4" />
    <circle cx="103.1" cy="26.7" r="3.8" />
  </svg>
);

/* Color palette bar — the classic neofetch touch */
const PALETTE = [T.red, T.yellow, T.green, T.blue, T.purple, T.comment, T.fg, T.gutter];

interface FetchSpec {
  user: string;
  host: string;
  icon: React.ElementType;
  iconColor: string;
  fields: [string, string][];
}

const MACHINES: FetchSpec[] = [
  {
    user: "phil",
    host: "macbook",
    icon: FaApple,
    iconColor: T.fg,
    fields: [
      ["OS", "macOS Sequoia"],
      ["Kernel", "arm64 (Apple Silicon)"],
      ["CPU", "Apple M1 Pro (8-core)"],
      ["GPU", "Apple M1 Pro (14-core)"],
      ["Memory", "16GB unified"],
      ["Storage", "512GB NVMe"],
      ["Display", "14.2\" Liquid Retina XDR (120Hz)"],
      ["Shell", "zsh + oh-my-zsh"],
      ["PM", "brew"],
      ["Editor", "VS Code · nvim"],
      ["Emulator", "Ghostty"],
      ["Theme", "Atom One Dark"],
    ],
  },
  {
    user: "phil",
    host: "desktop",
    icon: CachyOSIcon,
    iconColor: T.green,
    fields: [
      ["OS", "CachyOS (Arch btw)"],
      ["Kernel", "x86_64 Linux"],
      ["CPU", "AMD Ryzen 9 7950X (32-thread)"],
      ["GPU", "NVIDIA RTX 4070 Ti (12GB)"],
      ["Memory", "64GB DDR5"],
      ["Storage", "4TB NVMe"],
      ["Display", "2x 27\" 2K QHD (144Hz)"],
      ["Shell", "zsh + oh-my-zsh"],
      ["PM", "pacman"],
      ["Editor", "VS Code · nvim"],
      ["Emulator", "Konsole"],
      ["Theme", "Atom One Dark"],
    ],
  },
];

function NeofetchBlock({ spec }: { spec: FetchSpec }) {
  const Icon = spec.icon;
  const sepLen = `${spec.user}@${spec.host}`.length;

  return (
    <div className="flex gap-4 sm:gap-6">
      {/* Icon column */}
      <div className="flex flex-col items-center pt-1">
        <Icon className="h-6 w-6 sm:h-10 sm:w-10 md:h-12 md:w-12" style={{ color: spec.iconColor }} />
      </div>

      {/* Info column */}
      <div className="flex-1 min-w-0 leading-relaxed">
        {/* user@host */}
        <div>
          <span style={{ color: spec.iconColor }}>{spec.user}</span>
          <span style={{ color: T.fg }}>@</span>
          <span style={{ color: spec.iconColor }}>{spec.host}</span>
        </div>
        {/* separator */}
        <div style={{ color: T.gutter }}>{"─".repeat(sepLen)}</div>

        {/* fields */}
        {spec.fields.map(([label, value]) => (
          <div key={label} className="flex">
            <span className="shrink-0 w-[9ch]" style={{ color: T.blue }}>
              {label}
            </span>
            <span style={{ color: T.gutter }}>: </span>
            <span className="truncate" style={{ color: T.fg }}>{value}</span>
          </div>
        ))}

        {/* palette */}
        <div className="mt-2 flex">
          {PALETTE.map((c, i) => (
            <span key={i} style={{ color: c }}>██</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SetupSection() {
  return (
    <TerminalWindow
      title="~/setup"
      statusBar={
        <div className="flex items-center justify-between">
          <span>
            <span style={{ color: T.fg }}>2</span> machines
          </span>
          <span>FASTFETCH</span>
        </div>
      }
    >
      <div className="font-mono text-[11px] sm:text-xs space-y-5">
        {MACHINES.map((machine, i) => (
          <div key={machine.host}>
            {/* Command line */}
            <div className="mb-2 text-xs md:text-sm" style={{ color: T.comment }}>
              <span style={{ color: T.green }}>$</span>{" "}
              <span style={{ color: T.fg }}>fastfetch</span>{" "}
              <span style={{ color: T.purple }}>--host</span>=
              <span style={{ color: T.yellow }}>{machine.host}</span>
            </div>
            <NeofetchBlock spec={machine} />
            {i < MACHINES.length - 1 && (
              <div
                className="mt-4 h-px"
                style={{ backgroundColor: tA(T.gutter, "60") }}
              />
            )}
          </div>
        ))}
      </div>
    </TerminalWindow>
  );
}
