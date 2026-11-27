import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cached } from "@/lib/cache";
import { env } from "@/lib/env";
import { renderPath } from "@/lib/render";
import { CANONICAL } from "@/lib/seo";

export const dynamic = "force-dynamic";

const HTML = "text/html; charset=utf-8";

// Last good render is kept in R2 so public pages still load when D1 errors (e.g. free-tier limit).
async function renderWithSnapshot(path: string) {
  const key = `_snap${path}index.html`;
  try {
    const res = await renderPath(path);
    if (res.status !== 200) return res;
    const body = await res.text();
    getCloudflareContext().ctx.waitUntil(env().MEDIA.put(key, body, { httpMetadata: { contentType: HTML } }));
    return new Response(body, res);
  } catch (e) {
    const snap = await env().MEDIA.get(key);
    if (!snap) throw e;
    return new Response(snap.body, { headers: { "content-type": HTML, "cache-control": "public, max-age=0, s-maxage=60" } });
  }
}

export async function GET(req: Request, ctx: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await ctx.params;
  const url = new URL(req.url);
  // one URL per page: /about-us -> /about-us/
  if (slug.length && !url.pathname.endsWith("/") && !slug[slug.length - 1].includes(".")) return Response.redirect(`${url.origin}${url.pathname}/${url.search}`, 301);
  const path = slug.length ? `/${slug.join("/")}/` : "/";
  // duplicate pages: send people and crawlers to the real URL
  if (CANONICAL[path]) return Response.redirect(url.origin + CANONICAL[path] + url.search, 301);
  return cached(req, 300, () => renderWithSnapshot(path));
}
