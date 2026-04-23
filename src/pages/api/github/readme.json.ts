/**
 * Build-time proxy for the personal GitHub README.
 *
 * Why: in the browser, every visitor would burn their IP's 60/hr unauthenticated
 * GitHub rate limit. Here, the build runs once, optionally with GITHUB_TOKEN
 * (5000/hr authenticated), and the result is baked into a static JSON file
 * served from our own domain.
 */
import type { APIRoute } from "astro";

export const prerender = true;

const REPO = "zenatron/zenatron";

export const GET: APIRoute = async () => {
  const headers: HeadersInit = { "User-Agent": "pvi.sh-build" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${REPO}/main/README.md`,
      { headers }
    );
    if (!res.ok) {
      return jsonResponse({ content: "", error: `HTTP ${res.status}` });
    }
    const content = await res.text();
    return jsonResponse({
      repo: REPO,
      content,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("GitHub README fetch failed:", err);
    return jsonResponse({ content: "", error: "fetch_failed" });
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
