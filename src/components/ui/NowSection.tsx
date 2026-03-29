import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import TerminalWindow, { T } from "@/components/ui/TerminalWindow";

const NOW_ITEMS = [
  {
    category: "building",
    items: [
      { name: "performant flac library organizer", status: "in progress" },
      { name: "tools for card games", status: "planning" },
      { name: "this portfolio (always)", status: "deployed" },
    ],
  },
  {
    category: "learning",
    items: [
      { name: "embedded systems & rtos", status: "exploring" },
      { name: "game design patterns", status: "exploring" },
      { name: "rust", status: "exploring" },
    ],
  },
  {
    category: "reading",
    items: [
      { name: "Designing Data-Intensive Applications", status: "reference" },
      { name: "Game Programming Patterns", status: "reference" },
    ],
  },
];

const STATUS_COLORS: Record<string, string> = {
  "in progress": T.blue,
  "deployed": T.green,
  "planning": T.yellow,
  "exploring": T.yellow,
  "current": T.green,
  "reference": T.comment,
};

export default function NowSection() {
  return (
    <TerminalWindow
      title="~/now"
      statusBar={
        <div className="flex items-center justify-between">
          <span>
            last updated: <span style={{ color: T.green }}>Mar 2026</span>
          </span>
          <span>NOW</span>
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
        <span style={{ color: T.blue }}>now.md</span>
      </div>

      <div className="font-mono text-xs sm:text-sm space-y-4">
        {NOW_ITEMS.map((group, gi) => (
          <div key={group.category}>
            {/* Category header */}
            <div className="mb-1.5">
              <span style={{ color: T.purple }}>//</span>{" "}
              <span style={{ color: T.fg }}>{group.category.toUpperCase()}</span>
            </div>

            {/* Items */}
            {group.items.map((item, i) => {
              const isLast = i === group.items.length - 1;
              const prefix = isLast ? "└─" : "├─";
              const statusColor = STATUS_COLORS[item.status] || T.comment;

              return (
                <div key={item.name} className="flex items-start gap-2">
                  <span className="shrink-0" style={{ color: T.gutter }}>
                    {prefix}
                  </span>
                  <span style={{ color: T.fg }}>{item.name}</span>
                  <span className="ml-auto shrink-0">
                    <span style={{ color: T.gutter }}>[</span>
                    <span style={{ color: statusColor }}>{item.status}</span>
                    <span style={{ color: T.gutter }}>]</span>
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </TerminalWindow>
  );
}
