import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import TerminalWindow, { T, tA } from "@/components/ui/TerminalWindow";

interface GitHubEvent {
  id: string;
  type: string;
  created_at: string;
}

interface DayData {
  date: string;
  count: number;
}

const DAY_LABELS = ["", "M", "", "W", "", "F", ""];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getBlockChar(count: number): string {
  if (count === 0) return "\u00B7";
  if (count === 1) return "\u2591";
  if (count <= 3) return "\u2592";
  if (count <= 5) return "\u2593";
  return "\u2588";
}

function getBlockColor(count: number): string {
  if (count === 0) return T.gutter;
  if (count === 1) return tA(T.green, "40");
  if (count <= 3) return tA(T.green, "70");
  if (count <= 5) return tA(T.green, "aa");
  return T.green;
}

function buildGrid(events: GitHubEvent[]): {
  grid: DayData[][];
  weeks: number;
  monthLabels: { label: string; col: number }[];
  totalEvents: number;
  streak: number;
} {
  // Build a map of date -> count
  const countMap = new Map<string, number>();
  for (const event of events) {
    const date = event.created_at.slice(0, 10); // YYYY-MM-DD
    countMap.set(date, (countMap.get(date) || 0) + 1);
  }

  // Generate 91 days (13 weeks) ending today
  const today = new Date();
  const days: DayData[] = [];
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({ date: dateStr, count: countMap.get(dateStr) || 0 });
  }

  // Pad the start so column 0 begins on Sunday
  const firstDate = new Date(days[0].date);
  const startDow = firstDate.getDay(); // 0=Sun
  const padded: DayData[] = [];
  for (let i = 0; i < startDow; i++) {
    padded.push({ date: "", count: -1 }); // placeholder
  }
  padded.push(...days);

  // Build weeks (columns) x 7 rows
  const weeks = Math.ceil(padded.length / 7);
  const grid: DayData[][] = Array.from({ length: 7 }, () => []);
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d;
      grid[d].push(idx < padded.length ? padded[idx] : { date: "", count: -1 });
    }
  }

  // Month labels
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  for (let w = 0; w < weeks; w++) {
    // Use first valid day in this week
    for (let d = 0; d < 7; d++) {
      const cell = grid[d][w];
      if (cell && cell.date) {
        const month = new Date(cell.date).getMonth();
        if (month !== lastMonth) {
          monthLabels.push({ label: MONTH_NAMES[month], col: w });
          lastMonth = month;
        }
        break;
      }
    }
  }

  // Total events
  const totalEvents = days.reduce((sum, d) => sum + d.count, 0);

  // Current streak (consecutive days with activity ending today or yesterday)
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) {
      streak++;
    } else {
      // Allow today to be zero (day not over yet) only if it's the last element
      if (i === days.length - 1) continue;
      break;
    }
  }

  return { grid, weeks, monthLabels, totalEvents, streak };
}

