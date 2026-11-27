import { isStaging, siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

// Answer engines and AI assistants that may read and quote the site. They are named so the intent is explicit, and because a
// crawler with its own group ignores the "*" group, the private areas are repeated for them.
const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "Amazonbot"];
const PRIVATE = "Disallow: /admin\nDisallow: /api/\nAllow: /\n";

// Small and free of database calls, so it is built fresh each time: a cached "Disallow: /" must never outlive a deploy.
export function GET() {
  const base = siteUrl();
  const body = isStaging()
    ? "User-agent: *\nDisallow: /\n"
    : `User-agent: *\n${PRIVATE}\n${AI_BOTS.map((b) => `User-agent: ${b}`).join("\n")}\n${PRIVATE}\n# Plain-language summary of the company and its pages, for AI assistants: ${base}/llms.txt\nSitemap: ${base}/sitemap.xml\n`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=300" } });
}
