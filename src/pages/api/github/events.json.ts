/**
 * Build-time proxy for public GitHub events.
 *
 * Both the activity feed (most-recent ~30) and the heatmap (60-day grid)
 * consume this single endpoint, so the heatmap doesn't need a second fetch
 * just to paginate.
 */
import type { APIRoute } from "astro";

export const prerender = true;

const USERNAME = "zenatron";
const PAGES = 2;
const PER_PAGE = 100;

export const GET: APIRoute = async () => {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "pvi.sh-build",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const pages = await Promise.all(
      Array.from({ length: PAGES }, (_, i) => i + 1).map(async (page) => {
        const res = await fetch(
          `https://api.github.com/users/${USERNAME}/events/public?per_page=${PER_PAGE}&page=${page}`,
          { headers }
        );
        return res.ok ? ((await res.json()) as unknown[]) : [];
      })
    );
    const events = pages.flat();
    return jsonResponse({
      user: USERNAME,
      events,
      count: events.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("GitHub events fetch failed:", err);
    return jsonResponse({ user: USERNAME, events: [], error: "fetch_failed" });
  }
};

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