export default function GitHubHeatmap() {
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Fetch multiple pages to get ~90 days of data
    const fetchPages = async () => {
      try {
        const pages = await Promise.all(
          [1, 2, 3].map((page) =>
            fetch(
              `https://api.github.com/users/zenatron/events/public?per_page=100&page=${page}`
            ).then((res) => {
              if (!res.ok) throw new Error("Failed to fetch");
              return res.json();
            })
          )
        );
        setEvents(pages.flat());
        setLoading(false);
      } catch {
        setError(true);
        setLoading(false);
      }
    };
    fetchPages();
  }, []);

  const { grid, weeks, monthLabels, totalEvents, streak } = useMemo(
    () => buildGrid(events),
    [events]
  );

  if (loading) {
    return (
      <TerminalWindow title="~/git/contributions">
        <div className="font-mono text-xs sm:text-sm space-y-2">
          <div>
            <span style={{ color: T.green }}>$</span>{" "}
            <span style={{ color: T.fg }}>git log</span>{" "}
            <span style={{ color: T.purple }}>--graph</span>{" "}
            <span style={{ color: T.purple }}>--since</span>=
            <span style={{ color: T.yellow }}>"90d"</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
              style={{ color: T.yellow }}
            >
              ⠋
            </motion.span>
            <span style={{ color: T.comment }}>building heatmap...</span>
          </div>
        </div>
      </TerminalWindow>
    );
  }

  if (error) {
    return (
      <TerminalWindow title="~/git/contributions">
        <div className="font-mono text-xs sm:text-sm space-y-2">
          <div>
            <span style={{ color: T.green }}>$</span>{" "}
            <span style={{ color: T.fg }}>git log</span>{" "}
            <span style={{ color: T.purple }}>--graph</span>{" "}
            <span style={{ color: T.purple }}>--since</span>=
            <span style={{ color: T.yellow }}>"90d"</span>
          </div>
          <div>
            <span style={{ color: T.comment }}>
              // rate limited — check back later
            </span>
          </div>
        </div>
      </TerminalWindow>
    );
  }

  return (
    <TerminalWindow
      title="~/git/contributions"
      noPadding
      statusBar={
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span>
            <span style={{ color: T.fg }}>{totalEvents}</span> events
            {streak > 0 && (
              <>
                {" "}&middot;{" "}
                <span style={{ color: T.green }}>{streak}d</span> streak
              </>
            )}
          </span>
          <span className="flex items-center gap-2">
            <span style={{ color: T.comment }}>&middot;</span>
            <span style={{ color: getBlockColor(0) }}>{getBlockChar(0)}</span>
            <span style={{ color: getBlockColor(1) }}>{getBlockChar(1)}</span>
            <span style={{ color: getBlockColor(3) }}>{getBlockChar(3)}</span>
            <span style={{ color: getBlockColor(5) }}>{getBlockChar(5)}</span>
            <span style={{ color: getBlockColor(6) }}>{getBlockChar(6)}</span>
            <span style={{ color: T.comment }}>&middot;</span>
          </span>
        </div>
      }
    >
      {/* Command line */}
      <div
        className="px-3 sm:px-4 py-2 border-b font-mono text-xs md:text-sm"
        style={{ borderColor: T.gutter, color: T.comment }}
      >
        <span style={{ color: T.green }}>$</span>{" "}
        <span style={{ color: T.fg }}>git log</span>{" "}
        <span style={{ color: T.purple }}>--format</span>=
        <span style={{ color: T.yellow }}>heatmap</span>
      </div>

      {/* Heatmap grid */}
      <div className="px-3 sm:px-4 py-3 overflow-x-auto">
        <div className="font-mono text-xs sm:text-sm inline-block min-w-0">
          {/* Month labels row */}
          <div className="flex">
            {/* Spacer for day labels */}
            <span className="w-5 shrink-0" />
            <div className="flex">
              {Array.from({ length: weeks }, (_, w) => {
                const label = monthLabels.find((m) => m.col === w);
                return (
                  <span
                    key={w}
                    className="w-4 sm:w-5 text-center"
                    style={{ color: T.comment }}
                  >
                    {label ? label.label.slice(0, 3) : ""}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Grid rows (7 days) */}
          {grid.map((row, dayIdx) => (
            <div key={dayIdx} className="flex items-center">
              {/* Day label */}
              <span
                className="w-5 shrink-0 text-right pr-1"
                style={{ color: T.comment }}
              >
                {DAY_LABELS[dayIdx]}
              </span>
              {/* Cells */}
              <div className="flex">
                {row.map((cell, weekIdx) => {
                  if (cell.count < 0) {
                    return (
                      <span key={weekIdx} className="w-4 sm:w-5 text-center">
                        {" "}
                      </span>
                    );
                  }
                  return (
                    <span
                      key={weekIdx}
                      className="w-4 sm:w-5 text-center cursor-default"
                      style={{ color: getBlockColor(cell.count) }}
                      title={`${cell.date}: ${cell.count} event${cell.count !== 1 ? "s" : ""}`}
                    >
                      {getBlockChar(cell.count)}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </TerminalWindow>
  );
}
