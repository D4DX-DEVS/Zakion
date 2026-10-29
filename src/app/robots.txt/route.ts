import { cached } from "@/lib/cache";
import { isStaging, siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  return cached(req, 3600, async () => {
    const body = isStaging()
      ? "User-agent: *\nDisallow: /\n"
      : `User-agent: *\nDisallow: /admin\nDisallow: /api/\nAllow: /\n\nSitemap: ${siteUrl()}/sitemap.xml\n`;
    return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
  });
}
