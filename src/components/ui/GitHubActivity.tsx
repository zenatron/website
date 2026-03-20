import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TerminalWindow, { T, tA } from "@/components/ui/TerminalWindow";

interface GitHubEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload: {
    commits?: { message: string }[];
    action?: string;
    ref?: string;
    ref_type?: string;
  };
}

interface ActivityLine {
  hash: string;
  message: string;
  repo: string;
  date: string;
  type: string;
}

const TYPE_COLORS: Record<string, string> = {
  push: T.green,
  create: T.blue,
  pr: T.purple,
  issue: T.yellow,
  star: T.yellow,
  fork: T.blue,
  other: T.comment,
};

function fakeHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).slice(0, 7).padStart(7, "0");
}

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function parseEvents(events: GitHubEvent[]): ActivityLine[] {
  const lines: ActivityLine[] = [];

  for (const event of events) {
    const repo = event.repo.name.replace("zenatron/", "");

    switch (event.type) {
      case "PushEvent":
        if (event.payload.commits) {
          // Show first commit only per push
          const commit = event.payload.commits[0];
          if (commit) {
            lines.push({
              hash: fakeHash(event.id + commit.message),
              message: commit.message.split("\n")[0].slice(0, 60),
              repo,
              date: formatEventDate(event.created_at),
              type: "push",
            });
          }
        }
        break;
      case "CreateEvent":
        lines.push({
          hash: fakeHash(event.id),
          message: `created ${event.payload.ref_type}${event.payload.ref ? ` ${event.payload.ref}` : ""}`,
          repo,
          date: formatEventDate(event.created_at),
          type: "create",
        });
        break;
      case "PullRequestEvent":
        lines.push({
          hash: fakeHash(event.id),
          message: `${event.payload.action} pull request`,
          repo,
          date: formatEventDate(event.created_at),
          type: "pr",
        });
        break;
      case "IssuesEvent":
        lines.push({
          hash: fakeHash(event.id),
          message: `${event.payload.action} issue`,
          repo,
          date: formatEventDate(event.created_at),
          type: "issue",
        });
        break;
      case "WatchEvent":
        lines.push({
          hash: fakeHash(event.id),
          message: "starred",
          repo,
          date: formatEventDate(event.created_at),
          type: "star",
        });
        break;
      case "ForkEvent":
        lines.push({
          hash: fakeHash(event.id),
          message: "forked",
          repo,
          date: formatEventDate(event.created_at),
          type: "fork",
        });
        break;
    }

    if (lines.length >= 10) break;
  }

  return lines;
}

export default function GitHubActivity() {
  const [activity, setActivity] = useState<ActivityLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("https://api.github.com/users/zenatron/events/public?per_page=30")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((events: GitHubEvent[]) => {
        setActivity(parseEvents(events));
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <TerminalWindow title="~/git/activity">
        <div className="font-mono text-xs sm:text-sm space-y-2">
          <div>
            <span style={{ color: T.green }}>$</span>{" "}
            <span style={{ color: T.fg }}>git log</span>{" "}
            <span style={{ color: T.purple }}>--all</span>{" "}
            <span style={{ color: T.purple }}>--oneline</span>
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
            <span style={{ color: T.comment }}>fetching activity...</span>
          </div>
        </div>
      </TerminalWindow>
    );
  }

  if (error || activity.length === 0) {
    return (
      <TerminalWindow title="~/git/activity">
        <div className="font-mono text-xs sm:text-sm space-y-2">
          <div>
            <span style={{ color: T.green }}>$</span>{" "}
            <span style={{ color: T.fg }}>git log</span>{" "}
            <span style={{ color: T.purple }}>--all</span>{" "}
            <span style={{ color: T.purple }}>--oneline</span>
          </div>
          <div>
            <span style={{ color: T.comment }}>
              {error ? "// rate limited — check back later" : "// no recent public activity"}
            </span>
          </div>
        </div>
      </TerminalWindow>
    );
  }

  return (
    <TerminalWindow
      title="~/git/activity"
      noPadding
      statusBar={
        <div className="flex items-center justify-between">
          <span>
            <span style={{ color: T.fg }}>{activity.length}</span> recent events
          </span>
          <a
            href="https://github.com/zenatron"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:brightness-150"
          >
            [<span style={{ color: T.green }}>$</span>{" "}
            <span style={{ color: T.fg }}>open</span>{" "}
            <span style={{ color: T.fg }}>↗</span>]
          </a>
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
        <span style={{ color: T.purple }}>--all</span>{" "}
        <span style={{ color: T.purple }}>--oneline</span>{" "}
        <span style={{ color: T.purple }}>--limit</span>=<span style={{ color: T.yellow }}>{activity.length}</span>
      </div>

      {/* Activity rows */}
      <div>
        {activity.map((line, i) => {
          const isLast = i === activity.length - 1;
          const typeColor = TYPE_COLORS[line.type] || T.comment;
          return (
            <div
              key={line.hash + i}
              className="flex items-start sm:items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 font-mono text-xs sm:text-sm"
              style={{
                borderBottom: isLast ? "none" : `1px solid ${tA(T.gutter, "30")}`,
              }}
            >
              <span className="shrink-0" style={{ color: T.yellow }}>
                {line.hash}
              </span>
              <span className="flex-1 min-w-0 truncate" style={{ color: T.fg }}>
                {line.message}
              </span>
              <span className="shrink-0 hidden sm:inline" style={{ color: typeColor }}>
                {line.repo}
              </span>
              <span className="shrink-0 tabular-nums" style={{ color: T.comment }}>
                {line.date}
              </span>
            </div>
          );
        })}
      </div>
    </TerminalWindow>
  );
}
