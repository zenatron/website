import TerminalWindow, { T } from "@/components/ui/TerminalWindow";

const PRINCIPLES = [
  {
    label: "ship > perfect",
    description: "done is better than debating edge cases forever",
  },
  {
    label: "read the error",
    description: "the stack trace is trying to help you. let it.",
  },
  {
    label: "own the outcome",
    description: "blame doesn't fix bugs. accountability does.",
  },
  {
    label: "simplify ruthlessly",
    description: "if you can't explain it simply, you don't understand it well enough",
  },
  {
    label: "learn in public",
    description: "writing things down forces you to actually understand them",
  },
  {
    label: "tools are tools",
    description: "don't marry your stack. use what works, ditch what doesn't.",
  },
  {
    label: "help the next person",
    description: "write code (and docs) for the person who reads it at 2am",
  },
];

export default function PrinciplesSection() {
  return (
    <TerminalWindow
      title="~/principles"
      statusBar={
        <div className="flex items-center justify-between">
          <span>
            <span style={{ color: T.fg }}>{PRINCIPLES.length}</span> rules to
            code by
          </span>
          <span>MANIFEST</span>
        </div>
      }
    >
      {/* Command line */}
      <div
        className="font-mono text-xs md:text-sm mb-4"
        style={{ color: T.comment }}
      >
        <span style={{ color: T.green }}>$</span>{" "}
        <span style={{ color: T.fg }}>cat</span>{" "}
        <span style={{ color: T.blue }}>principles.md</span>
      </div>

      <div className="font-mono text-xs sm:text-sm space-y-0">
        {PRINCIPLES.map((principle, i) => {
          const isLast = i === PRINCIPLES.length - 1;
          const prefix = isLast ? "└─" : "├─";
          const linePrefix = isLast ? "   " : "│  ";
          const num = String(i + 1).padStart(2, "0");

          return (
            <div key={principle.label} className="mb-1.5">
              <div className="flex items-start gap-2">
                <span className="shrink-0" style={{ color: T.gutter }}>
                  {prefix}
                </span>
                <span style={{ color: T.comment }}>{num}.</span>
                <span style={{ color: T.purple }}>{principle.label}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="shrink-0" style={{ color: T.gutter }}>
                  {linePrefix}
                </span>
                <span style={{ color: T.comment }}>
                  {principle.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </TerminalWindow>
  );
}
