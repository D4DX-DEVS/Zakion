import { cached } from "@/lib/cache";
import { db } from "@/lib/env";
import { CANONICAL, PLACEHOLDER_SQL, siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Row = { loc: string; lastmod: string };

export function GET(req: Request) {
  return cached(req, 3600, async () => {
    const d = db();
    const [pages, posts] = await Promise.all([
      d.prepare("SELECT path loc, updated_at lastmod FROM pages WHERE status='published' AND kind IN ('page','project') AND body_html NOT LIKE ?").bind(PLACEHOLDER_SQL).all<Row>(),
      d.prepare("SELECT '/' || slug || '/' loc, updated_at lastmod FROM posts WHERE status='published' AND content NOT LIKE ?").bind(PLACEHOLDER_SQL).all<Row>(),
    ]);
    const base = siteUrl();
    const urls = [...pages.results, ...posts.results].filter(r => !CANONICAL[r.loc]);
    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map(r => `<url><loc>${base}${r.loc}</loc><lastmod>${r.lastmod.slice(0, 10)}</lastmod></url>`).join("\n") +
      `\n</urlset>\n`;
    return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
  });
}
